import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE PLUMB to THE TRAPEZE: the fifth page of `hash-fixture.ts`**, cut off
 * `-d.ts` on 27 September 2026, when that page stood at 483 lines, at the
 * boundary between THE RIME and THE TRIVET, taken out on 8 October 2026.
 * Nothing new goes here: the newest boss goes on `-f.ts`, the last page,
 * because `BOSS_KINDS` is appended to, never inserted into. The reasons the fixture works the way it
 * does are on `-a.ts` and in `hash-fixture.ts`, which composes the pages.
 */

/** What each is authored with; the keys are the page's share of `BOSS_KINDS`. */
export const BOSS_ENTRIES_E = {
  // THE PLUMB authors its script; two steps rather than the shipped nine
  // (`plumb-hash.ts`).
  plumb: {
    kind: "plumb",
    steps: [
      { ask: "left", skewMilli: -2600, rangeMilli: 400, color: "cyan", beats: 4 },
      { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
    ],
  },
  // THE SLING authors its script; two steps rather than the shipped nine
  // (`sling-hash.ts`).
  sling: {
    kind: "sling",
    steps: [
      { ask: "left", aim: "right", color: "red", beats: 4 },
      { ask: "fire", aim: "left", color: "cyan", beats: 3 },
    ],
  },
  // THE CAPSTAN authors its script the same way, two steps of the shipped
  // seven, the colour set off `either` (`capstan-hash.ts`).
  capstan: {
    kind: "capstan",
    steps: [
      { ask: "left", color: "red", beats: 6 },
      { ask: "fire", color: "cyan", beats: 3 },
    ],
  },
  // THE GALL the same, a leap and the shot, the colour set off `either`
  // (`gall-hash.ts`).
  gall: {
    kind: "gall",
    steps: [
      { ask: "leap", taps: 3, color: "red", beats: 6 },
      { ask: "fire", taps: 0, color: "cyan", beats: 3 },
    ],
  },
  // THE TRAPEZE the same, a swipe level and a lock level, the gong on
  // either side (`trapeze-hash.ts`).
  trapeze: {
    kind: "trapeze",
    steps: [
      { ask: "push", gongSide: 1, gongMilli: 10000, beats: 30 },
      { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 40 },
    ],
  },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE PLUMB to THE TRAPEZE's share of `patchBoss`. */
export function patchBossE(boss: BossState): void {
  if (boss.kind === "plumb") {
    // The left weight settled once and the right true, the core lit, both
    // stones pulled — every field given a value (`plumb-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.weights = [1, 2];
    boss.hits = 1;
    boss.coreLit = true;
    boss.pullMilli = [300, -700];
    boss.heldBeats = 2;
  }
  if (boss.kind === "sling") {
    // The left arm drawn once and the right home, the yoke lit, the pilot's
    // finger down mid-draw and the navigator loosed — every field given a
    // value (`sling-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.arms = [1, 2];
    boss.hits = 1;
    boss.yokeLit = true;
    boss.holding = [true, false];
    boss.drawnBeats = [2, 0];
    boss.loosed = [false, true];
  }
  if (boss.kind === "capstan") {
    // The left band bright and the right part worn, the core bare and shot
    // once, both seats leaning and both thumbs down, a hold beat counted —
    // every field given a value (`capstan-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.wear = [8, 3];
    boss.hits = 1;
    boss.bared = true;
    boss.pullMilli = [-1500, 400];
    boss.rubs = [2, 5];
    boss.rubbed = true;
    boss.heldBeats = 1;
  }
  if (boss.kind === "gall") {
    // Two leaps landed and the alien on the navigator's far point, from the
    // pilot's near one, two taps in, shot once, a finger down on each half —
    // every field given a value (`gall-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.point = 3;
    boss.from = 1;
    boss.taps = 2;
    boss.leaps = 2;
    boss.hits = 1;
    boss.down = [0, 3];
  }
  if (boss.kind === "trapeze") {
    // The second level lit and swinging, a side pushed, the navigator called
    // to the left, a finger down on each side, the lock held and one gong
    // kicked — every field given a value (`trapeze-hash.ts`).
    boss.phase = "level";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.ampMilli = 9000;
    boss.swingTick = 120;
    boss.half = 7;
    boss.pushedHalf = 6;
    boss.callers = [1, 1];
    boss.down = [-1, 1];
    boss.lockBeats = 2;
    boss.gongs = 1;
  }
}
