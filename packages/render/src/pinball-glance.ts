import { drawGlanced, type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";

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
 * Shipped, they do not glance: `PINBALL_GLANCE` is still, and VERSUS
 * `pinball:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`),
 * each at `PINBALL_GLANCE_SIZE`, in the target's own radius.
 */
export const PINBALL_GLANCE: Glance = { ...STILL_GLANCE };

/** How far a target's sides open and close, in its radius, and how far it rolls. */
export const PINBALL_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.12, tilt: 0.5 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.65;
/** Seconds apart in the round one target is from the next. */
const STAGGER = 1.3;

/**
 * A target as `draw` draws it about `x`,`y`, `halfW` by `halfH` its drawn
 * half-size, turned as `PINBALL_GLANCE` says at `time` from target `seed`'s
 * place in the round. Still, it is drawn once and exactly as before.
 */
export function drawPinTargetGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; halfW: number; halfH: number },
  seed: number,
  time: number,
  draw: () => void,
): void {
  const { x, y, halfW, halfH } = at;
  const f = glanceFrame(PINBALL_GLANCE, time + seed * STAGGER, { x, y, r: halfW, hold: 0 });
  if (glanceStill(f)) {
    draw();
    return;
  }
  const reach = 2.5 * Math.max(1, halfH / halfW);
  drawGlanced(ctx, f, { dark: FAR_DARK, full: PINBALL_GLANCE_SIZE.reach, reach }, () => {
    draw();
    const shape = new Path2D();
    shape.ellipse(x, y, halfW, halfH, 0, 0, Math.PI * 2);
    return [shape];
  });
}
