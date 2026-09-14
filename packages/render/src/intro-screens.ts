import { halo } from "./glow.js";
import { fireButton, shieldSlider } from "./intro-controls.js";
import { body, drip, type FigureBox, hull, plate } from "./intro-parts.js";
import { PALETTE } from "./palette.js";
import { P1_SKIN, P2_SKIN } from "./seat-skin.js";

/**
 * THE TWO SCREENS, AND WHY THEY ARE NOT THE SAME SCREEN.
 *
 * One phone carries the field — a body coming down a column at a hull with a
 * shield on it. The other carries the controls that answer it — a fire button
 * and a shield slider — and carries no picture of what is coming. That is the
 * whole game in two rectangles, and it is the reason the pair have to talk:
 * neither of them can finish a sentence on their own.
 *
 * Nothing here decides *when*. The scene hands in how far each thing has got
 * (`IntroPlay`) and these draw that moment, so the shout, the press and the
 * body popping cannot drift apart — one clock, in `intro-scene.ts`.
 */

/** Where the two phones are in the sentence the scene is saying. */
export interface IntroPlay {
  /** How far the first body has come down, 0 at the top, 1 at the hull. */
  fall: number;
  /** The fire answer: 0 before the press, 1 once the body is gone. */
  shot: number;
  /** How far the second body has come down toward the shield. */
  drop: number;
  /** The shield answer: 0 where the shield stood, 1 where it was sent. */
  shielded: number;
}

/** Where the shield sits before it is asked for, and where it is sent. */
const SHIELD_FROM = 0.3;
const SHIELD_TO = 0.72;

/** Player one's phone: the field, with something coming down it. */
export function fieldPhone(
  ctx: CanvasRenderingContext2D,
  b: FigureBox,
  age: number,
  play: IntroPlay,
): void {
  plate(ctx, b.x, b.y, b.w, b.h, P1_SKIN.tint);
  const inner = inside(b);
  columns(ctx, inner, 1);

  const lane = inner.x + inner.w * 0.38;
  const r = inner.w * 0.11;
  // The first body, and the moment it stops being one: the press does not move
  // it, it ends it, so the pop stands where the body was rather than anywhere
  // a player could mistake for a dodge (`docs/decisions.md` #21 — nothing the
  // players control travels).
  const fell = inner.y + inner.h * (0.06 + 0.4 * play.fall);
  if (play.shot < 1) {
    ctx.globalAlpha = 1 - play.shot;
    body(ctx, lane, fell, r, PALETTE.red, age, 401);
    ctx.globalAlpha = 1;
  }
  if (play.shot > 0 && play.shot < 1) {
    halo(
      ctx,
      lane,
      fell,
      r * (1.6 + 3 * play.shot),
      PALETTE.redRim,
      0.7 * Math.sin(play.shot * Math.PI),
    );
  }

  // The second body, coming down at the column the shield has to reach.
  const toward = inner.x + inner.w * SHIELD_TO;
  if (play.drop > 0) {
    const y = inner.y + inner.h * (0.05 + 0.41 * play.drop);
    const stopped = play.drop >= 1 && play.shielded >= 1;
    ctx.globalAlpha = stopped ? 0.35 : 1;
    body(ctx, toward, y, r * 0.86, PALETTE.cyan, age, 733);
    ctx.globalAlpha = 1;
    if (stopped) halo(ctx, toward, y + r * 0.6, r * 3, PALETTE.shieldRim, 0.55);
  }

  ship(ctx, inner, P1_SKIN, play.shielded, age);
  seam(ctx, inner, P1_SKIN);
  // This seat's own controls, and none of them is what is being asked for:
  // what the pair are looking at on this phone is the field.
  unlitRow(ctx, inner, 0.74, P1_SKIN);
  unlitRow(ctx, inner, 0.89, P1_SKIN);
  drip(ctx, b.x + b.w * 0.5, b.y + b.h, b.h * 0.14, P1_SKIN.tint, age * 1.1);
}

