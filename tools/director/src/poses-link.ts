import {
  beatSeconds,
  coilCharged,
  DEFAULT_CONFIG,
  type SpawnEntry,
  type TimedCommand,
  wardenTether,
} from "@neon-spore/sim";
import {
  fresh,
  guard,
  type Pose,
  pullCord,
  run,
  runUntil,
  POSE_TPB as TPB,
  until,
  ward,
} from "./pose-kit.js";

/**
 * The two states a candidate for something that **joins two things** is
 * judged on.
 *
 * Its own file for `poses-crossing.ts`'s reason: neither `poses-versus.ts` nor
 * `poses-surface.ts` has room, and the seam is a real one. A surface pose holds
 * a body still; an event pose replays one instant; a crossing pose follows a
 * path. What THE COIL's chain and THE WARDEN's rope have in common is that the
 * subject is a **link** — a charge passing from one dome to another, a line
 * between a hand and the thing it opens — and a link has to be judged with
 * both of its ends on the frame and something travelling between them. So
 * both poses here are cropped to the field, and both are *made to happen*:
 * a chain does not start until a ward opens a dome, and a rope says nothing
 * until a hand pulls it.
 */

/** The column every coil is authored in. The right wall, which is where a
 * coil comes in from anyway; the wave puts it there and `coilOnSpawn` sends it
 * left. */
const WALL = 10;

/**
 * Where the plate stands and when the three domes are authored.
 *
 * Three, spaced so the chain has somewhere to go twice: the first comes in
 * early enough to reach the left wall, drop `coilDropRows` and be on its way
 * back before the other two have crossed half the field, so the bolt that
 * leaves it climbs a diagonal to a dome in another row rather than sliding
 * along the row it is in. The plate waits in `WARD_COL`, and the trigger is
 * pressed across the beats the first dome is due there — held rather than
 * timed to a tick, because the window is the rule's (`guardArmed`) and a pose
 * that guessed the tick would go quietly wrong the first time the crossing
 * was re-timed.
 */
const WARD_COL = 4;
const SPAWN_BEATS = [0, 6, 12] as const;
const PRESS_FROM_BEAT = 15.75;
const PRESS_TO_BEAT = 16.25;

/** How long the whole chain is on the field once it has started: two more
 * jumps of `coilJumpBeats` each, and a beat for the last rock to be seen
 * running for the wall. Off the config, so a re-timed jump re-times the
 * replay with it. */
const COIL_CADENCE_SECONDS = (DEFAULT_CONFIG.coilJumpBeats * 2 + 2) * beatSeconds(DEFAULT_CONFIG);

/**
 * Three domes on the field and the ward opening the first, handed over on the
 * tick the charge leaves it for the next one.
 *
 * `creature:coil` is judged here. The dome is THE CLASP's and the rock is a
 * meteor's; what the coil draws of its own is the studs the charge leaves by
 * and the bolt it crosses on, and neither is on the frame until a dome has
 * failed — so the pose fails one. The chain then runs on its own clock: three
 * beats to the next dome, which opens and throws the charge on to the last.
 * The crop is the field because a link has two ends.
 */
export const COIL_POSE: Pose = {
  name: "COIL · THE CHARGE JUMPING",
  note: "Three rocks in domes crossing the field, the plate under one of them and the trigger pressed. The dome comes off, its rock runs for the far wall, and the charge it was holding jumps to another dome — three beats across the field on player 1's screen alone — which opens in turn and throws it on to the last.",
  lookAt:
    "the bolt crossing from where a dome failed to the one it is going to, and the three studs on the rim it lands on — whether the charge reads as one thing passing between domes",
  crop: "field",
  cadenceSeconds: COIL_CADENCE_SECONDS,
  build: () => {
    const entries: SpawnEntry[] = SPAWN_BEATS.map((beat) => ({
      beat,
      col: WALL,
      kind: "coil",
      color: null,
    }));
    const w = fresh(entries);
    const presses: TimedCommand[] = [ward(w.tick, WARD_COL)];
    // A press every quarter beat across the window: `guardArmed` keeps the
    // shield answering for `guardWindowMs` after each, so the ward is standing
    // whenever the first dome arrives in the column.
    const quarter = Math.round(TPB / 4);
    for (let t = Math.round(PRESS_FROM_BEAT * TPB); t <= PRESS_TO_BEAT * TPB; t += quarter)
      presses.push(guard(t));
    runUntil(
      w,
      "a charge on its way to a dome",
      presses,
      (x) => x.creatures.some((c) => c.kind === "coil" && coilCharged(c)),
      Math.round(TPB * (PRESS_TO_BEAT + 2)),
    );
    return w;
  },
};

