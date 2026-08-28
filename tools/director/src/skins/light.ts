import { KEY as KEY_LIGHT } from "@neon-spore/content";
import { auraPass, fillPass, rimPass } from "./parts.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * The key light: one direction, four constructs, one line that hangs them on a
 * body. Other skins are written against a light and none can supply one, and
 * six each inventing one puts twelve bodies on a page lit from twelve
 * directions — the mistake an eye reads as *wrong*. So the direction is a
 * **constant and never a parameter**, and whether it is on at all is `ctx.lit`.
 * **This is a card and it is not a promise about creatures.** The hue split is
 * what `docs/alive.md` refuses for a body in a wave, and that refusal is about
 * the field, not this page. Nothing here weakens it. What a shipped version
 * would clear first is the ammunition constraint: at 26 px the tint may never
 * move a red body toward cyan, because the colour *is* the callout.
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
const BODY = 0.5;
const FOCUS = 0.3;
const SPAN = 1.2;

/**
 * Where the stops go, derived rather than typed. `u` is SVG's gradient
 * parameter — focus-to-point over focus-to-circle — so each is a landmark: the
 * centre 0.200, the true terminator (the silhouette square to the light) 0.440,
 * the shadow silhouette 0.533, the turn halfway between the first two, 0.320.
 */
const U_CENTRE = FOCUS / (SPAN + FOCUS);
const U_TERMINATOR = ((): number => {
  const h = Math.hypot(BODY, FOCUS);
  const k = -(FOCUS * FOCUS) / h;
  return h / (-k + Math.sqrt(k * k - (FOCUS * FOCUS - SPAN * SPAN)));
})();
const U_SHADOW_RIM = (FOCUS + BODY) / (SPAN + FOCUS);
const U_TURN = (U_CENTRE + U_TERMINATOR) / 2;

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
const WARM = "#FFF2DC";
const SPECULAR_WHITE = "#FFFBF0";
const DEEP = "#05081A";
const BOUNCE = "#3A5C90";
const CONTACT_DARK = "#04030C";
const RIM_COOL = "#E6F2FF";

type Stop = readonly [offset: number, colour: string, alpha: number];

