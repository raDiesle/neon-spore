import { streamFor } from "../skins/seed.js";
import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * A halo made of rays rather than of haze.
 *
 * The third answer in the aura-and-halo direction, and the one that is not
 * soft. HALO is a blurred copy of the outline and AURA is a ring standing off
 * it; both are smooth, and a page with only those two was quietly claiming
 * that light around a body has to be. A corona is light with **structure** —
 * spokes, at uneven lengths, turning slowly — and it is what the eye actually
 * reads off a bright thing squinted at.
 *
 * ## Why it might matter more than it looks
 *
 * It is the only value on the axis that can say *which way is out* at a size
 * where the contour cannot. At 26 px a lobed blob and a round blob are the
 * same blob, and `docs/spec/graphics.md` says as much; a body wearing a fixed
 * pattern of rays is distinguishable from one wearing a different pattern long
 * after their outlines have stopped being. Whether that is worth having is the
 * question the card exists to ask — it is also a way to make every creature
 * look like the sun, which is the failure mode.
 *
 * Seeded from the name, so THE WEIGHT's rays are THE WEIGHT's: two bodies
 * sharing a corona would be the worst of both, adding cost and saying nothing.
 */
const RAYS = 14;
const NEAR = 1.05;
const FAR = 1.62;

export const CORONA: Glow<"corona"> = {
  id: "corona",
  label: "CORONA",
  hint: "a halo with structure — uneven rays turning slowly, the only glow here that is not soft",
  layer: "under",
  spread: FAR - 1 + 0.06,
  build(ctx) {
    const rand = streamFor(ctx.name);
    const g = document.createElementNS(SVG, "g");
    ctx.body.appendChild(g);

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;
    for (let i = 0; i < RAYS; i++) {
      const a = (i / RAYS) * Math.PI * 2;
      // Uneven, and uneven in a fixed way. Rays of one length read as a cog;
      // rays of a random length *per frame* read as static.
      const far = NEAR + (FAR - NEAR) * (0.35 + rand() * 0.65);
      const line = document.createElementNS(SVG, "line");
      line.setAttribute("x1", (ctx.centre.x + Math.cos(a) * rx * NEAR).toFixed(2));
      line.setAttribute("y1", (ctx.centre.y + Math.sin(a) * ry * NEAR).toFixed(2));
      line.setAttribute("x2", (ctx.centre.x + Math.cos(a) * rx * far).toFixed(2));
      line.setAttribute("y2", (ctx.centre.y + Math.sin(a) * ry * far).toFixed(2));
      line.setAttribute("stroke", ctx.colour);
      line.setAttribute("stroke-width", (ctx.weight * (0.5 + rand() * 0.5)).toFixed(2));
      line.setAttribute("stroke-opacity", (0.2 + rand() * 0.3).toFixed(2));
      line.setAttribute("stroke-linecap", "round");
      g.appendChild(line);
    }

    ctx.onFrame(({ beat }) => {
      // Turns about a tenth of a revolution a beat and breathes with it. Slow
      // enough that it is not a spinner, present enough that it is not a
      // decal — a corona that held perfectly still would read as painted on.
      const turn = beat * 3.6;
      g.setAttribute("transform", `rotate(${turn.toFixed(2)} ${ctx.centre.x} ${ctx.centre.y})`);
      g.setAttribute("opacity", (0.75 + 0.25 * Math.sin(beat * Math.PI * 2)).toFixed(3));
    });
  },
};
