import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE FLUE on: the last page of `hash-fixture.ts`**, and the one a new
 * boss's entry and patch go on. It opened the day that boss landed because
 * `-d.ts` stood at 483 lines; it was `-e.ts` until `-d.ts` was cut in two
 * and its back half took the letter. `BOSS_KINDS` is appended to, never
 * inserted into, so the newest boss is always at the end of this file; when
 * it passes 250 lines, a `-g.ts` takes the next boss.
 */

/** THE FLUE on's share of `BOSS_ENTRIES`. */
export const BOSS_ENTRIES_F = {
  // A vent with its notches, a damper and the shot, the rester off `both`
  // and the colour set off `either` (`flue-hash.ts`).
  flue: {
    kind: "flue",
    steps: [
      { ask: "vent", rester: 2, notches: [-2, 1], color: "red", beats: 12 },
      { ask: "damper", rester: "both", notches: [], color: "either", beats: 8 },
      { ask: "fire", rester: "both", notches: [], color: "cyan", beats: 3 },
    ],
  },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE FLUE on's share of `patchBoss`. */
export function patchBossF(boss: BossState): void {
  if (boss.kind === "flue") {
    // Two taps landed on an ember steadied off the middle, drifting left when
    // it goes, one vent spent and the core bared and shot once, the rests
    // counted apart, one seat stirred and one thumb down — every field given a
    // value (`flue-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.emberMilli = -700;
    boss.emberDir = -1;
    boss.taps = 2;
    boss.vents = 1;
    boss.hits = 1;
    boss.bared = true;
    boss.restBeats = [1, 2];
    boss.stirred = [true, false];
    boss.tapDown = [false, true];
  }
}
