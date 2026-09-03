import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { countsIn, driftInRow, headerCommentText } from "../drift.js";
import { parseRows } from "../index.js";

const ROOT = join(import.meta.dirname, "..", "..", "..");
// `worktrees` is `.claude/worktrees`: other lanes' checkouts of this same repo.
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "worktrees"]);

function walkAll(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkAll(full, out);
    else out.push(relative(ROOT, full).split("\\").join("/"));
  }
}

const files = (() => {
  const out: string[] = [];
  walkAll(ROOT, out);
  return out;
})();
const names = new Set([...files, ...files.map((p) => p.split("/").pop() ?? p)]);

describe("docs/INDEX.md rows still describe their files", () => {
  const committed = readFileSync(join(ROOT, "docs", "INDEX.md"), "utf8");
  const rows = parseRows(committed).filter((r) => r.path.endsWith(".ts") && names.has(r.path));

  test("there are rows to check", () => {
    expect(rows.length).toBeGreaterThan(100);
  });

  /**
   * The failures this is here for are silent ones: a row keeps its wording
   * while the file it describes is renamed out from under it, or grows a
   * ninth theme under a row that still says six.
   */
  test("no row names something its file does not have, or counts it differently", () => {
    const complaints: string[] = [];
    for (const row of rows) {
      const text = row.line.split("|")[2]?.trim() ?? "";
      const source = readFileSync(join(ROOT, row.path), "utf8");
      const found = driftInRow(text, { source, resolvesFile: (n) => names.has(n) });
      for (const complaint of found) complaints.push(`${row.path}: ${complaint}`);
    }
    expect(complaints).toEqual([]);
  });
});

describe("countsIn", () => {
  test("reads a number and what it counts, in digits or in words", () => {
    const counts = countsIn("the first six bosses and 3 rocks");
    expect(counts.get("bosse")).toEqual(new Set([6]));
    expect(counts.get("rock")).toEqual(new Set([3]));
  });

  test("a plural and its singular are one subject", () => {
    expect(countsIn("two lobes").get("lobe")).toEqual(new Set([2]));
    expect(countsIn("two lobe").get("lobe")).toEqual(new Set([2]));
  });

  test("leaves 'one' alone, which is an article more often than a count", () => {
    expect(countsIn("only one ever real").size).toBe(0);
  });

  test("counts nothing when the word after the number is not a subject", () => {
    expect(countsIn("five of them").size).toBe(0);
  });
});

describe("driftInRow", () => {
  const resolvesFile = (n: string) => n === "step.ts";

  test("catches a row counting the same subject differently", () => {
    const source = "/** Act two: the first six bosses, back to back. */\nexport const act = [];";
    expect(driftInRow("act two: the first five bosses", { source, resolvesFile })[0]).toContain(
      "says 5 bosse where the file's header says 6",
    );
  });

  test("says nothing about a number the header never mentions", () => {
    const source = "/** How far a torch's radius reaches, in tiles. */\nexport const r = 3;";
    expect(
      driftInRow("the torch: three-tile crystal, amber core", { source, resolvesFile }),
    ).toEqual([]);
  });

  test("catches a backticked name the file no longer mentions", () => {
    const source = "/** The world. */\nexport const world = 1;";
    expect(
      driftInRow("the world, and where `step` is called", { source, resolvesFile })[0],
    ).toContain("does not mention");
  });

  test("catches a backticked file that is not a file", () => {
    const source = "/** The world. */\nexport const world = 1;";
    expect(driftInRow("written back into `moved-away.ts`", { source, resolvesFile })[0]).toContain(
      "not a file in this repo",
    );
    expect(driftInRow("read by `step.ts`", { source, resolvesFile })).toEqual([]);
  });

  test("leaves prose, commands and phrases alone", () => {
    const source = "/** The world. */\nexport const world = 1;";
    const text = "`GET /api/waves`, and the base-revision token that refuses a clobber";
    expect(driftInRow(text, { source, resolvesFile })).toEqual([]);
  });
});

describe("headerCommentText", () => {
  test("takes the whole block, not its first sentence", () => {
    const source = "/**\n * One line.\n * And a second.\n */\nexport const x = 1;";
    expect(headerCommentText(source).replace(/\s+/g, " ").trim()).toBe("One line. And a second.");
  });

  test("falls back to the run of line comments a file opens with", () => {
    const source = "// The room code alphabet.\n// Chosen for the ear.\nexport const x = 1;";
    expect(headerCommentText(source)).toBe("The room code alphabet. Chosen for the ear.");
  });
});
