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
      { weapon: "bolt", color: "red", speedMilli: 2000, slowMilli: 1000, from: "left", needs: 1 },
      { weapon: "beam", color: "cyan", speedMilli: 1500, slowMilli: 250, from: "left", needs: 1 },
    ],
  },
  // A tap, an ordered retap and the shot, each mark's seat named and the
  // colour set off `either` (`governor-hash.ts`).
  governor: {
    kind: "governor",
    steps: [
      {
        ask: "tap",
        marks: [
          { seat: 1, markMilli: 250 },
          { seat: 2, markMilli: 750 },
        ],
        ordered: false,
        paceMilli: 7,
        color: "red",
        beats: 5,
      },
      {
        ask: "retap",
        marks: [
          { seat: 2, markMilli: 500 },
          { seat: 1, markMilli: 125 },
        ],
        ordered: true,
        paceMilli: 8,
        color: "either",
        beats: 6,
      },
      { ask: "fire", marks: [], ordered: false, paceMilli: 4, color: "cyan", beats: 8 },
    ],
  },
  // A teeth and a gullet, the holders apart, and the first step's colour,
  // taps, crawl, food and dung all set off what is left out, for the walk
  // only changes element 0; a meal of two (`lamprey-hash.ts`).
  lamprey: {
    kind: "lamprey",
    meal: [
      { kind: "slick", col: 3 },
      { kind: "meteor", col: 6 },
    ],
    steps: [
      {
        ask: "teeth",
        holder: 1,
        teeth: 1,
        jump: 2,
        beats: 12,
        color: "cyan",
        taps: 3,
        crawl: true,
        food: "bulb",
        dung: true,
      },
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
  // A yank level ahead of a haul and a cross, the knots and the beats apart,
  // so every figure of a level is varied (`latch-hash.ts`).
  latch: {
    kind: "latch",
    steps: [
      { ask: "yank", knots: 3, beats: 21 },
      { ask: "haul", knots: 1, beats: 9 },
      { ask: "cross", knots: 2, beats: 14 },
    ],
  },
  // Every layer once, the colours and the offsets apart (`bastion-hash.ts`).
  bastion: {
    kind: "bastion",
    steps: [
      { layer: "plates", beats: 11 },
      { layer: "ring", colors: ["cyan", "red"], beats: 13 },
      { layer: "lattice", offsets: [2, -1], beats: 17 },
      { layer: "port", offsets: [-2], beats: 19 },
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
    // A tap step lit with the needle off the start and one mark landed, taps
    // counted apart, the hub lit and shot once, and one thumb down — every
    // field given a value (`governor-hash.ts`).
    boss.phase = "lit";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.needleMilli = 430;
    boss.landed = 1;
    boss.taps = [3, 2];
    boss.hits = 1;
    boss.hubLit = true;
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
    // Its tail laid up and to the left, two of its meal served, after a body,
    // one dung rock falling, a trail behind it on the second leg of a crawl
    // to the left, and two taps on the lit tooth.
    boss.tailX = -707;
    boss.tailY = -707;
    boss.served = 2;
    boss.prey = 41;
    boss.dung = [42];
    boss.headBeat = 7;
    boss.trailCol = [4, 3];
    boss.trailRow = [6, 7];
    boss.leg = 1;
    boss.roamSide = -1;
    boss.toothTaps = 2;
  }
  if (boss.kind === "mimic") {
    // A split on with both pictures up, two tiles painted and the
    // navigator's peeled, three pictures shown, the picture changed, two arms reached, three
    // pictures off and the core tapped once — every field given a value
    // (`mimic-hash.ts`).
    boss.phase = "sign";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.signs = [2, 4];
    boss.origins = [12, 18];
    boss.shown = [3, 2, 4];
    boss.paint[12] = 1;
    boss.paint[13] = 1;
    boss.peeled = [false, true];
    boss.changed = true;
    boss.reaches = 2;
    boss.peels = 3;
    boss.hits = 1;
  }
  if (boss.kind === "latch") {
    // The second level lit, the rope a way past its third knot with one in
    // this level, the left grip down part way and the right let go from
    // higher, the right's turn next, and a yank coming — every field given a value (`latch-hash.ts`).
    boss.phase = "level";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.hauledMilli = 13300;
    boss.floorMilli = 12000;
    boss.knots = 3;
    boss.levelKnots = 1;
    boss.down = [true, false];
    boss.anchorMilli = [12400, 11100];
    boss.depthMilli = [900, 0];
    boss.turn = 1;
    boss.yankBeat = 11;
  }
  if (boss.kind === "bastion") {
    // The lattice lit with one node gone and the next charging, the left
    // thumb down part way and the right's plate torn under it, the moon
    // turned and its rim held — every field given a value (`bastion-hash.ts`).
    boss.phase = "layer";
    boss.phaseBeat = 3;
    boss.cursor = 2;
    boss.goneMask = 1;
    boss.pieces = 15;
    boss.down = [true, true];
    boss.pullMilli = [700, 0];
    boss.tore = [false, true];
    boss.yawMilli = 120000;
    boss.spinning = true;
    boss.spinAtMilli = 400;
    boss.dischargeBeat = 9;
    boss.chargeTick = 41;
    boss.nextChargeBeat = 12;
  }
}
