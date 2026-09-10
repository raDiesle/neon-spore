import * as mountLook from "../../../../../packages/render/src/mount-look.js";
import { patch, type Variant } from "../../../variant.js";
import { pendant } from "./shape.js";

/**
 * `creature:mount` / `pendant` — the mount is a sac hung off the rim, its
 * weight fallen in toward the hub.
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
 * **What this argues.** That a body carried by a ring should hang from it.
 * The form is the shape sheet's `sac` — the one THE WEIGHT and TENDRIL are
 * built on — tuned to a drop and turned so its narrow end is at the rim and
 * its heavy end hangs in toward the hub. Six drops round a turning wheel read
 * as fruit on it rather than as six bodies standing on it, and it is the
 * quietest of the three: no spine and no root, only a body whose weight
 * says where the middle is.
 *
 * **How it can lose.** *A drop is a slick seen end-on.* The slick is two sacs
 * at a waist, and a single sac at creature size may not be far enough from
 * one to be worth a new word. Judge it against the lane bodies falling past
 * the wheel: if a pair could mistake one for the other, it has lost.
 */
export const MOUNT_PENDANT: Variant = {
  slot: "creature:mount",
  name: "pendant",
  sentence:
    "the mount as the sheet's sac, tuned to a drop — narrow at the rim and heavy toward the hub, so six mounts hang off the wheel like fruit",
  dir: "tools/versus/candidates/creature-mount/pendant",
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
      fields: { shape: pendant },
    }),
  ],
};
