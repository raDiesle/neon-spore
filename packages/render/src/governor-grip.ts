import {
  type GovernorState,
  governorAsksSeat,
  governorDone,
  governorLitStep,
  governorMarkLanded,
  governorOff,
  governorOpenMarks,
  governorTapping,
  type SimConfig,
} from "@neon-spore/sim";
import { governorStanding } from "./governor-pose.js";
import { type Dial, dialAt, hubR, TRACK_IN, TRACK_OUT } from "./governor-shape.js";
import type { Circle, Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE GOVERNOR's hand**: the tap on the dial (`sim/governor-hand.ts`,
 * `docs/spec/bosses.md` §11.58), answered on the governor `drawGovernor` puts
 * on the screen this frame, tipped and lowered as it is (`governorStanding`).
 *
 * **The tap is anywhere on the dial's face**, from a seat with a mark still
 * to land. The simulation judges where the needle is, never where the thumb
 * is (`governorMarkFor`), so the whole face answers, and a tap made early is
 * heard as a skid rather than falling through to nothing. **It is an edge**,
 * THE VALVE's pin: the press sends `on: true` and the lift `on: false`.
 *
 * Until 6 October 2026 the works round the dial were a two-pad brake's chord;
 * the owner's rework gave each seat a mark of its own, and the works are
 * scenery now.
 */

/** How far past the dial's drawn rim a tap still lands on it, in tiles. */
const RIM_PAST = 0.25;

/** Whether the governor is there to be touched: every phase but spent. */
export function governorTakesHand(s: GovernorState): boolean {
  return !governorDone(s);
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

/** Mark `i` of the lit step as a circle on the dial where it stands this frame. */
export function governorMarkCircle(d: Dial, markMilli: number): Circle {
  const at = dialAt(d, markMilli, (TRACK_IN + TRACK_OUT) / 2);
  return { x: at.x, y: at.y, r: d.r * (TRACK_OUT - TRACK_IN) * 1.5 };
}

/**
 * The mark a seat's thumb is asked for, as a circle — the first of its own
 * among those open — or, with no seat named, the first open mark of either.
 * Null while no tap is asked of it.
 */
export function governorTapCircle(
  l: Layout,
  cfg: SimConfig,
  s: GovernorState,
  beat: number,
  beatPhase: number,
  seat?: 1 | 2,
): Circle | null {
  const step = governorLitStep(s);
  if (step === null || !governorTapping(s)) return null;
  const i = governorOpenMarks(s).find((m) => seat === undefined || step.marks[m]?.seat === seat);
  const mark = i === undefined ? undefined : step.marks[i];
  if (mark === undefined) return null;
  return governorMarkCircle(governorStanding(l, cfg, s, beat, beatPhase), mark.markMilli);
}

/**
 * The hub as a circle where it stands this frame, at the dial's middle — what
 * a shot is fired at while it is lit. Its size before the hits shrink it.
 */
export function governorHubCircle(
  l: Layout,
  cfg: SimConfig,
  s: GovernorState,
  beat: number,
  beatPhase: number,
): Circle {
  const d = governorStanding(l, cfg, s, beat, beatPhase);
  return { x: d.cx, y: d.cy, r: hubR(l) };
}

/** A press on the governor: the tap on the dial, from a seat with a mark to land. */
export function governorGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "governor");
  if (s === null || !governorTakesHand(s)) return null;
  const seat = field.seat;
  if (!governorAsksSeat(s, seat)) return null;
  const d = governorStanding(l, field.cfg, s, field.beat, field.beatPhase);
  if (!onDial(l, d, x, y)) return null;
  return {
    player: seat,
    command: { kind: "drag", target: "governorTap", on: true, fromMilli: 0 },
    hold: { kind: "drag", target: "governorTap", player: seat, originX: x, originY: y },
  };
}

/**
 * **Whose tap a press on the dial is, on the test screen**: the seat whose
 * mark still to land is nearest round the dial to where the mouse came
 * down. Both seats tap the same face, so the desk's one mouse is signed by
 * the mark it is aimed at (`desk-grab.ts`); undefined off the dial or with
 * no tap lit.
 */
export function governorGripSeat(l: Layout, x: number, y: number, field: Field): 1 | 2 | undefined {
  const s = bossOf(field, "governor");
  const step = s === null ? null : governorLitStep(s);
  if (s === null || step === null || !governorTapping(s)) return undefined;
  const d = governorStanding(l, field.cfg, s, field.beat, field.beatPhase);
  if (!onDial(l, d, x, y)) return undefined;
  const milli = (Math.atan2(x - d.cx, (d.cy - y) / d.tilt) / (Math.PI * 2)) * 1000;
  let best: 1 | 2 | undefined;
  let nearest = Number.POSITIVE_INFINITY;
  step.marks.forEach((mark, i) => {
    if (governorMarkLanded(s, i)) return;
    const off = governorOff(milli, mark.markMilli);
    if (off < nearest) {
      nearest = off;
      best = mark.seat;
    }
  });
  return best;
}
