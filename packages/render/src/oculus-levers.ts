import { type OculusState, oculusLitStep, oculusTapsEach, type SimConfig } from "@neon-spore/sim";
import { rgba } from "./hex.js";
import { type Layout, seatOf, type ViewRole } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_TRACK_W } from "./pull-track.js";

/**
 * **THE OCULUS's second and third levels, drawn on the lens** (the owner, 2
 * October 2026: *level 2 can be to not hold, but tap. and level 3 is to
 * rotate like done for "the maze" boss*).
 *
 * **A turn is a lever each on one ring round the lens**, at
 * `oculusLeverRadiusMilli`, the radius the simulation gears an arc by
 * (`sim/rim-turn.ts`): THE MAZE's channel and knob (`pull-track.ts`,
 * `pull-knob.ts`), the pilot's resting at nine o'clock and the navigator's
 * at three, both carried the same way round. **A knob stands where its own
 * count has taken it**, not under the thumb — only the arc turned while both
 * pull counts, so a knob standing still under a moving thumb is the picture
 * saying *the other one is not on*. The green behind each knob is that count.
 * A thumb may go back on anywhere in its half (`oculus-grip.ts`); the arc is
 * read from where it lands.
 *
 * **A tap is a row of pips on each seat's side of the ring**, one a tap that
 * seat owes (`oculusTapsEach`), lit green as they come.
 *
 * Drawn in the lens's frame, as `oculus-draw.ts` has it.
 */

/** The knob's radius, in tiles. */
export const OCULUS_KNOB = 0.42;

/** Where each seat's lever rests, in screen radians: the pilot's on the left. */
const REST = [Math.PI, 0] as const;

/** How far either side of its rest a seat's pips run, in radians. */
const PIPS_SPREAD = 0.9;

/** The lever ring's radius in pixels. */
export function oculusLeverRadius(l: Layout, cfg: SimConfig): number {
  return (cfg.oculusLeverRadiusMilli / 1000) * l.tile;
}

/** A seat's knob, `turned` thousandths of a degree on from its rest — the way a positive arc goes, anticlockwise on the screen. */
function knobAngle(side: 0 | 1, turned: number): number {
  return REST[side] - (turned / 360000) * Math.PI * 2;
}

const at = (r: number, a: number) => ({ x: Math.cos(a) * r, y: Math.sin(a) * r });

export function drawOculusLevers(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: OculusState,
  role: ViewRole,
  time: number,
): void {
  const step = oculusLitStep(s);
  if (step === null || s.phase !== "lit") return;
  if (step.ask !== "turn" && step.ask !== "tap") return;
  const r = oculusLeverRadius(l, cfg);
  const knob = OCULUS_KNOB * l.tile;
  const w = knob * PULL_TRACK_W;
  ctx.save();
  ctx.lineCap = "round";
  ring(ctx, r, w);
  for (const side of [0, 1] as const) {
    if (step.ask === "tap") pips(ctx, l, r, side, s.taps[side], oculusTapsEach(step));
    else lever(ctx, r, side, s, role, time, knob, w);
  }
  ctx.restore();
}

/** The quiet channel, the whole way round: `drawPullTrack`'s three strokes. */
function ring(ctx: CanvasRenderingContext2D, r: number, w: number): void {
  const p = new Path2D();
  p.arc(0, 0, r, 0, Math.PI * 2);
  const stroke = (colour: string, width: number, alpha: number): void => {
    ctx.strokeStyle = rgba(colour, alpha);
    ctx.lineWidth = width;
    ctx.stroke(p);
  };
  stroke(PALETTE.hullRim, w * 2 + STROKE.inner * 2, 0.45);
  stroke(PALETTE.background, w * 2, 1);
  stroke(PALETTE.hullRim, w * 2, 0.12);
}

function lever(
  ctx: CanvasRenderingContext2D,
  r: number,
  side: 0 | 1,
  s: OculusState,
  role: ViewRole,
  time: number,
  knob: number,
  w: number,
): void {
  const turned = s.turned[side];
  const a = knobAngle(side, turned);
  if (turned > 0) {
    // The count, green behind the knob, a lap at most.
    const from = REST[side];
    const to = Math.max(a, from - Math.PI * 2);
    ctx.strokeStyle = rgba(PALETTE.good, 0.95);
    ctx.lineWidth = w * 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, r, to, from);
    ctx.stroke();
  }
  const mine = role === "test" || seatOf(role) === side + 1;
  const way = { dx: Math.sin(a), dy: -Math.cos(a) };
  drawPullKnob(ctx, at(r, a), knob, {
    hex: PALETTE.hullRim,
    rim: PALETTE.text,
    held: s.held[side],
    time,
    way: mine ? way : null,
    theirs: !mine,
  });
}

function pips(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  r: number,
  side: 0 | 1,
  given: number,
  owed: number,
): void {
  const pip = l.tile * 0.13;
  for (let i = 0; i < owed; i++) {
    // Bottom to top on either side, so both rows fill the same way up.
    const k = owed === 1 ? 0.5 : i / (owed - 1);
    const lift = (k - 0.5) * 2 * PIPS_SPREAD;
    const a = side === 0 ? REST[0] + lift : REST[1] - lift;
    const p = at(r, a);
    const lit = i < given;
    ctx.fillStyle = rgba(lit ? PALETTE.good : PALETTE.background, lit ? 0.95 : 1);
    ctx.strokeStyle = rgba(lit ? PALETTE.good : PALETTE.hullRim, 0.8);
    ctx.lineWidth = STROKE.inner;
    ctx.beginPath();
    ctx.arc(p.x, p.y, pip, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}
