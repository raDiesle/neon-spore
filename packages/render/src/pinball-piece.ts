import { blobPath, LIGHT_HALF } from "@neon-spore/content";
import type { PinballState, PinPiece } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { litRound } from "./key-light.js";
import { PALETTE } from "./palette.js";
import type { Table } from "./pinball-table.js";
import { pinAt } from "./pinball-table.js";

/**
 * What stands on PINBALL's table, drawn as something alive.
 *
 * The pieces were circles and rounded boxes with one highlight each: correct,
 * legible, and the only screen in the game where nothing breathed. This round
 * is not the field and it is still the same game — so a peg is a **cell**, a
 * closed contour with lobes on it (`blobPath`, the same call every creature on
 * the field is drawn through), lit from inside and haloed from outside, and a
 * block is a slab of the same tissue stretched flat.
 *
 * **The colours are the ones the game already owns.** Plain pieces are the
 * shield's cyan, targets are `pod` amber — which is what this game has always
 * meant by "here, this is the thing" — and a piece the ball has touched this
 * shot burns to `good` green until the shot ends and it goes. Nothing here
 * invents a colour; what is new is that each of them now has a dark core and a
 * bright skin instead of one flat fill, which is the hull's own recipe
 * (`hull.ts`: dark where it is thick, bright at the skin).
 *
 * **The wobble runs on wall-clock time and the seed comes off the board
 * index**, so a table of forty cells is forty different creatures rather than
 * one shape stamped forty times — and none of it reaches the simulation, which
 * is why a wobble is allowed to be a float at all.
 */

/** Body, skin and halo for one state a piece can be in. */
interface Coat {
  core: string;
  body: string;
  rim: string;
}

const PLAIN: Coat = { core: PALETTE.cyanDark, body: PALETTE.shield, rim: PALETTE.shieldRim };
const TARGET: Coat = { core: PALETTE.podDark, body: PALETTE.pod, rim: PALETTE.podRim };
const LIT: Coat = { core: "#06301C", body: PALETTE.good, rim: PALETTE.goodRim };

/** How far a cell's contour departs from a circle, and how fast it breathes. */
const LOBE_DEPTH = 0.11;
const WOBBLE = 0.06;

function coat(piece: PinPiece, lit: boolean): Coat {
  return lit ? LIT : piece.target ? TARGET : PLAIN;
}

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
  const c = coat(piece, lit);
  // A target pulses and a plain piece does not: the one thing that has to be
  // findable across a crowded board is the thing the round is about.
  const pulse = piece.target || lit ? 0.5 + 0.5 * Math.sin(time * 2.4 + seed) : 0;
  if (piece.kind === "peg") {
    drawCell(ctx, t, at.x, at.y, (piece.wMilli * t.tile) / 1000, c, time, seed, pulse);
    return;
  }
  drawSlab(
    ctx,
    t,
    at.x,
    at.y,
    (piece.wMilli * t.tile) / 1000,
    (piece.hMilli * t.tile) / 1000,
    c,
    time,
    seed,
    pulse,
  );
}

/**
 * One cell. Halo, membrane, key light, rim — in that order, because the halo
 * is behind the body and the rim light lies on the silhouette, which is what
 * `hull.ts` does over the ship and `creatures.ts` over everything on the field.
 */
function drawCell(
  ctx: CanvasRenderingContext2D,
  t: Table,
  x: number,
  y: number,
  r: number,
  c: Coat,
  time: number,
  seed: number,
  pulse: number,
): void {
  halo(ctx, x, y, r * 2.1, c.body, 0.16 + 0.22 * pulse);
  const path = new Path2D(blobPath(x, y, r, r, 3, LOBE_DEPTH, WOBBLE, time, seed, 24));
  const skin = ctx.createRadialGradient(x - r * 0.3, y - r * 0.34, r * 0.1, x, y, r * 1.05);
  skin.addColorStop(0, c.rim);
  skin.addColorStop(0.42, c.body);
  skin.addColorStop(1, c.core);
  ctx.fillStyle = skin;
  ctx.fill(path);
  litRound(ctx, x, y, r, LIGHT_HALF.creature);
  ctx.save();
  strokeGlow(ctx, path, c.rim, Math.max(1, t.tile * 0.045), 0.6 + 0.5 * pulse);
  ctx.restore();
  // The nucleus. It is what makes a field of these read as bodies rather than
  // as beads, and on a target it is the thing that beats.
  ctx.save();
  ctx.globalAlpha = 0.45 + 0.4 * pulse;
  ctx.fillStyle = c.rim;
  ctx.beginPath();
  ctx.arc(x, y, r * (0.2 + 0.1 * pulse), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The same tissue stretched flat: a wall of it, with a lit ridge along the top. */
function drawSlab(
  ctx: CanvasRenderingContext2D,
  t: Table,
  x: number,
  y: number,
  halfW: number,
  halfH: number,
  c: Coat,
  time: number,
  seed: number,
  pulse: number,
): void {
  halo(ctx, x, y, Math.max(halfW, halfH) * 1.8, c.body, 0.12 + 0.18 * pulse);
  const path = new Path2D(blobPath(x, y, halfW, halfH, 4, 0.06, 0.03, time, seed + 7, 28));
  const skin = ctx.createLinearGradient(x, y - halfH, x, y + halfH);
  skin.addColorStop(0, c.rim);
  skin.addColorStop(0.35, c.body);
  skin.addColorStop(1, c.core);
  ctx.fillStyle = skin;
  ctx.fill(path);
  ctx.save();
  strokeGlow(ctx, path, c.rim, Math.max(1, t.tile * 0.04), 0.5 + 0.5 * pulse);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = c.rim;
  ctx.beginPath();
  ctx.ellipse(x, y - halfH * 0.35, halfW * 0.72, halfH * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