/** Player two's phone: the same game, the controls that answer it, and no
 * sight of what is coming. */
export function panelPhone(
  ctx: CanvasRenderingContext2D,
  b: FigureBox,
  age: number,
  play: IntroPlay,
): void {
  plate(ctx, b.x, b.y, b.w, b.h, P2_SKIN.tint);
  const inner = inside(b);
  // The same field, with nothing on it. This seat is playing the same game and
  // cannot see what is coming down it, which is the half of the pitch the
  // other phone cannot make on its own — and the columns are a whisper rather
  // than a drawing, because an empty grid as bright as the one next door would
  // read as a wave that had ended.
  columns(ctx, inner, 0.4);
  ship(ctx, inner, P2_SKIN, play.shielded, age);
  seam(ctx, inner, P2_SKIN);
  unlitRow(ctx, inner, 0.74, P2_SKIN);
  fireButton(ctx, inner, age, play.shot);
  shieldSlider(ctx, inner, age, play.shielded);
  drip(ctx, b.x + b.w * 0.5, b.y + b.h, b.h * 0.14, P2_SKIN.tint, age * 1.3 + 2);
}

/** The screen inside the phone's own case. */
function inside(b: FigureBox): FigureBox {
  return { x: b.x + b.w * 0.08, y: b.y + b.h * 0.08, w: b.w * 0.84, h: b.h * 0.84 };
}

/** The columns a body comes down, over the top of a screen. */
function columns(ctx: CanvasRenderingContext2D, inner: FigureBox, alpha: number): void {
  ctx.globalAlpha = alpha;
  for (const at of [0.25, 0.5, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(inner.x + inner.w * at, inner.y);
    ctx.lineTo(inner.x + inner.w * at, inner.y + inner.h * 0.55);
    ctx.strokeStyle = at === 0.5 ? PALETTE.gridBeat : PALETTE.grid;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/**
 * The ship, with the shield where it has been sent.
 *
 * At the same height on both phones, which is the whole of what makes them one
 * game rather than two apps: the pair are looking at the same hull from two
 * seats, and a hull at two heights would be two.
 */
function ship(
  ctx: CanvasRenderingContext2D,
  inner: FigureBox,
  skin: typeof P1_SKIN,
  shielded: number,
  age: number,
): void {
  hull(
    ctx,
    { x: inner.x, y: inner.y, w: inner.w, h: inner.h * 0.62 },
    SHIELD_FROM + (SHIELD_TO - SHIELD_FROM) * shielded,
    skin.tint,
    age,
  );
}

/**
 * Where the ship stops and the panel begins, as a lit thread rather than a box.
 *
 * A second rounded rectangle inside the first reads as a phone holding a phone.
 * The panel on the field is the ship seen from inside, and the owner asked for
 * nothing at that join to see (`band-seam.ts`).
 */
function seam(ctx: CanvasRenderingContext2D, inner: FigureBox, skin: typeof P1_SKIN): void {
  ctx.beginPath();
  ctx.moveTo(inner.x, inner.y + inner.h * 0.63);
  ctx.lineTo(inner.x + inner.w, inner.y + inner.h * 0.63);
  ctx.strokeStyle = skin.lip[0];
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * A row of the controls this beat is not about, unlit.
 *
 * A panel with two things on it is a machine with two things on it. The pair
 * are about to meet one that changes every wave, so the two that matter here
 * stand in a panel of others that plainly do something and are not being asked
 * for — which is also what makes *the* button worth shouting about.
 */
function unlitRow(
  ctx: CanvasRenderingContext2D,
  inner: FigureBox,
  at: number,
  skin: typeof P1_SKIN,
): void {
  const y = inner.y + inner.h * at;
  for (const across of [0.26, 0.5, 0.74]) {
    const x = inner.x + inner.w * across;
    const r = inner.w * 0.09;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.9, 0, 0, Math.PI * 2);
    ctx.fillStyle = skin.dead[0];
    ctx.fill();
    ctx.strokeStyle = skin.lip[1];
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
