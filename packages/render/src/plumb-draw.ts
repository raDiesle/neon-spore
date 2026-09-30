import { LIGHT_HALF } from "@neon-spore/content";
import {
  PLUMB_SETTLES_PER_WEIGHT,
  type PlumbState,
  plumbLitStep,
  type World,
} from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import { seatIsMine } from "./handle-word.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPlumbBleed } from "./plumb-bleed-light.js";
import type { PlumbFx } from "./plumb-fx.js";
import { drawPlumbCore, drawPlumbGlass } from "./plumb-marks.js";
import {
  plumbArrived,
  plumbBled,
  plumbFree,
  plumbLeft,
  plumbSkew,
  plumbStoneSize,
  plumbSwing,
  plumbTurn,
} from "./plumb-pose.js";
import {
  plumbBallR,
  plumbBeamEnd,
  plumbBeamPath,
  plumbChain,
  plumbHook,
  plumbHookPath,
  plumbLift,
  plumbSacBottom,
  plumbSacMiddle,
  plumbSacPath,
  plumbSacRadius,
} from "./plumb-shape.js";
import { drawPlumbWeight } from "./plumb-weight.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE PLUMB**: a lopsided bob hung off a hook over the middle column, a
 * beam across it with a ball on a chain at each end — the pilot's heavier —
 * each brought true by one seat holding its phone level, and then a core in
 * the bob's belly both cannons are asked to hit (§11.48,
 * `bosses-choreographed.md` §31).
 *
 * **Both screens are drawn the same**, but for the arrow in each ball, which
 * is on its own seat's screen alone: a level is one seat's, but the other has
 * to see which ball swings and how far its partner's bubble is off to say so.
 *
 * **Old bronze on a thread of light**: the body a dull olive bronze that is
 * neither cannon's colour, the glass a pale green-white, and the only colour
 * on it is what a step asks for — the core in its cannon's colour. **Its
 * health is the tilt and the core**: the beam comes level a quarter per
 * settle, and the core is smaller and brighter for every hit. A settle and
 * a core hit shake the bob and wash its sac red (`boss-hurt.ts`, the blow
 * every boss takes). Nothing here outlives a frame.
 */
export function drawPlumb(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: PlumbState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: PlumbFx,
): void {
  const arrived = plumbArrived(s, world, beat, beatPhase);
  const free = plumbFree(s, world, beat, beatPhase);
  const hook = plumbHook(l, world.cfg);
  const alpha = (0.2 + 0.8 * arrived) * (1 - free);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(hook.x + fx.hurt.shakeX(time, l.tile), hook.y - plumbLift(l, arrived));
  for (const side of [0, 1] as const) {
    drawPlumbGlass(ctx, l, s, side, beatPhase);
    ctx.globalAlpha = alpha;
  }
  drawPlumbLine(ctx, l);

  // Free, the bob swings wide as it goes: a swing that grows while it fades.
  const skew = plumbSkew(s, beatPhase) + 0.6 * free * Math.sin(free * Math.PI * 3);
  ctx.save();
  ctx.rotate(skew);
  drawBob(ctx, l, world, s, beat, beatPhase, time, fx);
  ctx.restore();

  for (const side of [0, 1] as const) {
    const end = plumbBeamEnd(l, side, skew);
    const swing = plumbSwing(s, world, side, beat, beatPhase, time);
    const reach = plumbChain(l);
    const fall = free * free * 6 * l.tile;
    const ball = {
      x: end.x + Math.sin(swing) * reach,
      y: end.y + Math.cos(swing) * reach + fall,
    };
    const size = plumbStoneSize(s, world, side);
    drawPlumbWeight(
      ctx,
      l,
      side,
      end,
      ball,
      size,
      s.weights[side] >= PLUMB_SETTLES_PER_WEIGHT,
      free > 0,
      seatIsMine(l.role, side === 0 ? 1 : 2),
      time,
    );
    const bled = plumbBled(s, world, side, beat, beatPhase);
    const stone = { ...ball, r: plumbBallR(l, side) * size };
    if (bled !== null) drawPlumbBleed(ctx, l, skew, side, stone, bled);
    // The painted settle, behind `?raster=1`, hung from where this chain is.
    ctx.save();
    ctx.translate(end.x, end.y);
    fx.swing.draw(ctx, side);
    ctx.restore();
  }
  ctx.restore();
}

/** The field's true down under the hook: a faint thread the sac is read against. */
function drawPlumbLine(ctx: CanvasRenderingContext2D, l: Layout): void {
  const line = new Path2D();
  const bottom = plumbSacMiddle(l).y + plumbSacBottom(l) + 0.4 * l.tile;
  line.moveTo(0, 0);
  line.lineTo(0, bottom);
  ctx.lineWidth = STROKE.inner * 0.6;
  ctx.strokeStyle = rgba(PALETTE.plumbGlass, 0.3);
  ctx.stroke(line);
}

/**
 * The hook, the beam and the sac, in the beam's turned frame. The sac is seen
 * towards its edge — narrow, a ridge down it where its two faces meet — until
 * it turns to show its core; the ridge slides off to the rim as it does.
 */
function drawBob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: PlumbState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: PlumbFx,
): void {
  const hook = plumbHookPath(l);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.plumbBronze, 0.95);
  ctx.stroke(hook);
  const beam = plumbBeamPath(l);
  ctx.fillStyle = rgba(PALETTE.plumbBronzeDark, 0.95);
  ctx.fill(beam);
  ctx.strokeStyle = rgba(PALETTE.plumbBronze, 0.9);
  ctx.stroke(beam);

  const turn = plumbTurn(s, world, beat, beatPhase);
  const wide = 0.62 + 0.38 * turn;
  const mid = plumbSacMiddle(l);
  const { rx, ry } = plumbSacRadius(l);
  ctx.save();
  ctx.translate(mid.x, mid.y);
  const sac = plumbSacPath(l, wide, time);
  ctx.fillStyle = rgba(PALETTE.background, 0.9);
  ctx.fill(sac);
  ctx.fillStyle = rgba(PALETTE.plumbBronze, 0.55);
  ctx.fill(sac);
  ctx.save();
  ctx.clip(sac);
  litRound(ctx, -rx * 0.2 * wide, ry * 0.2, Math.max(rx, ry) * 1.2, LIGHT_HALF.rock);
  if (turn < 0.98) {
    const ridge = new Path2D();
    const x = rx * wide * 0.9 * turn;
    ridge.moveTo(x, -ry);
    ridge.quadraticCurveTo(x * 1.1, ry * 0.4, x, ry * 1.6);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.plumbBronzeDark, 0.8 * (1 - turn));
    ctx.stroke(ridge);
  }
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.plumbBronze, 0.95);
  ctx.stroke(sac);
  drawHurt(ctx, sac, fx.hurt.value);

  const step = plumbLitStep(s);
  const fire =
    step !== null && step.ask === "fire" && s.coreLit
      ? { color: step.color, left: plumbLeft(s, world, beat, beatPhase) }
      : null;
  if (fire !== null) fx.tell(stepColour(fire.color).rim);
  // Once the last shot is in, the core's light has left it for the chains.
  const glowing = s.coreLit && s.phase !== "bleed" && s.phase !== "free";
  drawPlumbCore(ctx, l, turn, coreHurt(s.hits), glowing, fire, beatPhase);
  ctx.restore();
}
