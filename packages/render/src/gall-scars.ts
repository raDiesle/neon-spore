import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE GALL's scars**: the seam's four points, drawn whether or not the
 * alien sits on them — a place the pair can count to is a place one can send
 * the other's eyes to (§38). The scar under the alien is hidden by it.
 *
 * **Nothing is drawn round the alien to say how long is left.** It wore two
 * chevrons and a ring closing as its window ran out until the owner, 8
 * October 2026: *remove the visual around the enemy … we already have
 * generic timer* — the fuse every asking window burns (`slow-fuse.ts`).
 */

/** A scar where a point sits on the seam: a short dark crease across it. */
export function drawGallScar(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number): void {
  const w = 0.16 * l.tile;
  const crease = new Path2D();
  crease.moveTo(x - w, y - w * 0.25);
  crease.quadraticCurveTo(x, y + w * 0.35, x + w, y - w * 0.25);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.gallSeamDark, 0.85);
  ctx.stroke(crease);
}
