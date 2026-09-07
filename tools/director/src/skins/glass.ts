import { KEY } from "@neon-spore/content";
import { rimLightPass, specularPass } from "./light.js";
import { auraPass, clipGroup, rimPass } from "./parts.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * GLASS — a body you see *into*, rather than one with things drawn on it.
 *
 * Every skin before this one answers the same question, which is what sits on
 * the surface. CHAMBER comes closest and still draws its compartments as facts
 * rather than as things glimpsed through something. GLASS asks whether a
 * contour can read as having a **far side**, which is the one claim none of the
 * others make and the reason it is a contender rather than a variation.
 *
 * **It omits `contactPass` on purpose.** `light.ts` says of that pass: without
 * it the lit shoulder runs off the edge and the body reads as translucent.
 * That is the defect there and the subject here, so the one pass that would
 * repair it is the one this skin cannot have. Everything else the page's light
 * does — the ramp, the highlight, the rim — is called and not re-derived,
 * because a skin inventing its own light angle is how twelve bodies on one page
 * end up lit twelve ways.
 */

/**
 * How far the far wall stands off the near one, as a fraction of `reach`, and
 * how much of that the beat moves.
 *
 * It is a **displacement and not an inset**, and that is the correction the
 * first still forced. Scaling a lobed contour about its middle does not move
 * its wall inward — it moves every lobe toward the centre, so the second
 * outline crosses the first at each lobe and the picture fills with pale
 * rectangles that read as debris. Sliding the same contour along the light's
 * axis keeps every lobe a lobe and puts it behind, which is what a far wall
 * actually is.
 *
 * A body's thickness is not constant either: a slime drawing breath pushes its
 * far wall further off as it swells. A fixed offset reads as two outlines and a
 * moving one reads as depth, and the difference costs one sine.
 */
const WALL_OFFSET = 0.11;
const WALL_SWING = 0.035;

/**
 * The far wall lags the near one by a fifth of a beat.
 *
 * This is the whole of why the thing looks thick. Two contours breathing on the
 * same phase are a decal of one contour; the same two a fifth of a cycle apart
 * are a near surface and a far one with something viscous between them, and the
 * eye reads the gap as material without being told. It is the cheapest line in
 * this file and it carries the most.
 */
const WALL_LAG = 0.2;

/** Cool and never black: a shadow that goes to black goes to a hole. */
const DEEP = "#0B1024";

/** Light bouncing back off the far wall's shadowed side, at the edge. */
const BOUNCE_ALPHA = 0.16;

/**
 * The interior, as one gradient with six stops.
 *
 * Three stops make a ramp and a ramp reads as a gradient. Six with the colour
 * moving across them read as a substance, which is the difference this skin is
 * arguing for. The focus is pushed toward the key light so the bright part of
 * the interior sits under the lit shoulder rather than in the middle of the
 * card, and `color-interpolation="linearRGB"` keeps the midtone between the
 * body's hue and `DEEP` from going grey — sRGB is the default and it muddies
 * exactly the middle of a six-stop ramp, which is the part being looked at.
 */
function depthPass(ctx: SkinContext, into: SVGGElement): SVGPathElement {
  const grad = document.createElementNS(SVG, "radialGradient");
  grad.setAttribute("id", `${ctx.uid}-depth`);
  grad.setAttribute("r", "0.72");
  grad.setAttribute("fx", (0.5 + 0.26 * KEY.x).toFixed(4));
  grad.setAttribute("fy", (0.5 + 0.26 * KEY.y).toFixed(4));
  grad.setAttribute("color-interpolation", "linearRGB");
  for (const [offset, colour, alpha] of [
    ["0%", DEEP, "0.55"],
    ["46%", DEEP, "0.40"],
    ["72%", ctx.colour, "0.03"],
    ["88%", ctx.colour, "0.11"],
    ["96%", "#FFFFFF", "0.26"],
    ["100%", ctx.colour, BOUNCE_ALPHA.toFixed(2)],
  ] as const) {
    const s = document.createElementNS(SVG, "stop");
    s.setAttribute("offset", offset);
    s.setAttribute("stop-color", colour);
    s.setAttribute("stop-opacity", alpha);
    grad.appendChild(s);
  }
  ctx.defs.appendChild(grad);
  const p = ctx.contourPath();
  p.setAttribute("fill", `url(#${ctx.uid}-depth)`);
  p.setAttribute("fill-rule", "evenodd");
  p.setAttribute("stroke", "none");
  into.appendChild(p);
  return p;
}

/**
 * The far wall: the same contour, scaled about the body's own middle.
 *
 * The pivot is `ctx.centre` and not a bounding box worked out here — it is the
 * point the frame and the own-motion already turn about, handed down. A second
 * answer to where the middle is would put the far wall somewhere the body is
 * not, and it would only show on the bodies that are furthest off centre.
 */
function wallPass(ctx: SkinContext, into: SVGGElement): void {
  const g = document.createElementNS(SVG, "g");
  // Filled as well as stroked. A stroke alone is a second outline; the fill is
  // what makes the far lobes read as *behind* the near ones rather than beside
  // them, and it is the whole difference between a double line and a body.
  const wall = ctx.contourPath();
  wall.setAttribute("fill", ctx.colour);
  wall.setAttribute("fill-opacity", "0.05");
  wall.setAttribute("fill-rule", "evenodd");
  wall.setAttribute("stroke", ctx.colour);
  wall.setAttribute("stroke-opacity", "0.55");
  wall.setAttribute("stroke-width", (ctx.weight * 0.7).toFixed(3));
  g.appendChild(wall);
  into.appendChild(g);

  ctx.onFrame(({ beat }) => {
    const d = (WALL_OFFSET + WALL_SWING * Math.sin(2 * Math.PI * (beat - WALL_LAG))) * ctx.reach;
    // Away from the key light: the far wall is the surface the light reached
    // last, so it sits down-light of the near one.
    g.setAttribute("transform", `translate(${(-KEY.x * d).toFixed(3)} ${(-KEY.y * d).toFixed(3)})`);
  });
}

export const GLASS: Skin<"glass"> = {
  id: "glass",
  label: "GLASS",
  hint: "a far wall lagging the near one — the body has an inside, not a surface",
  build(ctx) {
    // No `fillPass` either, and this one only showed once the ramp came off:
    // its flat 0.12 tint is a base every other skin is built on, and under six
    // stops and a far wall it is the layer that turns the interior khaki. A
    // body you see into has nothing painted across it.
    const inside = clipGroup(ctx, "glass");
    depthPass(ctx, inside);
    wallPass(ctx, inside);
    // Neither `contactPass` nor `terminatorPass`, and the second one is the
    // correction the third still forced. Contact is the pass that stops a body
    // reading as translucent; the terminator is the volumetric ramp of a
    // *solid* one, and with it on, this drew a khaki ball with a highlight —
    // every other layer arguing for depth and one layer filling it in. What is
    // left is what glass is made of: bright where it turns away, empty in the
    // middle, one specular, and a far wall showing through.
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
  },
};
