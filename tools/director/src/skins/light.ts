import {
  addStops,
  BOUNCE,
  bodyFill,
  bodyStroke,
  CONTACT_DARK,
  DEEP,
  FOCUS,
  insideBody,
  KEY,
  keyAxis,
  RIM_COOL,
  SPAN,
  SPECULAR_WHITE,
  U_SHADOW_RIM,
  U_TERMINATOR,
  U_TURN,
  WARM,
} from "./light-axis.js";
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

/** Where fourteen skins find the key's direction. Defined with the axis it
 * belongs to and re-exported here, because that is the name they import
 * (`light-axis.ts`). */
export { KEY } from "./light-axis.js";

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
