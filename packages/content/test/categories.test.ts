import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { CreatureKind } from "@neon-spore/sim";
import { CREATURES, categoryOf } from "../src/creatures.js";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..", "..");
const BESTIARY = join(ROOT, "docs", "spec", "bestiary.md");

/** The four categories a `CreatureKind` can land in. `suck` is pods, which are
 * not kinds, so its row in the document is not this test's business. */
const CATEGORIES = ["cannon", "shield", "mixed", "special"] as const;

/**
 * Read the Categories table's members back out of the document, one row per
 * category, as the kind names written in it.
 *
 * Members are backticked on purpose — the cells used to say things like "every
 * meteor tier, the torch" and "*(reserved, empty)*", which read well and cannot
 * be checked against anything.
 */
function documentedMembers(text: string): Map<string, string[]> {
  const rows = new Map<string, string[]>();
  for (const line of text.split("\n")) {
    const row = /^\|\s*`(cannon|shield|mixed|special)`\s*\|[^|]*\|([^|]*)\|/.exec(line);
    if (!row) continue;
    const members = [...row[2]!.matchAll(/`([A-Za-z]+)`/g)].map((m) => m[1]!);
    rows.set(row[1]!, members.sort());
  }
  return rows;
}

function actualMembers(): Map<string, string[]> {
  const rows = new Map<string, string[]>(CATEGORIES.map((c) => [c, []]));
  for (const kind of Object.keys(CREATURES) as CreatureKind[]) {
    rows.get(categoryOf(kind))?.push(kind);
  }
  for (const [, members] of rows) members.sort();
  return rows;
}

/**
 * `categoryOf` is derived from `controls` and cannot drift. The table in
 * `docs/spec/bestiary.md` that lists what is in each category is prose, and it
 * had drifted in three rows of four by the time anyone looked: `shell` and
 * `veil` were missing from `cannon`, `warden` and `clasp` from `mixed`, and
 * `special` was still described as reserved and empty after the tether had
 * landed in it.
 *
 * Nothing failed, because a document is not compiled. This is the compiler.
 */
describe("the bestiary's Categories table", () => {
  it("names every category, so a renamed heading cannot pass vacuously", async () => {
    const rows = documentedMembers(await Bun.file(BESTIARY).text());
    expect([...rows.keys()].sort()).toEqual([...CATEGORIES].sort());
  });

  it("lists the same members categoryOf puts in each category", async () => {
    const documented = documentedMembers(await Bun.file(BESTIARY).text());
    const actual = actualMembers();
    for (const category of CATEGORIES) {
      expect(documented.get(category), category).toEqual(actual.get(category)!);
    }
  });
});
