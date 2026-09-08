import type { PinballState, PinPiece } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { drawRockBody } from "./meteor.js";
import { PALETTE } from "./palette.js";
import type { Table } from "./pinball-table.js";
import { pinAt } from "./pinball-table.js";
import { drawPodBody } from "./pods.js";

/**
 * What stands on PINBALL's table, drawn as things the pair already know.
 *
 * **The two kinds have to look nothing like each other**, and that is the
 * owner's instruction rather than a taste: *the required stones to collect must
 * look visually more attractive, and stones which are not required more boring,
 * like meteors.* Only targets end a round (Peggle's orange rule), so the board
 * is really two boards laid over each other — the one that matters and the one
 * that is in the way — and a table where both were the same blob asked the pair
 * to read a colour at a glance instead of a shape.
 *
 * So they are drawn by the game's own two answers to exactly that question. A
 * piece that is in the way is a **meteor** (`drawRockBody`): grey, faceted,
 * spinning slowly, dead — the thing this game has always meant by "you cannot
 * do anything with this". A piece that must go is a **pod** (`drawPodBody`):
 * amber, breathing, haloed — the thing it has always meant by "go and get
 * this". Neither is invented here and neither can drift, because both are the
 * calls the field makes.
 *
 * **A block is the same two bodies stretched.** The physics box is wide and
 * flat, so a rock is squashed into it and a target block is a *chain* of pods
 * across it — overlapping, so it reads as one mass rather than as three beads
 * on a shelf.
 *
 * **What the shot has already touched burns.** A hit piece stays standing until
 * the ball is done (`PinballState.lit`, and it is a physics decision before it
 * is a scoring one), so it is drawn lit rather than gone: the body it always
 * was, with the take's own light over it.
 */

/** Which pod a target wears. One kind for the whole table: the mark at a pod's
 * centre says which of the three it is, and on this board there is nothing for
 * that distinction to mean. */
const POD_KIND = "mend" as const;

/** How much bigger a target is drawn than the box it collides with. A pod that
 * exactly filled its own radius read as smaller than the rock beside it. */
const POD_MUL = 1.18;

/** Everything still standing, with what this shot has touched burning. */
export function drawPinPieces(
  ctx: CanvasRenderingContext2D,
  t: Table,
  state: PinballState,
  time: number,
): void {
  for (let i = 0; i < state.pieces.length; i++) {
    const piece = state.pieces[i];
    if (piece === undefined || state.alive[i] !== true) continue;
    drawPiece(ctx, t, piece, state.lit.includes(i), time, i);
  }
}

function drawPiece(
  ctx: CanvasRenderingContext2D,
  t: Table,
  piece: PinPiece,
  lit: boolean,
  time: number,
  seed: number,
): void {
  const at = pinAt(t, piece.xMilli, piece.yMilli);
  const halfW = (piece.wMilli * t.tile) / 1000;
  const halfH = ((piece.kind === "peg" ? piece.wMilli : piece.hMilli) * t.tile) / 1000;
  if (piece.target) drawTarget(ctx, at.x, at.y, halfW, halfH, piece.kind, time, seed);
  else drawDull(ctx, at.x, at.y, halfW, halfH, time, seed);
  if (lit) drawTaken(ctx, at.x, at.y, Math.max(halfW, halfH), time);
}

/**
 * A piece that does not have to go: a rock, and nothing else.
 *
 * No halo of its own beyond the stone's, no pulse and no beat — the whole
 * instruction is that it is *boring*, and a rock is the game's word for that.
 * `holes: 0`, because nothing has shot it.
 */
function drawDull(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  time: number,
  seed: number,
): void {
  const r = Math.min(halfW, halfH);
  ctx.save();
  ctx.translate(x, y);
  // A block is the same stone pulled wide. Scaled rather than redrawn, so a
  // wall and a peg are visibly the same material.
  if (halfW !== halfH) ctx.scale(halfW / r, halfH / r);
  drawRockBody(ctx, 0, 0, r, time + seed * 0.7, seed * 7 + 3, 0);
  ctx.restore();
}

/**
 * A piece that must go: a pod, breathing, in the amber this game reserves for
 * the thing you are meant to want.
 *
 * The seed is added to the clock rather than to a phase, because a pod's whole
 * animation runs off one `t` — so a table of five targets is five pods out of
 * step with each other and not one shape beating five times at once.
 */
function drawTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  kind: PinPiece["kind"],
  time: number,
  seed: number,
): void {
  const t = time + seed * 0.31;
  if (kind === "peg") {
    drawPodBody(ctx, x, y, halfW * POD_MUL, t, POD_KIND);
    return;
  }
  // A target block: a chain of pods across it, spaced closer than their own
  // width so the row reads as one body rather than as beads on a shelf.
  const r = halfH * POD_MUL;
  const count = Math.max(2, Math.round(halfW / Math.max(1, halfH * 0.9)));
  for (let i = 0; i < count; i++) {
    const at = count === 1 ? 0 : -1 + (2 * i) / (count - 1);
    drawPodBody(ctx, x + at * (halfW - r * 0.5), y, r, t + i * 0.4, POD_KIND);
  }
}

/**
 * The light on something this shot has already taken.
 *
 * It is still standing — the ball has to be able to bounce off it again — so
 * this is a coat over the body rather than a body of its own: the green the
 * game uses for a thing that went right, pulsing fast enough to read as *just
 * now* rather than as a state.
 */
function drawTaken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const beat = 0.55 + 0.45 * Math.sin(time * 9);
  halo(ctx, x, y, r * (2.4 + 0.6 * beat), PALETTE.good, 0.3 + 0.3 * beat);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.35 * beat;
  ctx.fillStyle = PALETTE.goodRim;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
