import { boundsOver, CATALOGUE, WOBBLE_PERIOD } from "@neon-spore/shape-sheet";
import { contactPass, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { LAT_LIMIT, type Mounted, mount, spin, stops } from "./mounted.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { turnAngle } from "./turn.js";
import { BEAT_SECONDS, type Skin, type SkinContext, SVG } from "./types.js";

/**
 * WIND — the same turning body, but the phase varies along it.
 *
 * `turnAngle(t)` is one number for a whole body, so everything mounted under
 * `spin` turns through the same angle at the same instant. That is a planet. A
 * worm is the other thing: one end is already coming round while the other has
 * not started, and the twist *travels*. The difference costs exactly one term,
 * and this file is that term plus the two questions it raises — how far apart
 * the ends may get, and which way along the body "along" is.
 *
 * It sits beside TURN in the switcher on purpose: the two draw the same kind of
 * surface and differ in one line of arithmetic, so the comparison is the
 * question and not a difference of decoration.
 */

/**
 * How far apart the two ends may be, and why there is a ceiling at all.
 *
 * Past about a third of a turn end to end, the near and far halves of one body
 * are showing opposite faces: the marks on one half are sweeping left while the
 * marks on the other sweep right, and what the eye assembles is two objects
 * that happen to touch. `SPREAD_LIMIT` is that third of a turn and is never
 * approached — `SPREAD` sits at 60% of it, which is 72°, and the amplitude
 * below is derived from it rather than typed, so the bound is the number a
 * reader changes and the amplitude follows.
 */
const SPREAD_LIMIT = (2 * Math.PI) / 3;
const SPREAD = SPREAD_LIMIT * 0.6;
/**
 * A band's offset is `AMP·sin(phase − ψ)`, and ψ runs over a range of `2·TWIST`
 * across the body. For any `TWIST` of `π/2` or more that range covers both a
 * crest and a trough, so the end-to-end difference is `2·AMP` — flat in time,
 * not a peak that is occasionally reached — and `2·AMP` is `SPREAD` by
 * construction. Sampled at 97 moments over a whole swing it comes out 1.2566
 * rad at every one of them, 20.0% of a turn against a 33.3% ceiling.
 */
const TWIST = Math.PI;
const AMP = SPREAD / 2;

/**
 * The wave runs on the page clock, like the swing it is added to, because the
 * owner asked for *regelmäßig* and the page already has one clock — every card
 * winds together rather than each on a private timer. Four beats a cycle
 * against the swing's twelve, so the whole motion closes after twelve and the
 * wind is plainly a faster rhythm riding a slower one, not a wobble in it.
 */
const WIND_PERIOD = BEAT_SECONDS * 4;

/** Bands across the body, and marks around each band. */
const SEGMENTS = 9;
const MARKS = 7;
/** Inside `LAT_LIMIT` rather than on it: a mark at the limit is a hairline
 * before the rotation touches it. */
const LAT_INSET = 0.94;

/**
 * How much wider than tall a body has to be before it is treated as a wide one.
 *
 * Not 1.0. BULB is 123 × 118 and RUNT is 41 × 42 — a body round to within a few
 * percent has no long axis, and a bare `w > h` hands it one on a 4% margin and
 * winds it sideways for no reason. A quarter again as wide is a claim; 4% is
 * noise. SLICK at 152 × 89 clears it easily; the hull spans clear it by an
 * order of magnitude. Twenty-four of the sixty catalogue entries are wide.
 */
const WIDE_ENOUGH = 1.25;

/** Asked over a whole wobble, not at rest: seven of the sixty entries change
 * which way they are longer as they breathe. */
const TIMES = [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * WOBBLE_PERIOD);

/**
 * Which way this body is long, from its own contour.
 *
 * The long axis is emphatically not always the tall one. Assuming vertical
 * winds SLICK — 152 wide, 89 tall — across its short dimension, which is a
 * wave crammed into the part of the body that has no room for it. The lookup
 * is by name because a skin is told `ctx.name` and nothing else about the
 * shape it is dressing; an unknown name (a contour drawn somewhere the
 * catalogue does not reach) falls back to the tall reading, which is the one
 * that is right for every round body and most of the rest.
 */
function isWideBody(name: string): boolean {
  const entry = CATALOGUE.find((e) => e.subject.name === name);
  if (!entry) return false;
  const b = boundsOver(entry.subject, TIMES);
  return b.x1 - b.x0 > (b.y1 - b.y0) * WIDE_ENOUGH;
}

/**
 * One band: the marks that share a place along the long axis, and the phase
 * that place is given.
 *
 * A band is the unit rather than a mark because a band is a worm's annulus:
 * everything at one place along the body turns together, which makes the shear
 * between neighbours legible instead of a fog of disagreeing dots. It is also
 * what lets this run through `spin` unchanged — one call per band, no second
 * copy of the projection here.
 */
interface Band {
  readonly list: Mounted[];
  readonly psi: number;
}

/**
 * One frame of winding. The swing is `turn.ts`'s, untouched — this adds the
 * travelling term to it and nothing else, so switching WIND off and TURN on
 * removes exactly one `sin`.
 */
export function wind(bands: readonly Band[], t: number): void {
  const base = turnAngle(t);
  for (const b of bands) spin(b.list, base + windOffset(b.psi, t));
}

/**
 * The travelling term on its own: what a band at phase `ψ` is offset by. It is
 * split out because it is the whole of the claim and the whole of the risk —
 * `ψ` runs over `±TWIST` across a body, so `max−min` of this over that range is
 * the end-to-end spread the ceiling is about, and it can be sampled without a
 * document. Its largest value over every `ψ` and every `t` is `SPREAD`.
 */
export function windOffset(psi: number, t: number): number {
  return AMP * Math.sin((2 * Math.PI * t) / WIND_PERIOD - psi);
}

function shade(ctx: SkinContext): string {
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-wind`);
  stops(grad, [
    [0, ctx.colour, 0.62],
    [0.6, ctx.colour, 0.34],
    [1, ctx.colour, 0],
  ]);
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-wind)`;
}

/**
 * One mark, drawn about its own origin in tangent units — east right, south
 * down — which is the frame `spin` foreshortens in. It is elongated *along* its
 * band, so the band reads as a line of dashes rather than a row of dots, and
 * the shear between two bands is a visible offset between two lines.
 */
function mark(g: SVGGElement, rx: number, ry: number, paint: string): SVGGElement {
  const el = document.createElementNS(SVG, "g");
  const e = document.createElementNS(SVG, "ellipse");
  e.setAttribute("rx", rx.toFixed(2));
  e.setAttribute("ry", ry.toFixed(2));
  e.setAttribute("fill", paint);
  el.appendChild(e);
  g.appendChild(el);
  return el;
}

/**
 * Bands at constant latitude, for a body that is longer than it is wide.
 *
 * Latitude is the coordinate the rotation does not touch, so a band's place
 * along the body is fixed and its phase with it — the twist travels up the
 * body and stays where it is put. One whole wave end to end (`TWIST = π`, so ψ
 * runs over 2π), which is deliberate rather than the smallest thing that would
 * work: half a wave puts the two ends in antiphase with a single node in the
 * middle, and a body split once down the middle is exactly the "two halves
 * disagreeing" reading this is trying not to produce. A whole wave brings the
 * ends back into phase and puts the crest and the trough at the quarters, so
 * what travels is a bulge along the body rather than a hinge in it.
 */
function tallBands(ctx: SkinContext, rand: () => number, g: SVGGElement, dim: number): Band[] {
  const paint = shade(ctx);
  const out: Band[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const u = (i / (SEGMENTS - 1)) * 2 - 1;
    const lat = Math.asin(u * LAT_LIMIT * LAT_INSET);
    const list: Mounted[] = [];
    for (let j = 0; j < MARKS; j++) {
      const r = ctx.reach * (0.055 + rand() * 0.03);
      const lon = ((j + rand() * 0.5) / MARKS) * Math.PI * 2;
      list.push(mount(mark(g, r * 1.7, r * 0.6, paint), lon, lat, ctx.reach, dim));
    }
    out.push({ list, psi: TWIST * u });
  }
  return out;
}

/**
 * Bands at constant longitude, for a body that is wider than it is tall.
 *
 * The rotation axis stays vertical, because `spin`'s does and a second
 * projection here would be the copy `CLAUDE.md` forbids. What changes is which
 * body-fixed coordinate indexes the phase: longitude, so the wave travels round
 * the girth — on a wide body, the direction the eye already reads as its
 * length, front face to limb and on round the back. `ψ` is the longitude
 * itself, so the wave closes on itself exactly and there is no seam where two
 * neighbouring bands would be handed opposite phases.
 *
 * The other way is to turn the whole mounted group on its side and spin about a
 * horizontal axis, which is what a worm actually does. Not done here because
 * `mounted.ts` fixes the key light in *screen* space, so a rotated group would
 * light its marks from a direction no other card uses. That is the trade.
 */
function wideBands(ctx: SkinContext, rand: () => number, g: SVGGElement, dim: number): Band[] {
  const paint = shade(ctx);
  const out: Band[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const lon = ((i / SEGMENTS) * 2 - 1) * Math.PI;
    const list: Mounted[] = [];
    for (let j = 0; j < MARKS; j++) {
      const r = ctx.reach * (0.055 + rand() * 0.03);
      const v = ((j + 0.5 + (rand() - 0.5) * 0.4) / MARKS) * 2 - 1;
      const lat = Math.asin(v * LAT_LIMIT * LAT_INSET);
      list.push(mount(mark(g, r * 0.6, r * 1.7, paint), lon, lat, ctx.reach, dim));
    }
    out.push({ list, psi: lon });
  }
  return out;
}

/** The surface, whichever way round the body is long. */
function surface(ctx: SkinContext): Band[] {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "wind");
  const dim = ctx.lit ? 0.28 : 1;
  return isWideBody(ctx.name) ? wideBands(ctx, rand, g, dim) : tallBands(ctx, rand, g, dim);
}

export const WIND: Skin<"wind"> = {
  id: "wind",
  label: "WIND",
  hint: "the turn again, with the phase running along the body — a worm, not a planet",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const bands = surface(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    // Posed once before the first frame, so nothing is ever seen unwound.
    wind(bands, 0);
    ctx.onFrame(({ t }) => wind(bands, t));
  },
};
