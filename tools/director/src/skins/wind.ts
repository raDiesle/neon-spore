import { longAxis } from "@neon-spore/content";
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
 * not started, and the twist *travels*. It costs exactly one term, and this file
 * is that term plus the two questions it raises — how far apart the ends may
 * get, and which way along the body "along" is. It sits beside TURN in the
 * switcher on purpose: the two draw the same kind of surface and differ in one
 * line of arithmetic, so the comparison is the question and not decoration.
 */

/**
 * How far apart the two ends may be, and why there is a ceiling at all.
 *
 * Past about a third of a turn end to end, the near and far halves of one body
 * show opposite faces: the marks on one half sweep left while the marks on the
 * other sweep right, and what the eye assembles is two objects that happen to
 * touch. `SPREAD_LIMIT` is that third and is never approached — `SPREAD` sits
 * at 60% of it, 72°, and the amplitude below is derived from it rather than
 * typed, so the bound is the number a reader changes.
 */
const SPREAD_LIMIT = (2 * Math.PI) / 3;
const SPREAD = SPREAD_LIMIT * 0.6;
/**
 * A band's offset is `AMP·sin(phase − ψ)`, and ψ runs over a range of `2·TWIST`
 * across the body. For any `TWIST` of `π/2` or more that range covers both a
 * crest and a trough, so the end-to-end difference is `2·AMP` — flat in time,
 * not a peak occasionally reached — and `2·AMP` is `SPREAD` by construction.
 * Sampled at 97 moments over a whole swing it is 1.2566 rad at every one of
 * them: 20.0% of a turn, against a 33.3% ceiling.
 */
const TWIST = Math.PI;
const AMP = SPREAD / 2;

/**
 * The wave runs on the page clock, like the swing it is added to: the owner
 * asked for *regelmäßig* and the page already has one clock, so every card winds
 * together rather than each on a private timer. Four beats a cycle against the
 * swing's twelve, so the motion closes after twelve and the wind reads as a
 * faster rhythm riding a slower one, not a wobble in it.
 */
const WIND_PERIOD = BEAT_SECONDS * 4;

/** Bands across the body, and marks around each. */
const SEGMENTS = 9;
const MARKS = 7;
/** Inside `LAT_LIMIT` rather than on it: a mark at the limit is a hairline
 * before the rotation touches it. */
const LAT_INSET = 0.94;

/**
 * One band: the marks sharing a place along the long axis, and that place's
 * phase. A band is the unit rather than a mark because a band is a worm's
 * annulus — everything at one place along the body turns together, which makes
 * the shear between neighbours legible instead of a fog of disagreeing dots. It
 * is also what lets this run through `spin` unchanged: one call per band, no
 * second copy of the projection here.
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
 * The travelling term on its own: what a band at phase `ψ` is offset by. Split
 * out because it is the whole of the claim and the whole of the risk — `ψ` runs
 * over `±TWIST` across a body, so `max−min` of this over that range is the
 * end-to-end spread the ceiling is about, sampled without a document.
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
 * One mark, about its own origin in tangent units — east right, south down, the
 * frame `spin` foreshortens in. Elongated *along* its band, so a band reads as a
 * line of dashes and the shear between two is an offset between two lines.
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
 * along the body is fixed and its phase with it — the twist travels up the body
 * and stays where it is put. One whole wave end to end (`TWIST = π`, so ψ runs
 * over 2π), which is deliberate rather than the smallest thing that would work:
 * half a wave puts the ends in antiphase with a single node in the middle, and
 * a body split once down its centre is exactly the "two halves disagreeing"
 * reading this is trying not to produce. A whole wave brings the ends back into
 * phase and puts crest and trough at the quarters, so what travels is a bulge
 * along the body rather than a hinge in it.
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
 * the girth — on a wide body, the direction the eye already reads as its length,
 * front face to limb and on round the back. `ψ` is the longitude itself, so the
 * wave closes exactly and no two neighbouring bands are handed opposite phases.
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

/**
 * The surface, whichever way round the body is long.
 *
 * The long axis is emphatically not always the tall one. Assuming vertical
 * winds SLICK — 152 wide, 89 tall — across its short dimension, a wave crammed
 * into the part of the body with no room for it. This used to be answered by
 * looking `ctx.name` back up in `CATALOGUE` and measuring the entry, because a
 * skin was told its reach and never its shape; a name the catalogue did not
 * reach fell silently back to the tall reading. `ctx.extent` is that
 * measurement, taken once by the thing that was already measuring the body,
 * and `longAxis` is the threshold, held in one place rather than two. A round
 * body has no long axis and is wound the tall way, as before.
 */
function surface(ctx: SkinContext): Band[] {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "wind");
  const dim = ctx.lit ? 0.28 : 1;
  const wide = longAxis(ctx.extent.w, ctx.extent.h) === "x";
  return wide ? wideBands(ctx, rand, g, dim) : tallBands(ctx, rand, g, dim);
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
