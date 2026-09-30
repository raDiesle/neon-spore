import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * **Every boss's shot cue has an aim target**, the owner, 29 September 2026:
 * *shooting with cannon should have clear aim target (check "the instar")*.
 * A `FIRE` or `SHOOT` standing off the hull stands on its target already and
 * is its own aim (`cueAim`, `cue-helper.ts`). One standing at the hull —
 * where the cannon has to be — says nothing about what it is aimed at unless
 * its reading sets `BossCue.aim` on the part the bolt must reach, as THE
 * SEAM's does (`boss-cue-read-zr.ts`).
 *
 * Read off the source: each shot word's statement, up to its `;`, that
 * stands the cue on `l.hullY`, in a file that never sets an `aim`. The
 * roll-out that gave the last eighteen theirs finished 30 September 2026; a
 * new boss's reading is held to it from its first commit.
 */

const SRC = join(import.meta.dir, "../src");

/** Whether a cue reading stands a shot word at the hull and never names an aim. */
function aimsAtNothing(source: string): boolean {
  if (/\baim\b\s*[,:}]/.test(source)) return false;
  for (const m of source.matchAll(/"(FIRE|SHOOT)"/g)) {
    const end = source.indexOf(";", m.index);
    if (source.slice(m.index, end === -1 ? undefined : end).includes("l.hullY")) return true;
  }
  return false;
}

const owing = readdirSync(SRC)
  .filter((f) => f.startsWith("boss-cue-read") && f.endsWith(".ts"))
  .filter((f) => aimsAtNothing(readFileSync(join(SRC, f), "utf8")))
  .sort();

describe("every boss's shot cue aims at something", () => {
  it("has no shot at the hull without an aim", () => {
    expect(owing).toEqual([]);
  });

  it("reads the shot words it is meant to", () => {
    // THE SEAM's reading stands FIRE at the hull and sets its aim: the check
    // must see the one and credit the other, or it proves nothing.
    const seam = readFileSync(join(SRC, "boss-cue-read-zr.ts"), "utf8");
    expect(aimsAtNothing(seam)).toBe(false);
    expect(aimsAtNothing(seam.replace(/\baim\b/g, "mark"))).toBe(true);
  });
});
