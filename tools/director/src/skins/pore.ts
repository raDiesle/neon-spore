import { KEY } from "./light.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * PORE — a frog's skin: bumps scattered without a lattice, dense in places and
 * sparse in others, each a small radial highlight over a shadow.
 *
 * The whole difference from SCALE and CARAPACE is the absence of a grid, and a
 * jittered grid is what you get if you are not careful — rows still visible
 * under the noise. So there are no rows here: `poissonScatter` below throws
 * darts inside the body's own disc and rejects one that lands too close to a
 * bump already placed, the way real pores crowd in one spot and thin out in
 * another rather than tiling. `SUCKER` in `./sucker.js` reuses this exact
 * engine with a different density field — a line, not a handful of points —
 * which is the one thing meant to keep the two skins apart; if it stops being
 * the only thing, that is a finding, not a detail to quietly fix here.
 *
 * Each bump is a plain filled circle plus, only when `ctx.lit`, a small bright
 * disc offset toward `KEY` and a small dark disc offset away from it — a
 * highlight and the shadow under it, at the size of one pore rather than the
 * body-wide ramp `light.ts` draws. Both discs paint from a gradient shared by
 * every bump on the card: `objectBoundingBox` units mean the same two stops
 * read correctly on a bump of any size or position, so hundreds of highlights
 * cost two `<defs>` entries and not one each.
 */

/** One placed dart: a body-relative position and its own radius. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface ScatterOptions {
  /** How many darts to try to land before giving up. */
  readonly target: number;
  /** A hard cap on candidates drawn, so a dense band can't spin forever. */
  readonly attempts: number;
  /** Sample disc radius, as a multiple of `reach` — `clipGroup` trims it. */
  readonly cover: number;
  readonly rMin: number;
  readonly rMax: number;
  /** Minimum centre-to-centre gap, as a multiple of a dart's own radius, at
   * closeness 1 and closeness 0 — the two ends of the density field. */
  readonly spacingDense: number;
  readonly spacingSparse: number;
  /** A candidate below this closeness is discarded outright, before spacing
   * is even checked — the way a region stays genuinely bare. */
  readonly minCloseness: number;
  /** 0 (bare) .. 1 (densest) at a body-relative point. The only thing that
   * tells two scatters apart is what this function measures against. */
  closeness(x: number, y: number): number;
  /** Optional multiplier on `rMax`/`rMin`'s pick, driven by closeness — unset
   * for a scatter with no size gradient, set for one with an axis. */
  sizeBias?(closeness: number): number;
}

/**
 * Dart-throwing, not a jittered lattice: a candidate is a uniformly-random
 * point in the disc (`sqrt(rand())` for area, not radius, so it isn't
 * centre-heavy), rejected if the local density field says so or if it lands
 * too near a dart already kept. Nothing here allocates per frame — this runs
 * once in `build()`, like every other skin's lattice.
 */
export function poissonScatter(
  rand: () => number,
  reach: number,
  opts: ScatterOptions,
): ScatterPoint[] {
  const placed: ScatterPoint[] = [];
  const bias = opts.sizeBias ?? (() => 1);
  let tries = 0;
  while (placed.length < opts.target && tries < opts.attempts) {
    tries++;
    const a = rand() * Math.PI * 2;
    const rr = Math.sqrt(rand()) * reach * opts.cover;
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    const c = opts.closeness(x, y);
    if (c < opts.minCloseness) continue;
    const r = reach * (opts.rMin + rand() * (opts.rMax - opts.rMin)) * bias(c);
    const spacing = r * (opts.spacingSparse - (opts.spacingSparse - opts.spacingDense) * c);
    const clash = placed.some((p) => Math.hypot(p.x - x, p.y - y) < spacing);
    if (clash) continue;
    placed.push({ x, y, r });
  }
  return placed;
}

const TARGET = 420;
const ATTEMPTS = TARGET * 60;
const COVER = 1.5;
const R_MIN = 0.045;
const R_MAX = 0.1;
const SPACING_DENSE = 1.5;
const SPACING_SPARSE = 3.4;
const HOTSPOTS = 4;
const WARM = "#FFF2DC";
const SHADOW = "#04030C";

