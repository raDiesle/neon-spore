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
import { drawEaterBody, type EaterPose } from "./splice-eater-body.js";
import { spliceTopY } from "./splice-straws.js";

/**
 * **THE SPLICE's clock, as the thing that eats the number** (the owner,
 * 25 September 2026: *an alien approaches and eats the ball itself*; and the
 * same day: *out of the right-hand wall, part of the ship, and plainly trying
 * to eat*).
 *
 * It grows out of a socket in the hold's right wall (`splice-hold.ts`) and is
 * out from the round's first beat. As the beats are spent it lengthens, its
 * drool gets longer, and its tongue snaps at the number the pair owes next —
 * once a beat and a little faster as it gets hungry, each snap reaching further
 * along the way, until the last one touches. How far the tongue gets *is* how
 * long is left, on the navigator's screen alone, the one the countdown was
 * always drawn on.
 *
 * When the clock runs out (`SpliceState.eatBeat`) the tongue takes the number,
 * the eater chews it, and spits what is left of it at the hull where the
 * cannon stood — on **both** screens from the chew on, because that is the
 * verdict and the verdict is both seats'. It lands as the `slick` breach the
 * simulation files it under.
 */

/** The socket: tiles in from the right edge, and tiles over the top ends. */
const SOCKET_IN = 0.45;
const SOCKET_UP = 2.2;
/** Its length at the start of a round and at the end, in tiles. */
const REACH_FROM = 1.3;
const REACH_TO = 2.8;
/** Beats of the bite: reaching, pulling in, chewing; the rest is the spit. */
const REACH_BEATS = 0.35;
const BITE_BEATS = 0.8;
const CHEW_BEATS = 1.3;

export function spliceSocket(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: l.width - l.tile * SOCKET_IN, y: spliceTopY(l, cfg) - l.tile * SOCKET_UP };
}

/** How much of the round's clock is spent, 0 to 1. */
export function spliceSpent(s: SpliceState, b: number): number {
  const beats = Math.max(1, spliceCurrent(s).beats);
  return Math.max(0, Math.min(1, (b - s.roundBeat) / beats));
}

/** A snap: out in the first sixth of its cycle, back slowly over the rest. */
function snap(phase: number): number {
  const f = ((phase % 1) + 1) % 1;
  return f < 0.16 ? f / 0.16 : (1 - (f - 0.16) / 0.84) ** 2;
}

function drawTongue(
  ctx: CanvasRenderingContext2D,
  t: number,
  from: { x: number; y: number },
  to: { x: number; y: number },
): void {
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  if (d < t * 0.1) return;
  const cx = (from.x + to.x) / 2;
  const cy = Math.max(from.y, to.y) + d * 0.25;
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = Math.max(1.5, t * 0.1);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(cx, cy, to.x, to.y);
  ctx.stroke();
  // The sticky tip, split in two.
  ctx.fillStyle = PALETTE.redRim;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(to.x, to.y + side * t * 0.07, t * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }
}

function ballAt(l: Layout, cfg: SimConfig, s: SpliceState, e: number) {
  return { x: tileCX(l, s.topCols[s.topOf[e] ?? 0] ?? 0), y: spliceTopY(l, cfg) };
}

/**
 * The eater, wherever it is. `b` is the beat and its phase. The clock only
 * ever shows on her screen, so on his it is not drawn until it has bitten.
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
  const o = spliceSocket(l, cfg);
  const sag = t * (0.3 + 0.1 * Math.sin(b * Math.PI * 0.5));
  const pose = (reach: number, open: number, hunger: number): EaterPose => ({
    len: t * (REACH_FROM + (REACH_TO - REACH_FROM) * reach),
    wide: t * (0.75 + 0.2 * reach),
    sag,
    open,
    hunger,
  });

  if (s.eatBeat === -1) {
    if (!full) return;
    if (s.passBeat !== -1) {
      // Beaten: it shrinks back into the wall over a beat, mouth shut.
      const gone = b - s.passBeat;
      if (gone >= 1) return;
      const p = pose(spliceSpent(s, s.passBeat), 0, 0);
      drawEaterBody(ctx, o.x, o.y, { ...p, len: p.len * (1 - gone) }, b);
      return;
    }
    const p = spliceSpent(s, b);
    const mouth = drawEaterBody(ctx, o.x, o.y, pose(p, 0.3 + 0.7 * p, p), b);
    const w = spliceWanted(s);
    if (w === -1) return;
    const ball = ballAt(l, cfg, s, w);
    const k = snap((b - s.roundBeat) * (1 + 0.6 * p)) * (0.15 + 0.8 * p);
    drawTongue(ctx, t, mouth, {
      x: mouth.x + (ball.x - mouth.x) * k,
      y: mouth.y + (ball.y - mouth.y) * k,
    });
    return;
  }

  const e = b - s.eatBeat;
  const taken = spliceWanted(s);
  if (e < BITE_BEATS) {
    if (!full) return;
    const mouth = drawEaterBody(ctx, o.x, o.y, pose(1, 1, 1), b);
    if (taken === -1) return;
    const ball = ballAt(l, cfg, s, taken);
    const out =
      e < REACH_BEATS ? e / REACH_BEATS : 1 - (e - REACH_BEATS) / (BITE_BEATS - REACH_BEATS);
    const tip = { x: mouth.x + (ball.x - mouth.x) * out, y: mouth.y + (ball.y - mouth.y) * out };
    drawTongue(ctx, t, mouth, tip);
    const r = t * 0.42 * (e < REACH_BEATS ? 1 : 0.4 + 0.6 * out);
    drawSlimeBall(ctx, tip.x, tip.y, r, b, taken, String(spliceNumberAt(s, taken)), {
      shake: 1,
      alpha: 1,
    });
    return;
  }

  const spit = cfg.spliceEatBeats;
  if (e < CHEW_BEATS) {
    // Chewing: the head swells on each gulp with the number glowing in it.
    const gulp = Math.abs(Math.sin((e - BITE_BEATS) * Math.PI * 4));
    const p = pose(1, 0.1, 0.6);
    const mouth = drawEaterBody(ctx, o.x, o.y, { ...p, wide: p.wide * (1 + 0.12 * gulp) }, b);
    const glow = ctx.createRadialGradient(
      mouth.x + t * 0.3,
      mouth.y,
      0,
      mouth.x + t * 0.3,
      mouth.y,
      t * 0.45,
    );
    glow.addColorStop(0, rgba(PALETTE.pod, 0.8));
    glow.addColorStop(1, rgba(PALETTE.pod, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mouth.x + t * 0.3, mouth.y, t * 0.45, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // The spit: what is left of the number, in an arc onto the hull where the
  // cannon stood. The simulation restarts the round on the beat it lands.
  const mouth = drawEaterBody(ctx, o.x, o.y, pose(1, 1, 0.4), b);
  const q = (e - CHEW_BEATS) / Math.max(0.1, spit - CHEW_BEATS);
  const col = s.eatCol === -1 ? cannonCol : s.eatCol;
  const to = { x: tileCX(l, col), y: l.hullY - t * 0.3 };
  const x = mouth.x + (to.x - mouth.x) * q;
  const y = mouth.y + (to.y - mouth.y) * q * q - t * 1.5 * 4 * q * (1 - q);
  drawSlimeBall(ctx, x, y, t * 0.36, b, taken, "", { shake: 0.5, alpha: 1 });
}
