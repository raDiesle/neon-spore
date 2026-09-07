import {
  type ChoirSide,
  type Creature,
  choirArmed,
  choirOnField,
  type World,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { showsCannon } from "./view-role.js";

/**
 * **THE CHOIR's two arrows**: the way to open a membrane on a device that
 * cannot tell you it has been shaken.
 *
 * There is no reliable way to ask a browser whether a shake is available.
 * `"DeviceMotionEvent" in window` is true on a desktop with no accelerometer
 * in it and no event ever arrives; iOS gates the whole thing behind a
 * permission that has to be asked for from a tap and can be refused; a
 * refusal and an absent sensor are the same silence. So the game does not ask.
 * **Both ways in are drawn, always**, and the pilot uses whichever their hands
 * and their phone can manage — the owner's own decision when the question was
 * put to him.
 *
 * **They are handles, not buttons**, and that is why they are here rather than
 * in `controls.ts`. A press is not the gesture; *carrying something outward*
 * is, and the game already has one word for a hand that takes hold of a thing
 * on the field and moves it — THE MAZE's string, THE WARDEN's rope, THE LID's
 * cord (`handles.ts`, `DragTarget`). Making them lobes would have meant a
 * control set of their own, a panel a wave has to name, and a gesture that is
 * two taps rather than two pulls.
 *
 * **They stand against the walls of the field**, one at each edge, level with
 * each other and clear of the band: the owner asked for them at the screen's
 * opposite borders, and the direction each one has to be carried is *out*,
 * which is only legible if the thing itself is already at the edge it points
 * over.
 *
 * **Player 1's screen only.** The pilot is the seat that shakes the phone, so
 * the pilot is the seat that gets the alternative; a navigator's screen with
 * arrows on it would be a control that answers nothing (`choirArrowHeard`
 * refuses seat 2 outright).
 */

/** Where the two stand, as shares of the play area's height and the screen's
 * width. Level, and low enough that neither sits under the hull bar. */
const ARROW_Y = 0.52;
const ARROW_INSET = 0.11;
/** The grab circle, as a share of the screen width. Big: the owner asked for
 * these to be prominent, and a handle a thumb misses is a handle that reads as
 * a control that does not work. */
const ARROW_R = 0.095;

/** Whether this screen draws and answers the arrows at all. One call, asked by
 * the drawing and by the hit test, so a handle can never be drawn where
 * nothing answers it. */
export function showsChoirArrows(l: Layout, creatures: readonly Creature[]): boolean {
  return showsCannon(l.role) && choirOnField(creatures);
}

/** Where one arrow rests. The resting circle is also the grab circle — an
 * arrow does not travel, it is a switch a hand throws, so there is no swung
 * position for `handles.ts` to have to distinguish. */
export function choirArrowCircle(l: Layout, side: ChoirSide): Circle {
  const r = l.width * ARROW_R;
  const x = side === -1 ? l.width * ARROW_INSET : l.width * (1 - ARROW_INSET);
  return { x, y: l.bandTop * ARROW_Y, r };
}

/**
 * Both arrows, drawn.
 *
 * **The one still to be carried is the lit one.** With nothing armed both
 * pulse together and either may be taken first; once one is out, that one goes
 * dark and its partner keeps pulsing on its own — so what the screen says at
 * every instant is *this is the next thing to do*, rather than leaving the
 * pilot to remember which hand they have already used.
 *
 * The pulse is on the wall clock, which render is free to use and the
 * simulation is not.
 */
export function drawChoirArrows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  time: number,
): void {
  if (!showsChoirArrows(l, world.creatures)) return;
  const armed = choirArmed(world);
  for (const side of [-1, 1] as const) {
    drawArrow(ctx, l, side, armed !== side, time);
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: ChoirSide,
  live: boolean,
  time: number,
): void {
  const { x, y, r } = choirArrowCircle(l, side);
  // The pulse: the chevrons breathe outward and the light behind them breathes
  // with them, so what is animated is the *direction* rather than the size of
  // a button. A dead arrow holds still, which is the plainest way a picture
  // has of saying this one is done.
  const beat = live ? (Math.sin(time * 4.4) + 1) / 2 : 0;
  const hue = live ? PALETTE.hull : PALETTE.dim;
  const rim = live ? PALETTE.hullRim : PALETTE.dim;

  ctx.save();
  if (live) halo(ctx, x, y, r * 1.9, hue, 0.16 + 0.14 * beat);
  // The socket, so the thing reads as hardware grown out of the ship rather
  // than as a sticker on the field — the same lip every lobe on the band
  // stands in, drawn at this file's own size.
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(7,4,15,.62)";
  ctx.fill();
  ctx.strokeStyle = hue;
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  ctx.globalAlpha = live ? 0.85 : 0.4;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Three chevrons pointing the way the hand has to go, the outermost one
  // faintest — a picture of travel rather than of a place.
  ctx.strokeStyle = rim;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 3; i++) {
    const push = (i - 1) * r * 0.34 + beat * r * 0.16;
    const cx = x + side * push;
    ctx.globalAlpha = (live ? 0.9 : 0.35) * (1 - i * 0.24);
    ctx.lineWidth = Math.max(1.6, r * 0.11);
    ctx.beginPath();
    ctx.moveTo(cx - side * r * 0.2, y - r * 0.34);
    ctx.lineTo(cx + side * r * 0.2, y);
    ctx.lineTo(cx - side * r * 0.2, y + r * 0.34);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // And the word, because a chevron alone says *that way* and not *carry me*.
  // SWIPE is the owner's own word for it.
  ctx.font = '700 11px "Courier New",monospace';
  ctx.textAlign = "center";
  ctx.fillStyle = rim;
  ctx.globalAlpha = live ? 0.9 : 0.4;
  ctx.fillText("SWIPE", x, y + r * 1.42);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.restore();
}