function addStops(grad: SVGElement, list: readonly Stop[]): void {
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
function keyAxis(ctx: SkinContext, id: string, list: readonly Stop[]): string {
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
function bodyFill(ctx: SkinContext, paint: string): SVGPathElement {
  const p = ctx.contourPath();
  p.setAttribute("fill", paint);
  p.setAttribute("fill-rule", "evenodd");
  p.setAttribute("stroke", "none");
  ctx.body.appendChild(p);
  return p;
}

function bodyStroke(ctx: SkinContext, paint: string, width: number): SVGPathElement {
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
function insideBody(ctx: SkinContext): SVGGElement {
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", `${ctx.uid}-lit`);
  clip.appendChild(ctx.contourPath());
  ctx.defs.appendChild(clip);
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${ctx.uid}-lit)`);
  ctx.body.appendChild(g);
  return g;
}

/**
 * TERMINATOR — the body's value ramp, and the one place a mistake is fatal. A
 * radial gradient centred on the shape is a glow; the same gradient with its
 * focus pushed toward the light is a sphere, and that attribute pair is the
 * whole lane. Four stops, not two: the lit shoulder at the focus, the turn into
 * shadow, a core shadow *darker than the base* on the terminator, and a faint
 * bounce off the shadowed rim — the stop everyone leaves out, and the one
 * separating a ball from a disc with a smudge on it.
 */
export function terminatorPass(ctx: SkinContext): SVGPathElement {
  if (!ctx.lit) return document.createElementNS(SVG, "path");
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-term`);
  grad.setAttribute("r", String(SPAN));
  grad.setAttribute("fx", (0.5 + FOCUS * KEY.x).toFixed(4));
  grad.setAttribute("fy", (0.5 + FOCUS * KEY.y).toFixed(4));
  addStops(grad, [
    [0, WARM, 0.34],
    [U_TURN, ctx.colour, 0.1],
    [U_TERMINATOR, DEEP, 0.62],
    [U_SHADOW_RIM, BOUNCE, 0.22],
  ]);
  ctx.defs.appendChild(grad);
  return bodyFill(ctx, `url(#${ctx.uid}-term)`);
}

/**
 * CONTACT — a dark inner shadow hugging the contour on the **lit** side only.
 * Counter-intuitive and correct: the terminator makes a body round, this makes
 * it solid, because a surface curving away from a light darkens right at the
 * silhouette. Without it the lit shoulder runs off the edge and the body reads
 * as translucent. Clipped inward, gone by 0.34 — before the terminator at 0.5.
 */
export function contactPass(ctx: SkinContext): SVGPathElement {
  if (!ctx.lit) return document.createElementNS(SVG, "path");
  const paint = keyAxis(ctx, "contact", [
    [0, CONTACT_DARK, 0.55],
    [0.14, CONTACT_DARK, 0.5],
    [0.34, CONTACT_DARK, 0],
    [1, CONTACT_DARK, 0],
  ]);
  const p = bodyStroke(ctx, paint, ctx.weight * 3.4);
  insideBody(ctx).appendChild(p);
  return p;
}

/**
 * SPECULAR — one highlight, small, soft, **offset from the focus rather than
 * sitting on it**. On it, a decal; beside it, a wet surface. One, never two.
 */
export function specularPass(ctx: SkinContext): SVGPathElement {
  if (!ctx.lit) return document.createElementNS(SVG, "path");
  const tilt = 0.21;
  const dx = KEY.x * Math.cos(tilt) - KEY.y * Math.sin(tilt);
  const dy = KEY.x * Math.sin(tilt) + KEY.y * Math.cos(tilt);
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-spec`);
  grad.setAttribute("cx", (0.5 + 0.33 * dx).toFixed(4));
  grad.setAttribute("cy", (0.5 + 0.33 * dy).toFixed(4));
  grad.setAttribute("r", "0.14");
  addStops(grad, [
    [0, SPECULAR_WHITE, 0.5],
    [0.4, SPECULAR_WHITE, 0.16],
    [1, SPECULAR_WHITE, 0],
  ]);
  ctx.defs.appendChild(grad);
  return bodyFill(ctx, `url(#${ctx.uid}-spec)`);
}

/**
 * RIM — a narrow bright stroke on the side *away* from the light, fading to
 * nothing before the terminator. It is the opposite of the aura, and the two
 * must share one body without becoming one smear. Two things keep them apart
 * and neither is width: the rim is **cooler and brighter than the body colour**
 * where the aura is the body colour exactly, and it is one hard stroke where
 * the aura is three soft ones. Drawn last, over the outline, since a rim light
 * lies on the silhouette.
 */
export function rimLightPass(ctx: SkinContext): SVGPathElement {
  if (!ctx.lit) return document.createElementNS(SVG, "path");
  const paint = keyAxis(ctx, "rimlight", [
    [0, RIM_COOL, 0],
    [0.62, RIM_COOL, 0],
    [0.88, RIM_COOL, 0.7],
    [1, RIM_COOL, 0.78],
  ]);
  const p = bodyStroke(ctx, paint, ctx.weight * 0.9);
  ctx.body.appendChild(p);
  return p;
}

/**
 * The light, in one line. The order is the argument: the ramp, the edge that
 * makes it solid, the highlight, the aura and outline the other skins draw, the
 * rim light over all. A skin needing a texture between two calls them itself.
 */
export function litPass(ctx: SkinContext): void {
  terminatorPass(ctx);
  contactPass(ctx);
  specularPass(ctx);
  auraPass(ctx);
  rimPass(ctx);
  rimLightPass(ctx);
}

/** The light over nothing but the fill, so it sits beside CORE — whose
 * outward-falling gradient is the honest baseline this has to beat. */
export const LIGHT: Skin<"light"> = {
  id: "light",
  label: "LIGHT",
  hint: "a fixed key light: terminator, contact, specular, rim",
  build(ctx) {
    fillPass(ctx);
    litPass(ctx);
  },
};
