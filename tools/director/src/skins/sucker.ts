import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { poissonScatter, type ScatterPoint } from "./pore.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * SUCKER — an octopus arm: concentric rings, largest along a spine and
 * falling off to either side.
 *
 * The scatter is `pore.ts`'s `poissonScatter`, unchanged — same dart-throwing,
 * same rejection against a dart already kept, so a lone reader of this file
 * cannot mistake the difference from PORE for a different algorithm. The
 * difference is the density field handed in: PORE's is a handful of seeded
 * points, radially symmetric in aggregate; this one is a single seeded line
 * through the body, `theta`, and closeness is how near a candidate falls to
 * it. That line is the one thing PORE has none of, so if a card ever reads as
 * "PORE with fewer dots" rather than "rings on an arm", the axis has stopped
 * doing its job and that is a finding, not a knob to nudge quietly here.
 *
 * `sizeBias` is what makes the axis visible rather than merely present: a
 * candidate near the line is allowed to be large, one far from it is pushed
 * small, on top of `minCloseness` keeping the far field genuinely bare rather
 * than thinly dotted. "Falling off to either side" is exactly that gradient,
 * read across the line's own normal, not along it.
 *
 * Each ring is three concentric circles — a dark centre, a faint inner ring,
 * and a bright outer annulus — radially symmetric in itself. Nothing here
 * reads `KEY`: unlike PORE's highlight, a sucker's own rings are not a claim
 * about which way the light falls, so there is nothing to guard on `ctx.lit`.
 */

const TARGET = 85;
const ATTEMPTS = TARGET * 90;
const COVER = 1.4;
const R_MIN = 0.07;
const R_MAX = 0.16;
const SPACING_DENSE = 1.7;
const SPACING_SPARSE = 4.2;
/** How far to either side of the spine its influence reaches, as a fraction
 * of `reach`. Past it a candidate is discarded outright by `MIN_CLOSENESS`. */
const BAND = 0.55;
const MIN_CLOSENESS = 0.02;
/** Near the spine a ring may reach `rMax`; at the band's own edge it is
 * pinned close to `rMin` — the size gradient that reads as "falling off". */
const SIZE_FAR = 0.35;

const DARK = "#050310";
const BRIGHT = "#F4EFFF";

function suckerField(ctx: SkinContext, rand: () => number): ScatterPoint[] {
  const theta = rand() * Math.PI * 2;
  const nx = -Math.sin(theta);
  const ny = Math.cos(theta);
  return poissonScatter(rand, ctx.reach, {
    target: TARGET,
    attempts: ATTEMPTS,
    cover: COVER,
    rMin: R_MIN,
    rMax: R_MAX,
    spacingDense: SPACING_DENSE,
    spacingSparse: SPACING_SPARSE,
    minCloseness: MIN_CLOSENESS,
    closeness: (x, y) => {
      const perp = Math.abs(x * nx + y * ny);
      return Math.max(0, 1 - perp / (ctx.reach * BAND));
    },
    sizeBias: (c) => SIZE_FAR + (1 - SIZE_FAR) * c,
  });
}

function circle(cx: number, cy: number, r: number): SVGCircleElement {
  const c = document.createElementNS(SVG, "circle");
  c.setAttribute("cx", cx.toFixed(1));
  c.setAttribute("cy", cy.toFixed(1));
  c.setAttribute("r", r.toFixed(2));
  return c;
}

/** A dark centre, a faint inner ring and a bright outer annulus — one ring
 * reads as depth the way CRATER's bowl-and-lip does, but with no axis of its
 * own: every stop here is set by `s.r` alone. */
function ring(g: SVGGElement, s: ScatterPoint, rand: () => number): void {
  const centre = circle(s.x, s.y, s.r * 0.42);
  centre.setAttribute("fill", DARK);
  centre.setAttribute("fill-opacity", (0.5 + rand() * 0.15).toFixed(3));
  g.appendChild(centre);

  const mid = circle(s.x, s.y, s.r * 0.72);
  mid.setAttribute("fill", "none");
  mid.setAttribute("stroke", DARK);
  mid.setAttribute("stroke-opacity", "0.22");
  mid.setAttribute("stroke-width", (s.r * 0.1).toFixed(2));
  g.appendChild(mid);

  const outer = circle(s.x, s.y, s.r);
  outer.setAttribute("fill", "none");
  outer.setAttribute("stroke", BRIGHT);
  outer.setAttribute("stroke-opacity", (0.45 + rand() * 0.2).toFixed(3));
  outer.setAttribute("stroke-width", (s.r * 0.22).toFixed(2));
  g.appendChild(outer);
}

function suckers(ctx: SkinContext): void {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "sucker");
  for (const s of suckerField(ctx, rand)) ring(g, s, rand);
}

export const SUCKER: Skin<"sucker"> = {
  id: "sucker",
  label: "SUCKER",
  hint: "concentric rings largest on a seeded spine, falling off to the sides",
  build(ctx) {
    fillPass(ctx);
    suckers(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
