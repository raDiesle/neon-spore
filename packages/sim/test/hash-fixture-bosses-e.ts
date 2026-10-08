import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE TRIVET to THE TRAPEZE: the fifth page of `hash-fixture.ts`**, cut off
 * `-d.ts` on 27 September 2026, when that page stood at 483 lines, at the
 * boundary between THE RIME and THE TRIVET. Nothing new goes here: the
 * newest boss goes on `-f.ts`, the last page, because `BOSS_KINDS` is
 * appended to, never inserted into. The reasons the fixture works the way it
 * does are on `-a.ts` and in `hash-fixture.ts`, which composes the pages.
 */

/** What each is authored with; the keys are the page's share of `BOSS_KINDS`. */
export const BOSS_ENTRIES_E = {
  // THE TRIVET authors its script; two steps rather than the shipped nine
  // (`trivet-hash.ts`).
  trivet: {
    kind: "trivet",
    steps: [
      { ask: "front", pads: 3, color: "cyan", beats: 4 },
      { ask: "fire", pads: 2, color: "cyan", beats: 3 },
    ],
  },
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
  // THE GRINDSTONE authors its script; two steps rather than the shipped nine
  // (`grindstone-hash.ts`).
  grindstone: {
    kind: "grindstone",
    steps: [
      { ask: "left", color: "red", beats: 6 },
      { ask: "clamp", color: "cyan", beats: 3 },
    ],
  },
  // THE CYST authors its script; two steps rather than the shipped eleven,
  // one of them off the middle (`cyst-hash.ts`).
  cyst: {
    kind: "cyst",
    steps: [
      { ask: "left", color: "red", beats: 4 },
      { ask: "bud", color: "cyan", beats: 3, offset: 2 },
    ],
  },
  // THE DAVIT's script, a swing and a shot, every authored field set off
  // `either` so the walk can move it (`davit-hash.ts`).
  davit: {
    kind: "davit",
    steps: [
      { ask: "left", leanMilli: -20000, rangeMilli: 8000, color: "cyan", beats: 6 },
      { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
    ],
  },
  // THE HALTER authors its script; two steps rather than the shipped seven,
  // the colour set off `either` so the walk can move it (`halter-hash.ts`).
  halter: {
    kind: "halter",
    steps: [
      { ask: "left", color: "red", beats: 6 },
      { ask: "fire", color: "cyan", beats: 3 },
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
  // THE GALL the same, a close and the shot, the colour set off `either`
  // (`gall-hash.ts`).
  gall: {
    kind: "gall",
    steps: [
      { ask: "close", color: "red", beats: 6 },
      { ask: "fire", color: "cyan", beats: 3 },
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

/** THE TRIVET to THE TRAPEZE's share of `patchBoss`. */
export function patchBossE(boss: BossState): void {
  if (boss.kind === "trivet") {
    // The front foot planted once and the rear home, the hub lit, pads down
    // on both seats — every field given a value (`trivet-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.feet = [1, 2];
    boss.hits = 1;
    boss.hubLit = true;
    boss.padsDown = [3, 5];
    boss.heldBeats = 2;
  }
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
  if (boss.kind === "grindstone") {
    // The left flat passed once and the right twice, the caliper locked, a
    // thumb part way through a pass and a pad down on each jaw — every field
    // given a value (`grindstone-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.passes = [1, 2];
    boss.hits = 1;
    boss.locked = true;
    boss.gritMilli = [400, 700];
    boss.rubs = [3, 1];
    boss.rubbed = [true, false];
    boss.padsDown = [1, 3];
    boss.heldBeats = 2;
  }
  if (boss.kind === "cyst") {
    // The left flank cracked, the right stilled and pinched part way, the
    // core bare and a thumb down on a mark — every field given a value
    // (`cyst-hash.ts`).
    boss.phase = "frozen";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.cracks = [1, 0];
    boss.hits = 1;
    boss.bared = true;
    boss.gapMilli = [400, 700];
    boss.tapDown = [true, false];
    boss.heldBeats = 2;
    boss.litTick = 40;
  }
  if (boss.kind === "davit") {
    // One swing landed and the other part way, the pivot lit, a lean read on
    // each seat, a finger down and counting, and the boom off hanging — every
    // field given a value (`davit-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.swings = [2, 1];
    boss.hits = 1;
    boss.pivotLit = true;
    boss.tiltMilli = [-19000, 4000];
    boss.holding = [false, true];
    boss.drawnBeats = [0, 3];
    boss.aimMilli = -19000;
  }
  if (boss.kind === "halter") {
    // One segment cracked, the centre bare and shot once, a seat part way
    // rested and the other stirred, a grip down on each — every field given a
    // value (`halter-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.cracks = [1, 0];
    boss.hits = 1;
    boss.bared = true;
    boss.restBeats = [2, 1];
    boss.stirred = [true, false];
    boss.grips = [3, 1];
    boss.heldBeats = 1;
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
    // Two closes landed and the gall moved to the navigator's far point, the
    // root bare and shot once, a pinch half shut on it and a beat counted —
    // every field given a value (`gall-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.point = 3;
    boss.closes = 2;
    boss.hits = 1;
    boss.bared = true;
    boss.gapMilli = 1300;
    boss.heldBeats = 1;
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
