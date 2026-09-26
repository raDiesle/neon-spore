import type { BossEntry } from "../src/boss-entries.js";
import type { BossState } from "../src/boss-union.js";

/**
 * **THE HASP on: the fourth page of `hash-fixture.ts`**, opened the day that
 * boss landed because `-c.ts` stood at 229 lines and an entry with its
 * paragraph and a patch with its own would not fit in the twenty-one that
 * were left. `-c.ts`' own header names this file as the one that would take
 * the next boss, which is what happened.
 *
 * The rule is unchanged: `BOSS_KINDS` is appended to, never inserted into, so
 * the newest boss is always at the end of the last page. The reasons the
 * fixture works the way it does are on `-a.ts` and in `hash-fixture.ts`,
 * which composes the pages.
 */

/** What each is authored with; the keys are the page's share of `BOSS_KINDS`. */
export const BOSS_ENTRIES_D = {
  // THE HASP authors nothing at all, which is the entry (`HaspEntry`): three
  // clasps is the silhouette and every fuse, reach and winding is tuning, so
  // there is no figure here for the walk to vary. What it has to see varied
  // is in `patchBossD` below, and all of it is state (`hasp-hash.ts`).
  hasp: { kind: "hasp" },
  // THE RATCHET the same: seven teeth is the silhouette (`RatchetEntry`).
  ratchet: { kind: "ratchet" },
  // THE NETTLE authors its script whole, for THE INSTAR's reason on `-c.ts`:
  // one step, a thumb's mark and a panel's, because the fingerprint's job is
  // the cursor and the per-mark counts, and its own parts and poses are read
  // off its own lists by place (`instar-hash.ts`).
  nettle: {
    kind: "nettle",
    steps: [
      {
        pose: "gaze",
        arrive: "approach",
        morphBeats: 2,
        windowBeats: 6,
        landBeats: 2,
        pushMilli: 250,
        marks: [
          { seat: "p1", part: "arm", gesture: "pullUp", xMilli: 318, yMilli: 720, need: 1000 },
          { seat: "both", part: "spot", gesture: "shoot", xMilli: 681, yMilli: 300, need: 3 },
        ],
      },
    ],
  },
  // THE MANTLE authors its thresholds whole, for THE GIMBAL's reason on
  // `-c.ts`: two of them rather than the shipped four, because the
  // fingerprint's job is the cursor and both handles' depths, not the length
  // of the list (`mantle-hash.ts`).
  mantle: { kind: "mantle", thresholds: [1400, 1700] },
  // THE KEEL authors its socket and its tempo run; two joints rather than the
  // shipped three, for the same reason (`keel-hash.ts`).
  keel: { kind: "keel", socket: "cyan", reprise: [4, 0] },
} satisfies Partial<Record<BossEntry["kind"], BossEntry>>;

/** THE HASP on's share of `patchBoss`. */
export function patchBossD(boss: BossState): void {
  if (boss.kind === "hasp") {
    // A clasp part way wound with both hands on it: the latch held from a beat
    // of its own, the wheel turned off its start and her bearing remembered,
    // the burn counted from a beat, the gate said, and a bolt loose in a column
    // with a beat on it — every nullable field given a value, so the walk can
    // tell a hashed one from a field it never sees change (`hasp-hash.ts`).
    //
    // `latchMilli` and `handMilli` are deliberately *not* their empty values
    // (`NO_LATCH`, `NO_BEARING`): a field the fixture leaves at the sentinel it
    // is installed with is a field the walk cannot move off its installed
    // value, and both of these are read every tick by the gate.
    boss.phase = "work";
    boss.phaseBeat = 3;
    boss.hasps = 2;
    boss.latchMilli = 720;
    boss.gripBeat = 4;
    boss.burnBeat = 5;
    boss.wheelMilli = 380;
    boss.handMilli = 640;
    boss.woundMilli = 520;
    boss.seized = true;
    boss.boltCol = 4;
    boss.boltBeat = 6;
  }
  if (boss.kind === "ratchet") {
    // A rack part way up with both hands on it: every field off the value
    // it is installed with, the catch set and the pawl down, so the walk can
    // tell a hashed one from one it never sees change (`ratchet-hash.ts`).
    boss.phase = "climb";
    boss.phaseBeat = 3;
    boss.teeth = 4;
    boss.clean = 2;
    boss.catchMilli = 700;
    boss.catchSpent = true;
    boss.pawlDown = true;
    boss.cleanLast = true;
    boss.boltCol = 4;
    boss.boltBeat = 6;
  }
  if (boss.kind === "nettle") {
    // THE INSTAR's patch on `-c.ts`: the marks up, a thumb on the arm, the
    // arm halfway and the spot shot out a beat ago.
    boss.phase = "act";
    boss.phaseBeat = 3;
    boss.progress = [500, 3];
    boss.doneBeat = [-1, 5];
    boss.ref = [250, -1];
    boss.thumbs = [1, 0];
  }
  if (boss.kind === "mantle") {
    // One plate-pair sheared, both handles held past the floor, a spark
    // leaking in a column with a beat on it, and the finale's alternation a
    // tap in — every nullable field given a value, so the walk can tell a
    // hashed one from a field it never sees change (`mantle-hash.ts`).
    boss.cursor = 1;
    boss.phase = "spark";
    boss.phaseBeat = 3;
    boss.depthMilli = [820, 640];
    boss.sparkCol = 4;
    boss.sparkBeat = 5;
    boss.heartbeatNext = 1;
    boss.heartbeatDone = 2;
  }
  if (boss.kind === "keel") {
    // Into the tempo run with a joint lit and a rock in the air at once —
    // never both in play, but every field given a value so the walk can
    // tell a hashed one from one it never sees change (`keel-hash.ts`).
    boss.phase = "joint";
    boss.phaseBeat = 3;
    boss.movement = 3;
    boss.joint = 4;
    boss.locked = [true, true, false, true, true, true];
    boss.repriseCursor = 1;
    boss.rockCol = 10;
    boss.rockBeat = 5;
  }
}
