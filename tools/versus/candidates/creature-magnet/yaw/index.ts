import * as magnetLook from "../../../../../packages/render/src/magnet-look.js";
import { patch, type Variant } from "../../../variant.js";
import { yawing } from "./paint.js";

/**
 * `creature:magnet` / `yaw` — the horseshoe turns on its staff, and its sides
 * come into view.
 *
 * **What the shipped side is.** `coil` (`magnet-coil.ts`): a body that hangs
 * — five hundredths of a radian either way — and never turns. The key light
 * makes it a solid, but a solid seen from one side only, and the direction the
 * owner named on 8 September was a body turning *just enough that what was
 * behind it comes into view*.
 *
 * **What this argues.** A slow swing about the staff, under a third of a right
 * angle each way on the pose clock, and both halves of a real turn drawn.
 * The front faces narrow — the pose. And on the side swinging toward the
 * viewer the body's **sides** appear: the plate's edge, the staff's flank,
 * the arch's outer wall, the tip's end, each a darker copy of its path pushed
 * out in the direction the turn uncovers, wider as it deepens and gone as it
 * comes back through square. The width cycles twice for every once the sides
 * do, and going away is not the mirror of coming toward, because a different
 * side shows — the two cues a squash cannot fake (`.claude/skills/depth`).
 *
 * **What it does not touch.** The rule: at the widest yaw the left pole is
 * plainly still the left, which is why the turn is as small as it is. The
 * lanes, drawn level and unturned first. The plate's paint, the poles'
 * gradient, the key light and the paths, all the shipped ones.
 *
 * **How it can lose.** *A body that turns is a body that is going somewhere.*
 * Nothing the players control travels on this field, and a creature that
 * visibly rotates on the spot may read as winding up for something it never
 * does. And at twenty-eight pixels a side strip at this yaw is a few pixels;
 * if it does not read, this is a squash with a comment, which is the failure
 * the depth skill names first. Watch the plate's edge at the widest yaw.
 */
export const MAGNET_YAW: Variant = {
  slot: "creature:magnet",
  name: "yaw",
  sentence:
    "the horseshoe swings slowly on its staff — the faces narrow and the sides come into view on the side turning toward you, a real turn and not a lean",
  dir: "tools/versus/candidates/creature-magnet/yaw",
  patches: [
    patch({
      target: magnetLook.MAGNET_LOOK,
      reached: () => magnetLook.MAGNET_LOOK,
      where: {
        file: "packages/render/src/magnet-look.ts",
        symbol: "MAGNET_LOOK",
      },
      fields: { body: yawing },
    }),
  ],
};
