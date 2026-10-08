import { type LatchState, latchLitStep, midCol, type SimConfig } from "@neon-spore/sim";
import { seatIsMine } from "./handle-word.js";
import { rgba } from "./hex.js";
import { latchGripPlayer, latchTakesHand } from "./latch-grip.js";
import { latchGripRest, latchKnobAt, latchMilliPx } from "./latch-shape.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_DOWN, straightPullTrack } from "./pull-line.js";
import { drawPullTrack } from "./pull-track.js";

/**
 * **THE LATCH's two grips**, in the field's one look for a thumb's control
 * (`pull-knob.ts`, `pull-track.ts`): the owner, 5 October 2026, *use the
 * default visuals for on screen controls we have*.
 *
 * Each grip is a knob one column off the tendril, tied to it by a strap that
 * pulls taut while a thumb has it. **The grip whose turn it is to pull** wears
 * the arrow down and, on its own seat's screen, the channel as long as one
 * pull, filling as the thumb carries it; **the other grip** is a knob with no
 * arrow — it is only held. The partner's knob is drawn too, dim and with no
 * channel: what says their thumb has landed (`sinew-handles.ts`).
 */
export function drawLatchHandles(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LatchState,
  time: number,
): void {
  if (!latchTakesHand(s)) return;
  const lit = latchLitStep(s) !== null;
  const reach = Math.max(1, cfg.latchReachMilli);
  const ropeX = tileCX(l, midCol(cfg));
  for (const grip of [0, 1] as const) {
    const mine = seatIsMine(l.role, latchGripPlayer(s, grip));
    const rest = latchGripRest(l, cfg, grip);
    const at = latchKnobAt(l, cfg, s, grip);
    const held = s.down[grip];
    const pulls = lit && grip === s.turn;
    drawStrap(ctx, l, at, ropeX, held);
    if (pulls && mine) {
      const track = straightPullTrack({
        from: rest,
        r: rest.r,
        head: at,
        held,
        rest: PULL_DOWN,
        len: latchMilliPx(l, reach),
        follow: false,
      });
      const along = Math.min(1, s.depthMilli[grip] / reach);
      drawPullTrack(ctx, track, { ...look(mine), held, origin: 0, at: along, time });
    }
    const way = pulls && mine ? PULL_DOWN : null;
    drawPullKnob(ctx, at, rest.r, { ...look(mine), held, time, way, theirs: !mine });
  }
}

/** The strap from a knob to the tendril: taut while held, sagging while not. */
function drawStrap(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: { x: number; y: number; r: number },
  ropeX: number,
  held: boolean,
): void {
  const from = at.x + Math.sign(ropeX - at.x) * at.r * 0.9;
  const sag = held ? 0 : l.tile * 0.35;
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.latchTendril, held ? 0.95 : 0.6);
  ctx.lineWidth = l.tile * (held ? 0.1 : 0.07);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(from, at.y);
  ctx.quadraticCurveTo((from + ropeX) / 2, at.y + sag, ropeX, at.y);
  ctx.stroke();
  ctx.restore();
}

/** A knob's colours: THE MAZE's on this screen's own, dim on the partner's. */
function look(mine: boolean): { hex: string; rim: string } {
  return mine
    ? { hex: PALETTE.hullRim, rim: PALETTE.text }
    : { hex: PALETTE.dim, rim: PALETTE.rock };
}
