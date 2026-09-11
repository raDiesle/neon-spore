import { SVG } from "../skins/types.js";
import { at, GYRE_TURN, inside, nucleus, organelle } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * ORBIT — one band of light girdles the ball at a tilt, and the ball is in
 * the way of half of it.
 *
 * **This is the game.** `packages/render/src/gyre-orbit.ts` is what THE GYRE's
 * organelle wears since 11 September 2026, the owner's pick from the three
 * offered against YOLK, and it is on the row as a **control** for the reason
 * `spores.ts` gives: a proposal judged against a memory of the shipped look
 * wins every time.
 *
 * ## The cue
 *
 * The strongest sign a picture has that a thing is round is another thing
 * going *behind* it. So the marks in the fluid are not granules but one
 * continuous ring — a great circle of the ball tipped off the equator, carried
 * round by the turn — drawn in two halves: the far arc first, dim and thin,
 * seen through the mass, and the near arc last, bright and wide, over the mass
 * and over the nucleus. Where the ring crosses the limb the two meet, and once
 * a turn the far half comes round into view and the near half goes behind.
 * Nothing posed on a plane can do that.
 *
 * A second, fainter band is tipped the other way and turns at a different
 * rate, so the two never repeat together.
 */

/** How far off the equator the band is tipped, in radians — how open it is
 * seen at its widest. */
const TILT = 1.05;
const REACH = 0.74;
const POINTS = 40;
/** The near half's width in line weights, and what the far half keeps of
 * that and of the light: the mass is translucent, not clear. */
const NEAR_WIDTH = 1.5;
const FAR_KEEP = 0.45;
const SECOND_RATE = 0.63;
const NUCLEUS = 0.17;

/** A point on a great circle tipped by `tilt`, turned by `theta` about the
 * vertical: where it lands and how far toward the viewer it is. */
function on(u: number, tilt: number, theta: number): { x: number; y: number; z: number } {
  const cx = Math.cos(u);
  const sy = Math.sin(u) * Math.sin(tilt);
  const cz = Math.sin(u) * Math.cos(tilt);
  return {
    x: cx * Math.cos(theta) + cz * Math.sin(theta),
    y: sy,
    z: -cx * Math.sin(theta) + cz * Math.cos(theta),
  };
}

/** The half of one band on one side, as a path: each run of points on that
 * side is one stroke, starting on the limb so the two halves meet. */
function half(r: number, tilt: number, theta: number, nearSide: boolean): string {
  let d = "";
  let open = false;
  let last = on(0, tilt, theta);
  for (let i = 0; i <= POINTS; i++) {
    const p = on((i / POINTS) * Math.PI * 2, tilt, theta);
    const here = nearSide ? p.z >= 0 : p.z < 0;
    if (!here) {
      open = false;
      last = p;
      continue;
    }
    if (!open) {
      d += `M${(last.x * r).toFixed(2)} ${(last.y * r).toFixed(2)}`;
      open = true;
    }
    d += `L${(p.x * r).toFixed(2)} ${(p.y * r).toFixed(2)}`;
    last = p;
  }
  return d;
}

interface Band {
  readonly far: SVGPathElement;
  readonly near: SVGPathElement;
  readonly tilt: number;
  readonly rate: number;
  readonly reach: number;
  readonly alpha: number;
}

function arc(ctx: FillingContext, alpha: number, width: number): SVGPathElement {
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", ctx.colour);
  p.setAttribute("stroke-opacity", alpha.toFixed(3));
  p.setAttribute("stroke-width", width.toFixed(3));
  p.setAttribute("stroke-linecap", "round");
  return p;
}

export const ORBIT: Filling<"orbit"> = {
  id: "orbit",
  label: "ORBIT",
  shipped: "THE GYRE's organelle — `packages/render/src/gyre-orbit.ts`",
  hint: "one band of light round the ball at a tilt — the far half seen dimly through the mass, the near half drawn over the nucleus, swapping once a turn",
  build(ctx: FillingContext) {
    const g = inside(ctx, "orbit");
    const r = organelle(ctx);
    const body = at(ctx.centre.x, ctx.centre.y);
    g.appendChild(body);

    const w = ctx.weight * NEAR_WIDTH;
    const bands: Band[] = [
      { tilt: TILT, rate: 1, reach: r * REACH, alpha: 0.8 },
      { tilt: -TILT * 0.7, rate: SECOND_RATE, alpha: 0.45, reach: r * REACH * 0.86 },
    ].map((b) => ({
      ...b,
      far: arc(ctx, b.alpha * FAR_KEEP, w * FAR_KEEP),
      near: arc(ctx, b.alpha, w),
    }));

    // Far halves under, the nucleus, near halves over: the order is the cue.
    for (const b of bands) body.appendChild(b.far);
    body.appendChild(nucleus(ctx, r, NUCLEUS));
    for (const b of [...bands].reverse()) body.appendChild(b.near);

    const step = (t: number): void => {
      for (const b of bands) {
        const theta = t * GYRE_TURN * b.rate;
        b.far.setAttribute("d", half(b.reach, b.tilt, theta, false));
        b.near.setAttribute("d", half(b.reach, b.tilt, theta, true));
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
