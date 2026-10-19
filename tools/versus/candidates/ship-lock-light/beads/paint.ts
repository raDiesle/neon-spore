import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** One bead a second of the four-second rest, set along the hull. */
const BEADS = 4;
/** Their spacing and size, in tiles, and how far into the skin they sit. */
const GAP = 0.42;
const R = 0.13;
const SINK = 0.32;

/**
 * Four beads in a row along the hull beside the cannon, one lit for each
 * second of the rest that has run. All four lit is a lock ready, and then
 * they flash together on the beat — a count the pair can read off at a
 * glance, and say: *two more*.
 */
export function paintBeads(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const ready = at.charge >= 1;
  const lit = ready ? BEADS : Math.floor(at.charge * BEADS);
  const flash = ready ? Math.max(0, 1 - at.beatPhase * 3) : 0;
  const r = at.tile * R;
  // To whichever side of the cannon the field has more room on.
  const side = at.x < at.tile * 4 ? 1 : -1;
  ctx.save();
  for (let i = 0; i < BEADS; i++) {
    const x = at.x + side * at.tile * (0.75 + i * GAP);
    const y = at.surface(x) + at.tile * SINK;
    ctx.fillStyle = "rgba(10, 6, 20, 0.85)";
    ctx.beginPath();
    ctx.arc(x, y, r * 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (i >= lit) continue;
    if (ready) {
      ctx.globalAlpha = 0.25 + 0.35 * flash;
      ctx.fillStyle = PALETTE.pod;
      ctx.beginPath();
      ctx.arc(x, y, r * (2 + flash), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
