import { contactPass, KEY, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { lift, type Mounted, mount, spin, stops } from "./mounted.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { turnAngle } from "./turn.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * PORE — a frog's skin: bumps scattered without a lattice, dense in places and
 * sparse in others, each a small radial highlight over a shadow.
 *
 * The whole difference from SCALE and CARAPACE is the absence of a grid, and a
 * jittered grid is what you get if you are not careful. So there are no rows
 * here: `poissonScatter` below throws darts inside the body's own disc and
 * rejects one landing too close to a bump already placed, the way real pores
 * crowd in one spot and thin out in another. `SUCKER` in `./sucker.js` reuses
 * this exact engine with a different density field — a line, not a handful of
 * points — which is the one thing meant to keep the two skins apart.
 *
 * Each bump is a filled circle plus, only when `ctx.lit`, a bright disc offset
 * toward `KEY` and a dark one away from it, both painting from a gradient
 * shared by every bump on the card — `objectBoundingBox` units, so hundreds of
 * highlights cost two `<defs>` entries and not one each.
 */

/** One placed dart: a body-relative position and its own radius. */
export interface ScatterPoint {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

/** What a bump's highlight and shadow paint from, or `null` under no light. */
type BumpPaint = { hi: string; sh: string } | null;

export interface ScatterOptions {
  /** How many darts to land, and a hard cap on candidates drawn so that a
   * dense band cannot spin forever. */
  readonly target: number;
  readonly attempts: number;
  /** Sample disc radius, as a multiple of `reach` — `clipGroup` trims it. */
  readonly cover: number;
  readonly rMin: number;
  readonly rMax: number;
  /** Minimum centre-to-centre gap, as a multiple of a dart's own radius, at
   * closeness 1 and closeness 0 — the two ends of the density field. */
  readonly spacingDense: number;
  readonly spacingSparse: number;
  /** A candidate below this closeness is discarded outright, before spacing is
   * even checked — the way a region stays genuinely bare. */
  readonly minCloseness: number;
  /** 0 (bare) .. 1 (densest) at a body-relative point. The only thing that
   * tells two scatters apart is what this function measures against. */
  closeness(x: number, y: number): number;
  /** Optional multiplier on the radius pick, driven by closeness. */
  sizeBias?(closeness: number): number;
}

/** Dart-throwing, not a jittered lattice: a candidate is a uniformly-random
 * point in the disc (`sqrt(rand())` for area, so it isn't centre-heavy),
 * rejected if the local density field says so or if it lands too near a dart
 * already kept. Runs once in `build()`, like every other skin's lattice. */
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

type Hotspot = { readonly x: number; readonly y: number; readonly spread: number };

/** A handful of seeded centres where pores crowd — not a grid, just a few
 * points whose influence overlaps and fades. */
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

/** The two gradients every bump's highlight and shadow share. */
function bumpPaint(ctx: SkinContext): { hi: string; sh: string } {
  const hi = document.createElementNS(SVG, "radialGradient");
  hi.setAttribute("id", `${ctx.uid}-pore-hi`);
  const sh = document.createElementNS(SVG, "radialGradient");
  sh.setAttribute("id", `${ctx.uid}-pore-sh`);
  stops(hi, [
    [0, WARM, 0.85],
    [0.5, WARM, 0.22],
    [1, WARM, 0],
  ]);
  stops(sh, [
    [0, SHADOW, 0.7],
    [0.6, SHADOW, 0.22],
    [1, SHADOW, 0],
  ]);
  ctx.defs.appendChild(hi);
  ctx.defs.appendChild(sh);
  return { hi: `url(#${ctx.uid}-pore-hi)`, sh: `url(#${ctx.uid}-pore-sh)` };
}

/** The scatter itself, so the mounted skin runs the identical field. */
function poreField(ctx: SkinContext, rand: () => number): ScatterPoint[] {
  const hs = hotspots(rand, ctx.reach);
  return poissonScatter(rand, ctx.reach, {
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
}

/** One bump: the base disc, and — only under the light — the highlight and the
 * shadow beside it. The offsets are along `KEY`, which in the mounted skin means
 * along `KEY` in the *tangent plane*: the first-order term of a light whose
 * direction there rotates as the surface turns away, `crater.ts`'s
 * approximation and for its reason. */
function bump(
  g: SVGGElement,
  b: ScatterPoint,
  x: number,
  y: number,
  colour: string,
  rand: () => number,
  paint: BumpPaint,
): void {
  const base = circle(x, y, b.r, colour);
  base.setAttribute("fill-opacity", (0.14 + rand() * 0.12).toFixed(3));
  g.appendChild(base);
  if (!paint) return;
  g.appendChild(circle(x + KEY.x * b.r * 0.32, y + KEY.y * b.r * 0.32, b.r * 0.55, paint.hi));
  g.appendChild(circle(x - KEY.x * b.r * 0.3, y - KEY.y * b.r * 0.3, b.r * 0.62, paint.sh));
}

function pores(ctx: SkinContext): void {
  const g = clipGroup(ctx, "pore");
  const rand = streamFor(ctx.name);
  const field = poreField(ctx, rand);
  const paint = ctx.lit ? bumpPaint(ctx) : null;
  for (const b of field) bump(g, b, b.x, b.y, ctx.colour, rand, paint);
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

/**
 * The same scatter, read as places on a ball. `poreField` is untouched — same
 * hotspots, same darts, same rejections — and `lift` reads each point off the
 * picture through the equal-area map `mounted.ts` describes, so the crowded
 * places crowd on the surface rather than on the screen. A bump is a disc with
 * no long axis, so `scale(cos α, cos lat)` is exact for it; what the eye reads
 * is the *count* changing at the edges as the far hemisphere's bumps arrive,
 * which a squashed decal cannot fake — its bumps at the limb are its bumps.
 */
function mountedPores(ctx: SkinContext): Mounted[] {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "pore-mounted");
  const paint = ctx.lit ? bumpPaint(ctx) : null;
  const dim = ctx.lit ? 0.3 : 1;
  const out: Mounted[] = [];
  for (const b of poreField(ctx, rand)) {
    const place = lift(b.x, b.y, ctx.reach * COVER);
    if (!place) continue;
    const el = document.createElementNS(SVG, "g");
    bump(el, b, 0, 0, ctx.colour, rand, paint);
    g.appendChild(el);
    out.push(mount(el, place.lon, place.lat, ctx.reach, dim));
  }
  return out;
}

export const MOUNTED_PORE: Skin<"pore-mounted"> = {
  id: "pore-mounted",
  label: "MOUNTED PORE",
  hint: "the same scatter of bumps, crowding on a turning surface not on the screen",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const skin = mountedPores(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    spin(skin, turnAngle(0));
    ctx.onFrame(({ t }) => spin(skin, turnAngle(t)));
  },
};
