import { facet, type Pin, pin, surfaceDim } from "@neon-spore/content";
import { at, disc, inside } from "./parts.js";
import type { Filling, FillingContext } from "./types.js";

/**
 * SPORES — the body is full, and it is a spore case.
 *
 * **This is the game.** `packages/render/src/body-spores.ts` is what a bulb
 * wears on the field, taken there on 9 September 2026 out of the same set of
 * five the rest of this axis came from. It is on the row as a **control**: a
 * proposal judged against a memory of the shipped look wins every time, and
 * that rule only means something if the shipped look is on the same row
 * (`tails/types.ts` makes the argument at length).
 *
 * The creature is called a bulb and the game is called Neon Spore, and the body
 * had never once looked like it was carrying anything. This fills it: eleven
 * small spheres packed through the whole volume rather than laid on a shell, so
 * the near ones are large and bright and the far ones small and dim, and the
 * packing turns.
 *
 * **Depth comes from the radius, not from a squash.** Each spore is pinned at
 * its own *reach* as well as its own longitude and latitude — the packing is
 * three deep — and a spore's drawn size is that reach times its facet's own
 * foreshortening. That is what stops it reading as a flat scatter of dots, and
 * it is the thing to check any proposal on this row against.
 */

const SPORES_N = 11;
const SPORE = 0.2;
const REACH = 0.62;
const SPIN = 0.42;
const DIM = 0.24;

/** Longitude, latitude and how far out — three shells rather than one. */
const LAYOUT: { q: Pin; depth: number }[] = Array.from({ length: SPORES_N }, (_, i) => {
  const depth = 0.45 + ((i * 7) % 3) * 0.27;
  return { q: pin(i * 2.39, ((i / (SPORES_N - 1)) * 2 - 1) * 0.8, depth), depth };
});

export const SPORES: Filling<"spores"> = {
  id: "spores",
  label: "SPORES",
  shipped: "THE BULB's interior — `packages/render/src/body-spores.ts`",
  hint: "eleven spheres packed three shells deep, the near ones large and bright and the deep ones small and dim",
  build(ctx: FillingContext) {
    const g = inside(ctx, "spores");
    const reach = Math.min(ctx.extent.w, ctx.extent.h) * 0.5 * REACH;
    const body = at(0);
    const marks = LAYOUT.map(({ q, depth }) => {
      const el = disc(reach * SPORE * depth * q.cosLat, ctx.colour, 0.7);
      body.appendChild(el);
      return el;
    });
    g.appendChild(body);

    const step = (t: number): void => {
      for (let i = 0; i < LAYOUT.length; i++) {
        const row = LAYOUT[i];
        const el = marks[i];
        if (!row || !el) continue;
        const f = facet(row.q, t * SPIN);
        if (!f.near) {
          el.setAttribute("display", "none");
          continue;
        }
        el.removeAttribute("display");
        el.setAttribute(
          "transform",
          `translate(${(f.x * reach).toFixed(2)} ${(f.y * reach).toFixed(2)}) scale(${f.sx.toFixed(4)} 1)`,
        );
        // Deeper in the packing is dimmer as well as smaller, which is the
        // whole of why this is a volume and not a scatter.
        el.setAttribute("opacity", (surfaceDim(DIM, f.lit) * row.depth).toFixed(3));
      }
    };
    step(0);
    ctx.onFrame(({ t }) => step(t));
  },
};
