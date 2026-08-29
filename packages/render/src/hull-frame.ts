import {
  type Bump,
  CANNON_LOBE,
  HULL,
  hullAngleAtX,
  hullPointAtX,
  MAW,
  type Point,
  SHIELD_LOBE,
} from "@neon-spore/content";
import { type Layout, tileCX } from "./layout.js";
import { lobe } from "./lobe.js";
import type { ShieldSegment } from "./shield.js";

/**
 * The hull's shape for one frame — split out of `hull.ts` so the geometry
 * model (this file) and the drawing that reads it (`hull.ts`) can each stay
 * under the line limit, and so a caller elsewhere in render/ that only needs
 * a point on the surface (`hullSkinY`, today's one example) does not have to
 * pull in canvas drawing code to get it.
 */

/**
 * How much of the shield's lift is there while nobody holds it open. It is
 * not zero: a shield that only exists during the trigger window cannot be
 * aimed, and player 2 has to see the thing they are sliding. Armed still
 * doubles it.
 */
const SHIELD_PASSIVE = 0.42;

export interface HullFrame {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  bumps: Bump[];
  /**
   * Everything but the cannon lobe. Damage hangs from this rather than from
   * the full contour — see `drawScars`.
   */
  skinBumps: Bump[];
  /** Screen x of the cannon, needed again for the muzzle. */
  cannonX: number;
  t: number;
}

/**
 * Where the lobes are, in columns. Fractional: the world moves them a whole
 * column at a time and render/ carries the eye across — `Glide` for the
 * cannon, a chain of them for the shield (`ShieldBody`).
 */
export interface LobePositions {
  cannon: number;
  /** The shield's body, head first. Each segment is its own bump. */
  shield: readonly ShieldSegment[];
}

/**
 * The ship's transient state, all of it eased and none of it in the world.
 * One object rather than four arguments, because every one of them is the
 * same kind of thing: how the membrane is behaving this frame.
 */
export interface HullMood {
  /** 0..1 towards the shield held open. */
  armed: number;
  /** 0..1 towards the cannon lobe turned inside out — the maw. */
  intake: number;
  /** 0..1 while the skin around the maw comes apart over a pod. */
  chew: number;
  /** 0..1 the light that goes through the ship once the pod is inside. */
  charge: number;
  /**
   * The laying phase, 0 → 2 (`cannon-maw.ts`'s `LayState`, which defines it).
   *
   * Its first half — 0..1, towards the shot that has been pressed leaving the
   * muzzle — is the one field here that is *not* eased and not this package's
   * invention: the world fixes the tick the shot goes, to the tick, on both
   * devices, so easing it would put the two cannons out of step with each
   * other. Its second half, 1..2, is the opposite kind of thing and is here
   * only because there was nowhere else to put it: the world stops saying
   * anything the moment the shot leaves, so the mouth's follow-through is the
   * renderer's, out of `Effects`. Absent on a ship with no trigger of its own
   * — THE MIRROR's copy performs shots rather than firing them.
   */
  lay?: number;
}

export function frame(l: Layout, time: number, mood: HullMood, at: LobePositions): HullFrame {
  const rx = l.gridWidth;
  const ry = l.tile * 1.6;
  const cx = l.gridLeft + l.gridWidth / 2;
  const cy = l.hullY + ry;
  const toAngle = (x: number): number => hullAngleAtX(x, cx, rx);

  // The columns are followed, not snapped to: `at` is fractional.
  const cannonX = tileCX(l, at.cannon);
  // The maw is the cannon lobe with the sign of its lift taken away from it: at
  // full intake the same swelling has passed through flat into a throat. One
  // lobe, two directions — see `MAW`.
  const cannonScale = 1 + (MAW.scale - 1) * mood.intake;
  const cannonHalf = 1 + (MAW.halfMul - 1) * mood.intake;
  const cannon = lobe(CANNON_LOBE, toAngle(cannonX), l.tile, ry, rx, time, cannonScale, cannonHalf);
  const skinBumps: Bump[] = [];

  // The shield is a body, not a plate: a head and three followers, each a bump
  // of its own. At rest they lie on top of each other and add up to the armour
  // plate; while it travels they string out behind the head and the skin of the
  // ship travels with them.
  const scale = SHIELD_PASSIVE + (1 - SHIELD_PASSIVE) * mood.armed;
  for (const seg of at.shield) {
    const x = tileCX(l, seg.col);
    skinBumps.push(
      lobe(SHIELD_LOBE, toAngle(x), l.tile, ry, rx, time, scale * seg.weight, seg.halfMul),
    );
  }
  return { cx, cy, rx, ry, bumps: [cannon, ...skinBumps], skinBumps, cannonX, t: time * 1.4 };
}

/** The membrane directly above a screen x. `bumps` selects which lobes count. */
function pointOn(f: HullFrame, x: number, bumps: Bump[]): Point {
  return hullPointAtX(
    x,
    f.cx,
    f.cy,
    f.rx,
    f.ry,
    HULL.lobes,
    HULL.depth,
    HULL.wobble,
    f.t,
    HULL.seed,
    bumps,
  );
}

/** The outline as drawn: lobes and all. */
export function surface(f: HullFrame, x: number): Point {
  return pointOn(f, x, f.bumps);
}

/** The same membrane without the cannon lobe standing on it. */
export function skin(f: HullFrame, x: number): Point {
  return pointOn(f, x, f.skinBumps);
}

/**
 * The screen y of the hull's real, breathing surface at one x — for anything
 * outside `hull.ts` that has to sit exactly on the skin rather than on
 * `Layout.hullY`'s flat approximation of it. `RockImpactFx`
 * (`rock-impact.ts`) is the one caller today: a rock that is supposed to be
 * stuck to the hull has to move with it, the same as `torch-crater.ts`'s dent
 * already does through `skinAt`.
 */
export function hullSkinY(
  l: Layout,
  time: number,
  mood: HullMood,
  at: LobePositions,
  x: number,
): number {
  return skin(frame(l, time, mood, at), x).y;
}
