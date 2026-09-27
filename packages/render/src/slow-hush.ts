import { NO_SLOW, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **A boss's natural motion dies down while THE SLOW is open** — the owner,
 * 27 September 2026: *circles should almost stay where they are and not move
 * because of the boss's natural body movement, otherwise it's hard to hit.*
 *
 * One curve for every boss that has such a motion under its marks: a weave, a
 * shiver, a bob. Motion that *is* the rule — a fall a row a beat, a gesture's
 * travel — is not multiplied by it. THE INSTAR's weave was the first
 * (`instar-sway.ts`); `tools/director/test/boss-hush.test.ts` holds the rest
 * to the speed the owner's words were written down as.
 */

/**
 * THE SLOW's window as the world holds it, which is all the hush reads. A
 * `World` is one; a hit test's `Field` carries one (`touch-field.ts`).
 */
export type SlowSpan = Pick<World, "slowFromBeat" | "slowToBeat">;

/** No window, ever: the motion at its full size. */
export const NO_SPAN: SlowSpan = { slowFromBeat: NO_SLOW, slowToBeat: NO_SLOW };

/** What is left of a motion inside a window unless its boss needs less (`HUSH.liveMark` in `idle-drift.ts`). */
export const HUSHED = 0.1;

/** Beats a motion takes to die down as a window opens, and to come back after it shuts. */
const HUSH_BEATS = 0.5;

/**
 * **How much of a motion is left**, 1 with no window and `hushed` inside
 * one. It eases down over the window's first half beat, and back up over the
 * half beat after it shuts from wherever it had got to, so a window shorter
 * than the ease never jumps. A pure function of the window's two ends, which
 * the world keeps after a window shuts (`sim/slow.ts` `closeSlow`).
 */
export function slowHush(slow: SlowSpan, beat: number, beatPhase: number, hushed = HUSHED): number {
  if (slow.slowToBeat === NO_SLOW) return 1;
  const b = beat + beatPhase;
  if (b < slow.slowFromBeat) return 1;
  const dying = (since: number) => 1 - (1 - hushed) * smoothstep(since / HUSH_BEATS);
  if (b < slow.slowToBeat) return dying(b - slow.slowFromBeat);
  const left = dying(slow.slowToBeat - slow.slowFromBeat);
  return left + (1 - left) * smoothstep((b - slow.slowToBeat) / HUSH_BEATS);
}
