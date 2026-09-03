import { PALETTE } from "@neon-spore/render";
import type { QueenCycle } from "./queen-cycle.js";
import { drawPetalRow, drawQueenMarks, drawQueenSocket } from "./queen-shared.js";

/**
 * The body all three whole-body BULB QUEEN drafts start from, apart from the
 * parts `queen-shared.ts` draws — so a draft is only the one thing it argues
 * about, and the axis stays an axis.
 *
 * It is its own file rather than the bottom of `queen-shared.ts` because that
 * file would have gone past the 250-line limit `packages/sim/test/limits.test.ts`
 * holds every source file to.
 */

/**
 * The share of the card a queen's body takes at full health, and how far she
 * sinks as it falls. Baseline for all three drafts; WITHDRAWAL multiplies the
 * first two and nothing touches the third.
 */
const SHELL_RX = 0.24;
const SHELL_RY = 0.14;
const SINK = 0.16;

/** Where a whole-body draft's parts land, once the sink has been applied. */
export interface QueenGeom {
  /** The card, because a socket is drawn against it rather than against her. */
  w: number;
  h: number;
  cx: number;
  cy: number;
  /** Her body's radii. WITHDRAWAL narrows and heightens these; the other two do not. */
  rx: number;
  ry: number;
  /** The row of two marks below her. */
  markY: number;
  markR: number;
  /** 0 at full health, 1 at none — the number every draft is drawing. */
  hurt: number;
}

/**
 * The baseline body, sunk for its health. `rxMul` and `ryMul` are the one hook
 * a draft has on the geometry itself, and only WITHDRAWAL uses them.
 */
export function queenGeom(
  w: number,
  h: number,
  cycle: QueenCycle,
  rxMul = 1,
  ryMul = 1,
): QueenGeom {
  const hurt = 1 - cycle.healthShare;
  const cy = h * 0.4 + hurt * h * SINK;
  const rx = w * SHELL_RX * rxMul;
  const ry = h * SHELL_RY * ryMul;
  return { w, h, cx: w * 0.5, cy, rx, ry, markY: cy + ry * 1.7, markR: h * 0.075, hurt };
}

/**
 * The three ways a draft is allowed to differ from the baseline body — and the
 * whole of what the axis is arguing about. Everything else is `drawQueenShell`'s.
 */
export interface QueenShellDraft {
  /** Drawn between the marks and the shell, so it reads as coming from inside — UNDERGLOW's ember. */
  behind?(ctx: CanvasRenderingContext2D, geom: QueenGeom): void;
  /**
   * Her outline, when a draft wants it to answer to health rather than sit at
   * rock. `alpha` is left out unless it is asked for: a bare `globalAlpha = 1`
   * around every stroke is two state writes per card per frame that say nothing.
   */
  rim?(geom: QueenGeom): { style: string; alpha?: number };
  /** Drawn on the shell and under the sockets — HAIRLINE's cracks. */
  onShell?(ctx: CanvasRenderingContext2D, geom: QueenGeom): void;
}

/**
 * The whole baseline body: the two marks, the faceted rock shell, the two flank
 * sockets and the petal row above her.
 *
 * This was twenty-five byte-identical lines in each of the three drafts, which
 * meant the axis was only honest by coincidence — a gradient stop or a socket
 * span edited in one file would have made two drafts differ in something the
 * page is not asking about, and nothing would have caught it. A draft now says
 * only the thing it is for.
 */
export function drawQueenShell(
  ctx: CanvasRenderingContext2D,
  geom: QueenGeom,
  cycle: QueenCycle,
  draft: QueenShellDraft = {},
): void {
  const { w, h, cx, cy, rx, ry } = geom;

  drawQueenMarks(ctx, cx, geom.markY, geom.markR, rx * 0.75, cycle, cycle.t);
  draft.behind?.(ctx, geom);

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
  grad.addColorStop(0, "#6B707E");
  grad.addColorStop(0.55, "#3C3F49");
  grad.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = grad;
  ctx.fill();
  const rim = draft.rim?.(geom);
  ctx.strokeStyle = rim?.style ?? PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  if (rim?.alpha === undefined) {
    ctx.stroke();
  } else {
    ctx.globalAlpha = rim.alpha;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  draft.onShell?.(ctx, geom);

  const rockR = h * 0.1;
  for (const side of [-1, 1] as const) {
    // The socket column is fixed at the *unsqueezed* half-width, so WITHDRAWAL's
    // flank moves in to meet it rather than dragging it along: a released rock
    // still falls from the column it started in rather than one that has been
    // quietly sliding all fight.
    const sockX = cx + side * w * SHELL_RX * 1.55;
    drawQueenSocket(ctx, w, h, sockX, cy, rockR, cx + side * rx * 0.6, side, cycle, cycle.t);
  }

  drawPetalRow(ctx, cx, cy - ry * 1.9, rx * 1.3, cycle);
}
