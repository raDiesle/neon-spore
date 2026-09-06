import { CLAW_POD, CLAW_ROCK, type ClawState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CLAW's machinery, drawn: the rail, the sockets under it, and the claw
 * itself hanging between the two.
 *
 * **Slabs and glyphs, never blobs** (`docs/spec/interludes.md`). Everything on
 * this page is drawn corner to corner with no smoothing and no wobble, which
 * is the same decision the shape sheet's own card made about this round and
 * for the same reason: the pilot is working a *machine* over a field of
 * wreckage, and a grown outline would be a creature holding something
 * (`tools/shape-sheet/src/drafts/machined.ts`).
 *
 * Its own file and not `claw-round.ts`, for the reason `pinball-table.ts` is
 * not `pinball-round.ts`: next door is the whole stage — the title, the tally,
 * the panel, the verdict — and this is the one picture inside it that both
 * screens share the frame of and disagree about the contents of.
 */

/** Where the rig stands on the stage. Worked out once and handed to each pass,
 * so nothing draws a socket the claw cannot reach. */
export interface Rig {
  /** Left edge of socket 0 and the width of one. */
  left: number;
  cellW: number;
  /** How many sockets there are — the field's own length, never re-derived. */
  cells: number;
  /** The rail's line, and the top of the sockets. */
  railY: number;
  socketTop: number;
  socketH: number;
}

export function clawRig(l: Layout, cells: number): Rig {
  const pad = Math.max(10, l.width * 0.05);
  const cellW = (l.width - pad * 2) / Math.max(1, cells);
  // Deep enough that a socket reads as a hole with something down it rather
  // than as a box in a row of boxes: at nine across on a phone a cell is under
  // forty pixels wide, and a square one is a chequerboard — which is the one
  // thing this round's picture must not look like.
  const socketH = Math.min(cellW * 2.2, l.playHeight * 0.26);
  return {
    left: pad,
    cellW,
    cells,
    railY: l.playHeight * 0.3,
    socketTop: l.playHeight * 0.52,
    socketH,
  };
}

/** The middle of a socket, across. */
export function clawCellX(rig: Rig, cell: number): number {
  return rig.left + (cell + 0.5) * rig.cellW;
}

/**
 * The rail: one hard line across the stage with a stop at each end.
 *
 * It is the hull by another name — the claw slides along it with the cannon's
 * exact verb — so it is drawn as a made thing standing across the picture
 * rather than as a surface anything lives on.
 */
export function drawClawRail(ctx: CanvasRenderingContext2D, rig: Rig): void {
  const right = rig.left + rig.cellW * rig.cells;
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(rig.left, rig.railY);
  ctx.lineTo(right, rig.railY);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.gridBeat;
  ctx.lineWidth = 2;
  for (const x of [rig.left, right]) {
    ctx.beginPath();
    ctx.moveTo(x, rig.railY - 9);
    ctx.lineTo(x, rig.railY + 9);
    ctx.stroke();
  }
}

/**
 * The sockets, and whatever this screen is allowed to see in them.
 *
 * **There are no letters and no numbers on it, and that is the round.** THE
 * FLEET's chart is lettered across and numbered down on purpose, so a pair can
 * collapse a direction into a coordinate and say it once; this one is a row of
 * identical holes, so the only thing either of them can say is which way and
 * how many — and the wrecks move, so they have to say it again
 * (`sim/claw.ts`).
 *
 * `wrecks` is whether this seat is shown the contents. Player 2's screen has
 * them; player 1's has the sockets and the dark inside them, which is exactly
 * as much as the machine's operator is given.
 */
export function drawClawSockets(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  round: ClawState,
  wrecks: boolean,
): void {
  for (let i = 0; i < rig.cells; i++) {
    const x = rig.left + i * rig.cellW;
    const w = Math.max(1, rig.cellW - 3);
    ctx.fillStyle = "#0C0A1C";
    ctx.fillRect(x + 1.5, rig.socketTop, w, rig.socketH);
    ctx.strokeStyle = PALETTE.grid;
    ctx.lineWidth = 1.4;
    ctx.strokeRect(x + 2, rig.socketTop + 0.5, Math.max(1, w - 1), rig.socketH - 1);
    if (!wrecks) continue;
    // Low in the socket, not centred in it: a wreck is buried, and a mark
    // floating in the middle of a deep hole reads as a label on the hole.
    drawWreck(ctx, round.cells[i] ?? 0, x + 1.5 + w / 2, rig.socketTop + rig.socketH * 0.62, w);
  }
}

/**
 * Whatever is in a socket, or nothing at all — the one call that turns a hold
 * into a picture, so the socket and the claw carrying one up cannot disagree
 * about what a pod looks like.
 */
export function drawWreck(
  ctx: CanvasRenderingContext2D,
  hold: number,
  cx: number,
  cy: number,
  w: number,
): void {
  if (hold === CLAW_POD) drawPod(ctx, cx, cy, w);
  if (hold === CLAW_ROCK) drawRock(ctx, cx, cy, w);
}

/** A pod in a socket: the amber this game already spends on "here, this is the
 * thing", cut square because nothing in a round is grown. */
function drawPod(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number): void {
  const r = w * 0.28;
  ctx.fillStyle = PALETTE.podDark;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
  ctx.fillStyle = PALETTE.podRim;
  ctx.fillRect(cx - r * 0.34, cy - r * 0.34, r * 0.68, r * 0.68);
}

/** And a rock: the same square with the light off it, in the colour a dead
 * rock already has on the field. */
function drawRock(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number): void {
  const r = w * 0.28;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
  ctx.beginPath();
  ctx.moveTo(cx - r, cy - r);
  ctx.lineTo(cx + r, cy + r);
  ctx.moveTo(cx + r, cy - r);
  ctx.lineTo(cx - r, cy + r);
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

/**
 * The claw itself: a stem down from the rail, a bar across it, and two fingers
 * that shut as it goes down.
 *
 * `drop` is 0 with the claw up on the rail and 1 with it at the bottom of a
 * socket, and the fingers close on the same number — one gesture, so the
 * picture cannot show a hand shut around nothing on its way down. It is read
 * off the beat of the last grab rather than held in a field of its own, which
 * is what keeps a restart from leaving one open (`sim/claw.ts`, `clawDown`).
 */
export function drawClaw(
  ctx: CanvasRenderingContext2D,
  rig: Rig,
  cell: number,
  drop: number,
  /**
   * What it is carrying, and it is drawn **between the fingers** rather than
   * only named in a caption under the socket. Both seats see it, which is the
   * one piece of the wreck field player 1 is ever given: a claw that came up
   * and said nothing is a round with no feedback in it for the seat that
   * cannot see, and a word alone leaves him reading rather than watching.
   */
  hold = 0,
): void {
  const x = clawCellX(rig, cell);
  const bottom = rig.socketTop + rig.socketH * 0.55;
  const hub = rig.railY + (bottom - rig.railY) * drop;
  const bar = Math.min(rig.cellW * 0.42, 26);
  const reach = bar * 1.5;

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, rig.railY);
  ctx.lineTo(x, hub);
  ctx.stroke();

  // The carriage on the rail. It is what the pair is really moving, and it
  // stays up there whatever the fingers are doing.
  ctx.fillStyle = PALETTE.hull;
  ctx.fillRect(x - bar * 0.7, rig.railY - 6, bar * 1.4, 12);

  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - bar, hub);
  ctx.lineTo(x + bar, hub);
  ctx.stroke();

  // The gape is in the contour and never in a rotation: a finger that swung
  // would be a hinge, and this is a linkage. Open is wide and out, shut is
  // narrow and down, and the one number carries both.
  const shut = drop;
  // What it has hold of, drawn before the fingers so they close over it — a
  // wreck in front of the hand is a hand that has already dropped it, which is
  // the note `tools/director/src/holders/crane.ts` made about the same picture.
  if (hold !== 0 && drop > 0) drawWreck(ctx, hold, x, hub + reach * 0.62, bar * 1.6);
  for (const side of [-1, 1] as const) {
    ctx.beginPath();
    ctx.moveTo(x + side * bar, hub);
    ctx.lineTo(x + side * bar * (1 - shut * 0.55), hub + reach * 0.55);
    ctx.lineTo(x + side * bar * (0.55 - shut * 0.45), hub + reach);
    ctx.stroke();
  }
}
