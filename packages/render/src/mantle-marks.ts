import {
  type MantleState,
  mantleCoreAsks,
  mantleKnobAsks,
  mantleVenting,
  type SimConfig,
  type SimEvent,
} from "@neon-spore/sim";
import { drawVerdictRing, GripVerdicts } from "./grip-verdict.js";
import { handleRadius } from "./handle-draw.js";
import type { Layout, ViewRole } from "./layout.js";
import { mantleVentCircle } from "./mantle-grip.js";
import { mantleRing, type Point } from "./mantle-shape.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";

/**
 * **THE MANTLE's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*) — and the whole of the convention,
 * THE SINEW's case, because every mark on this boss is on both screens
 * (`mantle-draw.ts`).
 *
 * Whether a mark asks is the simulation's (`sim/mantle.ts`): a knob while the
 * shell wants both hands and its own is off (`mantleKnobAsks`), the core's
 * ring for the seat whose tap is next (`mantleCoreAsks`), and the vent, from
 * either seat, while it hisses. **An asking mark wears the halo on its
 * owner's screen and the partner's turning ring and clock on the other's** —
 * which is why a knob's chevron, the gesture, is drawn on its owner's screen
 * alone (`mantle-handle.ts`). The core's is on the half of the ring that is
 * that seat's, left for the pilot and right for the navigator, by the
 * handles' geometry. The vent is both seats', so it haloes on both.
 *
 * The verdicts are the shell's own words: a shear, a brace held, a buckle
 * pressed flat and a turn guided green both knobs; a window run out reddens
 * both; a slip reddens the knob whose thumb lifted (`mantleSlip`'s `seat`).
 * A landed tap greens the core and a vent shut the vent. **A wrong-seat tap
 * is not refused red**: the simulation says nothing of it, on purpose, since
 * it costs nothing and teaches itself by being ignored (`sim/mantle-hand.ts`).
 *
 * Held in `MantleFx` (`mantle-fx.ts`). The knobs are keyed by index — 0 the
 * pilot's, 1 the navigator's — the core and the vent by their own keys.
 */
export const MANTLE_CORE_MARK = 2;
export const MANTLE_VENT_MARK = 3;

/** The words that are a verdict on both knobs at once, and which way. */
const BOTH: Readonly<Record<string, boolean>> = {
  mantleShear: true,
  mantleSteady: true,
  mantleFlat: true,
  mantleTurned: true,
  mantleLapse: false,
  mantleSwing: false,
};

export class MantleMarks {
  /** Was the last touch on each knob, the core and the vent, right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      const both = BOTH[e.type];
      if (both !== undefined) {
        this.verdicts.mark(0, both);
        this.verdicts.mark(1, both);
      } else if (e.type === "mantleSlip") this.verdicts.mark(e.seat - 1, false);
      else if (e.type === "mantleBeat" || e.type === "mantleDark")
        this.verdicts.mark(MANTLE_CORE_MARK, true);
      else if (e.type === "mantleSeal") this.verdicts.mark(MANTLE_VENT_MARK, true);
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}

/** Whether `seat`'s marks are this screen's own — both on the test screen. */
export function mantleMine(role: ViewRole, seat: 1 | 2): boolean {
  return role === "test" || (role === "p1") === (seat === 1);
}

/** The verdict's radius round a knob, in handle radii. */
const RING = 1.5;
/** The vent's marks' radius, in its circle's: the slot's own half-width (`mantle-vent.ts`). */
const SLOT = 0.6;

/** Under a knob: the halo, on its owner's screen while it asks. */
export function drawMantleKnobHalo(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  index: 0 | 1,
  knob: Point,
  time: number,
): void {
  if (!mantleMine(l.role, index === 0 ? 1 : 2) || !mantleKnobAsks(s, index)) return;
  const fade = ctx.globalAlpha;
  drawMarkHalo(ctx, knob.x, knob.y, handleRadius(l, cfg), time);
  ctx.globalAlpha = fade;
}

/** Over a knob: the partner's ring and clock while it asks on the other's screen, and the verdict on either. */
export function drawMantleKnobMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  index: 0 | 1,
  knob: Point,
  time: number,
  verdicts: GripVerdicts,
): void {
  const r = handleRadius(l, cfg);
  if (!mantleMine(l.role, index === 0 ? 1 : 2) && mantleKnobAsks(s, index)) {
    drawMarkTheirs(ctx, knob.x, knob.y, r, time);
    drawMarkWait(ctx, knob.x, knob.y, r, time);
  }
  const v = verdicts.at(index);
  if (v !== null) drawVerdictRing(ctx, knob.x, knob.y, r * RING, v);
}

/** The middle of `seat`'s half of the core's ring: its left for the pilot, its right for the navigator. */
function coreHalf(l: Layout, at: Point, seat: 1 | 2): Point {
  const ring = mantleRing(l, at);
  return { x: ring.x + (seat === 1 ? -ring.r : ring.r), y: ring.y };
}

/** Under the core's ring and the vent: the halo on each asking mark this screen owns. */
export function drawMantleHalos(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  at: Point,
  time: number,
): void {
  const fade = ctx.globalAlpha;
  const r = handleRadius(l, cfg);
  for (const seat of [1, 2] as const) {
    if (!mantleMine(l.role, seat) || !mantleCoreAsks(s, seat)) continue;
    const half = coreHalf(l, at, seat);
    drawMarkHalo(ctx, half.x, half.y, r, time);
  }
  if (mantleVenting(s)) {
    const vent = mantleVentCircle(l, cfg);
    drawMarkHalo(ctx, vent.x, vent.y, vent.r * SLOT, time);
  }
  ctx.globalAlpha = fade;
}

/** Over the core's ring and the vent: the partner's ring and clock on the half the core waits on, and the verdicts. */
export function drawMantleMarks(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: MantleState,
  at: Point,
  time: number,
  verdicts: GripVerdicts,
): void {
  const r = handleRadius(l, cfg);
  for (const seat of [1, 2] as const) {
    if (mantleMine(l.role, seat) || !mantleCoreAsks(s, seat)) continue;
    const half = coreHalf(l, at, seat);
    drawMarkTheirs(ctx, half.x, half.y, r, time);
    drawMarkWait(ctx, half.x, half.y, r, time);
  }
  const core = verdicts.at(MANTLE_CORE_MARK);
  if (core !== null) {
    const ring = mantleRing(l, at);
    drawVerdictRing(ctx, ring.x, ring.y, ring.r, core);
  }
  const vent = verdicts.at(MANTLE_VENT_MARK);
  if (vent !== null) {
    const v = mantleVentCircle(l, cfg);
    drawVerdictRing(ctx, v.x, v.y, v.r * SLOT, vent);
  }
}
