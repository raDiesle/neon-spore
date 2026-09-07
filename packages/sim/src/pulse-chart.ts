import type { SimConfig } from "./config.js";
import { PULSE_LANES, type PulseLane, type PulseNote, type PulseStage } from "./pulse.js";

/**
 * THE PULSE's chart, as arithmetic: where a note is in time, which note a
 * press is aimed at, and whether what was authored is a song at all.
 *
 * Nothing in here touches a `World` and nothing in here is about a seat. That
 * is the seam: `pulse-round.ts` owns the clock and the two meters, and this
 * owns the question *when is that arrow, and did that thumb land on it* — the
 * half a test can ask a hundred times a second without building a world.
 *
 * **A step is not a tick and the two are never mixed.** A note is authored on
 * the grid, lives in ticks, and the one conversion is `pulseNoteTick`. Written
 * out anywhere else it would be a second copy of where an arrow is, which is
 * exactly what `purity.test.ts`'s table of re-derived rules exists to stop.
 */

/** The tick a note is due on, from the tick the stage started. */
export function pulseNoteTick(cfg: SimConfig, startTick: number, note: PulseNote): number {
  return startTick + note.step * cfg.pulseStepTicks;
}

/** The tick the stage's grid runs out on — the last thing the song does. */
export function pulseEndTick(cfg: SimConfig, startTick: number, stage: PulseStage): number {
  return startTick + stage.steps * cfg.pulseStepTicks;
}

/**
 * How far a note has come, 0 at the top of the lane and 1 on the line.
 *
 * Past 1 it keeps going, which is on purpose: an arrow judged late is an arrow
 * that was already below the line when the thumb landed, and a picture that
 * clamped it at the line would show a hit happening in a place it did not.
 */
export function pulseNoteAt(
  cfg: SimConfig,
  startTick: number,
  note: PulseNote,
  tick: number,
): number {
  const due = pulseNoteTick(cfg, startTick, note);
  return 1 - (due - tick) / cfg.pulseLeadTicks;
}

/** Whether this seat can read this arrow, or only press it and hope. */
export function pulseVeiled(note: PulseNote, player: 1 | 2): boolean {
  return note.veil === player;
}

/** Whether this seat is the one who has to say it out loud. */
export function pulseCalls(note: PulseNote, player: 1 | 2): boolean {
  return note.veil !== undefined && note.veil !== player;
}

/** A lane as the index that goes on the wire and into the fingerprint. */
export function pulseLaneIndex(lane: PulseLane): number {
  return PULSE_LANES.indexOf(lane);
}

/**
 * Which note a press in this lane is aimed at, or -1 for a press at nothing.
 *
 * **The nearest unresolved one in the lane, and only inside the outer
 * window.** Nearest rather than next, because a thumb that arrives a little
 * late on a note is a thumb that should be judged against that note and not
 * against the one behind it — otherwise a single late press cascades, eating
 * the next arrow early and the one after that later still.
 *
 * `from` is where the scan starts, and it is what keeps this cheap: every note
 * below it is already resolved, and it only ever moves forward
 * (`pulseExpire`). The scan stops as soon as a note is further ahead than the
 * window reaches, so it reads a handful of arrows however long the song is.
 */
export function pulseAim(
  cfg: SimConfig,
  startTick: number,
  notes: readonly PulseNote[],
  judged: readonly number[],
  from: number,
  lane: PulseLane,
  tick: number,
): number {
  let best = -1;
  let bestGap = cfg.pulseGoodTicks + 1;
  for (let i = from; i < notes.length; i++) {
    const note = notes[i];
    if (note === undefined) continue;
    const due = pulseNoteTick(cfg, startTick, note);
    if (due - tick > cfg.pulseGoodTicks) break;
    if (note.lane !== lane || judged[i] !== 0) continue;
    const gap = Math.abs(due - tick);
    if (gap < bestGap) {
      best = i;
      bestGap = gap;
    }
  }
  return best;
}

/** A landed press as a `PULSE_JUDGES` index: 1 clean, 2 scruffy. */
export function pulseJudgeIndex(
  cfg: SimConfig,
  startTick: number,
  note: PulseNote,
  tick: number,
): number {
  return Math.abs(pulseNoteTick(cfg, startTick, note) - tick) <= cfg.pulsePerfectTicks ? 1 : 2;
}

/**
 * Notes this seat has run out of time on, and where the scan should start next
 * time. Called every tick, so it does the least it can: the cursor walks
 * forward over what is already resolved and stops at the first arrow still in
 * the air.
 */
export interface PulseExpiry {
  /** Indices that just became misses. Usually empty. */
  missed: number[];
  /** The new `from`. */
  from: number;
}

export function pulseExpire(
  cfg: SimConfig,
  startTick: number,
  notes: readonly PulseNote[],
  judged: readonly number[],
  from: number,
  tick: number,
): PulseExpiry {
  const missed: number[] = [];
  let i = from;
  for (; i < notes.length; i++) {
    const note = notes[i];
    if (note === undefined) break;
    if (pulseNoteTick(cfg, startTick, note) + cfg.pulseGoodTicks >= tick) break;
    if (judged[i] === 0) missed.push(i);
  }
  return { missed, from: i };
}

/**
 * What is wrong with an authored stage, or null.
 *
 * The same guard `mazeFault` and `pinballFault` are, and for the reason those
 * two were written: a chart is data, the director will let a person type one,
 * and every one of these is a mistake that reads on the screen as the round
 * being broken rather than as the chart being wrong. Notes out of order is the
 * one that matters most — `pulseAim` and `pulseExpire` both walk the list
 * forward and a chart that goes backwards makes arrows unhittable rather than
 * throwing.
 */
export function pulseFault(stage: PulseStage): string | null {
  if (stage.steps <= 0) return "a stage with no steps in it is not a song";
  if (stage.notes.length === 0) return "a stage with no notes in it is not a chart";
  let last = -1;
  for (const note of stage.notes) {
    if (note.step < 0) return `a note at step ${note.step} is before the song starts`;
    if (note.step >= stage.steps) return `a note at step ${note.step} is past the end of the song`;
    if (note.step < last) return "the notes are not in order, and the chart is read forwards";
    last = note.step;
  }
  // Two arrows in one lane on one step is one arrow drawn twice: the second is
  // unhittable, because the first takes the press.
  const seen = new Set<string>();
  for (const note of stage.notes) {
    const key = `${note.step}:${note.lane}`;
    if (seen.has(key)) return `two notes in the ${note.lane} lane on step ${note.step}`;
    seen.add(key);
  }
  return null;
}
