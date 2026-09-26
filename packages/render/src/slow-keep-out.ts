import type { Layout } from "./layout.js";
import type { Aim } from "./slow-intake-aim.js";

/**
 * **The body THE SLOW's light may not cross**, as a shape a pass can clip to
 * and a distance a pass can fade by.
 *
 * Out of `slow-intake-streams.ts` on 26 September 2026, when the `slow:light`
 * slot opened with four more answers to the same question and every one of
 * them owed the owner's *stop before body of boss* (22 September 2026). Two
 * copies of a keep-out are two bodies the light stops at.
 */

/** How wide the keep-out stands at the head and at the far end of the axis, in
 * body radii. The head's own figure is a little under one, and the chain's top
 * plate a little under a half, so both are covered with room to spare — the
 * owner asked for the light to stop before the body *and more of it*. */
const KEEP_HEAD = 1.02;
const KEEP_FAR = 0.7;

/** How far a point stands clear of the keep-out around the body, in pixels —
 * negative inside it. The capsule again, measured rather than cut. */
export function clearOf(at: Aim, x: number, y: number): number {
  const dx = at.x - at.ax;
  const dy = at.y - at.ay;
  const run = dx * dx + dy * dy;
  // How far down the axis the nearest point stands, held to the two ends so a
  // bead past the head measures to the head and not to the line's extension.
  const along =
    run <= 0 ? 1 : Math.max(0, Math.min(1, ((x - at.ax) * dx + (y - at.ay) * dy) / run));
  const near = Math.hypot(x - (at.ax + dx * along), y - (at.ay + dy * along));
  return near - at.r * (KEEP_FAR + (KEEP_HEAD - KEEP_FAR) * along);
}

/**
 * The play area with the whole body cut out of it: a capsule from the far end
 * of the axis down to the head, round-capped there.
 *
 * **One subpath and no overlap**, which is the whole reason it is a capsule
 * rather than a string of discs. Canvas fills by non-zero winding, so two
 * overlapping holes wound the same way cancel back to solid and the body would
 * be painted over exactly where the cut-outs met. Traversed against the
 * rectangle so the body's interior winds to nought and falls out of the clip.
 */
export function clipRoundBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  top: number,
  floor: number,
): void {
  ctx.beginPath();
  ctx.rect(0, top, l.width, floor - top);
  const dx = at.x - at.ax;
  const dy = at.y - at.ay;
  const run = Math.hypot(dx, dy);
  const head = at.r * KEEP_HEAD;
  if (run <= at.r * 0.05) {
    // Nothing hangs off this body: the capsule is its own head, and one arc
    // wound the other way is the hole.
    ctx.arc(at.x, at.y, head, 0, Math.PI * 2, true);
    ctx.clip();
    return;
  }
  const far = at.r * KEEP_FAR;
  // Across the axis, so the two flanks of the capsule can be walked.
  const px = -dy / run;
  const py = dx / run;
  const ang = Math.atan2(py, px);
  ctx.moveTo(at.ax + px * far, at.ay + py * far);
  ctx.lineTo(at.x + px * head, at.y + py * head);
  ctx.arc(at.x, at.y, head, ang, ang - Math.PI, true);
  ctx.lineTo(at.ax - px * far, at.ay - py * far);
  ctx.closePath();
  ctx.clip();
}
