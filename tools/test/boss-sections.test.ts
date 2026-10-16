import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./doc-paths.js";

/**
 * **Every boss has a section number of its own in `docs/spec/bosses.md`**,
 * and every `§11.n` the tree names is one of them.
 *
 * THE MATRON and THE GEODE were both written as §11.66 by two lanes on the
 * same day, and both landed with it: the rebase merged the two sections
 * cleanly and nothing read the headings. It was seen by eye and renumbered
 * (`docs/queue.md`, 16 October 2026).
 *
 * The release notes and the time log are records of what was true on the day
 * — the notes still give THE MOTHER the number she had when she was cut — so they are
 * not held to today's numbers; `legacy/` is the prototypes, never edited.
 */

const BOSSES = "docs/spec/bosses.md";
const RECORDS = new Set(["docs/release-notes.md", "docs/time-log.md"]);

/** The numbers after `11.` of every `## 11.n` heading, in file order. */
export function sectionNumbers(text: string): number[] {
  return [...text.matchAll(/^## 11\.(\d+)\b/gm)].map((m) => Number(m[1]));
}

/** Every number named more than once, in the order first seen twice. */
export function doubled(numbers: readonly number[]): number[] {
  const seen = new Set<number>();
  const twice = new Set<number>();
  for (const n of numbers) (seen.has(n) ? twice : seen).add(n);
  return [...twice];
}

const headings = sectionNumbers(readFileSync(join(ROOT, BOSSES), "utf8"));

describe("the bosses' section numbers", () => {
  test("say which heading they read, as a test should", () => {
    expect(sectionNumbers("## 11.66 THE MATRON\n\n## 11.66 THE GEODE\n")).toEqual([66, 66]);
    expect(doubled([0, 3, 66, 4, 66])).toEqual([66]);
  });

  test("are one a heading, none named twice", () => {
    expect(headings.length).toBeGreaterThan(50);
    expect(doubled(headings)).toEqual([]);
  });

  test("named anywhere in the tree are headings that exist", () => {
    // One `git grep` rather than reading the tree file by file, which took a
    // second and a half idle and timed out under load.
    const exist = new Set(headings);
    const found = Bun.spawnSync(
      ["git", "grep", "--untracked", "-oE", "§ ?11\\.[0-9]+", "--", "*.ts", "*.md", ":!legacy"],
      { cwd: ROOT },
    ).stdout.toString();
    const named: string[] = [];
    for (const line of found.split("\n").filter(Boolean)) {
      const [rel = "", cited = ""] = line.split(":");
      const n = Number(/11\.(\d+)/.exec(cited)?.[1]);
      if (!RECORDS.has(rel) && !exist.has(n)) named.push(line);
    }
    expect(found).toContain("§11.");
    expect(named).toEqual([]);
  });
});
