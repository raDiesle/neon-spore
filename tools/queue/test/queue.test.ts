import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { order, parseItems, pick, problemsIn, promptFor, removeItem } from "../queue.js";

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
    const prompt = promptFor(item);
    expect(prompt).toContain("docs/parked.md");
    expect(prompt).toContain(item.title);
    expect(prompt).toContain("bun run check");
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
