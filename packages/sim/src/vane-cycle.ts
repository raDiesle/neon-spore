import type { Color } from "./types.js";

/**
 * THE VANE's cycle, as arithmetic.
 *
 * The whole boss is one number moving: where the arm's tip stands. Everything
 * else on this page follows from it — which column an arrival is thrown into,
 * whether the bearing is open, which side of it splits, what colour it takes.
 * Nothing is stored and nothing is drawn from the rng, which is the third boss
 * in a row that can say that.
 *
 * Its own file, and not `vane.ts`, for the same reason `warden-cycle.ts` is not
 * `warden.ts`: the choreography moves state and this does not, so render/ and
 * the director can ask where the arm is standing without pulling a whole boss
 * in — and the director asks, because the table below is the cycle and there is
 * not allowed to be a second copy of it in a tool.
 *
 * What the cycle means in columns — where the tip stands on a field of this
 * width, which column it folds a body into, which column the split is on — is
 * `vane-arm.ts`, which reads this file and a `SimConfig`.
 */

/**
 * One stage of the sweep. Four of them make a cycle: held at one end, across,
 * held at the other, back. The holds are not a pause between two sweeps, they
 * are the encounter — a fold line that is moving cannot be named across a
 * voice delay, and the two beats a lever spends at the end of its travel are
 * the only beats in the fight when a column stays true long enough to say.
 */
export interface VaneStage {
  /** Beats it lasts. */
  beats: number;
  /** Where the tip stands as the stage opens, in thousandths of the reach, signed. */
  from: number;
  /** Where it stands as the next stage opens. */
  to: number;
  /** Whether the bearing's housing is split. The only beats a shot counts. */
  open: boolean;
  /** What the stage asks of the pair, in the words the director shows. */
  does: string;
}

/**
 * The cycle, and the only place it is written. `docs/spec/transfers-bosses.md`
 * describes it and points here; `tools/director` renders this array rather than
 * a table typed beside it, so a retune shows up in the editor without anybody
 * remembering to go and change it.
 *
 * Symmetric on purpose. The arm does the same thing in both directions, so a
 * pair that has learned one half of the cycle has learned the other — the
 * difficulty is in reading a fold, never in remembering which way round it is.
 */
export const VANE_CYCLE: readonly VaneStage[] = [
  {
    beats: 3,
    from: -1000,
    to: -1000,
    open: true,
    does: "held hard left — the housing splits one column to the bearing's right",
  },
  {
    beats: 3,
    from: -1000,
    to: 1000,
    open: false,
    does: "sweeping right; every arrival folds about the tip",
  },
  {
    beats: 3,
    from: 1000,
    to: 1000,
    open: true,
    does: "held hard right — the housing splits one column to the bearing's left",
  },
  {
    beats: 3,
    from: 1000,
    to: -1000,
    open: false,
    does: "sweeping left; every arrival folds about the tip",
  },
];

/**
 * Beats in one cycle. Added up rather than written down: the cycle *is* the
 * table above, and a `vaneCycleBeats` in `SimConfig` beside it would be a
 * second number that could disagree with it. It is not a tunable for the same
 * reason — moving it would not retime the fight, it would leave the stages
 * pointing at beats that are no longer theirs.
 */
export const VANE_CYCLE_BEATS = VANE_CYCLE.reduce((n, s) => n + s.beats, 0);

/** The cycle beat a stage opens on: everything before it, added up. */
export function vaneStageStart(index: number): number {
  let n = 0;
  for (let i = 0; i < index && i < VANE_CYCLE.length; i++) n += VANE_CYCLE[i]!.beats;
  return n;
}

/**
 * A phase, which follows from the pins and nothing else.
 *
 * The reach is the health bar. Every pin taken out of the bearing lets the arm
 * slip further out, so the boss answers damage by folding *more* of the field —
 * the same bargain the Bulb Queen makes when she sinks a tile per petal. The
 * timing never moves: holds and sweeps are the same length in every phase, so a
 * pair that learned the cycle on its first turn has learned it for the whole
 * fight (`docs/spec/bosses.md` 11.1). `above` reads as `WARDEN_PHASES` does.
 */
export interface VanePhase {
  name: string;
  above: number;
  /** Columns the tip stands out from the bearing at the end of a sweep. */
  reach: number;
}

export const VANE_PHASES: readonly VanePhase[] = [
  { name: "SWING", above: 3, reach: 2 },
  { name: "VEER", above: 1, reach: 4 },
  { name: "SEIZE", above: -1, reach: 5 },
];

/** The phase these pins put it in. Never stored — pins are the whole of it. */
export function vanePhase(pins: number): VanePhase {
  return VANE_PHASES.find((p) => pins > p.above) ?? VANE_PHASES[VANE_PHASES.length - 1]!;
}

/** The beat of the cycle the wave is on: 0 on the wave's first beat. */
export function vaneCycleBeat(waveBeat: number): number {
  const n = VANE_CYCLE_BEATS;
  return (((waveBeat - 1) % n) + n) % n;
}

/** Which cycle the wave is on, counted from 0. */
export function vaneCycle(waveBeat: number): number {
  return Math.floor(Math.max(0, waveBeat - 1) / VANE_CYCLE_BEATS);
}

/** Which stage of the cycle that beat falls in. */
export function vaneStageIndex(waveBeat: number): number {
  const at = vaneCycleBeat(waveBeat);
  let n = 0;
  for (let i = 0; i < VANE_CYCLE.length; i++) {
    n += VANE_CYCLE[i]!.beats;
    if (at < n) return i;
  }
  return VANE_CYCLE.length - 1;
}

/**
 * Where the tip stands this beat, in thousandths of the phase's reach.
 *
 * A stage's *last* beat is where it was going, not its first — so a sweep has
 * already left on the beat it begins, and the arm reaches the end of its travel
 * one beat before the housing splits. That beat is not slack: an arm that has
 * visibly stopped is the pair's tell that the window is about to open, and a
 * window with no tell in front of it cannot be called across a voice delay
 * (docs/spec/latency.md).
 */
export function vaneReachMilli(waveBeat: number): number {
  const i = vaneStageIndex(waveBeat);
  const stage = VANE_CYCLE[i]!;
  const k = vaneCycleBeat(waveBeat) - vaneStageStart(i);
  return stage.from + Math.round(((stage.to - stage.from) * (k + 1)) / stage.beats);
}

/**
 * Which opening the wave is in, counted from the first, or -1 while the housing
 * is shut. Derived rather than stored, so "this opening has taken its shot" is
 * one integer compared against another instead of a flag somebody has to
 * remember to clear.
 */
export function vaneOpening(waveBeat: number): number {
  const stage = vaneStageIndex(waveBeat);
  if (!VANE_CYCLE[stage]!.open) return -1;
  let nth = 0;
  for (let i = 0; i < stage; i++) if (VANE_CYCLE[i]!.open) nth += 1;
  const perCycle = VANE_CYCLE.filter((s) => s.open).length;
  return vaneCycle(waveBeat) * perCycle + nth;
}

/**
 * The colour the split housing carries, and so the colour the one shot has to
 * be. It alternates opening by opening, which makes it knowable half a cycle
 * ahead — the same promise the Warden's rim makes a whole cycle ahead.
 */
export function vaneColor(opening: number): Color {
  return opening % 2 === 0 ? "red" : "cyan";
}
