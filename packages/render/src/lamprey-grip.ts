import {
  LAMPREY_TEETH,
  type LampreyState,
  lampreyBiting,
  lampreyStep,
  lampreyTapper,
  type SimConfig,
} from "@neon-spore/sim";
import { fieldCol } from "./field-flip.js";
import { lampreyPose } from "./lamprey-pose.js";
import { type LampreyPose, lampreyGulletReach, lampreyToothAt } from "./lamprey-shape.js";
import { type Circle, colFromX, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE LAMPREY's hands**: the thumb on the jaw and the tap on the teeth
 * (`sim/lamprey-hand.ts`, `docs/spec/bosses.md` §11.59). Both are answered on
 * the eel `drawLamprey` puts on the screen this frame (`lampreyPose`).
 *
 * **The jaw is a band on the hull round the mouth**, as wide as the grip
 * reaches either side of it and the mark drawn there (`lamprey-marks.ts`), so
 * a thumb on the band is a thumb the simulation holds with. **It follows**:
 * the press sends the column under it as `id`, and so does every move after
 * (`touch-move.ts`, `follows`), because the jaw crawls and the thumb chases
 * it — wherever the thumb is when it leaves the band is still the column the
 * simulation judges. A lift lets go.
 *
 * **The jaw is the pinner's**, and only the pinner's: in a bite the step's
 * pinner, and while the eel swims in, pulls loose or rears the pinner of the
 * bite to come, so a thumb laid on the hull before the mouth lands holds it
 * from the first beat. The other seat's press falls through — to the
 * cannon, under the mouth, and on the desk to the seat that pins
 * (`desk-grab.ts`). Reared over the middle the band is gone, and the hull is
 * the cannon's again for the gullet.
 *
 * **The teeth are the mouth**, and only the bite's tapper's: a press inside
 * the lip is the tooth it is nearest, an edge like THE VALVE's pin — the press
 * sends `on: true` and the lift `on: false` — so a thumb left down has to lift
 * to tap again. Every tooth answers, the lit one or not: a wrong tooth snaps
 * the last one back, and that is the simulation's to say.
 */

/**
 * How far above the hull the jaw's band reaches, and below it, in tiles: up
 * past the mouth hovering before a bite, so a thumb laid on it is there when
 * it lands.
 */
const ABOVE = 1.5;
const BELOW = 0.6;
/** How far past the lip a tap still lands on the mouth, in tiles. */
const LIP_PAST = 0.3;

/** The seat that pins the bite that is on or the next one, or null with none to come. */
export function lampreyJawSeat(s: LampreyState): 1 | 2 | null {
  if (s.phase !== "entering" && s.phase !== "bite" && s.phase !== "loose") return null;
  return lampreyStep(s)?.pinner ?? null;
}

/** The jaw's band where the mouth is this frame, as a circle: where the ghost thumb stands. */
export function lampreyJawCircle(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (!lampreyBiting(s)) return null;
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  return { x: p.x, y: l.hullY, r: (cfg.lampreyGripCols + 0.5) * l.tile };
}

/** The lit tooth as a circle while a bite is on: where the ghost thumb taps. */
export function lampreyToothCircle(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): Circle | null {
  if (!lampreyBiting(s)) return null;
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  const at = lampreyToothAt(p, s.litTooth);
  return { x: at.x, y: at.y, r: p.r * 0.45 };
}

/**
 * The gullet as a circle where the eel rears this frame — what a shot is
 * fired at while it is lit, and the circle the cue's crosshair rides
 * (`boss-cue-read-zs.ts`). As wide as it opens after the hits so far.
 */
export function lampreyGulletCircle(
  l: Layout,
  cfg: SimConfig,
  s: LampreyState,
  beat: number,
  beatPhase: number,
): Circle {
  const p = lampreyPose(l, cfg, s, beat, beatPhase);
  return { x: p.x, y: p.y, r: p.r * lampreyGulletReach(s.hits) };
}

/** Whether a point is inside the mouth's lip, and a little past it. */
function onMouth(l: Layout, p: LampreyPose, x: number, y: number): boolean {
  const past = LIP_PAST * l.tile;
  const rx = p.r + past;
  const ry = p.r * p.tilt + past;
  return ((x - p.x) / rx) ** 2 + ((y - p.y) / ry) ** 2 <= 1;
}

/** The tooth nearest a point on the mouth. */
function nearestTooth(p: LampreyPose, x: number, y: number): number {
  let best = 0;
  let near = Number.POSITIVE_INFINITY;
  for (let t = 0; t < LAMPREY_TEETH; t++) {
    const at = lampreyToothAt(p, t);
    const d = Math.hypot(at.x - x, at.y - y);
    if (d < near) [best, near] = [t, d];
  }
  return best;
}

/** A press on the eel: a tap on the nearest tooth from the bite's tapper, or the pinner's thumb on the jaw. */
export function lampreyGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "lamprey");
  if (s === null) return null;
  const seat = field.seat;
  const p = lampreyPose(l, field.cfg, s, field.beat, field.beatPhase);
  if (lampreyBiting(s) && lampreyTapper(s) === seat && onMouth(l, p, x, y)) {
    const id = nearestTooth(p, x, y);
    return {
      player: seat,
      command: { kind: "drag", target: "lampreyTooth", on: true, fromMilli: 0, id },
      hold: { kind: "drag", target: "lampreyTooth", player: seat, originX: x, originY: y, id },
    };
  }
  if (lampreyJawSeat(s) !== seat) return null;
  const reach = (field.cfg.lampreyGripCols + 0.5) * l.tile;
  if (Math.abs(x - p.x) > reach) return null;
  if (y < l.hullY - ABOVE * l.tile || y > l.hullY + BELOW * l.tile) return null;
  const id = fieldCol(l, colFromX(l, x));
  return {
    player: seat,
    command: { kind: "drag", target: "lampreyJaw", on: true, fromMilli: 0, id },
    hold: {
      kind: "drag",
      target: "lampreyJaw",
      player: seat,
      originX: x,
      originY: y,
      id,
      follows: true,
    },
  };
}
