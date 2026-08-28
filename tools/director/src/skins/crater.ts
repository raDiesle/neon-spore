import { contactPass, KEY, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { type Mounted, mount, spin, stops } from "./mounted.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { streamFor } from "./seed.js";
import { BEAT_SECONDS, type Skin, type SkinContext, SVG } from "./types.js";

/**
 * TURN's machinery over a meteorite: a pitted landscape, rims catching the key
 * light and floors in shadow, the whole field carried round the body. The
 * projection, the shading and the vanishing at the limb are `mounted.ts`'s and are
 * imported rather than restated — two copies of a cosine drift, and the point
 * of putting these two skins on one switcher is that only the *surface* differs.
 *
 * `packages/render/src/craters.ts` draws the game's rock and was read for the
 * shape of the idea; nothing here imports it, and it answers a different
 * question — that one is a hole punched in a hull by a named rock, this one is
 * a landform lit from a fixed direction.
 *
 * **The motion is the one deliberate difference.** TURN oscillates, because the
 * owner asked for a worm turning left and right and a reversal is where a
 * sticker gives itself away. A meteorite tumbles one way at a constant rate,
 * and that is the other half of the same claim worth seeing: at constant
 * angular speed the apparent speed is *not* constant — a pit crosses the middle
 * of the body quickly and crawls for a long time near either edge, on `cos α`.
 * A field that drifted at an even pace across the disc would be a photograph
 * being panned, and the two skins side by side are how you tell.
 */

/** Sixteen beats to the turn — slow enough to watch one pit cross. */
const TUMBLE = BEAT_SECONDS * 16;

/** The body's rotation at `t`: one direction, one rate, no easing at all. */
function tumbleAngle(t: number): number {
  return (2 * Math.PI * t) / TUMBLE;
}

/**
 * A bowl's own palette, mirroring `light.ts`'s — which keeps its colours
 * private, deliberately, so a skin cannot drift the light by editing a stop.
 * These are not the light; they are what rock does under it.
 */
const FLOOR = "#04050E";
const WALL = "#C2CFE8";
const LIP = "#FFF2DC";

const CRATERS = 13;
const LAT_LIMIT = 0.82;

/**
 * A gradient across a crater along the key axis, in the bowl's own bounding
 * box: `0` is the end facing the light, `1` the end away from it.
 *
 * That it lives in the *bowl's* box and not the body's is what makes a crater a
 * crater: every pit is shaded the same way relative to the light, wherever it
 * sits, which is how a pitted field reads as one surface. It squashes with the
 * pit as the pit nears the limb — an approximation, since strictly the light's
 * direction within the tangent plane rotates as the surface turns away, but a
 * horizontal squash is the first-order term of exactly that and it costs
 * nothing per frame.
 */
function keyRamp(
  ctx: SkinContext,
  id: string,
  list: readonly (readonly [number, string, number])[],
): string {
  const grad = document.createElementNS(SVG, "linearGradient");
  grad.setAttribute("id", `${ctx.uid}-${id}`);
  grad.setAttribute("x1", (0.5 + 0.5 * KEY.x).toFixed(4));
  grad.setAttribute("y1", (0.5 + 0.5 * KEY.y).toFixed(4));
  grad.setAttribute("x2", (0.5 - 0.5 * KEY.x).toFixed(4));
  grad.setAttribute("y2", (0.5 - 0.5 * KEY.y).toFixed(4));
  stops(grad, list);
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-${id})`;
}

/**
 * The inside of a bowl, and it runs the way a first guess does not: **dark at
 * the end facing the light, pale at the end away from it**. The wall a light
 * can actually reach inside a pit is the far one; the near wall is the one
 * turned away and in shadow. Get this backwards and every crater on the page
 * reads as a blister.
 */
function bowlPaint(ctx: SkinContext): string {
  return keyRamp(ctx, "bowl", [
    [0, FLOOR, 0.88],
    [0.42, FLOOR, 0.6],
    [0.68, WALL, 0.24],
    [1, WALL, 0.4],
  ]);
}

/**
 * The raised lip, which is the opposite: its outer slope on the light's side is
 * the only part of the crater tilted *toward* the light, so the bright arc sits
 * exactly where the floor is darkest. That opposition — bright rim over dark
 * floor on the same side — is the whole of why a pit reads as depth rather than
 * as a stain, and it is what a flat dark ellipse can never do.
 */
function lipPaint(ctx: SkinContext): string {
  return keyRamp(ctx, "lip", [
    [0, LIP, 0.85],
    [0.28, LIP, 0.2],
    [0.5, LIP, 0],
    [1, LIP, 0],
  ]);
}

/** One pit: the bowl, and the lip drawn a hair outside it. */
function pit(r: number, weight: number, bowl: string, lip: string): SVGGElement {
  const g = document.createElementNS(SVG, "g");
  const floor = document.createElementNS(SVG, "ellipse");
  floor.setAttribute("rx", r.toFixed(2));
  floor.setAttribute("ry", r.toFixed(2));
  floor.setAttribute("fill", bowl);
  g.appendChild(floor);
  const rim = document.createElementNS(SVG, "ellipse");
  rim.setAttribute("rx", (r * 1.03).toFixed(2));
  rim.setAttribute("ry", (r * 1.03).toFixed(2));
  rim.setAttribute("fill", "none");
  rim.setAttribute("stroke", lip);
  rim.setAttribute("stroke-width", (weight * 0.5).toFixed(3));
  g.appendChild(rim);
  return g;
}

/**
 * The field, scattered by area and thinned so pits sit beside each other rather
 * than inside each other. Angular separation, not screen distance: two pits a
 * long way apart in longitude can land on the same pixels near the limb, and
 * rejecting those would leave the edge of the body bald in a way that moves.
 */
function field(ctx: SkinContext): Mounted[] {
  const rand = streamFor(ctx.name);
  const g = clipGroup(ctx, "pits");
  const bowl = bowlPaint(ctx);
  const lip = lipPaint(ctx);
  const out: Mounted[] = [];
  const placed: { lon: number; lat: number; a: number }[] = [];
  for (let i = 0; i < CRATERS * 4 && out.length < CRATERS; i++) {
    const lon = rand() * Math.PI * 2;
    const lat = Math.asin((rand() * 2 - 1) * LAT_LIMIT);
    const r = ctx.reach * (0.11 + rand() * 0.13);
    const a = Math.asin(Math.min(1, r / ctx.reach));
    const clash = placed.some((p) => {
      const d = Math.acos(
        Math.min(
          1,
          Math.sin(p.lat) * Math.sin(lat) + Math.cos(p.lat) * Math.cos(lat) * Math.cos(p.lon - lon),
        ),
      );
      return d < (p.a + a) * 1.15;
    });
    if (clash) continue;
    placed.push({ lon, lat, a });
    const el = pit(r, ctx.weight, bowl, lip);
    g.appendChild(el);
    // Pits keep a little more of themselves in shadow than TURN's markings do:
    // a landform still catches the sky when its own light has gone.
    out.push(mount(el, lon, lat, ctx.reach, 0.16));
  }
  return out;
}

export const CRATER: Skin<"crater"> = {
  id: "crater",
  label: "CRATER",
  hint: "a meteorite's pitted surface, tumbling under a fixed light",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    const pits = field(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
    spin(pits, tumbleAngle(0));
    ctx.onFrame(({ t }) => spin(pits, tumbleAngle(t)));
  },
};
