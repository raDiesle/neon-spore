import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { branchFor, claimOn, refuseNumbered, slugFor, unclaimed } from "../claim.js";
import { removeItem } from "../edit.js";
import { problemsIn, refuseUnlessWhole } from "../problems.js";
import { promptFor } from "../prompt.js";
import { match, order, parseItems, pick } from "../queue.js";
import { statusLines, statusOf } from "../status.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");

const ENTRY = `## Split the wave editor's cell panel

- **Found:** 2026-09-03, claude/some-lane
- **Files:** \`tools/director/src/cell-panel.ts\`

It is 310 lines and does two jobs.
`;

describe("parseItems", () => {
  it("reads a well-formed entry whole", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    expect(item.title).toBe("Split the wave editor's cell panel");
    expect(item.found).toBe("2026-09-03, claude/some-lane");
    expect(item.files).toEqual(["tools/director/src/cell-panel.ts"]);
    expect(item.body).toContain("310 lines");
  });

  it("ignores prose above the first entry", () => {
    expect(parseItems(`# Queue\n\nHow this file works.\n\n${ENTRY}`, "queue")).toHaveLength(1);
  });

  it("ignores an HTML comment, which is where both files keep their own notes", () => {
    expect(parseItems("<!-- ## Not an entry -->\n", "queue")).toEqual([]);
  });

  it("splits a Files list on commas and drops the backticks", () => {
    const md = ENTRY.replace("`tools/director/src/cell-panel.ts`", "`a.ts`, b.ts");
    expect(parseItems(md, "queue")[0]?.files).toEqual(["a.ts", "b.ts"]);
  });
});

const ASKING = `## A button says the wrong word

- **Found:** 2026-09-06, claude/some-lane
- **Files:** \`packages/content/src/controls.ts\`
- **Asks:** Leave the two words, hang a caption, or widen the lobe?

Why the short label is what fits, and what each of the three costs.
`;

describe("an entry that asks the owner something", () => {
  it("reads the question off the Asks: line", () => {
    expect(parseItems(ASKING, "queue")[0]?.asks).toBe(
      "Leave the two words, hang a caption, or widen the lobe?",
    );
  });

  it("leaves asks empty on an entry that needs nobody's answer", () => {
    expect(parseItems(ENTRY, "queue")[0]?.asks).toBe("");
  });

  it("is otherwise an ordinary entry a cold session could act on", () => {
    expect(problemsIn(parseItems(ASKING, "queue"))).toEqual([]);
  });

  it("catches an Asks: line that is not a question", () => {
    // A line reading like a task is one the owner agrees with and still cannot
    // answer, which is the whole failure the field exists to prevent.
    const md = ASKING.replace(/- \*\*Asks:\*\*.*\n/, "- **Asks:** Widen the lobe.\n");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("not a question");
  });

  it("catches a title that shouts the marker the listing already adds", () => {
    // Written twice on 16 September 2026, in two lanes, by the sessions that
    // added the `Asks:` line underneath: the listing builds its line off the
    // fields, so the entry showed up as "… — ASKS THE OWNER — ASKS THE
    // OWNER", and the doubled title is the string `take` and `done` match on.
    const md = ASKING.replace("## A button says the wrong word", "## A button — ASKS THE OWNER");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("the listing adds that");
  });

  it("catches the same in a Where: entry's title", () => {
    const md = ASKING.replace(
      "## A button says the wrong word",
      "## A button — LOCAL ONLY",
    ).replace("- **Asks:** Leave the two words, hang a caption, or widen the lobe?\n", "");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("LOCAL ONLY");
  });

  it("puts the question at the top of the prompt the session is handed", () => {
    const item = parseItems(ASKING, "queue")[0]!;
    const prompt = promptFor(item, branchFor(item));
    expect(prompt).toContain("Leave the two words, hang a caption, or widen the lobe?");
    // Before the body, so nobody starts building the wrong one of the three.
    expect(prompt.indexOf("opens with a question")).toBeLessThan(prompt.indexOf("## "));
  });

  it("says nothing about a question on an entry that carries none", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    expect(promptFor(item, branchFor(item))).not.toContain("opens with a question");
  });
});

