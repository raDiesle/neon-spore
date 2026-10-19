import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE CHRYSALIS on: the last page of `hash-fixture.ts`**, and the one a new
 * boss's entry and patch go on. Opened the day THE CHRYSALIS landed, 14
 * October 2026, because `-f.ts` stood at 235 lines. `BOSS_KINDS` is appended
 * to, never inserted into, so the newest boss is always at the end of this
 * file; when it passes 250 lines, a `-h.ts` takes the next boss.
 */

/** THE CHRYSALIS on's share of `BOSS_ENTRIES`. */
export const BOSS_ENTRIES_G = {
  // Every skin once, the turns, tracks, offsets and colours apart (`chrysalis-hash.ts`).
  chrysalis: {
    kind: "chrysalis",
    steps: [
      { skin: "slime", rubs: 4, beats: 11 },
      { skin: "quills", tracks: ["sweep", "climb"], beats: 13 },
      { skin: "sacs", offsets: [2, -1], beats: 17 },
      { skin: "heart", offsets: [-2, 1], colors: ["cyan", "red"], beats: 19 },
    ],
  },
  // Every kind of head once, the counts, ways, laps, offsets and colours apart (`hydra-hash.ts`).
  hydra: {
    kind: "hydra",
    steps: [
      { head: "bite", count: 2, ways: [1, -1], beats: 11 },
      { head: "coil", laps: 3, beats: 13 },
      { head: "eye", count: 3, beats: 17 },
      { head: "maw", offsets: [2, -1], colors: ["cyan", "red"], beats: 19 },
    ],
  },
  // Two steps, the second of two colours, offsets and ripening apart (`brood-hash.ts`).
  brood: {
    kind: "brood",
    steps: [
      { buds: [{ offset: 0, color: "red" }], ripenBeats: 9 },
      {
        buds: [
          { offset: -3, color: "cyan" },
          { offset: 2, color: "red" },
        ],
        ripenBeats: 12,
      },
    ],
  },
  // Two clutches, every kind of throw once, the columns and beats apart (`matron-hash.ts`).
  matron: {
    kind: "matron",
    steps: [
      {
        beats: 13,
        pods: [-3, 2],
        throws: [
          { at: 1, offset: -1, what: "red" },
          { at: 4, offset: 3, what: "cyan" },
        ],
      },
      {
        beats: 17,
        pods: [1, -2, 4],
        throws: [
          { at: 2, offset: 0, what: "rock" },
          { at: 6, offset: -4, what: "torch" },
        ],
      },
    ],
  },
  // Both kinds of step, a shed and a hop, the spots and counts apart (`moth-hash.ts`).
  moth: {
    kind: "moth",
    steps: [
      { kind: "wings", spots: [-2, 1], dustEvery: 5 },
      { kind: "belly", hits: 2, hopEvery: 7 },
    ],
  },
  // Two levels, a stacked pair in one, the columns and colours apart (`geode-hash.ts`).
  geode: {
    kind: "geode",
    steps: [
      { beats: 11, cracks: [{ at: 2, color: "red" }] },
      {
        beats: 13,
        cracks: [
          { at: -1, color: "cyan" },
          { at: -1, color: "red" },
        ],
      },
    ],
  },
  // Two hands, both kinds of pod, a swap and a drop each, the columns and beats apart (`swindle-hash.ts`).
  swindle: {
    kind: "swindle",
    steps: [
      {
        pods: [
          { offset: -2, kind: "pod" },
          { offset: 3, kind: "husk" },
        ],
        swaps: [{ at: 1, a: 0, b: 1 }],
        drops: [{ at: 5, pod: 1 }],
      },
      {
        pods: [
          { offset: 1, kind: "husk" },
          { offset: -4, kind: "pod" },
          { offset: 4, kind: "pod" },
        ],
        swaps: [{ at: 2, a: 2, b: 0 }],
        drops: [{ at: 7, pod: 2 }],
      },
    ],
  },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE CHRYSALIS on's share of `patchBoss`. */
export function patchBossG(boss: BossState): void {
  if (boss.kind === "chrysalis") {
    // The sacs lit with one gone and the next swelling, the left thumb down on
    // a quill part way and the right's ripped under it, both halves of the
    // rub counted — every field given a value (`chrysalis-hash.ts`).
    boss.phase = "skin";
    boss.phaseBeat = 3;
    boss.cursor = 2;
    boss.goneMask = 1;
    boss.pieces = 11;
    boss.down = [true, true];
    boss.pullMilli = [700, 0];
    boss.tore = [false, true];
    boss.rubAt = [2, 5];
    boss.rubbed = [3, 4];
    boss.sprayBeat = 9;
    boss.swellTick = 41;
    boss.nextSwellBeat = 12;
  }
  if (boss.kind === "hydra") {
    // The eyes lit with one gone, the left lid open and the right shut, the
    // left thumb part way across a neck and the right's spent, both coils
    // part unwound — every field given a value (`hydra-hash.ts`).
    boss.phase = "heads";
    boss.phaseBeat = 3;
    boss.cursor = 2;
    boss.goneMask = 1;
    boss.pieces = 7;
    boss.down = [true, true];
    boss.cutMilli = [700, 0];
    boss.spent = [false, true];
    boss.turning = [true, false];
    boss.turnAtMilli = [1200, -800];
    boss.unwoundMilli = [2400, 900];
    boss.lidOpen = [true, false];
    boss.blinkBeat = [9, 12];
  }
  if (boss.kind === "brood") {
    // The second step growing, one bud popped and one regrowing after a
    // drop — every field given a value (`brood-hash.ts`).
    boss.phase = "grow";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.dropped = 2;
    boss.buds = [
      { col: 2, color: "cyan", bornBeat: 3, popped: true },
      { col: 7, color: "red", bornBeat: 11, popped: false },
    ];
  }
  if (boss.kind === "matron") {
    // The second clutch hung with one pod swallowed and one throw gone —
    // every field given a value (`matron-hash.ts`).
    boss.phase = "hang";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.hung = [41, 42, 43];
    boss.takenMask = 2;
    boss.taken = 3;
    boss.thrown = 1;
  }
  if (boss.kind === "geode") {
    // The second level lit with its first piece cut and the second whole —
    // every field given a value (`geode-hash.ts`).
    boss.phase = "crack";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.pieces = 2;
    boss.cutTick = [41, -1];
  }
  if (boss.kind === "swindle") {
    // The second hand hung, a swap gliding and a drop gone, one real pod
    // already swallowed — every field given a value (`swindle-hash.ts`).
    boss.phase = "hang";
    boss.phaseBeat = 3;
    boss.cursor = 1;
    boss.hung = [41, 42, 43];
    boss.swapped = 1;
    boss.dropped = 1;
    boss.glide = [41, 43];
    boss.glideTo = [9000, 6000];
    boss.glideEnd = 4;
    boss.taken = 1;
  }
  if (boss.kind === "moth") {
    // A wings step lit, one spot torn, sinking two beats over a cannon it
    // drifted to, a slick shed — every field given a value (`moth-hash.ts`).
    boss.phase = "flit";
    boss.phaseBeat = 3;
    boss.centre = 4;
    boss.spots = [1];
    boss.hits = 1;
    boss.settle = 2;
    boss.seenCol = 4;
    boss.seenBeat = 5;
    boss.flitBeat = 7;
    boss.shed = 2;
    boss.landed = 1;
  }
}
