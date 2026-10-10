import type { ControlId } from "@neon-spore/content";
import { type SnakeState, snakeResting, snakeRound, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import type { SeatSkin } from "./seat-skin.js";
import { flick, gape } from "./snake-clock.js";
import { drawSnakeHead } from "./snake-head.js";

/**
 * SNAKE's four presses, as faces on the band's own lobes.
 *
 * The round used to draw a slab panel of its own, and the owner asked for its
 * buttons to look like the others (18 September 2026). So the four are `lobe`
 * controls in the sockets `band-control.ts` puts every control in, exactly as
 * THE SCOUT's and THE PULSE's are, and this file draws only what is *on* each
 * face. The socket, the gloss and the tissue around it are not its business.
 *
 * **Every face says its verb in a word**, the owner, 10 October 2026: *make
 * the buttons bigger and more understandable what each does.* They are big
 * on this round's band (`snake-layout.ts`), and each carries one picture over
 * one word: LEFT, RIGHT, SHOOT, EAT.
 *
 * **Player 2's two are a road sign's turn.** An arrow going up and bending
 * off to its side, which is what a quarter turn *relative to the heading* is
 * — the live nose showing which way the body pointed, THE SCOUT's glyph, read
 * as a compass and was taken off. A turn already queued lights its button
 * until the body takes it, so the driver can see the press was heard before
 * the head moves.
 *
 * **Player 1's two carry the head itself, and their verb.** SHOOT is the head with a bolt of
 * venom standing off its snout, and the bolt fades while the trigger rests;
 * EAT is the same head with its jaws at the gape the mouth is actually at
 * (`snake-clock.ts`), lit amber for as long as it stands open — the button
 * *is* the mouth, the way THE SCOUT's MAW is the ship's intake. Both are drawn
 * by the head's own drawer, so the thing under the thumb and the thing on the
 * arena are the same picture at two sizes.
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

/** The head on a button, as an arena whose one tile is this share of the
 * radius: the head's drawer sizes everything off the tile. */
const HEAD_TILE = 1.15;

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
    drawTurn(ctx, x, y - r * WORD_ROOM, r, on ? INK : hex, dir);
    drawWord(ctx, x, y + r * WORD_Y, r, dir === -1 ? "LEFT" : "RIGHT", on);
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
  const tile = r * HEAD_TILE;
  const arena = { x: 0, y: 0, tile, cols: 1, rows: 1 };
  // The picture stands in the top of the face and the word under it. The
  // head sits a shade low in that space, so the venom ahead of it, or the
  // open jaws, stand in its middle.
  const top = y - r * WORD_ROOM;
  const headY = top + (which === "fire" ? r * 0.28 : r * 0.1);
  if (which === "fire")
    drawVenom(ctx, x, top, r, live && round !== null ? restLeft(world, round) : 1);
  drawSnakeHead(ctx, arena, { x, y: headY }, 0, -1, open, flick(world.tick));
  drawWord(ctx, x, y + r * WORD_Y, r, which === "fire" ? "SHOOT" : "EAT", lit);
}

/** How far the picture on a face is lifted to leave room for the word. */
const WORD_ROOM = 0.2;

/** Where the word stands below the face's middle, in radii. */
const WORD_Y = 0.56;

/** The dark the picture and the word are drawn in on a lit face. */
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
 * The button's verb on its own face: **SHOOT** and **EAT**, the words the
 * field's hint says over the item (`boss-cue-read-g.ts`), and **LEFT** and
 * **RIGHT**. The owner, 25 September 2026: *the controls button is not clear
 * if its eating or shooting.* A dark copy under it, one pixel down, keeps it
 * readable over the lit fill as well as the dead one.
 */
function drawWord(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  word: string,
  lit: boolean,
): void {
  const size = Math.max(7, Math.round(r * 0.34));
  ctx.save();
  ctx.font = `800 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.fillText(word, x + 1, y + 1);
  ctx.fillStyle = lit ? INK : PALETTE.text;
  ctx.fillText(word, x, y);
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

/** How much of the trigger's rest is still to run, 0 ready to 1 just fired. */
function restLeft(world: World, round: SnakeState): number {
  if (!snakeResting(world, round)) return 0;
  const since = world.beat - round.shotBeat;
  return Math.max(0, Math.min(1, 1 - since / world.cfg.snakeFireRestBeats));
}

/**
 * The bolt ahead of the snout: two chevrons of venom pointing up and out of
 * the face, the further one fainter — PINBALL's muzzle in the snake's own
 * colour. They fade with the rest, so a trigger that will refuse the press
 * shows an empty snout, and come back as the rest runs out.
 */
function drawVenom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rest: number,
): void {
  const strength = 1 - rest;
  if (strength <= 0.02) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.venom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 2; i++) {
    const cy = y - r * (0.22 + i * 0.26);
    const half = r * 0.3;
    const dip = r * 0.16;
    ctx.globalAlpha = (i === 0 ? 0.95 : 0.5) * strength;
    ctx.lineWidth = Math.max(1.2, r * (i === 0 ? 0.13 : 0.1));
    ctx.beginPath();
    ctx.moveTo(x - half, cy + dip);
    ctx.lineTo(x, cy);
    ctx.lineTo(x + half, cy + dip);
    ctx.stroke();
  }
  ctx.restore();
}
