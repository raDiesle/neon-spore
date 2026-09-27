import * as look from "../../../../../packages/render/src/trivet-draw.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DANGLE — offered 27 September 2026, from the queue's "THE TRIVET's stand
 * has no secondary motion of its own". Outside a lurch or a fling the hub is
 * still and the only clock on the stand is the light's drift on the hub. So
 * the feet move instead: a lifted outer foot dangles a few degrees about its
 * leg's root on a slow period of its own, the two out of step, and the swing
 * is scaled by how far the foot is lifted — so a foot swinging down under its
 * chord slows as it comes, and a planted one is dead still. The hold still
 * reads as the swing stopping.
 *
 * The shipped foot is placed and then turned, so its plate, sockets and clamp
 * are the same and turn with the leg.
 */
/** How far a lifted foot swings each way about its root, in radians — about three and a half degrees. */
const DANGLE = 0.06;
/** Its rate in radians a second, off the contour's 0.9, 0.53 and 0.31. */
const DANGLE_RATE = 0.71;
/** How far the rear foot's swing is out of step with the front's. */
const APART = 2.3;

const dangling: look.TrivetFootHang = (root, foot, side, lift, time) => {
  const a = DANGLE * Math.max(0, Math.min(1, lift)) * Math.sin(time * DANGLE_RATE + side * APART);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = foot.x - root.x;
  const dy = foot.y - root.y;
  return { x: root.x + dx * c - dy * s, y: root.y + dx * s + dy * c, turn: foot.turn + a };
};

export const TRIVET_FOOT_DANGLE: Variant = {
  slot: "trivet:foot",
  name: "dangle",
  sentence:
    "dangle — each of THE TRIVET's lifted feet swings a few degrees about its leg's root on a slow period of its own, and goes dead still as it is planted",
  dir: "tools/versus/candidates/trivet-foot/dangle",
  patches: [
    patch({
      target: look.TRIVET_FOOT,
      reached: () => look.TRIVET_FOOT,
      where: {
        file: "packages/render/src/trivet-draw.ts",
        symbol: "TRIVET_FOOT",
        type: "{ hang: TrivetFootHang }",
      },
      fields: { hang: dangling },
    }),
  ],
};
