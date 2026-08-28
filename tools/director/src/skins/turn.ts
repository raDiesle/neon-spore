import { contactPass, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { type Mounted, mount, spin, stops } from "./mounted.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { BEAT_SECONDS, type Skin, type SkinContext, SVG } from "./types.js";

/**
 * The first skin that turned. The projection it was written to demonstrate now
 * lives in `mounted.ts` and is imported here like anywhere else — `turn.ts` was
 * its home while it had one user, and stopped being the right home at four.
 * What is left here is the surface: meridian bands and the patches between
 * them, and the swing that carries them, which every mounted skin shares.
 */

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
