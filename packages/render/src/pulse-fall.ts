import {
  PULSE_LANES,
  type PulseLane,
  type PulseState,
  pulseCalls,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseVeiled,
} from "@neon-spore/sim";
import { drawPulseArrow, drawPulseReceptor } from "./pulse-arrow.js";
import type { PulseField } from "./pulse-lane.js";
import type { PulseSlabLook } from "./pulse-panel.js";
import type { ViewState } from "./renderer.js";

/**
 * The arrows themselves: what is falling, what is standing on the line, and
 * what the buttons underneath should be doing about it.
 *
 * Split out of `pulse-round.ts` on the 250-line limit, along the seam that was
 * already there: next door composes a screen — a title, a meter, a count-in, a
 * verdict, a panel — and everything here reads the *chart*. It is also the only
 * half that differs between the two seats, which makes it the half worth
 * finding.
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
  const r = Math.min(field.lanes[0]?.w ?? 40, 64) * 0.34;
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
  const r = Math.min(field.lanes[0]?.w ?? 40, 64) * 0.32;
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

/**
 * How close the nearest unresolved arrow in each lane is, 0..1.
 *
 * The panel is lit by it (`pulse-panel.ts`), and it is worked out here rather
 * than there because it is a question about the *chart* and the panel should
 * not have to know what a note is.
 */
export function laneApproach(view: ViewState, boss: PulseState): number[] {
  const cfg = view.world.cfg;
  const out = [0, 0, 0, 0];
  if (boss.phase !== "play") return out;
  const seat: 1 | 2 = view.role === "p2" ? 2 : 1;
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  for (let i = from; i < boss.notes.length; i++) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    if (pulseNoteTick(cfg, boss.startTick, note) - view.world.tick > cfg.pulseLeadTicks) break;
    if (judged[i] !== 0) continue;
    // A veiled arrow lights nothing: the button it belongs to is exactly what
    // this seat is not being told.
    if (pulseVeiled(note, seat)) continue;
    const at = Math.max(0, Math.min(1, pulseNoteAt(cfg, boss.startTick, note, view.world.tick)));
    const lane = pulseLaneIndex(note.lane);
    out[lane] = Math.max(out[lane] ?? 0, at ** 3);
  }
  return out;
}

/** What one slab should look like: whose lane it is, and what is happening in it. */
export function slabLook(
  id: string,
  seat: 1 | 2,
  near: number[],
  view: ViewState,
  boss: PulseState,
): PulseSlabLook {
  const match = /^pulse([12])(Left|Down|Up|Right)$/.exec(id);
  // Not one of ours: a draft wave on some other panel. Drawn plainly rather
  // than skipped — see `PulseSlabLook.lane`.
  if (match === null) return { lane: null, near: 0, press: 0 };
  const lane = (match[2] ?? "Left").toLowerCase() as PulseLane;
  const index = pulseLaneIndex(lane);
  const mine = match[1] === String(seat);
  const at = mine ? (near[index] ?? 0) : 0;
  const lastTick = seat === 1 ? boss.lastTick1 : boss.lastTick2;
  const lastLane = seat === 1 ? boss.lastLane1 : boss.lastLane2;
  const press =
    mine && lastLane === index && lastTick >= 0
      ? Math.max(0, 1 - (view.world.tick - lastTick) / FADE_TICKS)
      : 0;
  return { lane, near: at, press };
}
