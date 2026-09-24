import { midCol, type SimConfig, SPOOL_RIBS } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE SPOOL is**, in field pixels: the barrel slung sideways across
 * the top of the field, the two flanges on its ends, the four ribs round the
 * winding, the line run down to the hull, the brake's rail and the
 * navigator's gauge. How far through a pose the scene is is `spool-pose.ts`.
 *
 * Its own file because one of the things on this page
 * is a handle, and a thumb will be answered against the very rail this file
 * places (`layout.ts`'s standing rule that a control is drawn and found in one
 * file). A second copy of *where the brake is* is how a knob comes to be drawn
 * off its own hit region.
 *
 * **Everything is placed off a `SpoolPose`** — where the axle is and how far
 * the body has turned toward the pair — so the one perspective change on this
 * boss (the slack spool turning a flange to face the ship, `.claude/skills/
 * new-boss` §5's third standard) is two numbers every part reads, and nothing
 * can tip apart from the barrel it hangs on.
 */

export interface Point {
  x: number;
  y: number;
}

/** Where the axle is, how far the body has turned toward the pair (0..1) and how full the winding is (0..1). */
export interface SpoolPose {
  at: Point;
  turn: number;
  wound: number;
}

/** The row the axle hangs on, in tiles below the top of the field. */
const ROW = 2.5;
/** Half the barrel's length between its flanges, in tiles. */
const BARREL_HALF = 2.6;
/** The bare core's radius and the winding's at its fullest, in tiles. */
const CORE_R = 0.36;
const WOUND_R = 0.92;
/** A flange's radius, and how open its ellipse is when seen side on (rx / ry). */
const FLANGE_R = 1.35;
const FLANGE_EDGE = 0.24;
/**
 * Where each rib stands along the barrel, as a share of its half-length, the
 * brake's end first. The order is the order they ease in, so the casing
 * unbinds from the pilot's side toward the far flange.
 */
const RIB_AT = [0.66, 0.22, -0.22, -0.66] as const;
/** A rib's half-thickness and how far it stands proud of the winding, in tiles. */
const RIB_HALF_W = 0.14;
const RIB_PROUD = 0.24;
/**
 * The brake's rail: how far outside its flange, how far below its top the
 * knob rests with no hand on it, and the knob's radius, in tiles. How far the
 * knob travels is not a constant: see `spoolBrakeAt`.
 */
const RAIL_OUT = 0.45;
const RAIL_LEAD = 0.23;
const KNOB_R = 0.3;
/** The gauge under the barrel: how far below the flanges, and its half-length, in tiles. */
const GAUGE_DROP = 0.7;
const GAUGE_HALF = 2.2;

/** Where the axle hangs when nothing has moved it: over the middle column. */
export function spoolHome(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/**
 * Which end the brake is on, on *this* screen: −1 the left flange, +1 the
 * right. Read off the column the field starts from rather than written down,
 * so THE FLIP turns the spool with the field (`field-flip.ts`).
 */
export function spoolSide(l: Layout, cfg: SimConfig): -1 | 1 {
  return fieldX(l, 0) < spoolHome(l, cfg).x ? -1 : 1;
}

/** Half the barrel as the eye sees it: full side on, nothing at all end on. */
export function spoolBarrelHalf(l: Layout, turn: number): number {
  return l.tile * BARREL_HALF * Math.cos((turn * Math.PI) / 2);
}

/** The winding's radius at `wound` full, in pixels. */
export function spoolWindR(l: Layout, wound: number): number {
  const share = Math.min(1, Math.max(0, wound));
  return l.tile * (CORE_R + (WOUND_R - CORE_R) * share);
}

/** A flange's radius, in pixels — the one size on the body that never changes. */
export function spoolFlangeR(l: Layout): number {
  return l.tile * FLANGE_R;
}

/**
 * One flange as an ellipse. The one at `end` = −side is the face the turn
 * brings round, so it opens to a full circle as the barrel foreshortens; the
 * other stays edge on and slides in behind it.
 */
export function spoolFlangePath(l: Layout, pose: SpoolPose, end: -1 | 1, facing: boolean): Path2D {
  const ry = spoolFlangeR(l);
  const open = facing
    ? FLANGE_EDGE + (1 - FLANGE_EDGE) * Math.sin((pose.turn * Math.PI) / 2)
    : FLANGE_EDGE;
  const p = new Path2D();
  p.ellipse(
    pose.at.x + end * spoolBarrelHalf(l, pose.turn),
    pose.at.y,
    ry * open,
    ry,
    0,
    0,
    Math.PI * 2,
  );
  return p;
}

/** The barrel between the flanges, at the winding's own thickness. */
export function spoolBarrelPath(l: Layout, pose: SpoolPose): Path2D {
  const half = spoolBarrelHalf(l, pose.turn);
  const r = spoolWindR(l, pose.wound);
  const p = new Path2D();
  p.rect(pose.at.x - half, pose.at.y - r, half * 2, r * 2);
  return p;
}

/** Where rib `i` stands along the barrel, the brake's end first. */
export function spoolRibX(l: Layout, pose: SpoolPose, side: -1 | 1, i: number): number {
  return pose.at.x + side * spoolBarrelHalf(l, pose.turn) * (RIB_AT[i] ?? 0);
}

/**
 * Rib `i` as a hoop seen edge on, standing proud of the winding. `lift` is how
 * far it has eased (0..1): it rises off the casing and leans away from the
 * brake, the way a stave sprung from its band would — eased, never broken.
 */
export function spoolRibPath(
  l: Layout,
  pose: SpoolPose,
  side: -1 | 1,
  i: number,
  lift: number,
): Path2D {
  const x = spoolRibX(l, pose, side, i) + side * lift * l.tile * 0.5;
  const y = pose.at.y - lift * l.tile * 1.1;
  const p = new Path2D();
  p.ellipse(
    x,
    y,
    l.tile * RIB_HALF_W * (1 + lift),
    spoolWindR(l, pose.wound) + l.tile * RIB_PROUD,
    side * lift * 0.9,
    0,
    Math.PI * 2,
  );
  return p;
}

/** The groove a rib leaves in the winding once it has eased away. */
export function spoolSocketPath(l: Layout, pose: SpoolPose, side: -1 | 1, i: number): Path2D {
  const x = spoolRibX(l, pose, side, i);
  const r = spoolWindR(l, pose.wound);
  const p = new Path2D();
  p.moveTo(x, pose.at.y - r);
  p.lineTo(x, pose.at.y + r);
  return p;
}

/** Every rib position the silhouette has, for anything counting them. */
export const RIB_COUNT = SPOOL_RIBS;

/** Where the line leaves the winding: the underside, on the axle's own column. */
export function spoolLineTop(l: Layout, pose: SpoolPose): Point {
  return { x: pose.at.x, y: pose.at.y + spoolWindR(l, pose.wound) };
}

/** Where the line is made fast: the hull, under the middle column. */
export function spoolLineFoot(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.hullY };
}

/**
 * **The brake**: the rail hanging outside the brake's flange, the knob on it
 * at the depth the pilot's thumb has it, and the shoe the knob's linkage
 * presses into the flange's rim — deeper in the deeper the grip.
 *
 * **The knob travels exactly the reach**, one tile for a thousand: a drag
 * reports its depth in thousandths of a tile and the simulation cuts it to
 * `spoolReachMilli` (`sim/spool-hand.ts`), so a rail of any other length
 * would draw the knob running ahead of the thumb or falling behind it —
 * `haspRail`'s rule, found there first.
 */
export function spoolBrakeAt(
  l: Layout,
  cfg: SimConfig,
  pose: SpoolPose,
  depthMilli: number,
): { top: Point; bottom: Point; knob: Point; shoe: Point; r: number } {
  const side = spoolSide(l, cfg);
  const rim = pose.at.x + side * (spoolBarrelHalf(l, pose.turn) + spoolFlangeR(l) * FLANGE_EDGE);
  const x = rim + side * l.tile * RAIL_OUT;
  const reach = Math.max(1, cfg.spoolReachMilli);
  const depth = Math.min(reach, Math.max(0, depthMilli));
  const top = { x, y: pose.at.y - l.tile * 0.35 };
  const rest = top.y + l.tile * RAIL_LEAD;
  const bottom = { x, y: rest + (reach * l.tile) / 1000 };
  const knob = { x, y: rest + (depth * l.tile) / 1000 };
  const shoe = {
    x: rim - side * (depth / reach) * l.tile * 0.16,
    y: pose.at.y + spoolFlangeR(l) * 0.35,
  };
  return { top, bottom, knob, shoe, r: l.tile * KNOB_R };
}

/** The navigator's gauge under the barrel: its middle and its half-length, in pixels. */
export function spoolGaugeAt(l: Layout, pose: SpoolPose): { mid: Point; half: number } {
  return {
    mid: { x: pose.at.x, y: pose.at.y + spoolFlangeR(l) + l.tile * GAUGE_DROP },
    half: l.tile * GAUGE_HALF,
  };
}
