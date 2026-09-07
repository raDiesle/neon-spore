import {
  PULSE_LANES,
  type PulseState,
  pulseCalls,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseVeiled,
} from "@neon-spore/sim";
import { drawPulseArrow, drawPulseReceptor } from "./pulse-arrow.js";
import type { PulseField } from "./pulse-lane.js";
import type { ViewState } from "./renderer.js";

/**
 * The arrows themselves: what is falling, what is standing on the line, and
 * what the buttons underneath should be doing about it.
 *
 * Split out of `pulse-round.ts` on the 250-line limit, along the seam that was
 * already there: next door composes a screen — a title, a meter, a count-in, a
 * verdict, the ship — and everything here reads the *chart*. It is also the
 * only half that differs between the two seats, which makes it the half worth
 * finding.
 *
 * **What the four buttons should be doing about it is not here any more.**
 * They are lobes on the band now rather than a panel of the round's own, and a
 * lobe's face is drawn from inside the band's own pass off nothing but the
 * world (`pulse-button.ts`).
 *
 * **Nothing here works out where a lane is.** `PulseField` is handed in, and it
 * was read off the buttons rather than laid out beside them (`pulse-lane.ts`).
 */

/** How long a judgement stands on a receptor before it fades, in ticks. */
const FADE_TICKS = 45;

/** Every arrow this seat still owes, from the cursor forward. */
export function drawArrows(
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
  const r = Math.min(field.lanes[0]?.w ?? 40, 72) * 0.42;
  for (let i = from; i < boss.notes.length; i++) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    if (pulseNoteTick(cfg, boss.startTick, note) - tick > cfg.pulseLeadTicks) break;
    if (judged[i] !== 0) continue;
    const at = pulseNoteAt(cfg, boss.startTick, note, tick);
    const y = field.topY + (field.lineY - field.topY) * at;
    const veiled = pulseVeiled(note, seat);
    // A veiled arrow has no lane on this screen — it comes down the middle,
    // which is the only place that gives nothing away.
    const x = veiled
      ? (field.lanes[1]?.x ?? 0) / 2 + (field.lanes[2]?.x ?? 0) / 2
      : (field.lanes[pulseLaneIndex(note.lane)]?.x ?? 0);
    drawPulseArrow(ctx, {
      x,
      y,
      r,
      lane: note.lane,
      time: view.time,
      near: Math.max(0, Math.min(1, at)),
      veiled,
      calls: pulseCalls(note, seat),
    });
  }
}

/** The four empty arrows on the line, lit by what this seat just did. */
export function drawReceptors(
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
  const r = Math.min(field.lanes[0]?.w ?? 40, 72) * 0.4;
  PULSE_LANES.forEach((lane, i) => {
    const box = field.lanes[i];
    if (box === undefined) return;
    const mine = lastLane === i ? fade : 0;
    drawPulseReceptor(
      ctx,
      box.x,
      field.lineY,
      r,
      lane,
      last === 1 || last === 2 ? mine : 0,
      last === 3 || last === 4 ? mine : 0,
    );
  });
}
