import { type SimConfig, type SpliceState, spliceCurrent, spliceNumberAt } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawSlimeBall } from "./splice-ball.js";
import { drawEaterBody, drawEaterRear, type EaterPose } from "./splice-eater-body.js";
import { drawLump, drawTongue, drawVenom, snap } from "./splice-eater-venom.js";
import { splicePipeTopY, spliceTopY } from "./splice-straws.js";

/**
 * **THE SPLICE's clock, as the thing that eats the number** (the owner,
 * 25 September 2026: *an alien approaches and eats the ball*; the same day,
 * *out of the right-hand wall, part of the ship, and plainly trying to eat*;
 * and then *a red alien head, bigger, on a neck*, broken through the wall,
 * with the back of its body through the same wall lower down).
 *
 * Its head is out from the round's first beat, on the navigator's screen. As
 * the beats are spent the neck lengthens, the drool gets longer, and its
 * tongue snaps at **the number nearest to it** — not the one the pair owes
 * next, because a tongue that pointed at the answer would be the eater saying
 * it (the owner, 25 September 2026). Each snap reaches further, until the last
 * one touches. How far the tongue gets *is* how long is left, on the one
 * screen the countdown was always drawn on.
 *
 * When the clock runs out (`SpliceState.eatBeat`) the tongue takes that
 * number, the head chews it, it goes down inside the wall to the back end,
 * and the back end pours it out as venom onto the hull where the cannon stood
 * — on **both** screens from the chew on, because that is the verdict and the
 * verdict is both seats'. The stream lands on the beat the simulation files
 * the `slick` breach, `spliceEatBeats` after the bite. The back end itself is
 * on both screens all the time, and moves only on the beat: it says nothing
 * about the clock.
 */

/** Tiles in from the right edge, for both holes. */
const HOLE_IN = 0.45;
/** The head's hole: tiles over the top ends. */
const HEAD_UP = 2.2;
/** The neck's length at the start of a round and at the end, in tiles. */
const REACH_FROM = 1.4;
const REACH_TO = 2.9;
/** Beats of the bite: reaching, pulling in, chewing, swallowing; then the venom. */
const REACH_BEATS = 0.35;
const BITE_BEATS = 0.8;
const CHEW_BEATS = 1.3;
const SWALLOW_BEATS = 2;

export function spliceSocket(l: Layout, cfg: SimConfig): { x: number; y: number } {
  return { x: l.width - l.tile * HOLE_IN, y: spliceTopY(l, cfg) - l.tile * HEAD_UP };
}

/** The lower hole, the back end's: a little over the pipes, so the venom arcs over them. */
export function spliceRearHole(l: Layout, cfg: SimConfig): { x: number; y: number } {
  const top = spliceTopY(l, cfg);
  return { x: l.width - l.tile * HOLE_IN, y: top + (splicePipeTopY(l, cfg) - top) * 0.62 };
}

/** How much of the round's clock is spent, 0 to 1. */
export function spliceSpent(s: SpliceState, b: number): number {
  const beats = Math.max(1, spliceCurrent(s).beats);
  return Math.max(0, Math.min(1, (b - s.roundBeat) / beats));
}

/**
 * The straw whose number the eater goes for: of those still to be had and not
 * on their way down, the one whose top end is nearest the right-hand wall it
 * is in. -1 if there is none.
 */
export function spliceEaterTarget(s: SpliceState): number {
  let best = -1;
  let bestCol = -1;
  for (let e = 0; e < s.entranceCols.length; e++) {
    if (spliceNumberAt(s, e) <= s.fed || s.flights.some((f) => f.straw === e)) continue;
    const col = s.topCols[s.topOf[e] ?? 0] ?? 0;
    if (col > bestCol) {
      best = e;
      bestCol = col;
    }
  }
  return best;
}

function ballAt(l: Layout, cfg: SimConfig, s: SpliceState, e: number) {
  return { x: tileCX(l, s.topCols[s.topOf[e] ?? 0] ?? 0), y: spliceTopY(l, cfg) };
}