describe("problemsIn", () => {
  it("passes an entry a cold session could act on", () => {
    expect(problemsIn(parseItems(ENTRY, "queue"))).toEqual([]);
  });

  it("catches a missing Found line", () => {
    const md = ENTRY.replace(/- \*\*Found:\*\*.*\n/, "");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("Found");
  });

  it("catches a missing Files line, which is where the next session starts", () => {
    const md = ENTRY.replace(/- \*\*Files:\*\*.*\n/, "");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("Files");
  });

  it("catches an entry that is fields and no instruction", () => {
    const md = ENTRY.replace("It is 310 lines and does two jobs.\n", "");
    expect(problemsIn(parseItems(md, "queue"))[0] ?? "").toContain("say what to change");
  });

  it("catches two entries with the same title, which `done` could not tell apart", () => {
    expect(problemsIn(parseItems(`${ENTRY}\n${ENTRY}`, "queue"))[0]).toContain("second entry");
  });
});

describe("refuseUnlessWhole", () => {
  it("hands out an entry that has no problem", () => {
    expect(() => refuseUnlessWhole(parseItems(ENTRY, "queue")[0]!)).not.toThrow();
  });

  it("refuses an entry the format test would fail on, naming what is wrong", () => {
    // An 87-character title was claimed on 14 September 2026 and could not be
    // retitled afterwards: `done` and the `Taken:` line match by title.
    const md = ENTRY.replace(/^## .*$/m, `## ${"a".repeat(87)}`);
    expect(() => refuseUnlessWhole(parseItems(md, "queue")[0]!)).toThrow(
      /fix it first:\n {2}- .*title over 80 characters/,
    );
  });

  it("names every problem, not only the first", () => {
    const md = ENTRY.replace(/- \*\*Found:\*\*.*\n/, "").replace(/- \*\*Files:\*\*.*\n/, "");
    expect(() => refuseUnlessWhole(parseItems(md, "queue")[0]!)).toThrow(/Found[\s\S]*Files/);
  });
});

describe("order", () => {
  it("puts half-done work first — it is the only kind that rots while it waits", () => {
    const queue = parseItems(ENTRY, "queue");
    const parked = parseItems(ENTRY.replace("Split the", "Finish the"), "parked");
    expect(order(queue, parked).map((i) => i.source)).toEqual(["parked", "queue"]);
  });
});

describe("promptFor", () => {
  it("names the file the entry has to be removed from when it lands", () => {
    const item = parseItems(ENTRY, "parked")[0]!;
    const prompt = promptFor(item, branchFor(item));
    expect(prompt).toContain("docs/parked.md");
    expect(prompt).toContain(item.title);
    expect(prompt).toContain("bun run check");
  });

  it("hands over the branch that was already claimed, not a name to invent", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    const branch = branchFor(item);
    const prompt = promptFor(item, branch);
    expect(prompt).toContain(
      `git worktree add .claude/worktrees/queue-split-the-wave-editors-cell-panel ${branch}`,
    );
  });

  it("puts the worktree under the main checkout when it is told where that is", () => {
    // Relative, it nests a tree inside the session's own when the session is
    // itself in `.claude/worktrees/` (`home-tree.test.ts` finds the path).
    const item = parseItems(ENTRY, "queue")[0]!;
    const prompt = promptFor(item, branchFor(item), { home: "/repo" });
    expect(prompt).toContain("git worktree add /repo/.claude/worktrees/queue-split-the-wave");
  });

  /**
   * The size paragraph. `docs/lane-speed.md` found that the top 14% of lanes
   * carry 38% of the minutes and are all one sitting holding two pieces of
   * work, and that the prompt said one thing about size — in its last line,
   * as a fallback. These four hold the fix in place: it is said, it is said
   * before the work is opened, it points at the table rather than copying it,
   * and the fallback is still there underneath.
   */
  it("says to decide the size before the work starts", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    const prompt = promptFor(item, branchFor(item));
    expect(prompt).toContain("Decide the size before you start");
    expect(prompt).toContain("lands green on its own");
  });

  it("says it above the command that opens the work, not after the body", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    const prompt = promptFor(item, branchFor(item));
    expect(prompt.indexOf("Decide the size")).toBeLessThan(prompt.indexOf("git worktree add"));
  });

  it("points at the table of cuts rather than repeating it", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    expect(promptFor(item, branchFor(item))).toContain("docs/lane-speed.md");
  });

  it("says it for an item that opens with a question too", () => {
    // Printed always: the queue has no size field, and adding one would make
    // the writer of an entry guess at the size of work they are not doing.
    const item = parseItems(ASKING, "queue")[0]!;
    expect(promptFor(item, branchFor(item))).toContain("Decide the size before you start");
  });

  it("keeps parking what is unfinished as the fallback underneath it", () => {
    const item = parseItems(ENTRY, "queue")[0]!;
    const prompt = promptFor(item, branchFor(item));
    expect(prompt).toContain("leave what you finished");
    expect(prompt.indexOf("Decide the size")).toBeLessThan(
      prompt.indexOf("leave what you finished"),
    );
  });
});