interface Hotspot {
  readonly x: number;
  readonly y: number;
  readonly spread: number;
}

/** A handful of seeded centres where pores crowd — never on a grid of their
 * own, just a few points whose influence overlaps and fades. */
function hotspots(rand: () => number, reach: number): Hotspot[] {
  return Array.from({ length: HOTSPOTS }, () => {
    const a = rand() * Math.PI * 2;
    const d = rand() * reach * 0.75;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d, spread: reach * (0.4 + rand() * 0.4) };
  });
}

function closenessFromHotspots(hs: readonly Hotspot[], x: number, y: number): number {
  let c = 0;
  for (const h of hs) {
    const d = Math.hypot(x - h.x, y - h.y);
    c = Math.max(c, Math.max(0, 1 - d / h.spread));
  }
  return c;
}

function circle(cx: number, cy: number, r: number, fill: string): SVGCircleElement {
  const c = document.createElementNS(SVG, "circle");
  c.setAttribute("cx", cx.toFixed(1));
  c.setAttribute("cy", cy.toFixed(1));
  c.setAttribute("r", r.toFixed(2));
  c.setAttribute("fill", fill);
  return c;
}

/** The two gradients every bump's highlight and shadow share — bbox units, so
 * one definition each reads correctly on a circle of any size or position. */
function bumpPaint(ctx: SkinContext): { hi: string; sh: string } {
  const hi = document.createElementNS(SVG, "radialGradient");
  hi.setAttribute("id", `${ctx.uid}-pore-hi`);
  const sh = document.createElementNS(SVG, "radialGradient");
  sh.setAttribute("id", `${ctx.uid}-pore-sh`);
  for (const [offset, colour, alpha] of [
    [0, WARM, 0.85],
    [0.5, WARM, 0.22],
    [1, WARM, 0],
  ] as const) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", `${offset * 100}%`);
    s.setAttribute("stop-color", colour);
    s.setAttribute("stop-opacity", String(alpha));
    hi.appendChild(s);
  }
  for (const [offset, colour, alpha] of [
    [0, SHADOW, 0.7],
    [0.6, SHADOW, 0.22],
    [1, SHADOW, 0],
  ] as const) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", `${offset * 100}%`);
    s.setAttribute("stop-color", colour);
    s.setAttribute("stop-opacity", String(alpha));
    sh.appendChild(s);
  }
  ctx.defs.appendChild(hi);
  ctx.defs.appendChild(sh);
  return { hi: `url(#${ctx.uid}-pore-hi)`, sh: `url(#${ctx.uid}-pore-sh)` };
}

function pores(ctx: SkinContext): void {
  const g = clipGroup(ctx, "pore");
  const rand = streamFor(ctx.name);
  const hs = hotspots(rand, ctx.reach);
  const field = poissonScatter(rand, ctx.reach, {
    target: TARGET,
    attempts: ATTEMPTS,
    cover: COVER,
    rMin: R_MIN,
    rMax: R_MAX,
    spacingDense: SPACING_DENSE,
    spacingSparse: SPACING_SPARSE,
    minCloseness: 0,
    closeness: (x, y) => closenessFromHotspots(hs, x, y),
  });
  const paint = ctx.lit ? bumpPaint(ctx) : null;
  for (const b of field) {
    const base = circle(b.x, b.y, b.r, ctx.colour);
    base.setAttribute("fill-opacity", (0.14 + rand() * 0.12).toFixed(3));
    g.appendChild(base);
    if (!paint) continue;
    g.appendChild(circle(b.x + KEY.x * b.r * 0.32, b.y + KEY.y * b.r * 0.32, b.r * 0.55, paint.hi));
    g.appendChild(circle(b.x - KEY.x * b.r * 0.3, b.y - KEY.y * b.r * 0.3, b.r * 0.62, paint.sh));
  }
}

export const PORE: Skin<"pore"> = {
  id: "pore",
  label: "PORE",
  hint: "a Poisson scatter of bumps, dense in places and bare in others",
  build(ctx) {
    fillPass(ctx);
    pores(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
