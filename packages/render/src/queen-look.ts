import { PALETTE } from "./palette.js";

/**
 * THE ONE RECORD A CANDIDATE **QUEEN** PATCHES.
 *
 * `warden-look.ts`'s kind, and the second on a boss. The queen is the biggest
 * body on any field — four and a half tiles across — and she was drawn from
 * three files with no record between them, so a second answer to her had
 * nothing to patch. This is the seam: the **shell**, which is everything
 * between the two marks under her and the two torches on her wings. The
 * marks are player 2's half of a secret and are not in question; the eggs
 * are the torch drawn by the torch's own hand; the petals are a readout. What
 * the pair is asked about is the armour, which shipped as one linear
 * gradient glued to her own frame — a flat plate with a stroke round it at
 * the one size on the field where a flat fill shows worst.
 *
 * **The shipped `armour` came through here with not one pixel moved.** The
 * stops, the stroke and the contour are the ones `queen.ts` carried inline;
 * the caller still builds the path, so a look cannot change her silhouette,
 * and still adds her shudder, so a look cannot steady her.
 */

/** Everything the shell is drawn from, in a frame centred on her body. */
export interface ShellDraw {
  readonly ctx: CanvasRenderingContext2D;
  /** Her contour this frame, closed, about the origin — `QUEEN_SHELL` walked
   * by `crystalPath` at `t`. A look fills and clips to it; it does not
   * change it. */
  readonly path: Path2D;
  /** The contour's half-extents in pixels. */
  readonly rx: number;
  readonly ry: number;
  /** The wobble clock the contour was walked at — the clock a look has to
   * resample `crystalRadiusMul` on, or its vertices and the path disagree. */
  readonly t: number;
  /** The frame clock, in seconds. */
  readonly time: number;
  /** What is left of her, 1 whole and 0 gone. */
  readonly healthShare: number;
}

/**
 * The shell as it ships: the same angular rock her torches are made of, one
 * gradient from her upper-left corner to her lower-right, and the rock's
 * outline round it.
 */
export function armour(d: ShellDraw): void {
  const { ctx, path, rx, ry } = d;
  const rg = ctx.createLinearGradient(-rx, -ry, rx, ry);
  rg.addColorStop(0, "#6B707E");
  rg.addColorStop(0.55, "#3C3F49");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  ctx.stroke(path);
}

export interface QueenLook {
  /** Her armour, over the marks and under the eggs. */
  readonly shell: (d: ShellDraw) => void;
}

export const QUEEN_LOOK: QueenLook = { shell: armour };
