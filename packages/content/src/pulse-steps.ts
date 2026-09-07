import { DEFAULT_CONFIG, type PulseLane, type PulseNote, ticksPerBeat } from "@neon-spore/sim";

/**
 * A chart, written as bars of text, and the reader that turns one into notes.
 *
 * **Because a chart written as objects is a chart nobody can read.** A stage is
 * a couple of hundred arrows and every one of them is a `{ step, lane }` — two
 * hundred lines in which the only thing that matters, the *shape* of the
 * rhythm, is invisible. Every step-file format ever written is a grid of
 * characters for that reason, and this is the same idea cut down to what one
 * round needs: a bar is a line, a step is a token, and the pattern is legible
 * from across the room.
 *
 * ```
 * "L  .  .   D  .  .   U  .  .   R  .  ."   one arrow on each beat
 * "L  .  D   .  U  .   R  .  L   .  D  ."   one every other step: three against two
 * "L1 .  .   R  .  .   D2 .  .   U  .  ."   the first is player 1's to be told
 * ```
 *
 * A token is one or more lanes — `L` left, `D` down, `U` up, `R` right — and
 * two on one token is a jump, both to be pressed on the same step. A trailing
 * `1` or `2` is the **veil**: the seat that cannot read it and has to be told
 * (`PulseNote.veil`). `.` is a rest.
 *
 * This is content and it is data; the reader is here rather than in `sim`
 * because a chart is authored, and nothing the simulation runs ever sees a
 * string.
 */

/**
 * Steps to a beat, off the shipped config rather than written down again.
 *
 * A step is `pulseStepTicks` and a beat is `ticksPerBeat`, and the one thing a
 * chart must never do is disagree with either — a bar of the wrong length is a
 * song that walks away from the click a bar at a time. `purity.test.ts` keeps
 * a table of exactly this kind of re-derivation, and this is the call that
 * keeps this file off it.
 */
export const PULSE_STEPS_PER_BEAT = ticksPerBeat(DEFAULT_CONFIG) / DEFAULT_CONFIG.pulseStepTicks;

/** Steps in a bar. Four beats, like every other bar in this game. */
export const PULSE_BAR_STEPS = PULSE_STEPS_PER_BEAT * 4;

const LANE_OF: Record<string, PulseLane> = { L: "left", D: "down", U: "up", R: "right" };

/**
 * The bars, read into notes in order.
 *
 * It throws rather than skipping, and on the two things that are typing
 * mistakes rather than choices: a bar of the wrong length silently shifts
 * everything after it, and an unknown letter silently drops an arrow. Both
 * read on the screen as the round being broken.
 */
export function pulseBars(bars: readonly string[]): PulseNote[] {
  const notes: PulseNote[] = [];
  bars.forEach((bar, index) => {
    const tokens = bar.trim().split(/\s+/);
    if (tokens.length !== PULSE_BAR_STEPS) {
      throw new Error(
        `bar ${index + 1} has ${tokens.length} steps in it and a bar is ${PULSE_BAR_STEPS}`,
      );
    }
    tokens.forEach((token, at) => {
      if (token === ".") return;
      const step = index * PULSE_BAR_STEPS + at;
      const tail = token.at(-1);
      const veil = tail === "1" ? 1 : tail === "2" ? 2 : undefined;
      const lanes = veil === undefined ? token : token.slice(0, -1);
      for (const letter of lanes) {
        const lane = LANE_OF[letter];
        if (lane === undefined) {
          throw new Error(`bar ${index + 1} step ${at + 1}: "${letter}" is not a lane`);
        }
        notes.push(veil === undefined ? { step, lane } : { step, lane, veil });
      }
    });
  });
  return notes;
}

/** How long a chart of this many bars runs, in steps. */
export function pulseBarSteps(bars: readonly string[]): number {
  return bars.length * PULSE_BAR_STEPS;
}
