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
 * stands the cue on `l.hullY`, in a file that never sets an `aim`.
 * `TO_COME` is the roll-out, one boss a lane (`docs/queue.md`); it only
 * shrinks — an entry whose file has its aim fails here until it is struck.
 */

const TO_COME: Readonly<Record<string, string>> = {
  "boss-cue-read-zl.ts": "THE CAPSTAN",
  "boss-cue-read-zm.ts": "THE GALL",
  "boss-cue-read-zn.ts": "THE BURGEE",
  "boss-cue-read-zo.ts": "THE FLUE",
  "boss-cue-read-zp.ts": "THE VALVE",
  "boss-cue-read-zq.ts": "THE GOVERNOR",
};

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
  it("has no shot at the hull without an aim but the roll-out's", () => {
    expect(owing.filter((f) => TO_COME[f] === undefined)).toEqual([]);
  });

  it("strikes a boss off the roll-out once it has its aim", () => {
    expect(Object.keys(TO_COME).filter((f) => !owing.includes(f))).toEqual([]);
  });
});
