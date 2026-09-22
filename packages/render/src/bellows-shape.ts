import { bellowsChamberCol, midCol, type SimConfig } from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE BELLOWS is**, in field pixels: the two ribbed housings and the
 * handle hanging under each. The leather waist between them and its four
 * seams are `bellows-waist.ts`, split off this page the moment it went over
 * 250 lines, along the seam the boss itself has: here is the half a seat is
 * shown and grips, there is the half both are shown and neither may touch.
 * How far through a pose the scene is is `bellows-pose.ts`.
 *
 * Its own file for `gimbal-shape.ts`'s reason, and here it matters more: two
 * of the things on this page are handles, and a thumb will be answered
 * against the very rail this file draws (`layout.ts`'s standing rule that a
 * control is drawn and found in one file). A second copy of *where the handle
 * is* is exactly how a handle comes to be drawn off its own hit region.
 *
 * **A chamber extends along the field's width, never toward the player.** The
 * lung is slung across the top and each housing draws out sideways, away from
 * the waist, so how full a chamber is reads as a distance between two things
 * on the same line rather than as a size the eye has to remember. That also
 * keeps the two chambers from ever overlapping the waist, which is the part
 * both seats are shown and the part that carries the health.
 */

export interface Point {
  x: number;
  y: number;
}

/** The row the lung's axis hangs on, in tiles below the top of the field. */
const ROW = 2.6;
/** How far a housing reaches from its own inner end, shut and drawn fully open, in tiles. */
const CHAMBER_SHUT = 1.15;
const CHAMBER_OPEN = 2.3;
/** Half a housing's height, in tiles. */
const CHAMBER_HALF = 1.25;
/** How many concertina folds a housing is drawn with. */
export const FOLDS = 5;
/** How far the handle's rail hangs below its housing, and the bar's half-width, in tiles. */
const RAIL = 1.5;
const BAR_HALF = 0.55;

/** The middle of the lung: the waist's own centre, which is the middle column. */
export function bellowsCentre(l: Layout, cfg: SimConfig): Point {
  return { x: fieldX(l, midCol(cfg)), y: l.gridTop + ROW * l.tile };
}

/**
 * Which way a seat's housing reaches on *this* screen: −1 to the left of the
 * waist, +1 to the right. Read off the column the simulation hangs the
 * chamber over rather than written down, so THE FLIP turns the lung with the
 * field and the pilot's chamber stays over the pilot's own column
 * (`field-flip.ts`, `bellowsChamberCol`).
 */
export function bellowsSide(l: Layout, cfg: SimConfig, player: 1 | 2): -1 | 1 {
  const mine = fieldX(l, bellowsChamberCol(cfg, player));
  return mine < bellowsCentre(l, cfg).x ? -1 : 1;
}

/** Where a housing's inner end sits: off the waist, clear of its lip. */
export function bellowsInnerX(l: Layout, cfg: SimConfig, player: 1 | 2): number {
  return bellowsCentre(l, cfg).x + bellowsSide(l, cfg, player) * l.tile * 0.75;
}

/**
 * How far a housing reaches from its inner end, in pixels, at `openMilli`
 * thousandths drawn out. The distance is the fill: a chamber shut is a stack
 * of folds pressed together and one open is the same folds spread.
 */
export function bellowsReach(l: Layout, openMilli: number): number {
  const share = Math.min(1, Math.max(0, openMilli / 1000));
  return l.tile * (CHAMBER_SHUT + (CHAMBER_OPEN - CHAMBER_SHUT) * share);
}

/** Half a housing's height in pixels — fixed, so the fill is the one thing moving. */
export function bellowsHalfH(l: Layout): number {
  return l.tile * CHAMBER_HALF;
}

/**
 * One housing's concertina: the folds between its inner end and its cap,
 * drawn as a zigzag over and under the axis and closed into the body.
 *
 * The folds are what makes it a bellows rather than a box, and they are drawn
 * rather than counted: a chamber at half its reach has the same five folds at
 * half the pitch, which is what a lung does and what a bar would not say.
 */
