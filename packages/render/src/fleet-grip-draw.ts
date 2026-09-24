import { type FleetState, fleetWindowLeft, type SimConfig, type World } from "@neon-spore/sim";
import { type Chart, chartOf } from "./fleet-chart.js";
import { drawDrainBar, FLEET_LATE } from "./fleet-clock.js";
import { FLEET_RING_MUL, fleetHoleCircle, fleetRingCentre, fleetWreckPull } from "./fleet-grip.js";
import { drawGripRing } from "./grip-rings.js";
import { drawHandleHint, type HandleWords, HINT_LOUD } from "./handle-word.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { seatOf } from "./view-role.js";

/**
 * **What the wound looks like while it is being worked** — the plume out of
 * it, the state's own clock under it, and this seat's ring on it.
 *
 * The three touches it belongs to are `fleet-grip.ts` next door, and that
 * header carries the argument for all of it: one circle, one ring a screen,
 * one word a screen. Split off it because the picture is the longer half and
 * a hit test is read on its own.
 */

/** How far the plume stands out of the hole, in squares. */
const PLUME_TILES = 1.5;

/** Whose each is, in words. Only ever read by the seat that owns it (`fleet-grip.ts`). */
const RAKE_WORDS: HandleWords = { seat: 1, mine: "RAKE", theirs: "P1'S" };
const KEEP_WORDS: HandleWords = { seat: 1, mine: "HOLD", theirs: "P1'S" };
const BREACH_WORDS: HandleWords = { seat: 2, mine: "HOLD", theirs: "P2'S" };
const WRECK_WORDS: HandleWords = { seat: 2, mine: "PULL", theirs: "P2'S" };

/** This seat's ring under this state: whether a thumb is on it, and its word. */
function gripOf(b: FleetState, seat: 1 | 2): { held: boolean; words: HandleWords } {
  if (seat === 1) return { held: b.rakeOn, words: b.phase === "flood" ? RAKE_WORDS : KEEP_WORDS };
  if (b.phase === "flood") return { held: b.breachHeld, words: BREACH_WORDS };
  return { held: b.wreckPullMilli > 0, words: WRECK_WORDS };
}

/**
 * The water standing out of the hole, on both screens, leaning as it goes.
 *
 * **Never taller than the chart it stands on.** `PLUME_TILES` of height
 * assumes a hole with a clear square and a half above it, which a ship holed
 * on the chart's own top row does not have — THE FLEET's authored second ship
 * reaches row 0. Capped at the hole's own distance from the chart's top edge
 * rather than clipped: a clip is `beginPath`, `rect` and `clip` more every
 * frame the wound is open, and this is arithmetic already in hand, for a
 * shape that was clipping its frame, not a look (`docs/queue.md`).
 */
function drawPlume(ctx: CanvasRenderingContext2D, c: Chart, hole: Circle, time: number): void {
  const h = Math.min(c.tile * PLUME_TILES, hole.y - c.top);
  ctx.save();
  ctx.strokeStyle = PALETTE.shield;
  ctx.lineWidth = STROKE.inner;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const lean = (i - 1) * c.tile * 0.24;
    const sway = Math.sin(time * 3 + i * 2.1) * c.tile * 0.22;
    ctx.globalAlpha = 0.42 + 0.26 * Math.sin(time * 5 + i);
    ctx.beginPath();
    ctx.moveTo(hole.x + lean * 0.3, hole.y);
    ctx.quadraticCurveTo(
      hole.x + lean + sway,
      hole.y - h * 0.55,
      hole.x + lean * 1.6 + sway,
      hole.y - h,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * The plume, the window under it and this seat's ring, drawn over the chart
 * and under nothing.
 *
 * The window is the round clock's own bar, narrowed to a couple of squares and
 * standing under the wound rather than under the chart — the same instrument
 * in the same colours, going red at the same eighth of itself, so a pair who
 * have learnt to read the long one read this one without being told
 * (`fleet-clock.ts`).
 *
 * Read off the world and this screen's role, and nothing else: a frame test
 * sets the world and gets the picture. Nothing here outlives its frame.
 */
export function drawFleetGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  b: FleetState,
  beatPhase: number,
  time: number,
): void {
  if (b.phase === "hunt") return;
  const c = chartOf(l, world);
  if (c.tile <= 0) return;
  const hole = fleetHoleCircle(c, b);

  drawPlume(ctx, c, hole, time);
  drawWindow(ctx, c, hole, world.cfg, b, fleetWindowLeft(world, b) - beatPhase);

  const seat = seatOf(l.role);
  const grip = gripOf(b, seat);
  const pull = seat === 2 ? fleetWreckPull(c, b) : 0;
  const at = fleetRingCentre(c, b, seat);
  drawGripRing(ctx, at.x, at.y + pull, hole.r * FLEET_RING_MUL, grip.held, time);
  // The word goes as soon as the thumb lands, the way THE MAZE's heart's does.
  if (!grip.held) {
    drawHandleHint(ctx, l, l.role, hole.x, hole.y + c.tile * 1.05, HINT_LOUD, grip.words);
  }
}

/** The state's own clock, a couple of squares wide, under the wound. */
function drawWindow(
  ctx: CanvasRenderingContext2D,
  c: Chart,
  hole: Circle,
  cfg: SimConfig,
  b: FleetState,
  beatsLeft: number,
): void {
  const span = b.phase === "flood" ? cfg.fleetFloodBeats : cfg.fleetWreckBeats;
  if (span <= 0) return;
  const left = Math.max(0, beatsLeft) / span;
  const w = c.tile * 1.8;
  const h = Math.max(2, c.tile * 0.09);
  ctx.save();
  drawDrainBar(ctx, hole.x - w / 2, hole.y + c.tile * 0.55, w, h, left, left < FLEET_LATE);
  ctx.restore();
}
