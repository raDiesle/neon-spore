import { KEY, surfaceLit } from "@neon-spore/content";
import { contactPass, rimLightPass, specularPass, terminatorPass } from "./light.js";
import { auraPass, clipGroup, fillPass, rimPass } from "./parts.js";
import { turnAngle } from "./turn.js";
import { type Skin, type SkinContext, SVG } from "./types.js";

/**
 * WRINKLE — meridians of fold that come up across the body on the beat and
 * smooth away again, each a ridge lit toward the key, turning with the surface.
 *
 * It was `creature:crawler` / `wrinkle` on VERSUS: a ring that squeezes bunches
 * its skin, and the creases a bag of skin falls into when the muscle under it
 * shortens run round the segment — which on a ball seen from the side are
 * meridians. The owner took GUT for the crawler on 10 September 2026 and asked
 * for this to be kept on the SHAPES page; it is a skin because what it
 * proposes is a *surface* — skin that creases — and SKIN is where a surface is
 * tried on every body at once. FOLD on the parts sheet is one crease; this is
 * what six of them do under the projection and the beat.
 *
 * ## What makes it a surface and not a stripe
 *
 * Each fold is an ellipse arc whose half-width is `R · sin α`: a straight line
 * down the middle when it faces us, bowed out to the limb a quarter turn on,
 * gone round the back. That is the same projection TURN's bands ride, and it
 * is the whole difference between a crease going round a body and a stripe
 * painted down it. Each is two strokes a hair apart — a shadow line away from
 * the key and a lit line toward it, the lit one's strength read off the fold's
 * own normal (`surfaceLit`) — so a ridge turned toward the light is the
 * bright one. And each is strongest across the middle and thins to nothing at
 * the limb, which is what a crease seen from further round does.
 *
 * The depth is the beat. A slack body shows a trace of every fold; halfway
 * through the beat they are deep; then they smooth away. So the contraction
 * is seen on the skin and not only in the outline.
 *
 * ## Where it can lose
 *
 * Six dark lines on a small body are a melon. The lit edge and the beat are
 * what argue against that, and on a card that is not moving neither is
 * present — judge it turning.
 */
/** How many folds, and how far up and down the body they run as a share of
 * its half-height. */
const FOLDS = 6;
const RUN = 0.8;
/** How far the lit line stands off the shadow line, in line weights. */
const RIDGE = 0.8;
/** What a fold shows on a slack body, and how much the beat adds. The slack
 * trace is twice the game's 0.12: a card at rest is the frame a still shows,
 * and a fold nobody can find at rest is a skin that looks like MEMBRANE. */
const SLACK = 0.25;
const TIGHT = 0.6;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

interface Fold {
  readonly shade: SVGPathElement;
  readonly lit: SVGPathElement;
  readonly lon: number;
}

function stroke(ctx: SkinContext, g: SVGGElement, colour: string, dx: number, dy: number) {
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("fill", "none");
  p.setAttribute("stroke", colour);
  p.setAttribute("stroke-width", (ctx.weight * 1.05).toFixed(3));
  p.setAttribute("stroke-linecap", "round");
  p.setAttribute("transform", `translate(${dx.toFixed(3)} ${dy.toFixed(3)})`);
  g.appendChild(p);
  return p;
}

function folds(ctx: SkinContext): void {
  const g = clipGroup(ctx, "wrinkle");
  const off = ctx.weight * RIDGE;
  const list: Fold[] = [];
  for (let i = 0; i < FOLDS; i++) {
    list.push({
      shade: stroke(ctx, g, SHADOW, -KEY.x * off, -KEY.y * off),
      lit: stroke(ctx, g, ctx.colour, KEY.x * off, KEY.y * off),
      lon: (i / FOLDS) * Math.PI * 2,
    });
  }

  const rx = ctx.extent.w / 2;
  const ry = ctx.extent.h / 2;
  const cx = ctx.centre.x;
  const run = ry * RUN;
  ctx.onFrame(({ t, beat }) => {
    const theta = turnAngle(t);
    const squeeze = 0.5 - 0.5 * Math.cos(beat * Math.PI * 2);
    const depth = SLACK + TIGHT * squeeze;
    for (const f of list) {
      const a = f.lon + theta;
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);
      if (cosA <= 0.05) {
        f.shade.setAttribute("display", "none");
        f.lit.setAttribute("display", "none");
        continue;
      }
      f.shade.removeAttribute("display");
      f.lit.removeAttribute("display");
      // The fold's own normal is the surface's along its meridian, read at the
      // equator: the projection called, so a fold turned toward the key is
      // the lit one.
      const lit = surfaceLit(1, 0, sinA, cosA);
      const half = Math.max(0.5, rx * Math.abs(sinA));
      const sweep = sinA < 0 ? 0 : 1;
      const d = `M ${cx.toFixed(2)} ${(ctx.centre.y - run).toFixed(2)} A ${half.toFixed(2)} ${run.toFixed(2)} 0 0 ${sweep} ${cx.toFixed(2)} ${(ctx.centre.y + run).toFixed(2)}`;
      // Full strength across the middle, thinning to nothing at the limb —
      // more slowly than the game's plain cosine, since a card is a fifth of
      // a field tile's fold and loses the limb ones first.
      const show = depth * cosA ** 0.6;
      f.shade.setAttribute("d", d);
      f.lit.setAttribute("d", d);
      f.shade.setAttribute("stroke-opacity", (0.9 * show).toFixed(3));
      f.lit.setAttribute("stroke-opacity", ((0.25 + 0.6 * lit) * show).toFixed(3));
    }
  });
}

export const WRINKLE: Skin<"wrinkle"> = {
  id: "wrinkle",
  label: "WRINKLE",
  hint: "six meridians of fold that come up across the body on the beat and smooth away, each a ridge lit toward the key, turning with the surface",
  build(ctx) {
    fillPass(ctx);
    terminatorPass(ctx);
    contactPass(ctx);
    folds(ctx);
    specularPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
    rimLightPass(ctx);
  },
};
