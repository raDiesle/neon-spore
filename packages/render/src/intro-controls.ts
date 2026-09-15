import { blobPoints, INTRO_SIDES } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { P1_SKIN, P2_SKIN } from "./seat-skin.js";
import { splinePath } from "./spline.js";

/**
 * THE TWO CONTROLS A SHOUT ASKS FOR, and the thumb landing on them.
 *
 * They are the two halves of one ship's controls, one on each side of the seam
 * that runs down `intro-share.ts`'s board — and the half of the intro's
 * argument that is *answered*: the person who asked for this cannot reach it.
 *
 * Nothing here knows when. `shot` and `shielded` come in as 0 before the word
 * has landed and 1 once the control has been moved (`intro-shout.ts`), so what
 * a frame shows and what the pair were told cannot come apart.
 *
 * **They are handed where they go rather than a box to sit in a corner of.**
 * They used to take the phone they were drawn on and put themselves at a
 * fraction of it, which is what a panel wants and not what a split board does:
 * the board decides where its seam is and hands each side its own place.
 */

/** Where a button is and how big it is, in the board's own pixels. */
export interface ButtonAt {
  x: number;
  y: number;
  r: number;
}

/** The rail a shield rides, and how thick the thing riding it is. */
export interface RailAt {
  from: number;
  to: number;
  y: number;
  r: number;
}

/** The button that ends a body, with the press landing on it. */
export function fireButton(
  ctx: CanvasRenderingContext2D,
  at: ButtonAt,
  age: number,
  shot: number,
): void {
  const cx = at.x;
  const cy = at.y;
  const r = at.r;
  const press = Math.sin(Math.min(1, shot * 1.6) * Math.PI);
  halo(ctx, cx, cy, r * 2.4, PALETTE.red, 0.35 + 0.5 * press);
  const face = splinePath(
    blobPoints(
      cx,
      cy,
      r * (1 - 0.1 * press),
      r * 0.94 * (1 - 0.1 * press),
      3,
      0.06,
      0.04,
      age,
      1109,
      26,
    ),
    true,
  );
  ctx.fillStyle = mixHex(PALETTE.red, "#0B0718", 0.68 - 0.4 * press);
  ctx.fill(face);
  strokeGlow(ctx, face, PALETTE.red, Math.max(1.2, r * 0.2), 1);
  // The ring a press throws off, which is how a phone says a finger landed.
  if (press > 0.02) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r * (1 + 1.5 * press), r * (1 + 1.5 * press), 0, 0, Math.PI * 2);
    ctx.strokeStyle = PALETTE.redRim;
    ctx.globalAlpha = 0.7 * (1 - press);
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

/** The strip the shield rides, and the shield riding it. */
export function shieldSlider(
  ctx: CanvasRenderingContext2D,
  rail: RailAt,
  age: number,
  shielded: number,
): void {
  const { y, from, to } = rail;
  const h = rail.r;
  ctx.beginPath();
  // `Math.abs`, because a rail may run either way: the shield travels the way
  // the word that asked for it says, and a negative radius is what a real
  // canvas throws `IndexSizeError` on (`intro-share.ts`).
  ctx.ellipse((from + to) / 2, y, Math.abs(to - from) / 2 + h * 0.3, h * 0.5, 0, 0, Math.PI * 2);
  // The rail is the seat's own dark, and the seat is whichever one holds the
  // shield (`content/src/intro.ts` `INTRO_SIDES`). It was player two's while
  // the shield was drawn on player two's phone, and an amber rail under a
  // violet half is the one thing in this picture that says the wrong seat.
  const skin = INTRO_SIDES.shield === 1 ? P1_SKIN : P2_SKIN;
  ctx.fillStyle = skin.dead[1];
  ctx.fill();
  ctx.strokeStyle = skin.lip[0];
  ctx.lineWidth = 1;
  ctx.stroke();

  const x = from + (to - from) * shielded;
  const r = h * 0.72;
  halo(ctx, x, y, r * 2.4, PALETTE.shield, 0.4 + 0.3 * Math.sin(age * 2));
  const knob = splinePath(blobPoints(x, y, r, r * 0.9, 3, 0.06, 0.03, age, 1301, 24), true);
  ctx.fillStyle = mixHex(PALETTE.shield, "#0B0718", 0.6);
  ctx.fill(knob);
  strokeGlow(ctx, knob, PALETTE.shield, Math.max(1.2, r * 0.22), 1);
  // A smear behind it while it is moving: the control slid, it did not jump.
  if (shielded > 0.02 && shielded < 1) {
    ctx.beginPath();
    ctx.ellipse((from + x) / 2, y, Math.abs(x - from) / 2, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.shield;
    ctx.globalAlpha = 0.25;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
