import { drawTorchRock, halo, PALETTE } from "@neon-spore/render";
import { CRADLE } from "./cradle.js";
import { type QueenCycle, socketDrift, socketScale } from "./queen-cycle.js";
import type { HolderContext } from "./types.js";

/**
 * What every whole-body BULB QUEEN VARIANT shares, so the three drafts differ
 * only in the one thing each is arguing about — how her body admits damage —
 * and not in whether they got the marks, the sockets or the petal row right.
 * The five load-bearing properties live here rather than being re-derived
 * per file: a variant calls these, it does not redraw them.
 */

/** A whole-body draft, shown against the same clock as its two siblings. */
export interface QueenVariant {
  id: string;
  /** Shown on the card. Named the way a player would name it. */
  name: string;
  /** One sentence: what this draft claims about how her body reads. */
  claim: string;
  /** The argument for it, and the argument against. Both, always. */
  note: string;
  draw(ctx: CanvasRenderingContext2D, w: number, h: number, cycle: QueenCycle): void;
}

/**
 * Both marks, through the same call, in the same colour, on the same clock —
 * property 1. Only the pulsing ring differs between them, and that ring is
 * what `showsQueenHint` restricts to player 2's screen in the real game; a
 * card has one screen to draw on, so it is shown here with a label rather
 * than split across two canvases.
 */
export function drawQueenMarks(
  ctx: CanvasRenderingContext2D,
  cx: number,
  markY: number,
  markR: number,
  spacing: number,
  cycle: QueenCycle,
  time: number,
): void {
  for (const side of [-1, 1] as const) {
    // Property 2: on the columns either side of hers, never off-centre.
    const mx = cx + side * spacing;
    ctx.beginPath();
    ctx.arc(mx, markY, markR, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill();
    ctx.strokeStyle = PALETTE.rock;
    ctx.lineWidth = Math.max(1, markR * 0.16);
    ctx.stroke();
    ctx.fillStyle = PALETTE.dim;
    ctx.font = `${Math.round(markR * 1.1)}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", mx, markY + markR * 0.05);

    if (cycle.weakSide === side) {
      const pulse = 0.4 + 0.25 * Math.sin(time * 3);
      ctx.strokeStyle = PALETTE.shieldRim;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(mx, markY, markR * 1.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      halo(ctx, mx, markY, markR * 2.4, PALETTE.shieldRim, pulse * 0.7);
      ctx.fillStyle = PALETTE.shieldRim;
      ctx.font = "9px sans-serif";
      ctx.fillText("P2", mx, markY - markR * 1.9);
    }
  }
}

/**
 * The health row: a slot per starting petal, position rather than count —
 * property 3's other half. The row itself never moves; only how many of its
 * slots are lit does. Sinking is each variant's own job, done by moving the
 * body (and this row along with it) down the card as `cycle.healthShare`
 * falls, so the row stays fixed relative to her and the two readings never
 * contradict each other.
 */
export function drawPetalRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  span: number,
  cycle: QueenCycle,
): void {
  const { petals, startPetals } = cycle;
  const petalR = span * 0.045;
  for (let i = 0; i < startPetals; i++) {
    const px = startPetals === 1 ? x : x - span / 2 + (span / (startPetals - 1)) * i;
    ctx.beginPath();
    ctx.arc(px, y, petalR, 0, Math.PI * 2);
    if (i < petals) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill();
      ctx.strokeStyle = PALETTE.hull;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
    } else {
      ctx.strokeStyle = PALETTE.dim;
      ctx.lineWidth = Math.max(1, petalR * 0.3);
      ctx.stroke();
    }
  }
}

/**
 * One flank socket — CRADLE's own draw (the holder the owner already chose),
 * baseline in all three whole-body drafts. Property 4: the rock inside it is
 * the game's own `drawTorchRock`, at this socket's own radius, so nothing
 * doubles when it later becomes the falling torch. Property 5: `socketScale`
 * takes it to zero and grows it back over the regrow beat, the same share
 * `queenEggGrowShare` gives the real one.
 */
export function drawQueenSocket(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sockX: number,
  sockY: number,
  rockR: number,
  bodyEdgeX: number,
  side: -1 | 1,
  cycle: QueenCycle,
  time: number,
): void {
  const scale = socketScale(cycle, side);
  const drift = socketDrift(cycle, side) * rockR * 0.9 * side;

  const c: HolderContext = {
    ctx,
    w,
    h,
    rockX: sockX + drift,
    rockY: sockY,
    rockR: rockR * scale,
    bodyX: bodyEdgeX,
    bodyY: sockY,
    bodyR: rockR * 1.3,
    drawRock() {
      ctx.save();
      ctx.translate(c.rockX, c.rockY);
      drawTorchRock(ctx, c.rockR, time);
      ctx.restore();
    },
  };

  const release = cycle.releaseSide === side ? cycle.release : 0;
  CRADLE.draw(c, { t: time, beat: cycle.beatFrac, release });
}
