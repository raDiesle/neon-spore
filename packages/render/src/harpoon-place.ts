import { HARPOON_KINDS, type HarpoonKind, harpoonBody, type World } from "@neon-spore/sim";
import { stuckClingerAt } from "./cling.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";

/**
 * **Where each harpooned body is drawn**, for the two passes that draw
 * something attached to one.
 *
 * Its own file, and it is four lines, because it is the answer to a mistake
 * worth not making twice. The line and the marks both asked `creatureCenter`
 * first — the right question for a body out on the field, and the wrong one for
 * a body on a control. A control's lobe is *eased* by the renderer, on its own
 * slower clock than the beat phase a body is placed by (`field-pose.ts`), so
 * the first picture of a placed leech had the body sitting on the cannon with
 * its cable, its square and its word a third of a tile to the side of it: two
 * answers to one question, rendered next to each other.
 *
 * `stuckClingerAt` is the one answer, and it is the same one `drawStuckClingers`
 * uses for the body itself (`cling.ts`). Everything attached to a harpooned
 * body goes through here, so there is nowhere left for a second one to appear.
 */

export type HeldHarpoons = ReadonlyMap<HarpoonKind, { x: number; y: number; r: number }>;

/** Every body a fault has on a control, where the ship pass drew it. Empty on
 * every wave that placed no such pencil, which is what the two draw passes
 * return on before they spend an op. */
export function heldHarpoons(
  l: Layout,
  world: World,
  cannonX: number,
  shieldX: number,
  surfaceY: SurfaceY,
  beatPhase: number,
): HeldHarpoons {
  const out = new Map<HarpoonKind, { x: number; y: number; r: number }>();
  for (const kind of HARPOON_KINDS) {
    const body = harpoonBody(world, kind);
    if (!body) continue;
    const at = stuckClingerAt(l, world, body, kind, cannonX, shieldX, surfaceY, beatPhase);
    out.set(kind, { x: at.x, y: at.y, r: at.r });
  }
  return out;
}