/**
 * The rope's cycle under the pilot's hand, in beats: a rest while it hangs, a
 * pull that ramps a tick at a time, a hold, and a release. Six beats: two of
 * them fit in one of THE WARDEN's twelve-beat cycles, so the rope the boss
 * replaces at the top of each cycle is replaced during a rest and never under
 * a moving hand.
 */
const REST_BEATS = 1;
const PULL_BEATS = 2;
const HOLD_BEATS = 2;
const CYCLE_BEATS = 6;
/** Beats the build runs past the attach before the hand's clock starts, so
 * the line has glided down to where it hangs before anybody takes it. */
const HANG_BEATS = 2;
const TETHER_CADENCE_SECONDS = DEFAULT_CONFIG.wardenCycleBeats * beatSeconds(DEFAULT_CONFIG);

/** The hand coming off the rope. `pullCord` is the hand going on. */
const letGo = (tick: number, id: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "wardenTether", on: false, fromMilli: 0, id },
});

/**
 * THE WARDEN's rope, hanging, taken, pulled taut and let go, over and over.
 *
 * `creature:tether` is judged here rather than on `WARDEN · ARMOURED`, where
 * the rope hangs slack and nobody touches it: the rope is its own gauge, and
 * what a look for it has to get right is the whole run from slack to taut,
 * which only happens under a hand. The pull ramps a tick at a time, which is
 * what a finger on glass actually sends, and goes a little past taut for
 * `LID · THE EYE OPEN`'s reason. The crop is the field because the rope's
 * two ends are five rows apart.
 */
export const TETHER_POSE: Pose = {
  name: "TETHER · PULLED",
  note: "The boss across the middle of the field with its rope hanging from the eye. The pilot's thumb takes the handle, pulls it down over two beats until the line is taut and the hatch is open, holds it, and lets go — the line goes slack and the hatch shuts on the instant. Then the hand takes it again.",
  lookAt:
    "the line between the eye and the handle — what it looks like slack, what it does as the pull comes on, and whether it reads as a thing with a near side or as a stroke",
  crop: "field",
  cadenceSeconds: TETHER_CADENCE_SECONDS,
  build: () => {
    const w = fresh([], [], { kind: "warden" });
    until(w, "a rope hanging from the warden", (x) => wardenTether(x) !== null);
    run(w, TPB * HANG_BEATS);
    return w;
  },
  hand: (w) => {
    const rope = wardenTether(w);
    if (rope === null) return [];
    // The tick the rope first hung is the tick the build handed over minus
    // the hang, and the rope hangs from beat one: `wardenCycleBeat` is zero on
    // the wave's first beat, so the clock here counts from there.
    const since = w.tick - TPB * (1 + HANG_BEATS);
    if (since < 0) return [];
    // Whole ticks throughout: a rest that lands between two ticks is a
    // release that never fires.
    const inCycle = (since % (TPB * CYCLE_BEATS)) - Math.round(TPB * REST_BEATS);
    const pullTicks = Math.round(TPB * PULL_BEATS);
    if (inCycle < 0) return [];
    if (inCycle < pullTicks) {
      const reach = Math.round((w.cfg.wardenTautMilli * 1.2 * (inCycle + 1)) / pullTicks);
      return [pullCord(w.tick, rope.id, reach, "wardenTether")];
    }
    if (inCycle === Math.round(TPB * (PULL_BEATS + HOLD_BEATS))) return [letGo(w.tick, rope.id)];
    return [];
  },
};
