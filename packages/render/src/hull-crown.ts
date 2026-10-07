import type { World } from "@neon-spore/sim";

/**
 * **What the swelling player 1 slides is, on this panel**: a gun, a hand or a
 * root.
 *
 * - `gun`, everywhere but two places: the mouth a shot is pressed out of, the
 *   intake that opens it, the chew and the laying pass (`hull.ts`).
 * - `hand`, THE CLAW's panel: the swelling is the arm folded at home, so the
 *   laying pass — a mouth nothing will come out of — is left undrawn
 *   (`reach-arm.ts`).
 * - `root`, THE THROAT: the gullet grows out of the hull where the cannon
 *   would be, and nothing is fired in that wave, so every pass that makes the
 *   swelling a gun is left out and the swelling is only the place the tube is
 *   rooted (`throat-draw.ts`). The owner, 1 October 2026: *instead of cannon
 *   the visual of the throat, connected with the ship like the cannon is.*
 *   Since 7 October there is no swelling either (`HullMood.root`) and no
 *   gunsight: the graft round the root is the ship's only bump there
 *   (`throat-graft.ts`).
 *
 * Not a field of `HullMood`: nothing about it is eased or transient. It is a
 * fact about the panel, asked once a frame by `frame-ship.ts`.
 */
export type HullCrown = "gun" | "hand" | "root";

export function hullCrown(world: World, arm: boolean): HullCrown {
  if (arm) return "hand";
  return world.boss?.kind === "throat" ? "root" : "gun";
}
