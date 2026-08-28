import { contactPass, KEY, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { mountPlate, type Plate, spinPlates } from "./mounted.js";
import { auraPass, clipGroup, corePass, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { turnAngle } from "./turn.js";
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

/** How finely a gore's four edges are sampled. Seven is where the outline stops
 * visibly faceting at a boss-sized card; the cost is a `d` of 28 points. */
const GORE_STEPS = 7;
/**
 * The cap becomes three gores rather than one plate, and that is forced rather
 * than chosen. A spherical cap's boundary is a ring of **constant** latitude,
 * which orthographic projection collapses onto a line segment — its far half
 * folds onto the same two limb points as its near half, and the polygon comes
 * out with no area at all. A gore that reaches the pole has meridian edges,
 * whose latitudes vary, so its far run traces the limb properly. See
 * `spinPlates`. Three keeps the crown reading as a crown and not as a ring.
 */
const CAP_SECTORS = 3;

/** One plate's outline, walked inner arc → meridian → outer arc → meridian, in
 * `[lon, lat]`. A degenerate end (`c0 = 0`, `c1 = π`) is a run of repeated pole
 * points, which costs a few zero-length segments and no special case. */
function gore(c0: number, c1: number, a0: number, a1: number): [number, number][] {
  const v: [number, number][] = [];
  const at = (c: number, a: number): void => {
    v.push([a, Math.PI / 2 - c]);
  };
  for (let i = 0; i <= GORE_STEPS; i++) at(c0, a0 + ((a1 - a0) * i) / GORE_STEPS);
  for (let i = 1; i <= GORE_STEPS; i++) at(c0 + ((c1 - c0) * i) / GORE_STEPS, a1);
  for (let i = 1; i <= GORE_STEPS; i++) at(c1, a1 - ((a1 - a0) * i) / GORE_STEPS);
  for (let i = 1; i < GORE_STEPS; i++) at(c1 - ((c1 - c0) * i) / GORE_STEPS, a0);
  return v;
}

/**
 * The same three courses, on a ball instead of on a picture.
 *
 * `CAP_R`, `MID_R` and `OUT_R` were radii out from the picture's centre; here
 * they are **colatitudes** out from the pole the body turns about, on the same
 * scale — `OUT_R` reached the corner of the card and now reaches the far pole,
 * so the three courses wrap the whole ball with nothing left bare. A shell of a
 * cap and two courses of segments, which is what the flat one draws too.
 *
 * This is the one skin here that cannot be a `Mounted`. Its plates span fifty
 * degrees of arc and more, and a single `scale(cos α, cos lat)` about a plate's
 * centre is the tangent plane *at that centre* — right for a scale, and for a
 * plate this size a flat card glued to a ball, visibly wrong at its own edges
 * and worst exactly where the plate crosses the limb. So each outline is
 * carried round vertex by vertex by `spinPlates`, and a plate straddling the
 * silhouette comes out cut along it.
 *
 * The flat skin's bright outer edge is not reproduced, and dropping it is the
 * argument: on a still body the lit edge is a fixed subset of plates and can be
 * drawn once, but on a turning one it is whichever edge faces `KEY` *now*. The
 * per-plate lambert `spinPlates` applies is the honest form of the same claim,
 * and like every other light on the page it goes off with `ctx.lit`.
 */
function mountedGores(ctx: SkinContext): Plate[] {
  const g = clipGroup(ctx, "carapace-mounted");
  const rand = streamFor(ctx.name);
  const midPhase = rand() * Math.PI * 2;
  const outPhase = midPhase + Math.PI / OUT_SECTORS;
  const dim = ctx.lit ? 0.25 : 1;
  const courses: readonly (readonly [number, number, number, number])[] = [
    [0, (Math.PI * CAP_R) / OUT_R, CAP_SECTORS, midPhase],
    [(Math.PI * CAP_R) / OUT_R, (Math.PI * MID_R) / OUT_R, MID_SECTORS, midPhase],
    [(Math.PI * MID_R) / OUT_R, Math.PI, OUT_SECTORS, outPhase],
  ];
  const out: Plate[] = [];
  for (const [c0, c1, sectors, phase] of courses) {
    const step = (Math.PI * 2) / sectors;
    for (let i = 0; i < sectors; i++) {
      const a0 = i * step + phase + SEAM_GAP;
      const a1 = (i + 1) * step + phase - SEAM_GAP;
      const p = document.createElementNS(SVG, "path");
      p.setAttribute("fill", ctx.colour);
      p.setAttribute("fill-opacity", "0.2");
      p.setAttribute("stroke", SEAM_COLOUR);
      p.setAttribute("stroke-width", String(ctx.weight * 1.3));
      g.appendChild(p);
      const centre = [(a0 + a1) / 2, Math.PI / 2 - (c0 + c1) / 2] as const;
      out.push(mountPlate(p, gore(c0, c1, a0, a1), centre, ctx.reach, dim));
    }
  }
  return out;
}

export const MOUNTED_CARAPACE: Skin<"carapace-mounted"> = {
  id: "carapace-mounted",
  label: "MOUNTED CARAPACE",
  hint: "the same courses of plates, cut by the silhouette as the body turns",
  build(ctx) {
    fillPass(ctx);
    corePass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const shell = mountedGores(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    spinPlates(shell, turnAngle(0));
    ctx.onFrame(({ t }) => spinPlates(shell, turnAngle(t)));
  },
};
