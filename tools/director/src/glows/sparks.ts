import { streamFor } from "../skins/seed.js";
import { SVG } from "../skins/types.js";
import type { Glow } from "./types.js";

/**
 * A particle system: motes leaving the body on seeded paths.
 *
 * The owner's *Particle Systems* — the case where the glow is not light but
 * small dynamic things thrown outward. It is the most expensive value on the
 * axis and the one most likely to be judged a mistake, which is exactly why it
 * is on the page rather than in an argument: sparks on a body that already
 * wobbles may simply read as the outline being dirty.
 *
 * ## Seeded, so the screenshot is the card
 *
 * Rule (b) in `docs/skins.md`. Every angle, rate and phase below comes from
 * `streamFor(ctx.name)` and nothing else, so THE WEIGHT's motes are THE
 * WEIGHT's on every reload — otherwise the frame somebody votes over is not
 * the frame anybody saw, and two bodies would share a texture the day two
 * cards happened to draw at the same moment.
 *
 * ## Nothing is allocated per frame
 *
 * Sixteen circles and three plain arrays, built once. The obvious
 * implementation spawns a particle object per mote per frame and would be
 * sixteen allocations sixty times a second on each of thirty cards, which is
 * rule (d) and is the reason it is written down.
 */
const MOTES = 16;
/** Where a mote is born and where it dies, as multiples of the half-extent. */
const BORN = 0.62;
const DIES = 1.42;

export const SPARKS: Glow<"sparks"> = {
  id: "sparks",
  label: "SPARKS",
  hint: "motes thrown outward on seeded paths — glow made of things rather than of light",
  layer: "over",
  spread: DIES - 1 + 0.1,
  build(ctx) {
    const rand = streamFor(ctx.name);
    const dots: SVGCircleElement[] = [];
    const angle: number[] = [];
    const rate: number[] = [];
    const phase: number[] = [];

    for (let i = 0; i < MOTES; i++) {
      const c = document.createElementNS(SVG, "circle");
      c.setAttribute("fill", ctx.colour);
      c.setAttribute("r", (ctx.weight * (0.9 + rand() * 1.1)).toFixed(2));
      ctx.body.appendChild(c);
      dots.push(c);
      angle.push(rand() * Math.PI * 2);
      rate.push(0.22 + rand() * 0.3);
      phase.push(rand());
    }

    const rx = ctx.extent.w / 2;
    const ry = ctx.extent.h / 2;

    ctx.onFrame(({ t }) => {
      for (let i = 0; i < MOTES; i++) {
        const dot = dots[i];
        const a = angle[i];
        const r = rate[i];
        const p0 = phase[i];
        if (!dot || a === undefined || r === undefined || p0 === undefined) continue;
        const p = (t * r + p0) % 1;
        const reach = BORN + (DIES - BORN) * p;
        dot.setAttribute("cx", (ctx.centre.x + Math.cos(a) * rx * reach).toFixed(2));
        dot.setAttribute("cy", (ctx.centre.y + Math.sin(a) * ry * reach).toFixed(2));
        // Fades the whole way out rather than winking off at the end: a mote
        // that vanishes at full brightness reads as a dropped frame.
        dot.setAttribute("fill-opacity", ((1 - p) * 0.95).toFixed(3));
      }
    });
  },
};
