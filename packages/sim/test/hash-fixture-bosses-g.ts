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
}
