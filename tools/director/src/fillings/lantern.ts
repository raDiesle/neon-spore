import { facet, KEY, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { stops } from "../skins/mounted.js";
import { SVG } from "../skins/types.js";
import { at, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * LANTERN — the body is a ball under the key light, and the nebula inside it
 * is a *place* on that ball that goes round.
 *
 * It was `creature:ghost` / `lantern` on VERSUS, offered against the ghost's
 * gradient nebula — colour welling up from the middle, the same from every
 * side. The owner took SWARM on 10 September 2026 and asked for the others to
 * come to the SHAPES page; this is an interior, so it is a filling.
 *
 * ## What it puts on the body
 *
 * Three of the five zones `.claude/skills/depth` names, and the two left out
 * said below. The **terminator**: a ramp whose focus is pulled toward the key,
 * so the interior is fullest where the ball faces the light and falls to the
 * card's own dark on the side that faces away. The **rim light**: a band of the
 * body's colour just inside the far edge, the contour stroked once, shifted
 * toward the key and clipped, so only the shadow-side edge of the shifted
 * shape is left — and fading out down the body, since on the ghost the hem was
 * not part of the ball. And the **core**: the heart of the nebula, a soft disc
 * pinned to a longitude and a latitude and carried round on the ghost's own
 * slow turn — brightest facing us, a sliver at the limb, drawn faintly through
 * the body when it is behind, so over nine seconds it goes round the back and
 * comes out the other side. That reveal is the one cue a pose cannot fake.
 *
 * The specular is left out on purpose — a ghost is its own light, and a hard
 * white glint on it would be a reflection of something the field does not
 * have — and the contact shadow is the skin's to draw, not the contents'.
 *
 * ## Against HOLLOW
 *
 * The same body as a solid. HOLLOW is bright away from the key and this is
 * bright toward it; the pair is the whole question, and they sit together on
 * the row for that reason.
 *
 * ## Where it can lose
 *
 * It is a ball and not a ghost. A clear lit side and a clear dark side is a
 * body that is very much there, and the shapelessness it replaced was part of
 * what that creature was.
 */

/** The card's own dark, the one every gradient on the page falls toward. */
const DARK = "#07060F";

/** How far toward the key the ramp's focus is pulled, in bounding-box units,
 * and how far it reaches. */
const OFFSET = 0.2;
const REACH = 0.72;

/** The far-rim band: width in line weights, how far toward the key the
 * contour is shifted to land it inside the far edge, and where down the body
 * it has faded to nothing as a share of the half-height. */
const RIM_WIDTH = 2.0;
const RIM_SHIFT = 0.1;
const HEM_FADE = 0.55;

/** The core: where it sits on the ball — a little below the middle, where the
 * gradient it replaced put its centre — how big it is as a share of the
 * smaller radius, its turn (`GHOST_SPIN`, in radians), and what it keeps in
 * full shadow and behind the body. */
const CORE_PIN: Pin = pin(0, 0.12, 1);
const CORE_ORBIT = 0.62;
const CORE = 0.5;
const CORE_HEART = 0.42;
const SPIN = 0.11 * Math.PI * 2;
const CORE_DIM = 0.45;
const CORE_BEHIND = 0.18;

function soft(ctx: FillingContext, name: string, colour: string, inner: number): string {
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-lantern-${name}`);
  stops(grad, [
    [0, colour, inner],
    [0.45, colour, inner * 0.5],
    [1, colour, 0],
  ]);
  ctx.defs.appendChild(grad);
  return `url(#${ctx.uid}-lantern-${name})`;
}

export const LANTERN: Filling<"lantern"> = {
  id: "lantern",
  label: "LANTERN",
  hint: "a ball under the key — fullest toward it, a band of bounced light inside the far rim, and the nebula's heart a place on the surface that goes round the back and comes out the other side",
  build(ctx: FillingContext) {
    const g = inside(ctx, "lantern");
    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    const orbit = Math.min(rx, ry) * CORE_ORBIT;
    const r = Math.min(rx, ry) * CORE;

    // The terminator: one ramp from the lit side to the card's dark.
    const shade = document.createElementNS(SVG, "radialGradient");
    shade.setAttribute("id", `${ctx.uid}-lantern-shade`);
    shade.setAttribute("cx", (0.5 + KEY.x * OFFSET * 0.4).toFixed(4));
    shade.setAttribute("cy", (0.5 + KEY.y * OFFSET * 0.4).toFixed(4));
    shade.setAttribute("fx", (0.5 + KEY.x * OFFSET).toFixed(4));
    shade.setAttribute("fy", (0.5 + KEY.y * OFFSET).toFixed(4));
    shade.setAttribute("r", String(REACH));
    stops(shade, [
      [0, ctx.colour, 0.62],
      [0.36, ctx.colour, 0.22],
      [0.62, DARK, 0.55],
      [1, DARK, 0.85],
    ]);
    ctx.defs.appendChild(shade);
    const fill = ctx.contourPath();
    fill.setAttribute("fill", `url(#${ctx.uid}-lantern-shade)`);
    fill.setAttribute("stroke", "none");
    g.appendChild(fill);

    // The rim light: the contour again, pushed toward the key, so the only
    // part of the stroke left inside the clip is the far side — and it fades
    // out down the body.
    const fade = document.createElementNS(SVG, "linearGradient");
    fade.setAttribute("id", `${ctx.uid}-lantern-fade`);
    fade.setAttribute("gradientUnits", "userSpaceOnUse");
    fade.setAttribute("x1", "0");
    fade.setAttribute("x2", "0");
    fade.setAttribute("y1", ctx.centre.y.toFixed(2));
    fade.setAttribute("y2", (ctx.centre.y + ry * HEM_FADE).toFixed(2));
    stops(fade, [
      [0, ctx.colour, 0.45],
      [1, ctx.colour, 0],
    ]);
    ctx.defs.appendChild(fade);
    const band = ctx.contourPath();
    band.setAttribute("fill", "none");
    band.setAttribute("stroke", `url(#${ctx.uid}-lantern-fade)`);
    band.setAttribute("stroke-width", (ctx.weight * RIM_WIDTH).toFixed(3));
    band.setAttribute(
      "transform",
      `translate(${(KEY.x * RIM_SHIFT * rx).toFixed(2)} ${(KEY.y * RIM_SHIFT * ry).toFixed(2)})`,
    );
    g.appendChild(band);

    // The core, placed: a soft light and a firmer heart, both on one pin.
    const body = at(ctx.centre.x, ctx.centre.y);
    const glow = document.createElementNS(SVG, "circle");
    glow.setAttribute("r", r.toFixed(2));
    glow.setAttribute("fill", soft(ctx, "glow", ctx.colour, 0.8));
    const heart = document.createElementNS(SVG, "circle");
    heart.setAttribute("r", (r * CORE_HEART).toFixed(2));
    heart.setAttribute("fill", soft(ctx, "heart", "#FFFFFF", 0.9));
    body.appendChild(glow);
    body.appendChild(heart);
    g.appendChild(body);

    const step = (t: number): void => {
      const f = facet(CORE_PIN, t * SPIN);
      const strength = f.near ? surfaceDim(CORE_DIM, f.lit) : CORE_BEHIND;
      const place = `translate(${(f.x * orbit).toFixed(2)} ${(f.y * orbit).toFixed(2)}) scale(${Math.max(0.08, Math.abs(f.sx)).toFixed(4)} 1)`;
      glow.setAttribute("transform", place);
      heart.setAttribute("transform", place);
      glow.setAttribute("opacity", strength.toFixed(3));
      heart.setAttribute("opacity", strength.toFixed(3));
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
