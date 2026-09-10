import * as mountLook from "../../../../../packages/render/src/mount-look.js";
import { patch, type Variant } from "../../../variant.js";
import { rasp } from "./shape.js";

/**
 * `creature:mount` / `rasp` — the mount is a burr, a ring of short spines
 * with a crown of longer ones facing out from the hub.
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
 * **What this argues.** That six mounts on a turning ring are the wheel's
 * *teeth*, and a tooth has a point. The form is the shape sheet's THE RASP —
 * a small round body under twenty short spines — given the crown `studded`
 * offers and that draft left off, so the spines on the outward side are
 * longer and the mount has a front, facing away from the hub. A spine is a
 * claim no smooth body in the bestiary makes, which is exactly what makes a
 * mount a mount at a glance, and what makes the whole wheel read as one
 * bristling object.
 *
 * **How it can lose.** *At 26 px a needle is a pixel.* Twenty of them on a
 * body whose outline is already ragged with wobble may read as a slick with
 * a bad edge, and two hundred and twenty-four contour points per mount, six
 * mounts a wheel, is the most any living body walks. Judge it on whether the
 * crown can be seen to point outward on a phone.
 */
export const MOUNT_RASP: Variant = {
  slot: "creature:mount",
  name: "rasp",
  sentence:
    "the mount as the sheet's THE RASP — a small round body under a ring of twenty short spines, with a crown of longer ones on the side facing out from the hub",
  dir: "tools/versus/candidates/creature-mount/rasp",
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
      fields: { shape: rasp },
    }),
  ],
};
