import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import { bleed } from "./lost-blood.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";

/**
 * The lost screen: the field plated over, and then the lower plate drawn down
 * off it, leaving the ship and the hole in it in the clear under a bulkhead
 * with WAVE LOST stamped on it.
 *
 * **What it argues** is that a lost wave should feel like something shutting.
 * The field is *held* at that moment — nothing falls, nothing fires — and a
 * veil is a poor picture of a stop; a bulkhead is the picture the pause
 * already is. What the slot demands is that the pair can still see where it
 * got through, and this answers it by uncovering the half of the screen the
 * breach is in rather than by cutting a hole in a plate.
 *
 * **Read `slid` before changing any of this.** The candidate's own sentence
 * said the plates *slide in and close*, and they do the opposite: at `age` 0
 * both cover their halves and the screen is solid, and over `CLOSE` seconds
 * they retreat — the upper one up to `SEAM`, the lower one off the foot
 * entirely. So the settled picture, which is the one the owner chose on 16
 * September 2026, is one plate across the top and an open field below it. The
 * tear below is only ever seen in transit, and `docs/queue.md` asks him
 * whether that is the way round he wants.
 */

/** How long the plates take to draw back, seconds. */
const CLOSE = 0.45;

/** Where the two plates meet, as a share of the play area. */
const SEAM = 0.44;

/** How wide the tear is, in tiles, and how ragged its edge. */
const TEAR_TILES = 2.4;
const TEETH = 7;

const PLATE = "#0C0A16";
const EDGE = "#2A2140";

function slid(age: number): number {
  return Math.max(0, Math.min(1, age / CLOSE));
}

export function veil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const k = slid(p.age);
  const seam = p.l.playHeight * SEAM;
  const top = -(1 - k) * seam;
  const foot = p.l.height - (1 - k) * (p.l.height - seam);

  ctx.fillStyle = PLATE;
  ctx.fillRect(0, top, p.l.width, seam - top);

  // The lower plate, with the tear cut out of it where the hull was broken.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, foot, p.l.width, p.l.height - foot);
  if (p.breachX !== null) {
    const half = p.l.tile * TEAR_TILES * 0.5;
    // Counter-wound, so the rectangle's own fill rule takes the tear out of it
    // rather than painting a second shape over the field.
    ctx.moveTo(p.breachX + half, foot);
    for (let i = TEETH; i >= 0; i--) {
      const u = i / TEETH;
      const x = p.breachX - half + half * 2 * u;
      const bite = signedHash(i, 3, 0) * p.l.tile * 0.22;
      ctx.lineTo(x, foot + p.l.tile * 1.5 + bite);
    }
    ctx.lineTo(p.breachX - half, foot);
    ctx.closePath();
  }
  ctx.fillStyle = PLATE;
  ctx.fill("evenodd");
  ctx.restore();

  // The lips of both plates, so they read as metal rather than as a wipe.
  const lip = new Path2D();
  lip.moveTo(0, seam);
  lip.lineTo(p.l.width, seam);
  lip.moveTo(0, foot);
  lip.lineTo(p.l.width, foot);
  strokeGlow(ctx, lip, EDGE, 2, 0.5);

  if (p.breachX !== null && k >= 1) {
    const half = p.l.tile * TEAR_TILES * 0.5;
    const hot = new Path2D();
    for (let i = 0; i <= TEETH; i++) {
      const u = i / TEETH;
      const x = p.breachX - half + half * 2 * u;
      const bite = signedHash(i, 3, 0) * p.l.tile * 0.22;
      const y = foot + p.l.tile * 1.5 + bite;
      if (i === 0) hot.moveTo(x, y);
      else hot.lineTo(x, y);
    }
    strokeGlow(ctx, hot, PALETTE.ember, Math.max(1, p.l.tile * 0.04), 1.1);
  }

  // Last, so it runs over the plate and over the open field alike — the owner
  // asked for it across the full width and a curtain that stopped at the seam
  // would be a curtain on the plate (`lost-blood.ts`).
  bleed(ctx, p);
}

export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  // Stamped on the upper plate, as far up it as the plate goes: a sign on a
  // bulkhead rather than a caption floating over a picture.
  let y = p.l.playHeight * 0.16;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '700 30px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 24;
  drop(ctx, mid, y, p.age, 2, 0, () => {
    ctx.font = '600 12px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries} · RUN IT AGAIN`, 0, 0);
  });
  y += 22;
  drop(ctx, mid, y, p.age, 3, 0, () => {
    ctx.font = '13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("The tear is where it came in.", 0, 0);
  });
  ctx.textAlign = "left";
}
