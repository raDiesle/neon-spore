import { blobPoints, POD } from "@neon-spore/content";
import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import { splinePath } from "./spline.js";

/** How far a target's sides open and close, in its radius, and how far it rolls. */
export const PINBALL_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.12, tilt: 0.5 };

/**
 * **PINBALL's targets glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * The round has no body of its own: the table is the field's columns, the
 * catcher is the ship's cannon, and what stands on it is rocks and pods
 * (`pinball-piece.ts`). The pods are the living things on it — the amber ones
 * the pair are told to want — so a pod is what turns, and a rock, which is
 * *boring* by the owner's instruction, does not. A target block turns as one
 * body, its chain of pods together.
 *
 * Each turns **about its centre** (`glance.ts`, a `hold` of 0), because the
 * centre and the radius are what the ball bounces off (`sim/pinball-*.ts`):
 * the near side swells and brightens, the far side narrows into the dark, and
 * the circle the physics knows stays where it was drawn. Each target runs the
 * round from its own place in it, so a table of five does not turn as one.
 *
 * Taken off VERSUS `pinball:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `PINBALL_GLANCE_SIZE`, in the target's own
 * radius.
 */
export const PINBALL_GLANCE: Glance = glanceOf(cock, PINBALL_GLANCE_SIZE, temperOf("pinball"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.65;
/** Seconds apart in the round one target is from the next. */
const STAGGER = 1.3;

/**
 * A target as `draw` draws it about `x`,`y`, `halfW` its drawn half-width,
 * turned as `PINBALL_GLANCE` says at `time` from target `seed`'s place in the
 * round. `pods` are where along it its pods sit, pixels off `x`, each `r`
 * across: the far side's dark is laid over their contours rather than over a
 * shape that reaches past a pod's lobes. Still, it is drawn once and exactly
 * as before.
 */
export function drawPinTargetGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; halfW: number; r: number; pods: readonly number[] },
  seed: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => void,
): void {
  const { x, y, halfW, r } = at;
  const f = glanceFrame(PINBALL_GLANCE, time + seed * STAGGER, { x, y, r: halfW, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const reach = 2.5 * Math.max(1, r / halfW);
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: PINBALL_GLANCE_SIZE.reach, reach }, (g) => {
    draw(g);
    // The pod's contour as `drawPodBody` draws it at rest, at each place.
    const k = r / Math.max(POD.rx, POD.ry);
    return at.pods.map((dx) =>
      splinePath(
        blobPoints(
          x + dx,
          y,
          POD.rx * k,
          POD.ry * k,
          POD.lobes,
          POD.depth,
          POD.wobble,
          0,
          POD.seed,
        ),
        true,
      ),
    );
  });
}
