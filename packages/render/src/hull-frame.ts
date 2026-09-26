import {
  type Bump,
  bumpAdd,
  CANNON_LOBE,
  HULL,
  hullAngleAtX,
  hullPointAtX,
  MAW,
  type Point,
  SHIELD_LOBE,
} from "@neon-spore/content";
import type { HullMood, LobePositions } from "./hull-mood.js";
import { type Layout, tileCX } from "./layout.js";
import { lobe } from "./lobe.js";

export type { HullMood, LobePositions } from "./hull-mood.js";

/**
 * The hull's shape for one frame — split out of `hull.ts` so the geometry
 * model (this file) and the drawing that reads it (`hull.ts`) can each stay
 * under the line limit, and so a caller elsewhere in render/ that only needs
 * a point on the surface (`hullSkinY`, today's one example) does not have to
 * pull in canvas drawing code to get it. What the ship is *doing* — its mood
 * and where its lobes stand — is `hull-mood.ts`, re-exported from here.
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
 * THE HULL'S OWN CLOCK — the `t` its radius function wobbles on.
 *
 * A function rather than a literal at the one call site because a second thing
 * now wants to ripple in step with the ship: the panel's roof, if the join
 * candidate that makes it the hull's underside is adopted (`band-join.ts`). Two
 * copies of `1.4` would be two ripples that agree today and drift the first
 * time either is tuned, which is what `purity.test.ts`'s COPIES sweep is for.
 */
export function hullClock(time: number): number {
  return time * 1.4;
}

/**
 * The ellipse the hull is measured against, for one layout: where its centre
 * is and how far it reaches.
 *
 * Exported for the same reason as `hullClock` — anything that wants to line a
 * shape up with the ship's own crests has to ask the ship where they are, and
 * `hullAngleAtX` needs exactly these two numbers.
 */
export function hullSpan(l: Layout): { cx: number; rx: number } {
  const rx = l.gridWidth;
  return { cx: l.gridLeft + rx / 2, rx };
}

/** The shortest way round from one angle to another, so a bump either side of
 * the seam is still measured as near. `bumpLift`'s own wrap, said once here
 * because this file asks the same question of one bump rather than of a list. */
function wrapAngle(diff: number): number {
  return Math.atan2(Math.sin(diff), Math.cos(diff));
}

export function frame(l: Layout, time: number, mood: HullMood, at: LobePositions): HullFrame {
  const { cx, rx } = hullSpan(l);
  const ry = l.tile * 1.6 * l.hullScale;
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
  //
  // **The plate does not stand on the cannon's shoulders.** `bumpLift` adds
  // every bump at a given angle, which is right for the four segments above —
  // they *are* one plate, written as four — and wrong for the shield meeting
  // the cannon: two swellings of one membrane in one column were drawn as one
  // on top of the other, and the crest came out about twice as tall as either.
  // The owner reported what follows from that, 15 September 2026: a rock warded
  // in the cannon's column turns from *inside* the ship. The sim answers a
  // wardable body one row above the hull (`sim/hull-guard.ts` `shieldRow`),
  // which is a rule about where the dome's crown is — and in that one column
  // the drawn crown was a whole tile higher than the rule assumes.
  //
  // So a segment carries only what it is taller than the cannon already is
  // under it. The total lift is then the *greater* of the two rather than their
  // sum, which is what one membrane does, and in every other column nothing
  // changes because the cannon lifts nothing there. Where the cannon is the
  // taller of the two the plate adds nothing at all and the rim is what says
  // the shield is there (`shield.ts` `drawShieldRim`), which is the honest
  // picture: the dome is over the gun, not on a pedestal above it.
  const scale = SHIELD_PASSIVE + (1 - SHIELD_PASSIVE) * mood.armed;
  for (const seg of at.shield) {
    const x = tileCX(l, seg.col);
    const angle = toAngle(x);
    const under = bumpAdd(
      wrapAngle(angle - cannon.angle),
      cannon.strength,
      cannon.plateau,
      cannon.shoulder,
    );
    const own = scale * seg.weight;
    skinBumps.push(
      lobe(SHIELD_LOBE, angle, l.tile, ry, rx, time, Math.max(0, own - under), seg.halfMul),
    );
  }
  return { cx, cy, rx, ry, bumps: [cannon, ...skinBumps], skinBumps, cannonX, t: hullClock(time) };
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
 * stuck to the hull has to move with it, the same as `craters.ts`'s dent
 * already does through `skinAt`.
 */
export function hullSkinY(
  l: Layout,
  time: number,
  mood: HullMood,
  at: LobePositions,
  x: number,
  // The caller usually already has this frame — `drawShip` computes it once
  // and hands it down rather than let every reader of the skin rebuild the
  // same lobes. Defaulted so a caller with only the four numbers above (a
  // shape tool, a test) still gets the same answer.
  f: HullFrame = frame(l, time, mood, at),
): number {
  return skin(f, x).y;
}

/**
 * **The screen y of one x on a ship's surface, as drawn** — a sampler handed
 * to whatever has to stand on the ship rather than beside it.
 *
 * A function rather than the frame itself, because the thing that wants it is
 * a creature pass and a creature pass has no business knowing what a hull
 * frame is. It is built once per rendered frame beside `drawShip`'s own, from
 * the same `HullFrame`, so the surface a worm walks on and the surface the eye
 * sees are the same arithmetic and cannot drift.
 */
export type SurfaceY = (x: number) => number;

/**
 * That sampler off a frame the caller already has.
 *
 * `surface` and not `skin`: the lobes are the whole point. A crawler walks the
 * ship lengthways and the owner asked for the cannon to be part of the ground
 * it covers — *"so its part of the area it walks, not just the ship surface.
 * when i move cannon, the worm is pushed up accordingly"* — and a swelling the
 * hull grows where a player puts something is exactly a thing to be walked
 * over. `hullSkinY` above leaves the cannon out on purpose, because what it
 * serves is damage hanging *from* the plating rather than a body standing on
 * it, and the two questions have stayed apart since.
 */
export function surfaceSampler(f: HullFrame): SurfaceY {
  return (x) => surface(f, x).y;
}

/** The same sampler off the plating alone — for what lands *in* the skin
 * rather than walks on it: a rock's crater is dug there whichever lobe stands
 * over the column (`landing.ts`, `rock-impact.ts`'s `skinAt`). */
export function skinSampler(f: HullFrame): SurfaceY {
  return (x) => skin(f, x).y;
}
