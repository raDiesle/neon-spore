import type { Hit } from "./types.js";

/**
 * The body flattens on impact and springs back.
 *
 * **This value is the reason HITS is a separate axis rather than seven more
 * glows.** `docs/glow.md`'s fifth rule is that a glow may never change the
 * contour — it adds light around a shape and never moves a point of it — and
 * `glows.test.ts` scans every glow file to enforce it. Squash breaks that rule
 * on purpose, and it is the oldest trick in the book: the canonical
 * game-feel demo squashes a brick and the same game suddenly feels alive.
 *
 * It moves the whole figure rather than the outline, through `ctx.transform`,
 * so the glow stack squashes with the body. A body that flattened while its
 * halo stayed round would read as the halo having come loose — the same defect
 * CLAUDE.md names about a highlight glued to a spinning rock.
 *
 * **Volume is conserved**, which is the difference between squash and a body
 * simply getting smaller: it loses in height exactly what it gains in width.
 * Without that it reads as distance rather than as impact.
 */
const DEPTH = 0.26;

export const SQUASH: Hit<"squash"> = {
  id: "squash",
  label: "SQUASH",
  hint: "the body flattens on impact and springs back — wider by as much as it loses in height",
  phase: "impact",
  // It gets *wider*, so the frame has to hold the extra half-width.
  spread: DEPTH * 0.6,
  build(ctx) {
    const { x, y } = ctx.centre;
    ctx.transform(({ hit }) => {
      if (hit.shock <= 0) return "";
      // Overshoots once on the way back rather than easing home: a body that
      // returns straight to rest reads as elastic, one that passes through it
      // reads as struck. The decay is on `shock` and the wobble rides it.
      const k = hit.shock * Math.cos(hit.shock * 7);
      const sy = 1 - DEPTH * k;
      const sx = 1 / sy;
      return `translate(${x} ${y}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-x} ${-y})`;
    });
  },
};
