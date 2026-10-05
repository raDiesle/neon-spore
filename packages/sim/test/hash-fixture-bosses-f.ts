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
  // A bolt level and a beam level, the colours apart, the speeds and the
  // slows apart, so every figure of a level is varied (`flue-hash.ts`).
  flue: {
    kind: "flue",
    levels: [
      { weapon: "bolt", color: "red", speedMilli: 2000, slowMilli: 1000 },
      { weapon: "beam", color: "cyan", speedMilli: 1500, slowMilli: 250 },
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
  // A pull and a gullet, the holders apart, and the first step's colour set
  // off `either`, for the walk only changes element 0
  // (`lamprey-hash.ts`).
  lamprey: {
    kind: "lamprey",
    steps: [
      { ask: "pull", holder: 1, teeth: 0, jump: 2, beats: 12, color: "cyan" },
      { ask: "gullet", holder: 2, teeth: 2, jump: 3, beats: 9, color: "either" },
    ],
  },
  // A sign and a split, the readers apart, the first one changing and its
  // frame set off nought, for the walk only changes element 0
  // (`mimic-hash.ts`).
  mimic: {
    kind: "mimic",
    steps: [
      { ask: "sign", reader: 2, changes: true, size: 5, beats: 10 },
      { ask: "split", reader: 1, changes: false, size: 3, beats: 8 },
      { ask: "core", reader: 1, changes: false, size: 0, beats: 4 },
    ],
  },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE FLUE on's share of `patchBoss`. */
export function patchBossF(boss: BossState): void {
  if (boss.kind === "flue") {
    // The second level lit, the ember run part of the way back, a shot spent
    // and one level cleared — every field given a value (`flue-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.rollTicks = 140;
    boss.emberMilli = -700;
    boss.emberDir = -1;
    boss.shots = 2;
    boss.hits = 1;
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
    // Leaping from one tile to another with the next drawn, two teeth out for
    // good and one cracked this stay, the gullet shot once, two tiles bitten,
    // a thumb on the tail and the head half up, one slipped — every field
    // given a value (`lamprey-hash.ts`).
    boss.phase = "leap";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.col = 5;
    boss.row = 6;
    boss.fromCol = 3;
    boss.fromRow = 4;
    boss.nextCol = 8;
    boss.nextRow = 3;
    boss.teethOut = 0b101;
    boss.litTooth = 4;
    boss.pulled = [3];
    boss.hits = 1;
    boss.bitten = [47, 71];
    boss.tailDown = [true, false];
    boss.tailMilli = [300, 0];
    boss.headMilli = [0, 700];
    boss.tapDown = [false, true];
    boss.slipped = [false, true];
  }
  if (boss.kind === "mimic") {
    // A split on with both pictures up, two tiles painted and the
    // navigator's peeled, the picture changed, two arms reached, three
    // pictures off and the core tapped once — every field given a value
    // (`mimic-hash.ts`).
    boss.phase = "sign";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.signs = [2, 4];
    boss.origins = [12, 18];
    boss.paint[12] = 1;
    boss.paint[13] = 1;
    boss.peeled = [false, true];
    boss.changed = true;
    boss.reaches = 2;
    boss.peels = 3;
    boss.hits = 1;
  }
}
