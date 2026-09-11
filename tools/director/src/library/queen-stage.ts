import { crystalPath, QUEEN_SHELL } from "@neon-spore/content";
import type { ShellDraw } from "@neon-spore/render";
import type { AssetContext, AssetFrame } from "./types.js";

/**
 * THE BULB QUEEN's shell, drawn on a card by a look of the caller's choosing.
 *
 * On the field `queen.ts` builds her contour and hands it to
 * `QUEEN_LOOK.shell` (`queen-look.ts`), the one seam a VERSUS candidate
 * patched. Here the contour is built the same way — `QUEEN_SHELL` walked by
 * `crystalPath` on the same clock — and handed straight to the look, so no
 * record is swapped at all. Only the shell: her marks are player 2's half of
 * a secret, her eggs are the torch's own, and her petals are a readout; none
 * of them is what the looks argue about.
 *
 * She is whole on the card. What each look does with time — the breath, the
 * heave, the slide of the plates — is on the frame clock the card supplies.
 */

/** Her half-extents on the card: three times as wide as tall, as on the field
 * (`queen-figure.ts`, `bodyRx` against `bodyRy`), and most of the card wide. */
const RX = 136;
const RY = 45;

export function drawQueenStage(
  c: AssetContext,
  f: AssetFrame,
  shell: (d: ShellDraw) => void,
): void {
  const { ctx, w, h } = c;
  const s = QUEEN_SHELL;
  const t = f.t;
  const path = new Path2D(crystalPath(0, 0, RX, RY, s.sides, s.depth, s.wobble, t, s.seed));
  ctx.save();
  ctx.translate(w / 2, h / 2);
  shell({ ctx, path, rx: RX, ry: RY, t, time: f.t, healthShare: 1 });
  ctx.restore();
}
