import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileCosts } from "../../test/figure.js";
import { countsIn, driftInRow, headerCommentText, namesIn } from "../drift.js";
import { parseRows } from "../index.js";

// What this file is allowed to take, scaled to how busy the machine is
// (`tools/test/repo-time.ts`). It spawns nothing and reads every file
// `docs/INDEX.md` names; the heaviest case costs 390 ms alone and timed out at
// 12.4 s on bun's flat five-second default on 17 September 2026, with fourteen
// shards up here and another session's whole check still running. Its sibling
// `index.test.ts` was given the same treatment and this file was missed.
fileCosts(500);

const ROOT = join(import.meta.dirname, "..", "..", "..");
// `.claude` holds `worktrees/`, and a worktree is a full copy of the repository
// sitting inside the repository. Named rather than `worktrees` on its own,
// which would also skip a directory that merely shares the word.
// `tools/test/tree-walk.test.ts` holds every walker to this.
const SKIP_DIRS = new Set([".claude", "node_modules", "dist", ".git"]);

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

  /**
   * The failure that earned this: the row for `boss-cue-read-c.ts` named THE
   * ORRERY for a week after that boss moved out of the file, green every run.
   * A count and a backticked name were both already read; a name in capitals
   * is the third thing in a row that goes stale by itself, and in this
   * repository every boss, round and sheet is spelled that way.
   */
  test("catches a row naming a boss its file no longer mentions", () => {
    const source = "/** THE LEDGER, THE LEAD and THE SCUTTLE read here. */\nexport const c = 1;";
    const text = "THE LEDGER, THE LEAD, THE SCUTTLE and THE ORRERY read on the hull";
    expect(driftInRow(text, { source, resolvesFile })).toEqual([
      "names ORRERY, which the file never mentions",
    ]);
  });

  test("says nothing about a boss its file still names, however it spells it", () => {
    // A file's own word for a boss is as often `fenceGapsOf` as THE FENCE, so
    // the question is whether the name is in the source at all — not whether
    // the header shouts it back in the row's own capitals.
    const source = "/** The fence's row under the map. */\nexport const fenceGapsOf = 1;";
    expect(driftInRow("THE FENCE's row under the map", { source, resolvesFile })).toEqual([]);
  });

  test("leaves prose, commands and phrases alone", () => {
    const source = "/** The world. */\nexport const world = 1;";
    const text = "`GET /api/waves`, and the base-revision token that refuses a clobber";
    expect(driftInRow(text, { source, resolvesFile })).toEqual([]);
  });
});

describe("namesIn", () => {
  test("takes a name once, however many times a row says it", () => {
    expect(namesIn("SNAKE eats, and SNAKE sheds")).toEqual(["SNAKE"]);
  });

  test("leaves the capitals that are grammar rather than a name", () => {
    // Every one of these turns up inside a real name — THE ORRERY, NOT BUILT
    // YET — and carries none of the claim.
    expect(namesIn("THE ORRERY AND THE VANE")).toEqual(["ORRERY", "VANE"]);
  });

  test("leaves a backticked span to the rules that already read one", () => {
    expect(namesIn("`GET /api/waves` and `MIRROR_STEPS`")).toEqual([]);
  });

  test("leaves an ordinary word alone, whatever case the sentence starts in", () => {
    expect(namesIn("The hull is drawn once a frame")).toEqual([]);
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
