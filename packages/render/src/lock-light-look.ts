import { arcFromTop } from "./arc-from-top.js";
import { PALETTE } from "./palette.js";

/**
 * THE LOCK's light, as the record VERSUS offers answers through
 * (`ship:lock-light`, opened 19 October 2026). The owner asked for the lock to
 * rest four seconds after it lands a shot (`sim/lock-rest.ts`), and for a
 * small light on the ship that says when it is ready again, so that nobody has
 * to hold a body to find out.
 *
 * The shipped answer is a lamp set in the skin under the cannon's mouth: lit
 * in the hand's amber when a lock is ready, dark with an amber arc filling
 * round it while it rests. It rides with the cannon, because that is where the
 * pilot is already looking.
 *
 * Its own file, importing nothing it would have to draw with but the palette and
 * `arcFromTop`,
 * so a candidate can reach it without the hull's whole import graph.
 */
export interface LockLightAt {
  /** The cannon lobe's top, on the membrane. */
  readonly x: number;
  readonly y: number;
  readonly tile: number;
  /** How far the rest has run, 0 to 1. One is a lock ready to take. */
  readonly charge: number;
  /** Seconds, the host's clock, and where in the beat it is. */
  readonly time: number;
  readonly beatPhase: number;
  /** The membrane's height at any x, for an answer laid along the hull. */
  readonly surface: (x: number) => number;
}

export interface LockLightLook {
  paint: (ctx: CanvasRenderingContext2D, at: LockLightAt) => void;
}

/** How far under the lobe's top the lamp is set, and how big, in tiles. */
const DROP = 0.62;
const RADIUS = 0.13;

function paintLamp(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const x = at.x;
  const y = at.y + at.tile * DROP;
  const r = at.tile * RADIUS;
  ctx.save();
  ctx.fillStyle = "rgba(10, 6, 20, 0.85)";
  ctx.beginPath();
  ctx.arc(x, y, r * 1.35, 0, Math.PI * 2);
  ctx.fill();
  if (at.charge >= 1) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = PALETTE.pod;
    ctx.lineWidth = Math.max(1, r * 0.45);
    ctx.beginPath();
    arcFromTop(ctx, x, y, r, at.charge);
    ctx.stroke();
  }
  ctx.restore();
}

export const LOCK_LIGHT: LockLightLook = { paint: paintLamp };
