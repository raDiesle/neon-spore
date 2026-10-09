import { type InstarState, instarVerdict, type World } from "@neon-spore/sim";
import type { Stopper } from "./bolt-stop.js";
import { type Foot, lowestFoot, outlineFoot, roundFoot } from "./core-stop.js";
import { instarFarEnd } from "./instar-far-end.js";
import type { Flight } from "./instar-flight.js";
import { seeFrontBody } from "./instar-front-body.js";
import { frontHeadFeet, sideHeadFeet } from "./instar-head-stop.js";
import { frontLimbFeet, profileLimbFeet } from "./instar-limb-stop.js";
import { instarAt, type Point } from "./instar-place.js";
import type { Look } from "./instar-plate.js";
import type { Sway } from "./instar-sway.js";
import { instarNeck, instarTurn } from "./instar-turn.js";
import { sideHead, turnedLines } from "./instar-turning.js";
import type { Layout } from "./layout.js";
import { sceneStopper } from "./scene-stop.js";

/** How `drawInstar` lays the body this frame: the views it drew, the flight it drew them through, and the shake. */
export interface InstarFrame {
  look: Look;
  /** The flight's transform, applied only while `flying`. */
  flight: Flight;
  flying: boolean;
  /** Which views were drawn: face-on, side-on, or both across a turn. */
  front: boolean;
  profile: boolean;
  /** How far the side-on drawing's body is turned round from face-on (`instar-turning.ts`). */
  turn: number;
  /** The flinch and the hurt across, the jolt up, in pixels. */
  shake: Point;
}

/**
 * **Where a bolt meets THE INSTAR**, for `BoltStops` (`bolt-stop.ts`): a
 * SHOOT mark over its column (`scene-stop.ts`, `instarVerdict`), and
 * otherwise the lowest of its body in each view drawn — face-on its seen
 * rings about the neck, its head (`instar-head-stop.ts`) and its wings
 * (`instar-limb-stop.ts`), side-on its hide between the back and the belly,
 * its head, its wings, its tail and its nests — each laid through the flight
 * and the shake as `drawInstar` lays them.
 *
 * Some steps plant their marks on the body above the tube's lower edge —
 * the perch's, the bared heart's — so a bolt the simulation says reached
 * one is drawn reaching it up through the tube. That is a look, and it is
 * not fixed here.

 */
export function instarStopper(
  l: Layout,
  world: World,
  s: InstarState,
  sway: Sway,
  frame: InstarFrame,
  beat: number,
  beatPhase: number,
): Stopper {
  const { look, flight, shake } = frame;
  const c = instarAt(l, 500, 380);
  const kx = frame.flying ? flight.scale * flight.turn : 1;
  const ky = frame.flying ? flight.scale : 1;
  const dx = frame.flying ? (flight.dxMilli * l.gridWidth) / 1000 : 0;
  const dy = frame.flying ? (flight.dyMilli * l.gridHeight) / 1000 : 0;
  const lay = (p: Point): Point => ({
    x: shake.x + c.x + dx + (p.x - c.x) * kx,
    y: shake.y + c.y + dy + (p.y - c.y) * ky,
  });
  const feet: Foot[] = [];
  if (frame.front) {
    const { f, head, r } = look;
    const neck = instarNeck(head, r);
    const seen = seeFrontBody(look, neck, instarFarEnd(l, f), instarTurn(f.side));
    for (const ring of seen) {
      const at = lay({ x: neck.x + ring.c.x, y: neck.y + ring.c.y });
      feet.push(roundFoot(at.x, at.y, ring.r * Math.abs(kx), ring.r * ky));
    }
    const scale = { x: Math.abs(kx), y: ky };
    feet.push(...frontHeadFeet(look, lay), ...frontLimbFeet(l, look, neck, seen, lay, scale));
  }
  if (frame.profile) {
    const t = turnedLines(l, look, frame.turn);
    const { top, bottom } = t;
    const scale = { x: Math.abs(kx), y: ky };
    feet.push(outlineFoot([...top, ...[...bottom].reverse()].map(lay)));
    // Across the middle of the turn both heads are drawn.
    const h = sideHead(frame.turn);
    if (h < 1) feet.push(...frontHeadFeet(look, lay));
    if (h > 0) feet.push(...sideHeadFeet(l, look, lay));
    feet.push(...profileLimbFeet(l, look, t, frame.turn, lay, scale));
  }
  return sceneStopper(l, world, s, sway, beat, beatPhase, instarVerdict, lowestFoot(feet));
}
