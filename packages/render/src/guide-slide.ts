import type { ControlSet } from "@neon-spore/content";
import { framePhase, type SceneRun, type SimEvent } from "@neon-spore/sim";
import { seatLayout } from "./guide-film.js";
import type { SeatView } from "./guide-seat.js";
import { drawSwitchSeam } from "./guide-switch.js";
import type { Layout } from "./layout.js";

/**
 * The move from one seat's screen to the other, drawn.
 *
 * `guide-switch.ts` answers *where* a page is in the move — `from`, the seat
 * it left, and `k`, how far along — and this is the picture that answer
 * produces: the outgoing screen sliding off to the left, the incoming one
 * following it in from the right, clipped to the film's own rectangle so
 * neither ever draws outside it, and the lit seam that travels with the
 * join. Lifted out of `guide-scene.ts` (`docs/queue.md`, 19 September 2026)
 * once that file was three jobs at 227 lines: this is the one of the three
 * that reads off `pageSwitch` and needs `handedSeat` twice, next to the page
 * — the caption, the hands, the band and the bar — which stayed, and the
 * state, which is `GuideStage` itself.
 */
export function drawSlide(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seats: readonly [SeatView, SeatView],
  run: SceneRun,
  events: readonly SimEvent[],
  shown: 1 | 2,
  from: 1 | 2 | null,
  k: number,
  time: number,
  set: ControlSet,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, l.width, l.height);
  ctx.clip();
  if (from !== null && k < 1) drawSeat(ctx, l, seats, run, events, from, -l.width * k, time, set);
  drawSeat(ctx, l, seats, run, events, shown, from === null ? 0 : l.width * (1 - k), time, set);
  if (from !== null && k < 1) drawSwitchSeam(ctx, l, l.width * (1 - k));
  ctx.restore();
}

function drawSeat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seats: readonly [SeatView, SeatView],
  run: SceneRun,
  events: readonly SimEvent[],
  seat: 1 | 2,
  dx: number,
  time: number,
  set: ControlSet,
): void {
  ctx.save();
  ctx.translate(dx, 0);
  const own = seatLayout(l, seat, run.world); // the outgoing seat's own fold
  seats[seat - 1]!.draw(ctx, own, {
    world: run.world,
    beatPhase: framePhase(run.world),
    role: own.role,
    time,
    // A frame's own seconds, so a lobe eases at the speed it eases at on a
    // phone rather than at the speed the rehearsal's ticks happen to arrive.
    dt: 1 / 60,
    events,
    running: true,
    controls: set,
    // **Nothing stands over this screen**: since 18 September 2026 the
    // picture is laid out below the band (`guide-film.ts`), so a round's
    // header no longer has to drop under it (`round-header.ts`).
    // **And a film is not a run the pair can lose**: the screen a lost wave
    // puts up asks about a wave nobody is playing (`briefing.ts`).
    rehearsal: true,
  });
  ctx.restore();
}
