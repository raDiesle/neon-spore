import type { BastionLayer, BastionState } from "@neon-spore/sim";
import type { At } from "./bastion-shape.js";
import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE BASTION glances** — the owner, 9 and 10 October 2026: *... or if
 * mechanical the full boss shape*, one entry per boss.
 *
 * The moon is a machine, and the part that turns is the sphere at its heart:
 * the core, the hull and the cage yaw together **about the moon's middle**
 * (`glance.ts`, a `hold` of 0) inside the armour and the gun ring, which stay
 * where they hang, the near side of the sphere opening and the far one
 * closing into the dark. The slabs a thumb pulls, the rim the pilot turns and
 * the gun a bolt stops on are on the armour and the ring, so none of them
 * moves (`bastion-grip.ts`, `bastion-stop.ts`).
 *
 * **It does not turn while one of its own shells is lit.** The cage's nodes
 * and the hull's open port are judged with no clock (`Field` carries none),
 * so the sphere steadies to face-on over the first beat of a lit lattice or
 * port and turns again over the first beat after it — the shell flung off or
 * grown back.
 *
 * Shipped, it does not glance: `BASTION_GLANCE` is still, and VERSUS
 * `bastion:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`),
 * each at `BASTION_GLANCE_SIZE`, counted in the cage's radius.
 */
export const BASTION_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the sphere turns, in the cage's radius, and how far it rolls — a machine's, as THE GOVERNOR's. */
export const BASTION_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.04, tilt: 0.2 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in the cage's radii: the core's glow stands just past it. */
const REACH = 1.4;

/** Whether `layer` is the sphere's own: a shell that turns with it. */
const held = (layer: BastionLayer | undefined): boolean => layer === "lattice" || layer === "port";

/**
 * How much of its turn the sphere shows at `at`, in beats with their
 * fraction: none while the lattice or the port is lit, coming back over the
 * first beat of the phase after one.
 */
export function bastionGlanceHush(s: BastionState, at: number): number {
  const into = Math.max(0, Math.min(1, at - s.phaseBeat));
  if (s.phase === "layer") return held(s.steps[s.cursor]?.layer) ? 1 - into : 1;
  const before = s.phase === "regrow" ? s.steps[s.cursor] : s.steps[s.cursor - 1];
  return s.phase !== "enter" && held(before?.layer) ? into : 1;
}

/**
 * The sphere as `draw` draws it about `c`, `r` the cage's radius, turned as
 * `BASTION_GLANCE` says and hushed as `bastionGlanceHush` says. `draw`
 * answers with the outlines the far side's dark is laid over. Still, it is
 * drawn once and exactly as before.
 */
export function drawBastionGlanced(
  ctx: CanvasRenderingContext2D,
  c: At,
  r: number,
  s: BastionState,
  at: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(BASTION_GLANCE, time, { x: c.x, y: c.y, r, hold: 0 });
  const hush = bastionGlanceHush(s, at);
  const hushed = { ...f, swing: f.swing * hush, roll: f.roll * hush };
  if (glanceStill(hushed)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(
    ctx,
    hushed,
    { dark: FAR_DARK, full: BASTION_GLANCE_SIZE.reach, reach: REACH },
    draw,
  );
}
