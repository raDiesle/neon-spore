import { retriesText } from "@neon-spore/sim";
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
 * September 2026, is one plate across the top and an open field below it, and
 * the tear below is only ever seen in transit.
 *
 * **That disagreement was put to the owner and he answered it on 17 September
 * 2026: turn it round, through VERSUS.** The sentence drawn — plates that come
 * in and shut on everything but a lit slot in the breach column — is the
 * `shut` candidate in the `lost:screen` slot, and it is a different screen
 * from the one he picked rather than a correction to it. Nothing here moved;
 * what changed is that the other way round is now something he can look at
 * beside this one.
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

/**
 * The plates alone, with nothing running down them.
 *
 * Split out of `veil` on 17 September 2026 and not one pixel moved: the fluid
 * used to be the last four lines of this function, so an answer that wanted to
 * argue about *what runs down the lost screen* — which is the one thing the
 * owner asked for alternatives to by name — had to retype the plates in order
 * to leave it out, and would then have been asking him two questions and
 * getting one answer. A candidate composes these two now.
 */
export function plates(ctx: CanvasRenderingContext2D, p: LostPaint): void {
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
}

/** The shipped screen: the plates, and the ship bleeding down them. */
export function veil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  plates(ctx, p);
  // Last, so it runs over the plate and over the open field alike — the owner
  // asked for it across the full width and a curtain that stopped at the seam
  // would be a curtain on the plate (`lost-blood.ts`).
  bleed(ctx, p);
}

/**
 * Where the stack starts, as a share of the play area: as far up the upper
 * plate as the plate goes, so it reads as a sign on a bulkhead rather than as
 * a caption floating over a picture.
 */
const TOP = 0.16;

/**
 * The words, starting at `top` of the play area.
 *
 * A parameter rather than the constant, for the same reason the plates and the
 * fluid came apart: the owner asked on 17 September 2026 for *text of "wave
 * lost" more down near the game screen*, and a candidate that argued it by
 * copying all four lines out would be four copies of the wording to keep in
 * step. `words` below is this at the shipped number and is what ships.
 */
export function wordsAt(ctx: CanvasRenderingContext2D, p: LostPaint, top: number): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  let y = p.l.playHeight * top;
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
  // The run's own figure, asked for by the owner on 16 September 2026 as *the
  // score*: not this wave's try, which the line above already gives, but how
  // many times the pair has gone again across every wave of the run. It is the
  // number the HUD's corner and the balance sheet both close on
  // (`hud.ts`, `balance.ts`), and the lost screen is where another one is
  // about to be added — so it is said in the same words `retriesText` gives
  // those two, and never spelled a second way.
  y += 20;
  drop(ctx, mid, y, p.age, 4, 0, () => {
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha *= 0.8;
    ctx.fillText(`THIS RUN · ${retriesText(p.retries)}`, 0, 0);
  });
  ctx.textAlign = "left";
}

/** The shipped stack, where it has always been. */
export function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  wordsAt(ctx, p, TOP);
}
