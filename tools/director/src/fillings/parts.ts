import { type Mounted, mount, spin } from "../skins/mounted.js";
import { clipGroup } from "../skins/parts.js";
import { SVG } from "../skins/types.js";
import type { FillingContext } from "./types.js";

/**
 * What every filling is built out of.
 *
 * The ten values on this axis are ten different arguments about what is inside
 * a body, and they are made of about four shapes between them: a disc pinned to
 * a surface, a thread of overlapping discs, a line from the middle to a mark,
 * and a ring drawn as the ellipse a circle of latitude projects to. Each of
 * those is here once.
 *
 * **Nothing in this file decides where anything is.** The projection is
 * `packages/content`'s `surface.ts`, reached through `skins/mounted.ts`'s
 * `mount` and `spin` — the same two functions the mounted skins hang on, so a
 * filling and a MOUNTED SCALE agree about where the far side of a body is by
 * construction rather than by two files getting the same arithmetic right.
 */

/** The group a filling draws into: clipped to the contour, so nothing inside a
 * body escapes it. Every value calls this first and nothing calls it twice. */
export function inside(ctx: FillingContext, name: string): SVGGElement {
  return clipGroup(ctx, `fill-${name}`);
}

/**
 * A slick is two sacs joined at a waist, and the four values written for it
 * place their marks in two clusters. Half the body's own width either side of
 * the middle, at the share the candidates used.
 */
export const SAC_AT = 0.42;

/** Where the two clusters sit, in the body's own units. */
export function sacs(ctx: FillingContext): [number, number] {
  const half = (ctx.extent.w / 2) * SAC_AT;
  return [-half, half];
}

/** A filled disc about its own origin, ready to be `mount`ed. */
export function disc(r: number, colour: string, alpha: number): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  const c = document.createElementNS(SVG, "circle");
  c.setAttribute("r", Math.max(0.4, r).toFixed(2));
  c.setAttribute("fill", colour);
  c.setAttribute("fill-opacity", alpha.toFixed(3));
  g.appendChild(c);
  return g;
}

/** A stroked line from the middle of a cluster out to a mark, drawn under it. */
export function neck(x2: number, y2: number, colour: string, w: number, alpha: number): SVGElement {
  const l = document.createElementNS(SVG, "line");
  l.setAttribute("x1", "0");
  l.setAttribute("y1", "0");
  l.setAttribute("x2", x2.toFixed(2));
  l.setAttribute("y2", y2.toFixed(2));
  l.setAttribute("stroke", colour);
  l.setAttribute("stroke-width", Math.max(0.3, w).toFixed(2));
  l.setAttribute("stroke-opacity", alpha.toFixed(3));
  l.setAttribute("stroke-linecap", "round");
  return l;
}

/** A translated group — one cluster of a two-sac filling, or a whole figure's
 * worth of marks that share an origin. */
export function at(x: number, y = 0): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  return g;
}

/**
 * One cluster of mounted marks, turning on its own offset.
 *
 * A two-sac filling is two of these with a half-turn between them, which is
 * what stops the body reading as one thing drawn twice. `spin` takes a single
 * angle for a whole list, so the offset lives here rather than in the list.
 */
export interface Cluster {
  readonly marks: Mounted[];
  readonly offset: number;
}

/**
 * Register the turn, and take one now so the first frame is not a stack of
 * marks at the origin.
 *
 * `rate` is radians per second of the page clock — the candidates all measured
 * their spin against the contour clock, which is the same seconds.
 */
export function turning(ctx: FillingContext, rate: number, clusters: readonly Cluster[]): void {
  const step = (t: number): void => {
    for (const c of clusters) spin(c.marks, t * rate + c.offset);
  };
  step(0);
  ctx.onFrame(({ t }) => step(t));
}

/** `mount`, with the two things every filling passes the same way: the mark is
 * pinned at a longitude and latitude on a ball of `reach`, and what it keeps in
 * full shadow is the value's own `dim`. */
export function place(
  el: SVGGElement,
  lon: number,
  lat: number,
  reach: number,
  dim: number,
): Mounted {
  return mount(el, lon, lat, reach, dim);
}
