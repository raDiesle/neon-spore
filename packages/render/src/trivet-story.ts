import {
  midCol,
  type TrivetState,
  trivetChordHeld,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawOculusSight } from "./oculus-story.js";
import { PALETTE, STROKE } from "./palette.js";
import { into } from "./trivet-pose.js";
import { type Point, trivetHubR, trivetLegPath } from "./trivet-shape.js";

/**
 * **THE TRIVET's two story steps, drawn** (§30's story item; the rules are
 * `sim/trivet-step.ts`, `sim/trivet-shot.ts` and `sim/trivet-guard.ts`).
 *
 * - **The lurch.** The hub swings out over the column its shot is wanted in,
 *   low and tilted onto the foot it leans on, and the far foot comes up off
 *   the field; once the leaning foot's chord is held the far foot settles
 *   most of the way back, which is the stand kept from going over.
 * - **The needle.** One more of CALTROP's needles, flung from the hub out
 *   over the column it will fall down and sinking as the step runs out, with
 *   THE OCULUS's dotted sight from its point to the hull there and a notch
 *   where the shield has to stand — THE RIME's icicle, in the stand's metal.
 *
 * Both in the stand's own frame, the hub's standing middle at the origin;
 * both screens the same, as the rest of the stand is.
 */

/** How low the lurching hub sinks, and how far it tilts, at its fullest. */
const LURCH_DROP = 0.45;
const LURCH_TILT = 0.32;
/** How far the far foot comes up in a lurch, and how much of that a held chord takes back. */
const LURCH_LIFT = 0.55;
const HELD_SETTLE = 0.7;
/** How far the hub leans toward the needle it flings, as a share of the way to its column. */
const FLING = 0.12;
/** The needle's length in tiles, and how far toward the hull it sinks by the time its step runs out. */
const NEEDLE_LONG = 1.5;
const SINK = 0.4;

/** 0 to 1: how far into the lit story step `ask` the stand is; 0 on any other step. */
function lit(s: TrivetState, ask: "tip" | "needle", beat: number, beatPhase: number): number {
  if (s.phase !== "lit" || trivetLitStep(s)?.ask !== ask) return 0;
  return smoothstep(Math.min(1, into(s, beat, beatPhase) * 2));
}

/** How far the lurch has thrown the stand over, 0 to 1. */
export function trivetLurch(s: TrivetState, beat: number, beatPhase: number): number {
  return lit(s, "tip", beat, beatPhase);
}

/** How far the needle has been flung out over its column, 0 to 1. */
export function trivetNeedle(s: TrivetState, beat: number, beatPhase: number): number {
  return lit(s, "needle", beat, beatPhase);
}

/** How far the needle has sunk toward the hull: 0 as it lights, 1 as it runs out. */
export function trivetNeedleSink(s: TrivetState, beat: number, beatPhase: number): number {
  const step = trivetLitStep(s);
  if (step === null || step.ask !== "needle") return 0;
  return Math.min(1, into(s, beat, beatPhase) / Math.max(1, step.beats));
}

/** Pixels across from the stand's middle to the lit story step's column; 0 on any other step. */
export function trivetStoryDx(l: Layout, world: World, s: TrivetState): number {
  const step = trivetLitStep(s);
  if (step === null || (step.ask !== "tip" && step.ask !== "needle")) return 0;
  const mid = midCol(world.cfg);
  return fieldX(l, trivetStepCol(mid, step)) - fieldX(l, mid);
}

/** Where the hub has been thrown: across, down and turned, all nought but in a lurch or a fling. */
export function trivetHubSwing(
  l: Layout,
  world: World,
  s: TrivetState,
  beat: number,
  beatPhase: number,
): { dx: number; dy: number; tilt: number } {
  const dx = trivetStoryDx(l, world, s);
  const lurch = trivetLurch(s, beat, beatPhase);
  if (lurch > 0) {
    return {
      dx: dx * lurch,
      dy: LURCH_DROP * l.tile * lurch,
      tilt: Math.sign(dx) * LURCH_TILT * lurch,
    };
  }
  const fling = trivetNeedle(s, beat, beatPhase) * FLING;
  return { dx: dx * fling, dy: 0, tilt: Math.sign(dx) * LURCH_TILT * fling };
}

/** How far foot `side` is thrown up by a lurch: the far foot only, and less once the near one is held. */
export function trivetLurchLift(
  s: TrivetState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): number {
  const step = trivetLitStep(s);
  if (step === null || step.ask !== "tip") return 0;
  const near = trivetTipSide(step);
  if (side === near) return 0;
  const held = trivetChordHeld(s, near, step.pads) ? HELD_SETTLE : 0;
  return LURCH_LIFT * trivetLurch(s, beat, beatPhase) * (1 - held);
}

/**
 * The needle, `out` of the way flung to hang `dx` across from `from` and
 * `sink` of the way sunk, with the sight down to the hull `toHull` below.
 */
export function drawTrivetNeedle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  out: number,
  sink: number,
  dx: number,
  toHull: number,
  beatPhase: number,
): void {
  if (out <= 0) return;
  const long = NEEDLE_LONG * l.tile;
  const top = from.y + trivetHubR(l);
  const y = top + (toHull - top - long) * SINK * sink;
  const root = { x: from.x + (dx - from.x) * out, y: y * out + from.y * (1 - out) };
  const tip = { x: root.x, y: root.y + long * out };
  const needle = trivetLegPath(l, root, tip);
  ctx.fillStyle = PALETTE.trivetMetal;
  ctx.fill(needle);
  const pulse = 0.6 + 0.4 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, needle, PALETTE.trivetSocket, STROKE.inner, out * pulse);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.trivetMetalDark, 0.9);
  ctx.stroke(needle);
  const colour = { body: PALETTE.hullRim, rim: PALETTE.trivetSocket };
  drawOculusSight(ctx, l, tip, { x: dx, y: toHull }, colour, out);
}
