import type { LampreyState } from "@neon-spore/sim";
import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { LampreyPose } from "./lamprey-shape.js";

/** How far the head turns, in the mouth's radius, and how far it rolls — a head's cock. */
export const LAMPREY_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.12, tilt: 0.35 };

/**
 * **THE LAMPREY glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn, especially the head*, one entry per boss.
 *
 * The head is the part that turns: the sucker, its fringe, the mouth, the
 * ring of teeth and their marks — or the jaws while it hunts — yaw together
 * **about the mouth's middle** (`glance.ts`, a `hold` of 0), the near side of
 * the lip opening and the far side closing into the dark. The body, the fin
 * and the tail's knob stay as they lie. A bolt meets the gullet's rim under
 * the mouth's middle (`lamprey-stop.ts`), which the turn holds.
 *
 * **It is hushed while the eel bites** (`hush`): then a thumb taps the lit
 * tooth, and the tooth a press is judged against is read off the pose with no
 * clock (`lamprey-grip.ts`; `Field` carries none), so the head steadies to
 * face-on over the bite's first beat and turns again over the first beat of
 * whatever comes after.
 *
 * Taken off VERSUS `lamprey:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `LAMPREY_GLANCE_SIZE`, counted in the mouth's
 * radius.
 */
export const LAMPREY_GLANCE: Glance = glanceOf(cock, LAMPREY_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in the mouth's radii: the fringe and the jaws stand out past the lip. */
const REACH = 2.6;

/** How much of its turn the head shows at `at`, in beats with their fraction: none while it bites. */
export function lampreyGlanceHush(s: LampreyState, at: number): number {
  const into = Math.max(0, Math.min(1, at - s.phaseBeat));
  return s.phase === "bite" ? 1 - into : into;
}

/**
 * The head as `draw` draws it, turned about the mouth's middle as
 * `LAMPREY_GLANCE` says and hushed as `lampreyGlanceHush` says. `draw`
 * answers with the outlines the far side's dark is laid over. Still, it is
 * drawn once and exactly as before.
 */
export function drawLampreyGlanced(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  s: LampreyState,
  at: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(LAMPREY_GLANCE, time, { x: p.x, y: p.y, r: p.r, hold: 0 });
  const hush = lampreyGlanceHush(s, at);
  const hushed = { ...f, swing: f.swing * hush, roll: f.roll * hush };
  if (glanceStill(hushed)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(
    ctx,
    hushed,
    { dark: FAR_DARK, full: LAMPREY_GLANCE_SIZE.reach, reach: REACH },
    draw,
  );
}
