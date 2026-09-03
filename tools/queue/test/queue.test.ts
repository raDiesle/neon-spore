import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  branchFor,
  claimOn,
  promptFor,
  slugFor,
  statusLines,
  statusOf,
  unclaimed,
} from "../claim.js";
import { order, parseItems, pick, problemsIn, removeItem } from "../queue.js";

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
