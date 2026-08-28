import { contactPass, KEY, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { BEAT_SECONDS, type Skin, type SkinContext, SVG } from "./types.js";

/**
 * Every other body on the page is a flat shape seen from exactly one angle.
 * This one turns, and the whole file is one claim about what separates a body
 * turning from a picture sliding under a hole.
 *
 * A feature sits at a fixed longitude `lon` and latitude `lat` on a ball of
 * radius `reach`. The body's rotation about its vertical axis is `θ`, so the
 * feature's apparent longitude is `α = lon + θ`, and it projects to
 *
 *     x = reach·cos(lat)·sin(α)      y = reach·sin(lat)
 *
 * with the far hemisphere — `cos α ≤ 0` — simply not drawn. Everything the eye
 * needs falls out of that one line by differentiating it, and it falls out
 * *twice*, which is the reason a half-correct version does not exist:
 *
 * - **Width.** A patch spanning `dλ` of longitude covers `dx/dλ = reach·cos(lat)
 *   ·cos α` on screen, so its horizontal scale is `cos α`: full width facing the
 *   viewer, nothing at all at the silhouette. It narrows to zero rather than
 *   being clipped by an edge, and that is the difference between a feature on a
 *   surface and a sticker on a disc. Vertically the scale is `cos(lat)`, fixed,
 *   because the axis is vertical and nothing about latitude moves.
 * - **Speed.** `dx/dt = reach·cos(lat)·cos α·θ̇` — the same cosine. A body at
 *   constant angular speed crosses fast through the middle and crawls at the
 *   limb, and the only way to get that wrong is to interpolate `x` instead of
 *   `α`. Here `x` is never interpolated; it is `sin α` every frame.
 *
 * The light does not turn. `KEY` is fixed for the page, and each feature is
 * shaded by its own surface normal against it, so the lit shoulder stays put
 * while the surface travels under it — which is the second half of the read.
 */

/**
 * How far in front of the body the key light stands, so a normal pointing at
 * the viewer is still partly lit. `KEY` is a screen direction and has no depth;
 * without a `z` every feature on the meridian facing us would be at exactly the
 * terminator, and the whole disc would read as half dark.
 */
const KEY_Z = 0.5;
const KEY_LEN = Math.hypot(1, KEY_Z);
const LX = KEY.x / KEY_LEN;
const LY = KEY.y / KEY_LEN;
const LZ = KEY_Z / KEY_LEN;

/** A feature pinned to the surface: where it sits, and what does not change. */
export interface Mounted {
  /** The feature's own geometry, drawn about its origin in body units. */
  readonly el: SVGGElement;
  readonly lon: number;
  readonly cosLat: number;
  readonly sinLat: number;
  /** `reach·cos(lat)` — the radius of this feature's own circle of latitude. */
  readonly k: number;
  /** `reach·sin(lat)` — its screen height, which the rotation never touches. */
  readonly cy: number;
  /** What is left of it in full shadow: 0 vanishes, 1 ignores the light. */
  readonly dim: number;
  shown: boolean;
}

/** Pin one built group to a longitude and latitude. Everything constant about
 * the projection is worked out here, once, and never again in the loop. */
export function mount(
  el: SVGGElement,
  lon: number,
  lat: number,
  reach: number,
  dim: number,
): Mounted {
  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  return { el, lon, cosLat, sinLat, k: reach * cosLat, cy: reach * sinLat, dim, shown: true };
}

/**
 * One frame of rotation: position, foreshortening and shading for every feature.
 *
 * Two attributes each, no allocation but the strings SVG insists on, and a
 * feature on the far side is `display:none` — set on the transition only, so a
 * card whose back half is quiet writes nothing for it.
 */
export function spin(list: readonly Mounted[], theta: number): void {
  for (const m of list) {
    const a = m.lon + theta;
    const c = Math.cos(a);
    if (c <= 0) {
      if (m.shown) {
        m.el.setAttribute("display", "none");
        m.shown = false;
      }
      continue;
    }
    if (!m.shown) {
      m.el.removeAttribute("display");
      m.shown = true;
    }
    const s = Math.sin(a);
    m.el.setAttribute(
      "transform",
      `translate(${(m.k * s).toFixed(2)} ${m.cy.toFixed(2)}) scale(${c.toFixed(4)} ${m.cosLat.toFixed(4)})`,
    );
    const lam = m.cosLat * s * LX + m.sinLat * LY + m.cosLat * c * LZ;
    m.el.setAttribute("opacity", (m.dim + (1 - m.dim) * Math.max(0, lam)).toFixed(3));
  }
}

/** Gradient stops, since `light.ts` keeps its own copy private. */
export function stops(
  grad: SVGElement,
  list: readonly (readonly [number, string, number])[],
): void {
  for (const [offset, colour, alpha] of list) {
    const stop = document.createElementNS(SVG, "stop");
    stop.setAttribute("offset", `${(offset * 100).toFixed(2)}%`);
    stop.setAttribute("stop-color", colour);
    stop.setAttribute("stop-opacity", alpha.toFixed(3));
    grad.appendChild(stop);
  }
}

/** How far the worm turns each way. Wide enough that a feature starting near
 * the facing meridian is carried right over the limb and back. */
const SWING = 1.9;
/** Twelve beats there and back, so the turn is far slower than anything else on
 * the page and cannot be mistaken for the heartbeat. */
const PERIOD = BEAT_SECONDS * 12;
/**
 * The dwell. A plain `A·sin(ωt)` is slowest exactly at the reversal, which is
 * where a sticker and a surface look most alike — both stop. Pushing the sine
 * through a `tanh` flattens the ends further and straightens the middle: the
 * sweep runs at 1.74× the plain rate and near-constant angular speed, the turn
 * hangs at 0.26×. So during the sweep the *only* thing varying the apparent
 * speed across the body is the projection's own cosine, which is the claim; and
 * at the hang there is time to watch a feature at the limb sit at no width at
 * all while the middle of the body is still visibly moving.
 */
const DWELL = 1.6;
const DWELL_NORM = Math.tanh(DWELL);

/** The body's rotation at `t` seconds: left, hold, right, hold. */
export function turnAngle(t: number): number {
  return (SWING * Math.tanh(DWELL * Math.sin((2 * Math.PI * t) / PERIOD))) / DWELL_NORM;
}

/** Meridian bands, and the patches between them. The bands carry the read —
 * a stripe pinching to a hairline at the edge is the least deniable cue there
 * is — and the patches keep the body from looking machined. */
const BANDS = 3;
const PATCHES = 12;
/** Latitudes are kept off the poles: a patch at `cos(lat) ≈ 0` is a horizontal
 * hairline whatever the rotation does, and reads as a scratch. */
const LAT_LIMIT = 0.82;

function shade(ctx: SkinContext, id: string, radial: boolean): string {
  const grad = document.createElementNS(SVG, radial ? "radialGradient" : "linearGradient");
  grad.setAttribute("id", `${ctx.uid}-${id}`);
  if (radial)
    stops(grad, [
      [0, ctx.colour, 0.5],
      [0.55, ctx.colour, 0.28],
      [1, ctx.colour, 0],
    ]);
  else
    stops(grad, [
      [0, ctx.colour, 0],
      [0.5, ctx.colour, 0.34],
      [1, ctx.colour, 0],
    ]);
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-${id})`;
}

function ellipse(rx: number, ry: number, paint: string): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  const e = document.createElementNS(SVG, "ellipse");
  e.setAttribute("rx", rx.toFixed(2));
  e.setAttribute("ry", ry.toFixed(2));
  e.setAttribute("fill", paint);
  g.appendChild(e);
  return g;
}

/**
 * The surface itself. Bands are pinned at latitude 0 and drawn tall, so the
 * clip decides where they end; each is an ellipse, which already pinches toward
 * the poles the way a meridian should. Patches are scattered by area, seeded
 * from the name like every other skin.
 */
function surface(ctx: SkinContext): Mounted[] {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "turn");
  const band = shade(ctx, "band", false);
  const patch = shade(ctx, "patch", true);
  const out: Mounted[] = [];
  for (let i = 0; i < BANDS; i++) {
    const el = ellipse(ctx.reach * (0.1 + rand() * 0.06), ctx.reach * 1.25, band);
    g.appendChild(el);
    out.push(mount(el, (i / BANDS) * Math.PI * 2 + rand() * 0.5, 0, ctx.reach, 0.18));
  }
  for (let i = 0; i < PATCHES; i++) {
    const r = ctx.reach * (0.1 + rand() * 0.1);
    const el = ellipse(r, r * (0.7 + rand() * 0.5), patch);
    g.appendChild(el);
    const lat = Math.asin((rand() * 2 - 1) * LAT_LIMIT);
    out.push(mount(el, rand() * Math.PI * 2, lat, ctx.reach, 0.22));
  }
  return out;
}

export const TURN: Skin<"turn"> = {
  id: "turn",
  label: "TURN",
  hint: "a surface that rotates under a fixed light, not a texture sliding",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const skin = surface(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    // Posed once before the first frame, so nothing is ever seen unprojected.
    spin(skin, turnAngle(0));
    ctx.onFrame(({ t }) => spin(skin, turnAngle(t)));
  },
};