/**
 * The eater, wherever it is. `b` is the beat and its phase. The clock only
 * ever shows on her screen, so on his the head is not drawn until it has bitten.
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
  const rear = spliceRearHole(l, cfg);
  const e = s.eatBeat === -1 ? -1 : b - s.eatBeat;
  const swell =
    e < CHEW_BEATS ? 0 : e < SWALLOW_BEATS ? (e - CHEW_BEATS) / (SWALLOW_BEATS - CHEW_BEATS) : 1;
  const vent = drawEaterRear(ctx, rear.x, rear.y, t, swell, b);
  const target = spliceEaterTarget(s);
  const look = target === -1 ? { x: o.x - t * 3, y: o.y + t * 2 } : ballAt(l, cfg, s, target);
  const sag = t * (0.35 + 0.1 * Math.sin(b * Math.PI * 0.5));
  const pose = (reach: number, open: number, hunger: number): EaterPose => ({
    len: t * (REACH_FROM + (REACH_TO - REACH_FROM) * reach),
    wide: t * (1.9 + 0.25 * reach),
    sag,
    open,
    hunger,
    look,
  });

  if (s.eatBeat === -1) {
    if (!full) return;
    if (s.passBeat !== -1) {
      // Beaten: it pulls back into the wall over a beat, mouth shut.
      const gone = b - s.passBeat;
      if (gone >= 1) return;
      const p = pose(spliceSpent(s, s.passBeat), 0, 0);
      drawEaterBody(ctx, o.x, o.y, { ...p, len: p.len * (1 - gone) }, b);
      return;
    }
    const p = spliceSpent(s, b);
    const mouth = drawEaterBody(ctx, o.x, o.y, pose(p, 0.3 + 0.7 * p, p), b);
    if (target === -1) return;
    const ball = ballAt(l, cfg, s, target);
    const k = snap((b - s.roundBeat) * (1 + 0.6 * p)) * (0.15 + 0.8 * p);
    drawTongue(ctx, t, mouth, {
      x: mouth.x + (ball.x - mouth.x) * k,
      y: mouth.y + (ball.y - mouth.y) * k,
    });
    return;
  }

  if (e < BITE_BEATS) {
    if (!full) return;
    const mouth = drawEaterBody(ctx, o.x, o.y, pose(1, 1, 1), b);
    if (target === -1) return;
    const ball = ballAt(l, cfg, s, target);
    const out =
      e < REACH_BEATS ? e / REACH_BEATS : 1 - (e - REACH_BEATS) / (BITE_BEATS - REACH_BEATS);
    const tip = { x: mouth.x + (ball.x - mouth.x) * out, y: mouth.y + (ball.y - mouth.y) * out };
    drawTongue(ctx, t, mouth, tip);
    const r = t * 0.42 * (e < REACH_BEATS ? 1 : 0.4 + 0.6 * out);
    drawSlimeBall(ctx, tip.x, tip.y, r, b, target, String(spliceNumberAt(s, target)), {
      shake: 1,
      alpha: 1,
    });
    return;
  }

  if (e < CHEW_BEATS) {
    // Chewing: the head swells on each gulp with the number glowing in it.
    const gulp = Math.abs(Math.sin((e - BITE_BEATS) * Math.PI * 4));
    const p = pose(1, 0.15 + 0.3 * gulp, 0.6);
    const mouth = drawEaterBody(ctx, o.x, o.y, { ...p, wide: p.wide * (1 + 0.06 * gulp) }, b);
    const glow = ctx.createRadialGradient(mouth.x, mouth.y, 0, mouth.x, mouth.y, t * 0.5);
    glow.addColorStop(0, rgba(PALETTE.pod, 0.8));
    glow.addColorStop(1, rgba(PALETTE.pod, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mouth.x, mouth.y, t * 0.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Swallowed: the head sinks back, and a lump of glow goes down inside the
  // wall to the back end, which swells with it and then pours.
  const back = Math.min(1, (e - CHEW_BEATS) / (SWALLOW_BEATS - CHEW_BEATS));
  const p = pose(1 - back * 0.6, 0.1, 0.3);
  drawEaterBody(ctx, o.x, o.y, p, b);
  if (e < SWALLOW_BEATS) {
    drawLump(ctx, t, o.x, o.y + (rear.y - o.y) * back);
    return;
  }
  const q = (e - SWALLOW_BEATS) / Math.max(0.1, cfg.spliceEatBeats - SWALLOW_BEATS);
  const col = s.eatCol === -1 ? cannonCol : s.eatCol;
  drawVenom(ctx, t, vent, { x: tileCX(l, col), y: l.hullY - t * 0.15 }, Math.min(1, q), b);
}
