import { KEY as KEY_LIGHT } from "@neon-spore/content";
import { type SkinContext, SVG } from "./types.js";

/**
 * **The key light's axis**: where the light is, the stops along it, the six
 * colours a lit surface is painted in, and the four one-line helpers that hang
 * a paint on a body.
 *
 * Its own file, split off when `light.ts` reached the 250-line ceiling. The
 * seam is the one that file's own header describes: *one direction, four
 * constructs, one line that hangs them on a body*. The four constructs — the
 * terminator ramp, the contact shadow, the specular and the rim light — are
 * what eleven skins import, and they stay next door; everything here is what
 * they are built out of, and no skin has ever asked for any of it.
 *
 * `KEY` is the exception and it is deliberate: fourteen skins import it from
 * `light.ts`, which re-exports it from here, so there is one definition and
 * the name they reach for does not move.
 */

/** Upper left, and it lives in `packages/content` now — the only package this
 * file and `packages/render` can both read, so one angle serves the page and
 * the game and neither can drift. The reasoning for upper left went with it. */
export const KEY = KEY_LIGHT;

/**
 * The body as `objectBoundingBox` sees it, how far the gradient's focus is
 * pushed toward the light, and the gradient circle. Bbox units, like
 * `corePass`, so no pixel scale reaches in here.
 * `SPAN` at 2.4 R is a choice about **margin**, not a threshold. The lit
 * silhouette must stay brighter than the core shadow — `(R−d)/(SPAN−d) <
 * (d+R/2)/(SPAN+d)` — which holds for any `SPAN > 1.29 R`, where the two are
 * equal and the ball is a donut. What a large circle buys is room: at 2.4 R the
 * body occupies only the first 53% of the ramp, the lit rim sits at 22% and the
 * core shadow at 37%, and four stops fit between them with air.
 */
export const BODY = 0.5;
export const FOCUS = 0.3;
export const SPAN = 1.2;

/**
 * Where the stops go, derived rather than typed. `u` is SVG's gradient
 * parameter — focus-to-point over focus-to-circle — so each is a landmark: the
 * centre 0.200, the true terminator (the silhouette square to the light) 0.440,
 * the shadow silhouette 0.533, the turn halfway between the first two, 0.320.
 */
export const U_CENTRE = FOCUS / (SPAN + FOCUS);
export const U_TERMINATOR = ((): number => {
  const h = Math.hypot(BODY, FOCUS);
  const k = -(FOCUS * FOCUS) / h;
  return h / (-k + Math.sqrt(k * k - (FOCUS * FOCUS - SPAN * SPAN)));
})();
export const U_SHADOW_RIM = (FOCUS + BODY) / (SPAN + FOCUS);
export const U_TURN = (U_CENTRE + U_TERMINATOR) / 2;

/**
 * The hue split, as literals. A lit surface tends toward the colour of the
 * light and a shadowed one toward the sky, which is why the reference sheet's
 * `sphereGlow` runs white → pale → cool → black over spheres of every hue
 * instead of ramping each sphere's own. Rotating the body's hue would be worse
 * than nothing: a fixed rotation is warm for a red body and cool for a cyan
 * one, so the page would disagree in colour just after this file stopped it
 * disagreeing in angle. `DEEP` is the core shadow, cool and darker than the
 * base; `BOUNCE` is light coming back off whatever the body sits over.
 */
export const WARM = "#FFF2DC";
export const SPECULAR_WHITE = "#FFFBF0";
export const DEEP = "#05081A";
export const BOUNCE = "#3A5C90";
export const CONTACT_DARK = "#04030C";
export const RIM_COOL = "#E6F2FF";

export type Stop = readonly [offset: number, colour: string, alpha: number];

export function addStops(grad: SVGElement, list: readonly Stop[]): void {
  for (const [offset, colour, alpha] of list) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
    s.setAttribute("stop-color", colour);
    s.setAttribute("stop-opacity", alpha.toFixed(3));
    grad.appendChild(s);
  }
}

/**
 * A gradient along the key axis, in bbox units: `0` is the silhouette nearest
 * the light, `1` the furthest, and **`0.5` is the terminator**, since a point
 * square to the light projects onto the centre — how CONTACT and RIM say
 * "before the terminator" and mean a number.
 */
export function keyAxis(ctx: SkinContext, id: string, list: readonly Stop[]): string {
  const grad = document.createElementNS(SVG, "linearGradient");
  grad.setAttribute("id", `${ctx.uid}-${id}`);
  grad.setAttribute("x1", (0.5 + BODY * KEY.x).toFixed(4));
  grad.setAttribute("y1", (0.5 + BODY * KEY.y).toFixed(4));
  grad.setAttribute("x2", (0.5 - BODY * KEY.x).toFixed(4));
  grad.setAttribute("y2", (0.5 - BODY * KEY.y).toFixed(4));
  addStops(grad, list);
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-${id})`;
}

/** A body path under a paint, and a stroke wearing the contour. Both are
 * carried by the contour as it breathes, and cost nothing per frame. */
export function bodyFill(ctx: SkinContext, paint: string): SVGPathElement {
  const p = ctx.contourPath();
  p.setAttribute("fill", paint);
  p.setAttribute("fill-rule", "evenodd");
  p.setAttribute("stroke", "none");
  ctx.body.appendChild(p);
  return p;
}

export function bodyStroke(ctx: SkinContext, paint: string, width: number): SVGPathElement {
  const p = ctx.contourPath();
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", paint);
  p.setAttribute("stroke-width", String(width));
  return p;
}

/**
 * A group clipped to the body with its own id, so a skin composing this light
 * *and* its own clipped texture does not put two clip paths under one id.
 */
export function insideBody(ctx: SkinContext): SVGGElement {
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", `${ctx.uid}-lit`);
  clip.appendChild(ctx.contourPath());
  ctx.defs.appendChild(clip);
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${ctx.uid}-lit)`);
  ctx.body.appendChild(g);
  return g;
}