describe("the claim", () => {
  const item = parseItems(ENTRY, "queue")[0]!;

  it("is a branch named from the title, so the same item always claims the same one", () => {
    expect(branchFor(item)).toBe("claude/queue-split-the-wave-editors-cell-panel");
  });

  it("survives a title made of punctuation", () => {
    expect(slugFor("!!! ??? ---")).toBe("item");
  });

  it("stays inside a sane branch length", () => {
    expect(slugFor("a".repeat(200)).length).toBe(48);
  });

  it("does not end in a hyphen when the cut lands mid-word", () => {
    expect(slugFor(`${"a".repeat(47)} tail`)).not.toMatch(/-$/);
  });

  it("reads origin's copy of a branch as the same claim", () => {
    expect(claimOn(item, ["origin/claude/queue-split-the-wave-editors-cell-panel"])).toBe(
      branchFor(item),
    );
  });

  it("is nothing when no branch matches", () => {
    expect(claimOn(item, ["main", "claude/something-else"])).toBeUndefined();
  });

  it("hides a taken item from what is free", () => {
    const items = parseItems(
      `${ENTRY}
${ENTRY.replace("Split", "Finish")}`,
      "queue",
    );
    const free = unclaimed(items, [branchFor(items[0]!)]);
    expect(free.map((i) => i.title)).toEqual(["Finish the wave editor's cell panel"]);
  });
});

/**
 * The question this answers is asked of a machine that is about to be turned
 * off — "is anything still being worked on" — so the answer has to be a word
 * rather than a list somebody has to count.
 */
describe("statusOf", () => {
  const items = parseItems(`${ENTRY}\n${ENTRY.replace("Split", "Finish")}`, "queue");

  it("is DONE when there is nothing left at all", () => {
    const status = statusOf([], []);
    expect(status.state).toBe("done");
    expect(statusLines(status)[0]).toStartWith("DONE");
  });

  it("is IDLE when items are waiting and nobody is on one", () => {
    const status = statusOf(items, ["main", "claude/some-lane"]);
    expect(status.state).toBe("idle");
    expect(status.waiting).toBe(2);
    expect(statusLines(status)[0]).toStartWith("IDLE");
  });

  it("is BUSY the moment one item is claimed, and names it", () => {
    const status = statusOf(items, [branchFor(items[0]!)]);
    expect(status.state).toBe("busy");
    expect(status.waiting).toBe(1);
    expect(status.ongoing.map((o) => o.item.title)).toEqual([items[0]!.title]);
    const lines = statusLines(status);
    expect(lines[0]).toStartWith("BUSY");
    expect(lines.join("\n")).toContain(branchFor(items[0]!));
  });

  it("counts every claim, not just the first", () => {
    const status = statusOf(items, items.map(branchFor));
    expect(status.ongoing).toHaveLength(2);
    expect(status.waiting).toBe(0);
  });
});

describe("pick", () => {
  const items = order(
    parseItems(ENTRY, "queue"),
    parseItems(ENTRY.replace("Split", "Finish"), "parked"),
  );

  it("takes a 1-based position", () => {
    expect(pick(items, "1").source).toBe("parked");
  });

  it("takes part of a title", () => {
    expect(pick(items, "Split the wave").source).toBe("queue");
  });

  it("refuses an ambiguous title rather than removing the wrong entry", () => {
    expect(() => pick(items, "wave editor")).toThrow(/matches 2/);
  });

  it("refuses a title that is not there", () => {
    expect(() => pick(items, "nothing like this")).toThrow(/nothing in the queue/);
  });

  it("says which of the two ways it landed, which is what `done` is guarded by", () => {
    expect(match(items, "1").how).toBe("number");
    expect(match(items, "Split the wave").how).toBe("title");
  });
});

