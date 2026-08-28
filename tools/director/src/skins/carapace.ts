import { KEY } from "./light.js";
import { auraPass, clipGroup, corePass, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * CARAPACE — few, large, geometric plates separated by dark seams, a beetle
 * elytron or a turtle's shell rather than SCALE's many soft petals.
 *
 * Same lattice discipline as SCALE, same reason: every plate is laid out once
 * in polar space — an angle and a fraction of `ctx.reach`, never a pixel — and
 * the whole lattice sits inside one `clipGroup`, whose clip path is re-handed
 * a fresh `d` every frame by `shape-figure.ts`. Nothing here is baked to a
 * fixed silhouette; the *positions* are computed once and the *edge the body
 * actually has* is supplied fresh each frame by the clip.
 *
 * Where SCALE shrinks outward in many rounded rows, this is three hard rings
 * — a cap, and two bands of straight-edged sectors staggered against each
 * other, each ring far fewer plates than SCALE draws in one row. That is the
 * difference the brief asks not to lose: soft-and-many against hard-and-few,
 * not the same lattice at a second scale. A version of this that only turned
 * SCALE's row count down and its petals square would be the failure the brief
 * names — the two would read as one skin twice, and the fix would be here,
 * not on the switcher.
 *
 * "A bright edge on the lit side of each" is `KEY`, not a second angle: a
 * plate's outer edge is highlighted only where that edge's own outward
 * direction agrees with `KEY`, the same constant `light.ts` lights every card
 * with, so a carapace under LIGHT does not argue with its own highlight.
 */

const CAP_R = 0.42;
const MID_R = 0.85;
const OUT_R = 1.5;
const MID_SECTORS = 5;
const OUT_SECTORS = 7;
const SEAM_GAP = 0.05;
const SEAM_COLOUR = "#05070F";
const HIGHLIGHT = "#EAF3FF";

function wedgePath(r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number) =>
    `${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
  const large = a1 - a0 > Math.PI ? 1 : 0;
  if (r0 <= 0.001) {
    return `M 0 0 L ${p(r1, a0)} A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${large} 1 ${p(r1, a1)} Z`;
  }
  return (
    `M ${p(r0, a0)} L ${p(r1, a0)} ` +
    `A ${r1.toFixed(1)} ${r1.toFixed(1)} 0 ${large} 1 ${p(r1, a1)} ` +
    `L ${p(r0, a1)} A ${r0.toFixed(1)} ${r0.toFixed(1)} 0 ${large} 0 ${p(r0, a0)} Z`
  );
}

/** The one edge worth lighting: the outer arc, and only when it faces `KEY`. */
function litOuterEdge(r: number, a0: number, a1: number, weight: number): SVGPathElement | null {
  const mid = (a0 + a1) / 2;
  const facing = Math.cos(mid) * KEY.x + Math.sin(mid) * KEY.y;
  if (facing <= 0.05) return null;
  const p = document.createElementNS(SVG, "path");
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const x0 = (Math.cos(a0) * r).toFixed(1);
  const y0 = (Math.sin(a0) * r).toFixed(1);
  const x1 = (Math.cos(a1) * r).toFixed(1);
  const y1 = (Math.sin(a1) * r).toFixed(1);
  p.setAttribute("d", `M ${x0} ${y0} A ${r.toFixed(1)} ${r.toFixed(1)} 0 ${large} 1 ${x1} ${y1}`);
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", HIGHLIGHT);
  p.setAttribute("stroke-opacity", (facing * 0.75).toFixed(3));
  p.setAttribute("stroke-width", String(weight * 1.1));
  p.setAttribute("stroke-linecap", "round");
  return p;
}

function plate(
  ctx: SkinContext,
  g: SVGGElement,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
): void {
  const body = document.createElementNS(SVG, "path");
  body.setAttribute("d", wedgePath(r0 * ctx.reach, r1 * ctx.reach, a0, a1));
  body.setAttribute("fill", ctx.colour);
  body.setAttribute("fill-opacity", "0.2");
  body.setAttribute("stroke", SEAM_COLOUR);
  body.setAttribute("stroke-width", String(ctx.weight * 1.3));
  g.appendChild(body);
  const edge = litOuterEdge(r1 * ctx.reach, a0 + SEAM_GAP * 0.5, a1 - SEAM_GAP * 0.5, ctx.weight);
  if (edge) g.appendChild(edge);
}

function ring(
  ctx: SkinContext,
  g: SVGGElement,
  r0: number,
  r1: number,
  sectors: number,
  phase: number,
): void {
  const step = (Math.PI * 2) / sectors;
  for (let i = 0; i < sectors; i++) {
    const a0 = i * step + phase + SEAM_GAP;
    const a1 = (i + 1) * step + phase - SEAM_GAP;
    plate(ctx, g, r0, r1, a0, a1);
  }
}

function carapacePlates(ctx: SkinContext): void {
  const g = clipGroup(ctx, "carapace");
  const rand = streamFor(ctx.name);
  const midPhase = rand() * Math.PI * 2;
  const outPhase = midPhase + Math.PI / OUT_SECTORS;
  plate(ctx, g, 0, CAP_R, 0, Math.PI * 2 - 0.001);
  ring(ctx, g, CAP_R, MID_R, MID_SECTORS, midPhase);
  ring(ctx, g, MID_R, OUT_R, OUT_SECTORS, outPhase);
}

export const CARAPACE: Skin<"carapace"> = {
  id: "carapace",
  label: "CARAPACE",
  hint: "few hard plates in seamed rings, lit edge from the key light",
  build(ctx) {
    fillPass(ctx);
    corePass(ctx);
    carapacePlates(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
