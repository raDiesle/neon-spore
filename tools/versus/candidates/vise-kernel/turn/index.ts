import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import * as look from "../../../../../packages/render/src/vise-marks.js";
import { viseKernel } from "../../../../../packages/render/src/vise-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * TURN — offered 27 September 2026, from the queue's "THE VISE's husk has no
 * secondary motion of its own". Outside a story step the only clock on the
 * case is the light's drift, and a dry husk should stay still — so the touch
 * goes on the kernel. It rocks a few degrees about its own centre on a slow
 * period, never leaving its column, and between fire steps a soft highlight
 * wanders round its face on a period of its own: faint while the lobes are
 * over it, brighter once they stand open off it.
 *
 * The lit kernel turns too, so a fire step lighting it is not a snap back to
 * square; its ring is centred where it always was.
 */
/** How far the kernel rocks each way, in radians — about five degrees. */
const TURN = 0.09;
/** Its rate in radians a second, off the light's 0.5. */
const TURN_RATE = 0.37;
/** The highlight's round the face, in radians a second. */
const SHEEN_RATE = 0.83;
/** The highlight at its brightest, in shadow and bared. */
const SHEEN = { shadow: 0.1, bare: 0.25 };

const sheen: look.ViseKernelIdle["sheen"] = (ctx, l, core, size, bare, time) => {
  const k = viseKernel(l);
  const r = k.r * size;
  const a = time * SHEEN_RATE;
  const x = k.x + Math.cos(a) * r * 0.4;
  const y = k.y + Math.sin(a) * r * 0.5;
  const alpha = bare ? SHEEN.bare : SHEEN.shadow;
  ctx.save();
  ctx.clip(core);
  // Three rings, widest faintest, so the spot is soft rather than a sticker.
  for (const [w, strength] of [
    [0.5, 0.3],
    [0.32, 0.5],
    [0.16, 0.8],
  ] as const) {
    const spot = new Path2D();
    spot.arc(x, y, Math.max(0.5, r * w), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, alpha * strength);
    ctx.fill(spot);
  }
  ctx.restore();
};

export const VISE_KERNEL_TURN: Variant = {
  slot: "vise:kernel",
  name: "turn",
  sentence:
    "turn — THE VISE's kernel rocks a few degrees in its hollow on a slow period, and a soft highlight wanders round its dull face, brighter once the lobes stand open",
  dir: "tools/versus/candidates/vise-kernel/turn",
  patches: [
    patch({
      target: look.VISE_KERNEL,
      reached: () => look.VISE_KERNEL,
      where: {
        file: "packages/render/src/vise-marks.ts",
        symbol: "VISE_KERNEL",
        type: "ViseKernelIdle",
      },
      fields: { turn: (time: number) => TURN * Math.sin(time * TURN_RATE), sheen },
    }),
  ],
};
