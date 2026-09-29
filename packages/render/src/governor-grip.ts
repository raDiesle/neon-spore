import {
  type GovernorState,
  governorDone,
  governorGovernor,
  governorLitStep,
  governorTapper,
  governorTapping,
  type SimConfig,
} from "@neon-spore/sim";
import { governorStanding } from "./governor-pose.js";
import { type Dial, dialAt, drumAt, headAt, TRACK_IN, TRACK_OUT } from "./governor-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE GOVERNOR's hands**: the brake's chord on the works and the tap on
 * the dial (`sim/governor-hand.ts`, `docs/spec/bosses.md` §11.58). Both are
 * answered on the governor `drawGovernor` puts on the screen this frame,
 * tipped and lowered as it is (`governorStanding`).
 *
 * **The chord is pressed on the works, not on a jaw.** The yoke's jaws are
 * a sixth of a tile wide and a finger's width apart, and two thumbs on them
 * would cover the drum they are shutting on. So the zone is THE TRIVET's
 * (`trivet-grip.ts`): the width of the field, from over the spindle's head
 * down past the dial's sides, and **only outside the dial**, which is the
 * tap's. Which pad a finger is, is the order it landed in (`chord.ts`). The
 * target names the seat — `governorChordLeft` the pilot's, `governorChordRight`
 * the navigator's — so a press on this phone is always this seat's chord.
 *
 * **The works are the braking seat's while a tap is asked**, and either
 * seat's otherwise. The simulation records a pad from either seat at any
 * time, so a chord already whole when a step lights brakes from its first
 * tick. But while a tap step is lit, the tapper's thumb on the works is
 * worth nothing. Refusing it here lets the desk's one mouse fall through to
 * the seat that can use it (`desk-grab.ts`).
 *
 * **The tap is anywhere on the dial's face**, and only the lit step's
 * tapper's. The simulation judges where the needle is, never where the thumb
 * is (`governorOnMark`), so the whole face answers, and a tap made early is
 * heard as a skid rather than falling through to nothing. **It is an edge**,
 * THE VALVE's pin: the press sends `on: true` and the lift `on: false`.
 */

/** Half a tile of zone over the spindle's head, and one under the dial's near rim. */
const ABOVE = 0.5;
const BELOW = 1;
/** How far past the dial's drawn rim a tap still lands on it, in tiles. */
const RIM_PAST = 0.25;

/** Whether the governor is there to be braked: every phase but spent. */
export function governorTakesHand(s: GovernorState): boolean {
  return !governorDone(s);
}

/** Whether `seat`'s chord is answered now: the braking seat's while a tap is lit, either seat's otherwise. */
export function governorChordsFor(s: GovernorState, seat: 1 | 2): boolean {
  if (!governorTakesHand(s)) return false;
  return !governorTapping(s) || governorGovernor(s) === seat;
}

/**
 * Whether a point lies on the dial: its drawn rim and a quarter tile past it.
 * Not `hitReach`'s half again, which on a disc this size would eat a tile of
 * the works around it.
 */
function onDial(l: Layout, d: Dial, x: number, y: number): boolean {
  const past = RIM_PAST * l.tile;
  const rx = d.r + past;
  const ry = d.r * d.tilt + past;
  return ((x - d.cx) / rx) ** 2 + ((y - d.cy) / ry) ** 2 <= 1;
}

/** The brake drum as a circle, where the ghost thumb stands for a chord and what `handleCircle` answers. */
export function governorYokeCircle(
  l: Layout,
  cfg: SimConfig,
  s: GovernorState,
  beat: number,
  beatPhase: number,
): Circle {
  const drum = drumAt(l, governorStanding(l, cfg, s, beat, beatPhase));
  return { x: drum.at.x, y: drum.at.y, r: drum.r * 1.4 };
}

/** The lit mark as a circle while a tap is asked: where the ghost thumb taps, and nothing between. */
export function governorTapCircle(
  l: Layout,
  cfg: SimConfig,
  s: GovernorState,
  beat: number,
  beatPhase: number,
): Circle | null {
  const step = governorLitStep(s);
  if (step === null || !governorTapping(s)) return null;
  const d = governorStanding(l, cfg, s, beat, beatPhase);
  const at = dialAt(d, step.markMilli, (TRACK_IN + TRACK_OUT) / 2);
  return { x: at.x, y: at.y, r: d.r * (TRACK_OUT - TRACK_IN) * 1.5 };
}

/** A press on the governor: the tap on the dial, or one finger of this seat's chord on the works. */
export function governorGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "governor");
  if (s === null || !governorTakesHand(s)) return null;
  const seat = field.seat;
  const d = governorStanding(l, field.cfg, s, field.beat, field.beatPhase);
  if (onDial(l, d, x, y)) {
    if (governorTapper(s) !== seat) return null;
    return {
      player: seat,
      command: { kind: "drag", target: "governorTap", on: true, fromMilli: 0 },
      hold: { kind: "drag", target: "governorTap", player: seat, originX: x, originY: y },
    };
  }
  if (!governorChordsFor(s, seat)) return null;
  const top = headAt(l, d).y - ABOVE * l.tile;
  const bottom = d.cy + d.r * d.tilt + BELOW * l.tile;
  if (y < top || y > bottom || x < l.gridLeft || x > l.gridLeft + l.gridWidth) return null;
  const target = seat === 1 ? "governorChordLeft" : "governorChordRight";
  return {
    player: seat,
    command: null,
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, chord: true },
  };
}
