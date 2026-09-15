import { INTRO_SIDES } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { fireButton, shieldSlider } from "./intro-controls.js";
import { type FigureBox, hull, plate } from "./intro-parts.js";
import { PALETTE } from "./palette.js";

/**
 * **ONE SHIP'S CONTROLS, WITH A SEAM DOWN THE MIDDLE.**
 *
 * The picture the intro is about, since 15 September 2026. It used to be two
 * phones with what is drawn on each of them — a body falling down one, a panel
 * of buttons on the other — and the owner took that out: *how the game looks
 * or what is shown on the mobile is not relevant*. What is relevant is that
 * there is one ship, that its controls are split between two people, and that
 * neither of them can reach across the seam. So there is one board, and a line
 * through it, and the two halves are lit in the two seats' own colours.
 *
 * The seam is the whole drawing. Everything else here — the hull over it, the
 * thumb landing on a button, the shield sliding — is there to make the seam
 * mean something: a control moves on the far side of it from the person who
 * asked for it.
 *
 * Nothing here decides *when*. The scene hands in how far each answer has got
 * (`IntroPlay`), so the shout and the control that answers it cannot come
 * apart — one clock, in `intro-pair.ts`.
 */

/** Where the two halves of the board are in the sentence the scene is saying. */
export interface IntroPlay {
  /** The fire answer: 0 before the press, 1 once it has been given. */
  shot: number;
  /** The shield answer: 0 where the shield stood, 1 where it was sent. */
  shielded: number;
}

/**
 * The colour each half is lit in. Violet is player one and amber is player two
 * everywhere else in the game (`seat-skin.ts`), and the two heads over the
 * board are already drawn in them (`intro-pair.ts`) — so the pair meet the two
 * colours they are about to be told apart by before they have chosen anything.
 */
const SIDE_HEX = { 1: PALETTE.hull, 2: PALETTE.pod } as const;

/**
 * The board, in one box: the hull it flies, the seam, and a control on each
 * side of it.
 */
export function drawShareBoard(
  ctx: CanvasRenderingContext2D,
  box: FigureBox,
  age: number,
  play: IntroPlay,
): void {
  if (box.w <= 0 || box.h <= 0) return;
  // A dim rim rather than the hull's own white: the board is the furniture the
  // ship and the two controls are on, and a board that is the brightest thing
  // in the picture is a picture of a board.
  plate(ctx, box.x, box.y, box.w, box.h, PALETTE.dim, "rgba(10,8,22,.92)");

  // The seam first and the ship over it: the line runs the whole height of the
  // board, and the one thing it does not cut is the hull. That is the picture
  // — two halves, one ship.
  seam(ctx, box, age);
  const hullH = Math.max(2, box.h * 0.46);
  hull(
    ctx,
    { x: box.x + box.w * 0.08, y: box.y + box.h * 0.02, w: box.w * 0.84, h: hullH },
    0.5,
    PALETTE.hullRim,
    age,
  );

  // A control on each side, in the half its own seat holds (`INTRO_SIDES`).
  const half = { w: box.w * 0.5, h: box.h };
  const shieldSide = INTRO_SIDES.shield === 1 ? 0 : 1;
  const shieldBox = { x: box.x + half.w * shieldSide, y: box.y, w: half.w, h: half.h };
  const fireBox = { x: box.x + half.w * (1 - shieldSide), y: box.y, w: half.w, h: half.h };
  wash(ctx, shieldBox, SIDE_HEX[INTRO_SIDES.shield]);
  wash(ctx, fireBox, SIDE_HEX[INTRO_SIDES.fire]);

  const y = box.y + box.h * 0.74;
  const r = Math.max(2, Math.min(box.w * 0.08, box.h * 0.18));
  fireButton(ctx, { x: fireBox.x + fireBox.w * 0.5, y, r }, age, play.shot);
  // **It travels the way the word says.** The shout that asks for it names a
  // direction — `SHIELD, LEFT` — and a knob that answered by sliding right
  // would be the one thing on this screen that contradicts what was said out
  // loud, which is the whole subject of the scene.
  shieldSlider(
    ctx,
    {
      from: shieldBox.x + shieldBox.w * 0.76,
      to: shieldBox.x + shieldBox.w * 0.24,
      y,
      r,
    },
    age,
    play.shielded,
  );
}

/**
 * The line neither of them reaches across.
 *
 * Drawn as a gap in the board rather than as a wall on top of it: two halves
 * with nothing joining them read as two halves, and a bar across the middle
 * reads as a thing somebody put there. It breathes, because everything in this
 * game does and because a hard static line is the one shape the field never
 * draws.
 */
function seam(ctx: CanvasRenderingContext2D, box: FigureBox, age: number): void {
  const x = box.x + box.w * 0.5;
  const top = box.y + box.h * 0.06;
  const bottom = box.y + box.h * 0.94;
  if (bottom <= top) return;
  const sway = Math.sin(age * 1.3) * Math.max(0.6, box.w * 0.006);
  const path = new Path2D();
  path.moveTo(x + sway, top);
  path.quadraticCurveTo(x - sway, (top + bottom) / 2, x + sway, bottom);
  ctx.save();
  ctx.setLineDash([Math.max(2, box.h * 0.07), Math.max(2, box.h * 0.06)]);
  strokeGlow(ctx, path, PALETTE.dim, Math.max(1, box.w * 0.01), 0.9);
  ctx.restore();
}

/** A half of the board, tinted the seat's colour and no more than tinted. */
function wash(ctx: CanvasRenderingContext2D, side: FigureBox, hex: string): void {
  if (side.w <= 0 || side.h <= 0) return;
  halo(ctx, side.x + side.w * 0.5, side.y + side.h * 0.7, Math.max(1, side.w * 0.7), hex, 0.16);
}
