import { facet, pin, surfaceDim } from "@neon-spore/content";
import { contactPass, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { auraPass, fillPass, rimPass } from "./parts.js";
import { turnAngle } from "./turn.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * SETAE — a girdle of short bristles round the body, pinned by longitude and
 * carried round as it turns, flicking back on the beat.
 *
 * It was `creature:crawler` / `setae` on VERSUS: every ring of the worm wore
 * twelve of these behind its middle, and the walk was seen on them — on the
 * contraction the near bristles swept toward the tail, and as the surface
 * rolled each one came round the limb as a sliver, stood up across the middle
 * and went round the back. The owner took GUT for the crawler on 10 September
 * 2026 and asked for this to be kept on the SHAPES page; it is here as a skin
 * because what it proposes is a *surface* — hairs standing off a ball — and
 * SKIN is where a surface is tried on every body at once. SOFT SPIKE on the
 * parts sheet is the same hair, one at a time; this is what a band of them
 * does under the projection.
 *
 * ## What makes it a surface and not a fringe
 *
 * CILIA is a hundred strands *at the rim*, read off the live outline. These
 * are twelve, pinned to places on the sphere, and drawn by the tangent plane's
 * own map (`facet`): a bristle facing us is seen end-on and reads short, one
 * at the limb is seen full length, and each arrives thin on one side, stands
 * up across the front and thins away on the other. That reveal is the one
 * thing a decal cannot do, and it is why the bristles are outside the clip —
 * a hair cut to the contour is a hair that stops where the body does.
 *
 * The flick is the crawler's squeeze, read here off the page's beat: once a
 * beat the girdle sweeps back and eases forward again, so the body is seen
 * to *do* something with its hairs rather than only to carry them.
 *
 * ## Where it can lose
 *
 * Twelve hairs on a still body are a pincushion. On a body that turns and
 * flicks they are an animal; the value is in the motion, and a still of it
 * is the weakest frame it has.
 */
/** How many bristles the girdle carries, how far out of the middle they root
 * and how long they are as a share of the smaller radius. */
const COUNT = 12;
const REACH = 0.86;
const LENGTH = 0.5;
/** Where round the body the girdle stands, in radians of latitude below the
 * middle; every other one a little higher, so the band has some depth. */
const GIRDLE_LAT = 0.28;
/** What a bristle keeps of its light turned away, and how far the beat sweeps
 * it back, in radians. */
const FLOOR = 0.4;
const SWEEP = 0.7;

const PINS = Array.from({ length: COUNT }, (_, i) =>
  pin((i / COUNT) * Math.PI * 2, GIRDLE_LAT * (i % 2 === 0 ? 1 : 0.7), REACH),
);

function bristles(ctx: SkinContext): void {
  const rx = ctx.extent.w / 2;
  const ry = ctx.extent.h / 2;
  const r = Math.min(rx, ry);
  const hairs: SVGPathElement[] = [];
  for (let i = 0; i < COUNT; i++) {
    const h = document.createElementNS(SVG, "path");
    h.setAttribute("fill", "none");
    h.setAttribute("stroke", ctx.colour);
    h.setAttribute("stroke-width", (ctx.weight * 1.1).toFixed(3));
    h.setAttribute("stroke-linecap", "round");
    ctx.body.appendChild(h);
    hairs.push(h);
  }

  ctx.onFrame(({ t, beat }) => {
    const theta = turnAngle(t);
    // The squeeze: 0 at the top of the beat, 1 halfway through, and back.
    const squeeze = 0.5 - 0.5 * Math.cos(beat * Math.PI * 2);
    const back = SWEEP * squeeze;
    for (let i = 0; i < COUNT; i++) {
      const p = PINS[i];
      const h = hairs[i];
      if (!p || !h) continue;
      const f = facet(p, theta);
      if (!f.near) {
        h.setAttribute("display", "none");
        continue;
      }
      h.removeAttribute("display");
      const x = f.x * rx;
      const y = f.y * ry;
      // Out along the surface's own normal at that point — the direction from
      // the centre — swept round by the squeeze, and shortened across the
      // middle by the tangent map's own `sx`: a bristle facing us is seen
      // end-on and reads short, one at the limb full length.
      const n = Math.hypot(x / Math.max(1e-6, rx), y / Math.max(1e-6, ry)) || 1;
      const nx = x / Math.max(1e-6, rx) / n;
      const ny = y / Math.max(1e-6, ry) / n;
      const len = r * LENGTH * (0.45 + 0.55 * (1 - Math.abs(f.sx)));
      const ex = x + (nx * Math.cos(back) - ny * Math.sin(back)) * len;
      const ey = y + (nx * Math.sin(back) + ny * Math.cos(back)) * len;
      const mx = x + (ex - x) * 0.5 - len * 0.15;
      const my = y + (ey - y) * 0.5;
      const cx = ctx.centre.x;
      const cy = ctx.centre.y;
      h.setAttribute(
        "d",
        `M ${(cx + x).toFixed(2)} ${(cy + y).toFixed(2)} Q ${(cx + mx).toFixed(2)} ${(cy + my).toFixed(2)} ${(cx + ex).toFixed(2)} ${(cy + ey).toFixed(2)}`,
      );
      h.setAttribute("stroke-opacity", (0.9 * surfaceDim(FLOOR, f.lit)).toFixed(3));
    }
  });
}

export const SETAE: Skin<"setae"> = {
  id: "setae",
  label: "SETAE",
  hint: "a girdle of twelve bristles pinned round the body, carried round as it turns and flicking back on the beat — hairs standing off a ball",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    bristles(ctx);
  },
};