describe("what a position is allowed to do", () => {
  const items = order(
    parseItems(ENTRY, "queue"),
    parseItems(ENTRY.replace("Split", "Finish"), "parked"),
  );
  const numbered = match(items, "1");
  const named = match(items, "Split the wave");

  it("refuses a number for `done` even when the entry is free", () => {
    // 19 September 2026: the lane had filed its own finding above the item it
    // was closing, so the number it had read a minute earlier was one row
    // stale. The entry it landed on was nobody's, which is exactly why the
    // holder check let it through and the entry went.
    expect(() => refuseNumbered(numbered, "done", undefined, true)).toThrow(/takes a title/);
  });

  it("names what that number was on, so the wrong one is caught before the deletion", () => {
    expect(() => refuseNumbered(numbered, "done", undefined, true)).toThrow(
      /Finish the wave editor's cell panel/,
    );
  });

  it("lets a title through, which is the way out", () => {
    expect(() => refuseNumbered(named, "done", undefined, true)).not.toThrow();
    expect(() =>
      refuseNumbered(named, "release", "claude/queue-someone-else", false),
    ).not.toThrow();
  });

  it("lets a number through for a verb that only gives something back", () => {
    expect(() => refuseNumbered(numbered, "release", undefined, false)).not.toThrow();
  });

  it("still refuses a number for `release` when somebody else is standing on it", () => {
    expect(() => refuseNumbered(numbered, "release", "claude/queue-someone-else", false)).toThrow(
      /is taken/,
    );
  });
});

describe("removeItem", () => {
  it("takes one entry out and leaves the rest", () => {
    const md = `# Queue\n\n${ENTRY}\n${ENTRY.replace("Split", "Finish")}`;
    const next = removeItem(md, "Split the wave editor's cell panel");
    expect(next).not.toContain("Split the wave");
    expect(next).toContain("Finish the wave");
    expect(next).toContain("# Queue");
  });

  it("throws rather than silently doing nothing", () => {
    expect(() => removeItem("# Queue\n", "not here")).toThrow(/no entry titled/);
  });
});

describe("the files themselves", () => {
  for (const source of ["queue", "parked"] as const) {
    it(`docs/${source}.md parses, and every entry is one a cold session could act on`, () => {
      const md = readFileSync(join(ROOT, "docs", `${source}.md`), "utf8");
      expect(problemsIn(parseItems(md, source))).toEqual([]);
    });
  }
});

describe("a fenced block is prose about an entry, not an entry", () => {
  it("does not offer the format example in docs/queue.md as work", () => {
    const md =
      "# Queue\n\nThe format:\n\n```\n## Example heading\n\n- **Found:** 2026-09-03, x\n```\n";
    expect(parseItems(md, "queue")).toEqual([]);
  });
});

describe("a fence nobody closed", () => {
  // What went wrong on 6 September 2026: a rebase resolution left a second
  // copy of the preamble's closing fence in the middle of the entries, and
  // every entry under it vanished from `bun run queue` without a word.
  const THREE_FENCES = `# Queue\n\nThe format:\n\n\`\`\`\n## Example heading\n\`\`\`\n\n\`\`\`\n\n${ENTRY}`;

  it("is refused rather than obeyed, so the entries under it cannot vanish", () => {
    expect(() => parseItems(THREE_FENCES, "queue")).toThrow(/never closed/);
  });

  it("names the line it opened on, and the file it is in", () => {
    expect(() => parseItems(THREE_FENCES, "queue")).toThrow(/docs\/queue\.md: .*line 9\b/);
    expect(() => parseItems(THREE_FENCES, "parked")).toThrow(/docs\/parked\.md/);
  });

  it("still lets a balanced pair hide what is inside it", () => {
    expect(parseItems(`\`\`\`\n## Example heading\n\`\`\`\n\n${ENTRY}`, "queue")).toHaveLength(1);
  });
});
