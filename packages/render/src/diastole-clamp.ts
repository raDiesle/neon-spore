import {
  type DiastoleState,
  diastoleChamberCol,
  diastoleClamped,
  diastoleClampHolds,
  diastoleClampSeat,
  type SimConfig,
} from "@neon-spore/sim";
import { diastoleY } from "./diastole-draw.js";
import { drawHandleRest, drawHandleRing, handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Field, Touch } from "./touch.js";
import type { ViewRole } from "./view-role.js";
import { showsDiastoleClamp } from "./view-role-clocks-b.js";

/**
 * **THE DIASTOLE's clamp**: the one thing on the twin lobe a hand takes hold
 * of, drawn and answered in one file for `stare-lid.ts`' reason — the circle
 * a thumb is answered at is the circle the ring is drawn from.
 *
 * The ring sits on the grey right chamber, on the pilot's screen alone, from
 * the beat the left collapses (`alone`, `sim/diastole-open.ts`): the pilot is
 * the seat that cannot see the chamber beat, so the ring never says *when*
 * — it breathes at the wall clock, which is nobody's count — and the beat is
 * still the navigator's to say out loud. What the ring does say is *this,
 * and your thumb*. Held, it fills and a dial runs out over
 * `diastoleClampBeats`, the one readout of the window on the screen that
 * cannot otherwise see the window at all; the chamber under it is squeezed
 * shut on **every** screen for as long as the clamp holds (`diastole-draw.ts`),
 * because a clamp is a thing both seats can see and neither count is in it.
 * The spasm has no ring: there is nothing to clamp for eight beats, and the
 * chamber's own shudder is what says so.
 *
 * The **rest** is the one place the circle is written down, and the hit test
 * answers there whatever the chamber is doing: a press is tested against the
 * chamber's middle, and the pointer is captured from that press on
 * (`handles.ts`).
 */

/** Where the ring rests: on the chamber the clamp is for. */
export function diastoleClampRest(l: Layout, cfg: SimConfig): Circle {
  return { x: tileCX(l, diastoleChamberCol(cfg, 1)), y: diastoleY(l), r: handleRadius(l, cfg) };
}

/** Whether the picture is asking for the thumb at all: the alone phase, and no other. */
export function diastoleAsksClamp(b: DiastoleState): boolean {
  return b.phase === "alone";
}

/**
 * The press, answered for the clamp's seat while the chamber beats alone.
 * `field.diastole` is `null` on every wave without the twin lobe, and a press
 * then falls through to whatever is behind it as if no ring were there. The
 * thumb is a hold and not a pull: the simulation reads only that it is down
 * and on which beat (`sim/diastole-hand.ts`).
 */
export function diastoleClampUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const b = field.diastole;
  if (b === null || !diastoleAsksClamp(b) || field.seat !== diastoleClampSeat) return null;
  if (!hitCircle(diastoleClampRest(l, field.cfg), x, y)) return null;
  const target = "diastoleChamber";
  return {
    player: field.seat,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: field.seat, originX: x, originY: y },
  };
}

/**
 * How much of a held clamp's window has run, zero to one. It counts from the
 * beat the clamp *caught*, which may be the beat after the thumb came down —
 * a clamp sent the beat before its contraction is still whole on the beat it
 * was sent (`sim/diastole-hand.ts`).
 */
export function diastoleClampRun(
  b: DiastoleState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (!diastoleClamped(b)) return 0;
  const into = beat - b.clampBeat + beatPhase;
  return Math.max(0, Math.min(1, into / cfg.diastoleClampBeats));
}

/**
 * The ring on the chamber, for the seat whose thumb it is. Called after the
 * chambers are drawn, so the ring stands on the chamber and nothing stands on
 * the ring.
 */
export function drawDiastoleClamp(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: DiastoleState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!diastoleAsksClamp(b) || !showsDiastoleClamp(role)) return;
  const rest = diastoleClampRest(l, cfg);
  const held = diastoleClamped(b);
  if (held) drawHandleRest(ctx, rest, PALETTE.rock);
  drawHandleRing(ctx, {
    x: rest.x,
    y: rest.y,
    r: rest.r,
    hex: PALETTE.rock,
    rim: PALETTE.text,
    held,
    // The dial runs only while the window is open: a clamp caught on the
    // beat after the thumb shows a whole ring until that beat comes.
    pull: diastoleClampHolds(b, beat) ? diastoleClampRun(b, cfg, beat, beatPhase) : 0,
    time,
  });
}