export function bellowsBodyPath(
  l: Layout,
  cfg: SimConfig,
  player: 1 | 2,
  openMilli: number,
  /** How far the housing has swung away in the vent, 0..1. */
  apart = 0,
): Path2D {
  const side = bellowsSide(l, cfg, player);
  const at = bellowsCentre(l, cfg);
  const x0 = bellowsInnerX(l, cfg, player) + side * apart * l.tile * 1.4;
  const reach = bellowsReach(l, openMilli);
  const h = bellowsHalfH(l);
  const p = new Path2D();
  p.moveTo(x0, at.y - h * 0.55);
  for (let i = 0; i <= FOLDS; i++) {
    const x = x0 + side * reach * (i / FOLDS);
    const out = i % 2 === 0 ? 0.72 : 1;
    p.lineTo(x, at.y - h * out);
  }
  p.lineTo(x0 + side * reach, at.y + h);
  for (let i = FOLDS; i >= 0; i--) {
    const x = x0 + side * reach * (i / FOLDS);
    const out = i % 2 === 0 ? 0.72 : 1;
    p.lineTo(x, at.y + h * out);
  }
  p.closePath();
  return p;
}

/** The end plate a housing is drawn out by: the cap the handle's rail hangs off. */
export function bellowsCapX(
  l: Layout,
  cfg: SimConfig,
  player: 1 | 2,
  openMilli: number,
  apart = 0,
): number {
  const side = bellowsSide(l, cfg, player);
  return bellowsInnerX(l, cfg, player) + side * (apart * l.tile * 1.4 + bellowsReach(l, openMilli));
}

/**
 * **The mouth a split housing shows**, and the one perspective change on this
 * boss (`.claude/skills/new-boss` §5's third standard): while the waist holds,
 * a chamber is a flat concertina seen from the side; once it falls away it
 * turns on its cap and the pair is shown the hollow it has been squeezing all
 * fight. One number does it, so nothing on the housing can tip apart from it.
 */
export function bellowsMouthPath(
  l: Layout,
  cfg: SimConfig,
  player: 1 | 2,
  openMilli: number,
  apart: number,
): Path2D {
  const x = bellowsCapX(l, cfg, player, openMilli, apart);
  const at = bellowsCentre(l, cfg);
  const p = new Path2D();
  p.ellipse(x, at.y, l.tile * 0.9 * apart, bellowsHalfH(l) * 0.92, 0, 0, Math.PI * 2);
  return p;
}

/**
 * A seat's handle: the rail under its own housing and the bar on it, at the
 * depth that seat's thumb has carried it (`bellowsDepthMilli`). The rail
 * hangs off the cap, so a chamber drawn further out carries its handle with
 * it and the bar is never left behind the body it works.
 */
export function bellowsHandleAt(
  l: Layout,
  cfg: SimConfig,
  player: 1 | 2,
  openMilli: number,
  depthMilli: number,
  apart = 0,
): { top: Point; at: Point; halfW: number } {
  const x = bellowsCapX(l, cfg, player, openMilli, apart);
  const y = bellowsCentre(l, cfg).y + bellowsHalfH(l) * 0.6;
  const share = Math.min(1, Math.max(0, depthMilli / Math.max(1, cfg.bellowsReachMilli)));
  return {
    top: { x, y },
    at: { x, y: y + l.tile * RAIL * (0.18 + 0.82 * share) },
    halfW: l.tile * BAR_HALF,
  };
}

/** The bar itself, as a path — the thing a thumb takes hold of in lane two. */
export function bellowsBarPath(at: Point, halfW: number, l: Layout): Path2D {
  const p = new Path2D();
  p.ellipse(at.x, at.y, halfW, l.tile * 0.2, 0, 0, Math.PI * 2);
  return p;
}
