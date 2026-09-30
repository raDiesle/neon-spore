import { circleSubpath } from "@neon-spore/content";
import {
  type SimConfig,
  type VaneState,
  vaneGuardBeat,
  vaneGuardCount,
  vaneGuardedAt,
  vanePivotAt,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litColour } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { STEEL } from "./vane-bearing.js";

/**
 * **THE VANE's guard arms, drawn**: one steel spar round the hub for every form
 * after the first, turning a whole turn every `vaneGuardTurnBeats` and standing
 * across a mouth for the beats the rule refuses a shot there
 * (`sim/vane-guard.ts`, `docs/spec/bosses.md` §11.5, *Four forms*). The owner,
 * 30 September 2026: *another arm appears and rotates around it*.
 *
 * The angle is the guard's own beat round its turn, eased by the beat's phase,
 * and nothing else: a guard lies flat to the right half-way through its cover
 * of the right mouth and flat to the left half a turn later, going over the top
 * between. **A spar is lit only while `vaneGuardedAt` covers the mouth it lies
 * across**, so the one the pair sees glowing is the one the shot is refused by
 * — the rule is asked, never worked out here a second time.
 *
 * Nothing here is held between frames.
 */

/** How far a guard reaches from the pivot, in tiles — past the mouth beside it. */
const REACH = 1.12;

/** Half the width of a guard at the hub and at its end, in tiles. */
const ROOT = 0.075;
const END = 0.045;

export function drawVaneGuards(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: VaneState,
  px: number,
  py: number,
  beatPhase: number,
  hex: string,
): void {
  const cfg = world.cfg;
  const count = vaneGuardCount(b);
  if (count === 0) return;
  const pivot = vanePivotAt(cfg, b, world.beat, world.waveBeat);
  const cold = new Path2D();
  const lit = new Path2D();
  for (let k = 0; k < count; k++) {
    const a = guardAngle(cfg, count, k, world.waveBeat, beatPhase);
    const across = acrossMouth(cfg, b, world.waveBeat, pivot, a);
    (across ? lit : cold).addPath(spar(l, px, py, a));
  }
  ctx.save();
  ctx.fillStyle = litColour(STEEL, 0.4);
  ctx.fill(cold);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.5);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(cold);
  ctx.fillStyle = litColour(STEEL, 0.7);
  ctx.fill(lit);
  ctx.restore();
  strokeGlow(ctx, lit, hex, STROKE.outline, 1);
}

/**
 * The canvas angle guard `k` stands at: 0 flat to the right at the middle of
 * its cover of the right mouth, and turning over the top — a negative angle on
 * a canvas, whose y runs down.
 */
export function guardAngle(
  cfg: SimConfig,
  count: number,
  k: number,
  waveBeat: number,
  beatPhase: number,
): number {
  const turn = cfg.vaneGuardTurnBeats;
  const p = vaneGuardBeat(cfg, count, k, waveBeat) + beatPhase - cfg.vaneGuardCoverBeats / 2;
  return -(p / turn) * Math.PI * 2;
}

/**
 * Whether the spar at `a` is the one standing across a covered mouth: the mouth
 * on its side is guarded this beat, and the spar is within its cover of lying
 * flat across it.
 */
function acrossMouth(
  cfg: SimConfig,
  b: VaneState,
  waveBeat: number,
  pivot: number,
  a: number,
): boolean {
  const right = Math.cos(a) > 0;
  if (!vaneGuardedAt(cfg, b, right ? pivot + 1 : pivot - 1, waveBeat, pivot)) return false;
  const half = (cfg.vaneGuardCoverBeats / cfg.vaneGuardTurnBeats) * Math.PI;
  return Math.abs(Math.sin(a)) <= Math.sin(half) + 1e-6;
}

/** One guard: a tapered bar from the hub out along `a`, with a round end. */
function spar(l: Layout, px: number, py: number, a: number): Path2D {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const reach = l.tile * REACH;
  const root = l.tile * ROOT;
  const end = l.tile * END;
  const ex = px + c * reach;
  const ey = py + s * reach;
  const p = new Path2D();
  p.moveTo(px - s * root, py + c * root);
  p.lineTo(ex - s * end, ey + c * end);
  p.lineTo(ex + s * end, ey - c * end);
  p.lineTo(px + s * root, py - c * root);
  p.closePath();
  p.addPath(new Path2D(circleSubpath(ex, ey, end * 1.6)));
  return p;
}
