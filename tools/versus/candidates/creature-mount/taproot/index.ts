import * as mountLook from "../../../../../packages/render/src/mount-look.js";
import { patch, type Variant } from "../../../variant.js";
import { taproot } from "./shape.js";

/**
 * `creature:mount` / `taproot` — the mount is a bulb held to the wheel by
 * roots, and the roots reach in toward the hub.
 *
 * **What the shipped side is.** A slick or a bulb, exactly as one is drawn in
 * a lane — same contour, same colour, same sway, same size — because what the
 * pair reads off a wheel is *the colour standing in a column*, and until 10
 * September 2026 that was the whole argument for a mount having no picture of
 * its own. The owner asked that day for a mount that reads as a mount at a
 * glance, and this is one of three answers. All three keep the colour, the
 * skin, the interior and the sway: only the outline changes, the way THE
 * BEATBOX's arms change it (`mount-look.ts`).
 *
 * **What this argues.** That a body on a rim should look *held*. The form is
 * the shape sheet's own TAPROOT — a round body with five narrow tendrils cut
 * into its underside, drifting and never letting go — turned so the tendrils
 * face the hub. Six mounts on a wheel then all reach in toward the same
 * middle, which is the one picture a lane body can never make: a thing
 * gripping the ring it stands on. The tendrils are narrow on purpose; a body
 * with fat lower lobes is a slick, and the claim only reads if what attaches
 * the body is thinner than the body.
 *
 * **How it can lose.** *Five roots at 26 px are a fringe.* A tendril that
 * thin may not survive the wobble at creature size, and a mount that reads
 * as a ragged slick has cost the pair a clean colour for nothing. Judge it on
 * whether one root can be seen to point at the hub.
 */
export const MOUNT_TAPROOT: Variant = {
  slot: "creature:mount",
  name: "taproot",
  sentence:
    "the mount as the sheet's TAPROOT — a round body with five narrow roots cut into its underside, turned so every mount's roots reach in toward the hub of the wheel it stands on",
  dir: "tools/versus/candidates/creature-mount/taproot",
  patches: [
    patch({
      target: mountLook.MOUNT_LOOK,
      // No accessor: `creature-body.ts`'s table row reads the export itself,
      // once per mount per frame. The module namespace is the whole route
      // there is.
      reached: () => mountLook.MOUNT_LOOK,
      where: {
        file: "packages/render/src/mount-look.ts",
        symbol: "MOUNT_LOOK",
        type: "MountLook",
      },
      fields: { shape: taproot },
    }),
  ],
};
