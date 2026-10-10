import type { ControlId } from "@neon-spore/content";
import { snakeRound, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";
import { drawBiteFace, drawSpitFace } from "./snake-button-mouth.js";
import { gape } from "./snake-clock.js";

/**
 * SNAKE's four presses, as faces on the band's own lobes.
 *
 * The round used to draw a slab panel of its own, and the owner asked for its
 * buttons to look like the others (18 September 2026). So the four are `lobe`
 * controls in the sockets `band-control.ts` puts every control in, exactly as
 * THE SCOUT's and THE PULSE's are, and this file draws only what is *on* each
 * face. The socket, the gloss and the tissue around it are not its business.
 *
 * **No face carries a word**, the owner, 10 October 2026: *remove text from
 * control set buttons and make the buttons look like what its doing.* The
 * LEFT, RIGHT, SHOOT and EAT under the pictures went the same day they came,
 * and each picture grew into the room they left.
 *
 * **Player 2's two are a road sign's turn.** An arrow going up and bending
 * off to its side, which is what a quarter turn *relative to the heading* is
 * — the live nose showing which way the body pointed, THE SCOUT's glyph, read
 * as a compass and was taken off. A turn already queued lights its button
 * until the body takes it, so the driver can see the press was heard before
 * the head moves.
 *
 * **Player 1's two are the head doing the thing**: spitting venom, and biting
 * a pod (`snake-button-mouth.ts`). EAT is lit amber for as long as the real
 * mouth stands open — the button *is* the mouth, the way THE SCOUT's MAW is
 * the ship's intake.
 */

export type SnakeLobe = "left" | "right" | "fire" | "maw";

/** Which of SNAKE's four this control is, if any. */
export function snakeLobeOf(id: ControlId): SnakeLobe | null {
  if (id === "snakeLeft") return "left";
  if (id === "snakeRight") return "right";
  if (id === "snakeFire") return "fire";
  if (id === "snakeMaw") return "maw";
  return null;
}

export function drawSnakeLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  which: SnakeLobe,
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const round = snakeRound(world);
  const live = round !== null && round.phase === "play";
  if (which === "left" || which === "right") {
    const dir = which === "left" ? -1 : 1;
    const on = live && round.turn === dir;
    const hex = PALETTE.hull;
    if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
    ctx.fillStyle = on ? hex : skin.dead[0];
    ctx.strokeStyle = hex;
    ctx.lineWidth = STROKE.outline;
    paintLobe(ctx, x, y, r, "both");
    drawTurn(ctx, x, y - r * 0.08, r * TURN, on ? INK : hex, dir);
    return;
  }
  const open = which === "maw" && live ? gape(world.cfg, world.tick, round) : 0;
  const lit = open > 0 && snakeMawLit(world);
  const hex = which === "maw" ? PALETTE.pod : PALETTE.venom;
  if (lit) halo(ctx, x, y, r * 1.8, hex, 0.5);
  ctx.fillStyle = lit ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  if (which === "fire") drawSpitFace(ctx, x, y, r, world, live ? round : null);
  else drawBiteFace(ctx, x, y, r, world, open);
}

/** How much bigger the turn arrow is than it was under a word. */
const TURN = 1.3;

/** The dark the arrow is drawn in on a lit face. */
const INK = "#1B0630";

/**
 * A turn, as the road sign draws it: a stem going up and bending a quarter
 * round to the side the button turns to, with the head on the end. Relative,
 * as the press is — *left* is the body's left, wherever it is going.
 */
function drawTurn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  ink: string,
  dir: -1 | 1,
): void {
  const foot = { x: x - dir * r * 0.18, y: y + r * 0.34 };
  const bend = { x: foot.x, y: y - r * 0.2 };
  const tip = { x: x + dir * r * 0.36, y: y - r * 0.2 };
  const head = r * 0.2;
  ctx.save();
  ctx.strokeStyle = ink;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, r * 0.15);
  ctx.beginPath();
  ctx.moveTo(foot.x, foot.y);
  ctx.lineTo(bend.x, bend.y + r * 0.16);
  ctx.quadraticCurveTo(bend.x, bend.y, bend.x + dir * r * 0.16, bend.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.moveTo(tip.x - dir * head, tip.y - head);
  ctx.lineTo(tip.x, tip.y);
  ctx.lineTo(tip.x - dir * head, tip.y + head);
  ctx.stroke();
  ctx.restore();
}

/**
 * Whether the EAT face is lit: the round in play and its press still answered.
 * The mouth's own gape says whether it is open. This says only whether the
 * button under the thumb is the thing that opened it.
 */
export function snakeMawLit(world: World): boolean {
  const round = snakeRound(world);
  return round !== null && round.phase === "play";
}
