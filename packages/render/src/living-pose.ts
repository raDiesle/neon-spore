import { livingMotion, poseClock } from "@neon-spore/content";
import {
  type Creature,
  type CreatureKind,
  type SimConfig,
  THROB_TURN_MILLI,
  throbTurnMilli,
} from "@neon-spore/sim";
import { dartFlip, dartLean } from "./dart.js";

/**
 * Where a living body sits and which way it faces, on this beat: the
 * own-motion's offsets and squash, and on top of them the rotations that are
 * one kind's rule rather than a sway — the throb's turn, the dart's lean and
 * the way round its nose leads. Cut out of `drawLiving` when that file
 * reached its limit, because this is the part that grows a paragraph for
 * every body with a turn of its own, and the draw only reads the answer.
 *
 * Offsets come back in pixels, the rest in the units the draw applies them in:
 * `rot` in radians, `sx`/`sy` and `flip` as scales.
 */
export interface LivingPose {
  readonly ox: number;
  readonly oy: number;
  readonly sx: number;
  readonly sy: number;
  /** The whole rotation: sway, spin and lean. */
  readonly rot: number;
  /** The throb's own turn on its own, for the far half that turns by it. */
  readonly spin: number;
  readonly flip: number;
}

export function livingPose(
  look: CreatureKind,
  c: Creature,
  cfg: SimConfig,
  beats: number,
  beatPhase: number,
  tile: number,
): LivingPose {
  // The sway itself is data, in `content/own-motion.ts`, so the shape tools
  // can animate a creature the way the game does instead of re-typing it.
  // Offsets come back in tiles, which is the only form that survives a
  // different screen.
  const pose = livingMotion(look).poseAt(poseClock(c.id, beats));
  const ox = pose.dx * tile;
  const oy = pose.dy * tile;
  const { sx, sy } = pose;
  // The dart's lean, on top of its own-motion rather than inside it: POISE is
  // a pure function of the beat like every other motion and cannot know which
  // way this body is pointing, and the direction is the whole creature. Zero
  // for everything else, so nothing but a dart is turned by a line of this.
  // The Throb's whole tell, and the one rotation in the game that is a rule
  // rather than a lean: the body turns clockwise the whole way down, and which
  // half is pointing at the cannon is what a shot meets. `throbTurnMilli` is
  // the same expression `throbStruck` resolves against, handed the same
  // continuous beat, so the seam the pair is watching and the seam the bullet
  // finds are one number (`sim/throb.ts`).
  const spin = look === "throb" ? (throbTurnMilli(cfg, beats) / THROB_TURN_MILLI) * Math.PI * 2 : 0;
  const rot = pose.rot + spin + (look === "dart" ? dartLean(c, beatPhase) : 0);
  // And which way round it is drawn. 1 for every other body — a contour with
  // no point on it does not care — and the whole of how a dart's nose leads in
  // both directions (`dartFlip`).
  const flip = look === "dart" ? dartFlip(c) : 1;
  return { ox, oy, sx, sy, rot, flip, spin };
}
