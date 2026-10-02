import { FLUE_TAPS, FLUE_VENTS } from "@neon-spore/sim";
import { arcFromTop } from "./arc-from-top.js";
import { FLUE_UNITS, flueCoreR, flueEmberR, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE FLUE's marks**: what says what a step asks and what is spent. The
 * slot glowing is *a vent is lit*; a ring round the steadied ember is *tap
 * it*, full for the seat that taps and only faint for the other, so the
 * still one can see it is working without being handed a mark to look at;
 * three studs over the damper are the taps landed; and a vent spent is a
 * notch lit in an end unit. All in the white of the hull's rim, the one light
 * on a flue that is otherwise soot — the core is the only part in a
 * cannon's colour (`flue-draw.ts`).
 *
 * Nothing marks the seat that rests, THE HALTER's reason
 * (`halter-marks.ts`): what says it is resting is the ember stopping dead.
 */

/** How faint the other seat's ring is. */
const OTHER = 0.3;
/** The ring's radius round the ember, in ember radii. */
const RING = 2.6;
/** The tap studs' radius and spacing, and how far over the flue's middle they sit, in tiles. */
const STUD = 0.07;
const STUD_GAP = 0.24;
const STUD_UP = 0.78;

/** The lit vent's slot, glowing on its beat: *this one*. */
export function drawFlueSlotGlow(
  ctx: CanvasRenderingContext2D,
  slot: Path2D,
  beatPhase: number,
): void {
  const pulse = 0.55 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlowFaded(ctx, slot, PALETTE.hullRim, STROKE.inner, pulse, 0.8);
}

/**
 * The ring round the steadied ember, *tap it*: breathing on its beat for the
 * tapper's screen, with an arc round it running down as the vent's window
 * does; a thin faint ring for the other seat's.
 */
export function drawFlueTapRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  left: number,
  full: boolean,
  beatPhase: number,
): void {
  const r = flueEmberR(l) * RING;
  const ring = new Path2D();
  ring.arc(at.x, at.y, r, 0, Math.PI * 2);
  if (!full) {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.hullRim, OTHER);
    ctx.stroke(ring);
    return;
  }
  const pulse = 0.65 + 0.35 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlowFaded(ctx, ring, PALETTE.hullRim, STROKE.outline, pulse, 1);
  const time = new Path2D();
  arcFromTop(time, at.x, at.y, r * 1.35, left);
  strokeGlowFaded(ctx, time, PALETTE.hullRim, STROKE.inner, 0.6, 1);
}

/** The three tap studs over the flue's middle, one lit for each tap landed in the vent lit. */
export function drawFlueTapStuds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  centre: Point,
  taps: number,
): void {
  const r = STUD * l.tile;
  for (let i = 0; i < FLUE_TAPS; i++) {
    const x = centre.x + (i - (FLUE_TAPS - 1) / 2) * STUD_GAP * l.tile;
    const y = centre.y - STUD_UP * l.tile;
    const stud = new Path2D();
    stud.arc(x, y, r, 0, Math.PI * 2);
    if (i < taps) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill(stud);
      strokeGlowFaded(ctx, stud, PALETTE.hullRim, STROKE.inner, 1, 0.8);
    } else {
      ctx.fillStyle = PALETTE.flueSlot;
      ctx.fill(stud);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35);
      ctx.stroke(stud);
    }
  }
}

/**
 * The vents spent: a notch in each end unit, dark until its vent is spent
 * and lit after — the first on the left end, the second on the right — and
 * flaring past lit the moment it is (`flue-fx.ts`).
 */
export function drawFlueVents(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  ends: readonly [Point, Point],
  vents: number,
  flare: (i: 0 | 1) => number,
): void {
  const w = 0.09 * l.tile;
  const h = 0.26 * l.tile;
  for (let i = 0; i < FLUE_VENTS; i++) {
    const at = ends[i] ?? ends[0];
    const notch = new Path2D();
    for (const dx of [-1, 1])
      notch.rect(at.x + dx * 1.6 * w - w / 2, at.y - h - 0.3 * l.tile, w, h);
    if (i < vents) {
      ctx.fillStyle = PALETTE.hullRim;
      ctx.fill(notch);
      strokeGlowFaded(
        ctx,
        notch,
        PALETTE.hullRim,
        STROKE.inner,
        0.9 + 1.6 * flare(i === 0 ? 0 : 1),
        0.8,
      );
    } else {
      ctx.fillStyle = PALETTE.flueSlot;
      ctx.fill(notch);
    }
  }
}

/**
 * A tap's tick: a short bright bar through the slot across the ember, the
 * weight of THE RATCHET's click, gone in a sixth of a second.
 */
export function drawFlueTick(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  tick: number,
): void {
  if (tick <= 0) return;
  const h = flueEmberR(l) * (2.2 + 1.2 * (1 - tick));
  const bar = new Path2D();
  bar.moveTo(at.x, at.y - h);
  bar.lineTo(at.x, at.y + h);
  strokeGlowFaded(ctx, bar, PALETTE.hullRim, STROKE.outline, 1.6 * tick, 1);
}

/** A lapse's flash off the ember at `at`: a ring thrown out from it, fading as it widens. */
export function drawFlueLapse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  lapse: number,
): void {
  if (lapse <= 0) return;
  const ring = new Path2D();
  ring.arc(at.x, at.y, flueEmberR(l) * (1.2 + 2 * (1 - lapse)), 0, Math.PI * 2);
  strokeGlowFaded(ctx, ring, PALETTE.hullRim, STROKE.inner, lapse, 0.9);
}

/** A core hit's flash over the core at `at`: white, and wider for every hit. */
export function drawFlueFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  flash: { now: number; hits: number },
): void {
  if (flash.now <= 0 || flash.hits <= 0) return;
  const hits = Math.min(3, flash.hits);
  const r = flueCoreR(l) * (0.6 + 0.5 * hits) * (1.4 - 0.4 * flash.now);
  const p = new Path2D();
  p.arc(at.x, at.y, Math.max(0.5, r), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
  ctx.fill(p);
  strokeGlowFaded(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
}

/** The end units' indices, left and right. */
export const FLUE_ENDS = [0, FLUE_UNITS - 1] as const;
