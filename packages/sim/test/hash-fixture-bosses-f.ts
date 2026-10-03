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
  // A tap, a retap and the shot, each tapper named and the colour set off
  // `either` (`governor-hash.ts`).
  governor: {
    kind: "governor",
    steps: [
      { ask: "tap", tapper: 1, markMilli: 250, paceMilli: 3, color: "red", beats: 10 },
      { ask: "retap", tapper: 2, markMilli: 500, paceMilli: 5, color: "either", beats: 6 },
      { ask: "fire", tapper: 2, markMilli: 0, paceMilli: 0, color: "cyan", beats: 3 },
    ],
  },
  // A bite and a gullet, the pinners apart, both crawls and the first step's
  // colour set off `either`, for the walk only changes element 0
  // (`lamprey-hash.ts`).
  lamprey: {
    kind: "lamprey",
    steps: [
      {
        ask: "bite",
        pinner: 1,
        teeth: 3,
        toothBeats: 3,
        col: 2,
        crawl: 1,
        crawlBeats: 3,
        color: "cyan",
        beats: 0,
      },
      {
        ask: "gullet",
        pinner: 2,
        teeth: 2,
        toothBeats: 2,
        col: 8,
        crawl: -1,
        crawlBeats: 2,
        color: "either",
        beats: 3,
      },
    ],
  },
  // A sign and a split, the readers apart, the first one changing and its
  // colour set off `either`, for the walk only changes element 0
  // (`mimic-hash.ts`).
  mimic: {
    kind: "mimic",
    steps: [
      { ask: "sign", reader: 2, changes: true, color: "cyan", beats: 10 },
      { ask: "split", reader: 1, changes: false, color: "either", beats: 8 },
      { ask: "core", reader: 1, changes: false, color: "red", beats: 4 },
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
  if (boss.kind === "governor") {
    // A tap step lit with the needle off the start and running hot, taps
    // counted apart, the hub lit and shot once, one pad of each seat down and
    // one thumb down — every field given a value (`governor-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.needleMilli = 430;
    boss.speedMilli = 1500;
    boss.taps = [3, 2];
    boss.hits = 1;
    boss.hubLit = true;
    boss.padsDown = [1, 2];
    boss.tapDown = [true, false];
  }
  if (boss.kind === "lamprey") {
    // A re-bite on, crawling left off its column, half bitten, two teeth out
    // for good and one cracked this bite, the gullet shot once, one thumb on
    // the jaw and the other's down — every field given a value
    // (`lamprey-hash.ts`).
    boss.phase = "bite";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.jawCol = 5;
    boss.crawlDir = -1;
    boss.crawlBeat = 4;
    boss.biteMilli = 375;
    boss.teethOut = 0b101;
    boss.litTooth = 4;
    boss.toothBeat = 5;
    boss.pulled = [3];
    boss.rebiting = true;
    boss.hits = 1;
    boss.holdCol = [4, -1];
    boss.tapDown = [false, true];
  }
  if (boss.kind === "mimic") {
    // A split on with both pictures up, two tiles painted and the
    // navigator's peeled, the brush on the shield, the picture changed, two
    // arms reached, three pictures off and the core tapped once — every field
    // given a value (`mimic-hash.ts`).
    boss.phase = "sign";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.signs = [2, 4];
    boss.inks = [7, 3];
    boss.origins = [12, 18];
    boss.paint[12] = 2;
    boss.paint[13] = 1;
    boss.brush = 3;
    boss.peeled = [false, true];
    boss.changed = true;
    boss.reaches = 2;
    boss.peels = 3;
    boss.hits = 1;
  }
}
