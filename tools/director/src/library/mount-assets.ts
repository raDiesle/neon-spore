import { rasp, taproot } from "@neon-spore/render";
import { drawMountStage } from "./mount-stage.js";
import type { Asset } from "./types.js";

/**
 * THE GYRE's mounts — the two contours offered for a body that stands on a
 * turning rim, and the bare body it stood there as.
 *
 * `creature:mount` was decided on 11 September 2026: the owner took TAPROOT
 * into the game and said "move to 'shapes' page if not there yet:
 * CREATURE:MOUNT · RASP". So three are here on one mount, its hub up and to
 * the left: the roots it wears, the burr, and the plain slick or bulb it was
 * until that day.
 */

const FROM = "THE GYRE · creature:mount";

export const MOUNT_TAPROOT: Asset = {
  id: "mount-taproot",
  label: "TAPROOT",
  from: FROM,
  inGame: true,
  claim:
    "A round body with narrow roots cut into one side of its outline. Look at the lower-left edge: three roots reach toward the wheel's hub, which is up and to the left of this card's middle, and drift without letting go.",
  note: "In the game since 11 September 2026 — the owner's pick.",
  draw: (c, f) => drawMountStage(c, f, { shape: taproot }),
};

export const MOUNT_RASP: Asset = {
  id: "mount-rasp",
  label: "RASP",
  from: FROM,
  claim:
    "A small round body under a ring of short spines, with longer ones on one side. Look at the upper-right edge: the crown of long spines points away from the hub, so the mount has a front.",
  note: "Kept on 11 September 2026 — the owner asked for it on this page.",
  draw: (c, f) => drawMountStage(c, f, { shape: rasp }),
};

export const MOUNT_BARE: Asset = {
  id: "mount-bare",
  label: "BARE",
  from: FROM,
  claim:
    "The slick or the bulb exactly as it is drawn in a lane — same contour, same colour, same sway. Look at the outline: nothing about it says which way the hub is.",
  note: "What a mount was until 11 September 2026: no picture of its own.",
  draw: (c, f) => drawMountStage(c, f, { shape: () => undefined }),
};
