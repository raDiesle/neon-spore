import {
  PULSE_LANES,
  type PulseNote,
  type PulseState,
  pulseCalls,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseVeiled,
} from "@neon-spore/sim";
import { drawPulseArrival, drawPulseSocket } from "./pulse-body.js";
import type { PulseField } from "./pulse-lane.js";
import type { ViewState } from "./renderer.js";

/**
 * What is falling down the screen, and the four empty sockets in the ship it
 * is falling into.
 *
 * Split out of `pulse-round.ts` on the 250-line limit, along the seam that was
 * already there: next door composes a screen — a title, a meter, a count-in, a
 * verdict, the ship — and everything here reads the *chart*. It is also the
 * only half that differs between the two seats, which makes it the half worth
 * finding.
 *
 * **What the four buttons should be doing about it is not here.** They are
 * lobes on the band, and a lobe's face is drawn from inside the band's own
 * pass off nothing but the world (`pulse-button.ts`).
 */

/** How long a judgement stands on a socket before it fades, in ticks. */
const FADE_TICKS = 45;

/** Every arrival this seat still owes, from the cursor forward. */
export function drawArrivals(
  ctx: CanvasRenderingContext2D,
  view: ViewState,
  boss: PulseState,
  field: PulseField,
  seat: 1 | 2,
): void {
  const cfg = view.world.cfg;
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  const tick = view.world.tick;
  const r = bodyRadius(field);
  for (let i = from; i < boss.notes.length; i++) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    if (pulseNoteTick(cfg, boss.startTick, note) - tick > cfg.pulseLeadTicks) break;
    if (judged[i] !== 0) continue;
    const at = pulseNoteAt(cfg, boss.startTick, note, tick);
    const veiled = pulseVeiled(note, seat);
    const box = arrivalBox(field, note, seat);
    if (box === undefined) continue;
    drawPulseArrival(ctx, {
      x: box.x,
      // **It comes to rest in its socket and waits there.** `pulseNoteAt`
      // keeps counting past 1 — a thumb is still in time for eighteen ticks
      // after the beat — and an unclamped body spent that whole grace period
      // sliding down through the hull, so by the tick it was finally called a
      // miss it was already out of sight underneath the ship and there was
      // nothing left to drop. Resting is also the truer picture: the body has
      // reached the ship, and what happens next is whether anybody deals with
      // it (`pulse-drop.ts` takes it from there).
      y: Math.min(box.landY, field.topY + (box.landY - field.topY) * at),
      r,
      lane: note.lane,
      seed: i,
      time: view.time,
      near: Math.max(0, Math.min(1, at)),
      veiled,
      calls: pulseCalls(note, seat),
    });
  }
}

/**
 * Which lane a note falls down **on this seat's screen**, and where it lands.
 *
 * A veiled one has no lane here: it comes down between the two middle ones, at
 * the skin halfway between theirs, which is the only place that gives nothing
 * away. Halfway rather than at either, because a body that landed on one
 * lane's own skin would be standing in that lane.
 *
 * Exported because the fall and what becomes of a dropped one are two files
 * and this is one rule (`pulse-drop.ts`). A second copy of *where a veil comes
 * down* is a veil that lands somewhere the eye did not follow it to.
 */
export function arrivalBox(
  field: PulseField,
  note: PulseNote,
  seat: 1 | 2,
): { x: number; landY: number } | undefined {
  if (!pulseVeiled(note, seat)) return field.lanes[pulseLaneIndex(note.lane)];
  const a = field.lanes[1];
  const b = field.lanes[2];
  if (a === undefined || b === undefined) return field.lanes[0];
  return { x: (a.x + b.x) / 2, landY: (a.landY + b.landY) / 2 };
}

/** How big a body is drawn. One number, so all four are the same size. */
export function bodyRadius(field: PulseField): number {
  return Math.min(field.lanes[0]?.w ?? 40, 72) * 0.42;
}

/** The four empty sockets in the hull, lit by what this seat just did. */
export function drawSockets(
  ctx: CanvasRenderingContext2D,
  view: ViewState,
  boss: PulseState,
  field: PulseField,
  seat: 1 | 2,
): void {
  const last = seat === 1 ? boss.last1 : boss.last2;
  const lastTick = seat === 1 ? boss.lastTick1 : boss.lastTick2;
  const lastLane = seat === 1 ? boss.lastLane1 : boss.lastLane2;
  const age = lastTick < 0 ? 1 : (view.world.tick - lastTick) / FADE_TICKS;
  const fade = Math.max(0, 1 - age);
  const r = bodyRadius(field) * 0.86;
  PULSE_LANES.forEach((lane, i) => {
    const box = field.lanes[i];
    if (box === undefined) return;
    const mine = lastLane === i ? fade : 0;
    drawPulseSocket(
      ctx,
      box.x,
      box.landY,
      r,
      lane,
      last === 1 || last === 2 ? mine : 0,
      last === 3 || last === 4 ? mine : 0,
    );
  });
}
