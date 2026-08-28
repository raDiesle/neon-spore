import { type SkinContext, SVG } from "./types.js";

/**
 * The passes more than one skin draws.
 *
 * MEMBRANE, CORE and VEIN are not three pictures, they are one picture with
 * one thing added each time — that is the whole design of the comparison, and
 * it only holds if the shared passes are literally the same code. Three copies
 * of an aura drift, and a vote taken over drifted copies answers nothing.
 *
 * Every one of these appends to `ctx.body` in call order, so a skin reads top
 * to bottom as the order the passes stack: fill, gradient, texture, aura, rim.
 */

/** Aura passes, widest and faintest first — `glow.ts`'s shape, in SVG. */
const PASSES = 3;
const SPREAD = 5;

/**
 * The dark body fill, under every stroke. `evenodd` so a mouth or a parted
 * body stays a hole rather than being flooded.
 */
export function fillPass(ctx: SkinContext): SVGPathElement {
  const back = ctx.contourPath();
  back.setAttribute("fill", ctx.colour);
  back.setAttribute("fill-opacity", "0.12");
  back.setAttribute("fill-rule", "evenodd");
  back.setAttribute("stroke", "none");
  ctx.body.appendChild(back);
  return back;
}

/**
 * A radial value gradient under the membrane.
 *
 * Its outer stop falls toward the card's own dark and never toward the rim
 * colour. That direction is the point and it is `alive.md`'s: a gradient that
 * brightens the rim raises contrast, one that brightens the edge erodes it.
 */
export function corePass(ctx: SkinContext): SVGPathElement {
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-core`);
  grad.setAttribute("r", "0.72");
  for (const [offset, stop, alpha] of [
    ["0%", ctx.colour, "0.34"],
    ["58%", ctx.colour, "0.12"],
    ["100%", "#07060F", "0.55"],
  ] as const) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", offset);
    s.setAttribute("stop-color", stop);
    s.setAttribute("stop-opacity", alpha);
    grad.appendChild(s);
  }
  ctx.defs.appendChild(grad);
  const lit = ctx.contourPath();
  lit.setAttribute("fill", `url(#${ctx.uid}-core)`);
  lit.setAttribute("fill-rule", "evenodd");
  lit.setAttribute("stroke", "none");
  ctx.body.appendChild(lit);
  return lit;
}

/**
 * A clip on the body itself, for anything drawn inside the membrane.
 *
 * Hands back the group to fill; the clip path wears the contour like every
 * other, so the texture is trimmed by the shape as it breathes rather than by
 * the shape as it stood still.
 *
 * `name` distinguishes one clip from another **within a single skin**, and a
 * skin that wants two must pass it. The id used to be `${uid}-clip` and
 * nothing else, so calling this twice put two clip paths under one id and
 * silently trimmed one group with the other's shape — a wrong picture with no
 * error anywhere. Two skins hit it independently and each hand-rolled a
 * private copy of this function rather than change a shared file; the second
 * time a workaround is written is when the helper is wrong. `uid` still keys
 * one card apart from the next, which is the other collision and the reason
 * every id here carries it.
 */
export function clipGroup(ctx: SkinContext, name = "clip"): SVGGElement {
  const id = `${ctx.uid}-${name}`;
  const clip = document.createElementNS(SVG, "clipPath");
  clip.setAttribute("id", id);
  clip.appendChild(ctx.contourPath());
  ctx.defs.appendChild(clip);
  const g = document.createElementNS(SVG, "g");
  g.setAttribute("clip-path", `url(#${id})`);
  ctx.body.appendChild(g);
  return g;
}

/**
 * The aura: the same outline a few times, widest and faintest first. Three
 * passes is `STROKE.glowPasses`, and the spread matches `STROKE.glowSpread`.
 */
export function auraPass(ctx: SkinContext): SVGPathElement[] {
  const out: SVGPathElement[] = [];
  for (let i = PASSES; i >= 1; i--) {
    const g = ctx.contourPath();
    g.setAttribute("fill", "none");
    g.setAttribute("stroke", ctx.colour);
    g.setAttribute("stroke-opacity", (0.1 + 0.05 * (PASSES - i)).toFixed(2));
    g.setAttribute("stroke-width", String(ctx.weight + (i * SPREAD) / PASSES));
    ctx.body.appendChild(g);
    out.push(g);
  }
  return out;
}

/** The outline itself, last and on top of everything. */
export function rimPass(ctx: SkinContext): SVGPathElement {
  const rim = ctx.contourPath();
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", ctx.colour);
  rim.setAttribute("stroke-width", String(ctx.weight));
  ctx.body.appendChild(rim);
  return rim;
}
