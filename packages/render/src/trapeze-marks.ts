import type { SimConfig, TrapezeSide } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { drawPullTrack, PULL_TRACK_W } from "./pull-track.js";
import { trapezeOnArc } from "./trapeze-shape.js";

/**
 * **THE TRAPEZE's two zones**: the left and the right half of the field under
 * the swing, where a finger swipes toward the middle to push it. The owner,
 * 7 October 2026: *it should be made clear visually in which area what has to
 * be done and when.*
 *
 * **Where**: each zone is its half of the field from the swing's lowest
 * point down to a row above the hull, so a thumb never lands on the cannon.
 * **Whose**: a badge in each, `P1` or `P2`, the seat that pushes there — a
 * call level changes it as the swing heads that way. **When**: a zone is dim
 * while the swing is anywhere else, and lights the moment the swing comes
 * back over it. **What**: the pull every pull handle wears (`pull-knob.ts`,
 * `pull-track.ts`) — the owner, 14 October 2026, on this card of CONTROLS ›
 * ON THE FIELD: *should be changed to regular pull control visuals*. A knob
 * in the zone with its arrow pointing in, on a channel `trapezeSwipeMilli`
 * long toward the middle, the knob riding the finger's carry
 * (`sim/trapeze-hand.ts`, `carryMilli`) and the channel filling green behind
 * it. Shut, the pull is dim, as its frame is. On the screen of the seat whose
 * zone it is not, a lit zone is faint and its knob wears no arrow: the
 * partner sees it and can say *now*.
 *
 * `trapezeZone` is the one placement the drawing and the thumb share
 * (`trapeze-grip.ts`).
 */

/** How much of a zone shows on the screen of the seat that does not push there. */
const OTHER = 0.35;
/** How much of the pull shows while its zone is shut. */
const SHUT = 0.4;
/** Rows of the field the zones leave free above the hull, for the cannon. */
const FREE_ROWS = 1.2;

export interface Zone {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The zone on `side`, in canvas pixels. */
export function trapezeZone(l: Layout, cfg: SimConfig, side: TrapezeSide): Zone {
  const top = trapezeOnArc(l, cfg, 0).y;
  const mid = trapezeOnArc(l, cfg, 0).x;
  const bottom = l.hullY - FREE_ROWS * l.tile;
  const left = side < 0 ? l.gridLeft : mid;
  const w = side < 0 ? mid - l.gridLeft : l.gridLeft + l.cols * l.tile - mid;
  return { x: left, y: top, w, h: Math.max(l.tile, bottom - top) };
}

/** Whether (x, y) is inside `z`. */
export function inZone(z: Zone, x: number, y: number): boolean {
  return x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h;
}

/** The pull drawn in a zone: how far along the knob is, 0..1, whether a finger has it, the
 * channel's length and the knob's radius in pixels, and the renderer's clock. */
export interface ZonePull {
  carry: number;
  held: boolean;
  length: number;
  r: number;
  time: number;
}

/**
 * One zone: its frame, its seat's badge, its pull, and — while `open` — its
 * light. `mine` is whether this screen's seat pushes here; `pulse` 0..1
 * breathes the light.
 */
export function drawTrapezeZone(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  z: Zone,
  side: TrapezeSide,
  seat: 1 | 2,
  open: boolean,
  mine: boolean,
  pulse: number,
  pull: ZonePull,
): void {
  const k = mine ? 1 : OTHER;
  const r = 0.3 * l.tile;
  const frame = new Path2D();
  frame.roundRect(z.x + 0.1 * l.tile, z.y, z.w - 0.2 * l.tile, z.h, r);
  if (open) {
    ctx.fillStyle = rgba(PALETTE.hullRim, (0.08 + 0.08 * pulse) * k);
    ctx.fill(frame);
    strokeGlow(ctx, frame, PALETTE.hullRim, STROKE.inner, k, 1);
  } else {
    ctx.lineWidth = STROKE.inner;
    ctx.setLineDash([0.18 * l.tile, 0.18 * l.tile]);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.22 * k);
    ctx.stroke(frame);
    ctx.setLineDash([]);
  }
  drawBadge(ctx, l, z, side, seat, open ? k : 0.45 * k);
  drawZonePull(ctx, z, side, mine, open || pull.held ? k : SHUT * k, pull);
}

/**
 * The zone's pull: a channel `length` long across the zone's middle toward
 * the field's middle, the knob at its outer end until a finger carries it in.
 * Keyed by side, so FIZZ plays its drop, its squish and its slurp home
 * (`pull-memory.ts`) and a push's fizz (`pull-counts.ts`).
 */
function drawZonePull(
  ctx: CanvasRenderingContext2D,
  z: Zone,
  side: TrapezeSide,
  mine: boolean,
  k: number,
  pull: ZonePull,
): void {
  const y = z.y + z.h / 2;
  const from = { x: z.x + z.w / 2 + (side * pull.length) / 2, y };
  const to = { x: from.x - side * pull.length, y };
  const key = `trapeze:${side}`;
  const look = { hex: PALETTE.hullRim, rim: PALETTE.text, held: pull.held, time: pull.time, key };
  ctx.save();
  ctx.globalAlpha *= k;
  drawPullTrack(
    ctx,
    { pts: [from, to], w: pull.r * PULL_TRACK_W },
    { ...look, origin: 0, at: pull.carry },
  );
  const knob = { x: from.x - side * pull.length * pull.carry, y };
  drawPullKnob(ctx, knob, pull.r, { ...look, way: mine ? { dx: -side, dy: 0 } : null });
  ctx.restore();
}

/** The badge in the zone's top outer corner: the seat that pushes here. */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  z: Zone,
  side: TrapezeSide,
  seat: 1 | 2,
  k: number,
): void {
  const x = side < 0 ? z.x + 0.75 * l.tile : z.x + z.w - 0.75 * l.tile;
  const y = z.y + 0.6 * l.tile;
  ctx.font = `700 ${Math.round(0.42 * l.tile)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(PALETTE.hullRim, k);
  ctx.fillText(`P${seat}`, x, y);
}
