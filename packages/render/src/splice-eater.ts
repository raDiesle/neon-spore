import {
  type SimConfig,
  type SpliceState,
  spliceCurrent,
  spliceNumberAt,
  spliceWanted,
} from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawSlimeBall } from "./splice-ball.js";
import { drawEaterBody } from "./splice-eater-body.js";
import { spliceTopY } from "./splice-straws.js";

/**
 * **THE SPLICE's clock, as the thing that eats the number** (the owner,
 * 25 September 2026: *an alien approaches and eats the ball itself*).
 *
 * It hangs out of an orifice in the hold's ceiling (`splice-hold.ts`) and
 * lets itself down as the round's beats are spent, so how far down it is *is*
 * how long is left — on the navigator's screen alone, the one the countdown was
 * always drawn on. In the last stretch its mouth opens. When the clock runs out
 * (`SpliceState.eatBeat`) its tongue takes the number the pair owed next, and
 * it drops onto the hull at the column the cannon was in — on **both**
 * screens, because that fall is the verdict and the verdict is both seats'.
 * It lands as slime, the `slick` breach the simulation files it under.
 *
 * The body is the shape sheet's TENDRIL draft (`splice-eater-body.ts`).
 */

/** How far across the grid the orifice is, and how many tiles over the top ends. */
const ORIFICE_ACROSS = 0.8;
const ORIFICE_UP = 3.4;
/** Its length at the start of a round and at the end, in tiles. */
const REACH_FROM = 0.5;
const REACH_TO = 2.5;
/** Beats of the bite spent reaching for the number and pulling it in. */
const REACH_BEATS = 0.35;
const BITE_BEATS = 0.8;

export function spliceOrifice(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return {
    x: l.gridLeft + l.gridWidth * ORIFICE_ACROSS,
    y: spliceTopY(l, cfg) - l.tile * ORIFICE_UP,
  };
}

/** How much of the round's clock is spent, 0 to 1. */
export function spliceSpent(s: SpliceState, b: number): number {
  const beats = Math.max(1, spliceCurrent(s).beats);
  return Math.max(0, Math.min(1, (b - s.roundBeat) / beats));
}

/**
 * The eater, wherever it is. `b` is the beat and its phase. The clock only
 * ever shows on her screen, so on his it is not drawn until it drops.
 */
export function drawEater(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SpliceState,
  full: boolean,
  cannonCol: number,
  b: number,
): void {
  const t = l.tile;
  const o = spliceOrifice(l, cfg);
  const sway = Math.sin(b * Math.PI * 0.5) * t * 0.18;
  if (s.eatBeat === -1) {
    if (!full || s.passBeat !== -1) return;
    const p = spliceSpent(s, b);
    const open = Math.max(0, (p - 0.7) / 0.3);
    drawEaterBody(
      ctx,
      o.x,
      o.y - t * 0.1,
      t * (REACH_FROM + (REACH_TO - REACH_FROM) * p),
      t * (0.6 + 0.3 * p),
      sway,
      open,
      b,
    );
    return;
  }
  const e = b - s.eatBeat;
  const taken = spliceWanted(s);
  if (e < BITE_BEATS) {
    if (!full) return;
    const mouth = drawEaterBody(ctx, o.x, o.y - t * 0.1, t * REACH_TO, t * 0.9, sway, 1, b);
    if (taken === -1) return;
    const ball = { x: tileCX(l, s.topCols[s.topOf[taken] ?? 0] ?? 0), y: spliceTopY(l, cfg) };
    const out =
      e < REACH_BEATS ? e / REACH_BEATS : 1 - (e - REACH_BEATS) / (BITE_BEATS - REACH_BEATS);
    const tip = { x: mouth.x + (ball.x - mouth.x) * out, y: mouth.y + (ball.y - mouth.y) * out };
    ctx.strokeStyle = PALETTE.redRim;
    ctx.lineWidth = Math.max(1.5, t * 0.09);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(mouth.x, mouth.y);
    ctx.quadraticCurveTo((mouth.x + tip.x) / 2, Math.max(mouth.y, tip.y) + t * 0.4, tip.x, tip.y);
    ctx.stroke();
    const r = t * 0.42 * (e < REACH_BEATS ? 1 : 0.4 + 0.6 * out);
    const at = e < REACH_BEATS ? ball : tip;
    drawSlimeBall(ctx, at.x, at.y, r, b, taken, String(spliceNumberAt(s, taken)), {
      shake: 1,
      alpha: 1,
    });
    return;
  }
  // The drop: out of the ceiling, faster as it goes, onto the column the
  // cannon was in when it bit.
  const q = Math.max(
    0,
    Math.min(1, (e - BITE_BEATS) / Math.max(0.1, cfg.spliceEatBeats - BITE_BEATS)),
  );
  const len = t * (1.7 + 0.5 * q);
  const col = s.eatCol === -1 ? cannonCol : s.eatCol;
  const x = o.x + (tileCX(l, col) - o.x) * (1 - (1 - q) * (1 - q));
  const top = o.y + (l.hullY - len - o.y) * q * q;
  const mouth = drawEaterBody(ctx, x, top, len, t * 0.95, sway * (1 - q), 1, b);
  // The number, swallowed, glowing through it.
  const glow = ctx.createRadialGradient(
    mouth.x,
    mouth.y - len * 0.35,
    0,
    mouth.x,
    mouth.y - len * 0.35,
    t * 0.4,
  );
  glow.addColorStop(0, rgba(PALETTE.pod, 0.85));
  glow.addColorStop(1, rgba(PALETTE.pod, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(mouth.x, mouth.y - len * 0.35, t * 0.4, 0, Math.PI * 2);
  ctx.fill();
}
