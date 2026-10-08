import { LIGHT_HALF, resample } from "@neon-spore/content";
import {
  type LatchState,
  latchKnotsAll,
  midCol,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { drawLatchHandles } from "./latch-handles.js";
import { type LatchPose, latchPose } from "./latch-pose.js";
import {
  type LatchBody,
  latchBodies,
  latchGripY,
  latchHang,
  latchKnotY,
  latchMilliPx,
  latchSkinLoops,
} from "./latch-shape.js";
import { drawLatchHalos, drawLatchVerdicts, type LatchVerdicts } from "./latch-verdicts.js";
import { type Layout, tileCX } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/** The tendril's width, a knot's radius and the spacing of its rings, in tiles. */
const TENDRIL = 0.16;
const KNOT = 0.2;
const RING_MILLI = 500;

/**
 * **THE LATCH** (§11.61): a colony of small ochre bodies in one skin hung
 * over the field, its tendril run down the middle and hooked into the hull,
 * and the two grips a column either side of it.
 *
 * **Both screens draw the one colony** and the one rope — the pair is
 * hauling the same thing — and only the grips differ by seat
 * (`latch-handles.ts`).
 *
 * **Progress is read off the body and the rope, never a bar**: the knots ride
 * down the tendril as it is hauled and pass the grips the instant the
 * simulation counts them, a ring every half tile so even a short pull is seen
 * to move it; every knot in tears a body off the colony; the rope hauled in
 * coils on the hull; and the colony is stretched toward the ship by the rope
 * pulled since the last knot, so a slip is seen to spring it back up.
 */
export function drawLatch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: LatchState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: LatchVerdicts,
): void {
  const cfg = world.cfg;
  const p = latchPose(s, cfg, beat, beatPhase);
  const bodies = latchBodies(l, cfg, s, p, time);
  drawTendril(ctx, l, cfg, s, p);
  drawColony(ctx, l, bodies, p);
  drawLatchHalos(ctx, l, cfg, s, time);
  drawLatchHandles(ctx, l, cfg, s, time);
  drawLatchVerdicts(ctx, l, cfg, s, time, fx.verdicts);
}

/** The tendril from the colony to the hull, its rings, its knots and its coil. */
function drawTendril(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: LatchState,
  p: LatchPose,
): void {
  const x = tileCX(l, midCol(cfg));
  const root = latchHang(l, cfg, p).y;
  // It shoots down to the hull as the colony arrives, and is left hanging
  // from the hull, torn off at the top, as the colony goes.
  const top = root + (l.hullY - root) * p.gone * 0.7;
  const bottom = root + (l.hullY - root) * p.arrived;
  if (bottom <= top) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.latchSkinDark;
  ctx.lineWidth = l.tile * TENDRIL + STROKE.outline * 2;
  line(ctx, x, top, bottom);
  ctx.strokeStyle = PALETTE.latchTendril;
  ctx.lineWidth = l.tile * TENDRIL;
  line(ctx, x, top, bottom);
  // The rings ride down with the rope, so every pull is seen to move it.
  ctx.strokeStyle = rgba(PALETTE.latchSkinDark, 0.7);
  ctx.lineWidth = STROKE.inner;
  const step = latchMilliPx(l, RING_MILLI);
  const first = latchGripY(l, cfg) + latchMilliPx(l, s.hauledMilli % RING_MILLI);
  for (let y = first - step * Math.ceil((first - top) / step); y < bottom; y += step) {
    if (y <= top) continue;
    ctx.beginPath();
    ctx.ellipse(x, y, l.tile * TENDRIL * 0.55, l.tile * 0.04, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
  for (let k = 1; k <= latchKnotsAll(s); k += 1) {
    const y = latchKnotY(l, cfg, s, k);
    if (y <= top + l.tile * KNOT || y >= bottom) continue;
    drawKnot(ctx, l, x, y, k <= s.knots, k === s.knots + 1);
  }
  if (p.arrived >= 1) drawCoil(ctx, l, x, s.hauledMilli);
}

function line(ctx: CanvasRenderingContext2D, x: number, y0: number, y1: number): void {
  ctx.beginPath();
  ctx.moveTo(x, y0);
  ctx.lineTo(x, y1);
  ctx.stroke();
}

/** A knot on the tendril: pale and lit while it is the next to come in, dull once it is in. */
function drawKnot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  pulledIn: boolean,
  next: boolean,
): void {
  const r = l.tile * KNOT;
  ctx.save();
  if (next) {
    ctx.fillStyle = rgba(PALETTE.latchKnot, 0.25);
    ctx.beginPath();
    ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = pulledIn ? PALETTE.latchSkin : PALETTE.latchKnot;
  ctx.strokeStyle = PALETTE.latchSkinDark;
  ctx.lineWidth = STROKE.outline;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.15, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** The rope hauled in, coiled on the hull round the hook: a loop more every two tiles of it. */
function drawCoil(ctx: CanvasRenderingContext2D, l: Layout, x: number, hauled: number): void {
  const loops = Math.min(5, 1 + Math.floor(hauled / 2000));
  ctx.save();
  ctx.lineWidth = l.tile * TENDRIL * 0.8;
  for (let i = 0; i < loops; i += 1) {
    const rx = l.tile * (0.3 + 0.09 * i);
    const y = l.hullY - l.tile * 0.06 * i;
    ctx.strokeStyle =
      i % 2 === 0
        ? PALETTE.latchTendril
        : mixHex(PALETTE.latchTendril, PALETTE.latchSkinDark, 0.35);
    ctx.beginPath();
    ctx.ellipse(x, y, rx, l.tile * 0.1, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** The colony: one skin round every body still on it, a nucleus in each, flushed pale as it rears. */
function drawColony(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  bodies: readonly LatchBody[],
  p: LatchPose,
): void {
  const path = new Path2D();
  for (const loop of latchSkinLoops(l, bodies)) path.addPath(splinePath(resample(loop, 40), true));
  ctx.save();
  ctx.fillStyle =
    p.rear > 0 ? mixHex(PALETTE.latchSkin, PALETTE.latchKnot, 0.35 * p.rear) : PALETTE.latchSkin;
  ctx.fill(path);
  // One light over the whole colony, and a crease where each body meets the
  // core, so it reads as bodies sharing one skin, not one lump with dents.
  const core = bodies[0];
  ctx.save();
  ctx.clip(path);
  if (core !== undefined) {
    const reach = Math.max(...bodies.map((b) => Math.hypot(b.x - core.x, b.y - core.y) + b.r));
    litRound(ctx, core.x, core.y, reach + 2, LIGHT_HALF.creature);
    ctx.strokeStyle = rgba(PALETTE.latchSkinDark, 0.55);
    ctx.lineWidth = STROKE.outline * 1.2;
    for (const b of bodies.slice(1)) {
      const toward = Math.atan2(core.y - b.y, core.x - b.x);
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.95, toward - 0.9, toward + 0.9);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = PALETTE.latchSkinDark;
  ctx.lineWidth = STROKE.outline * 1.5;
  ctx.stroke(path);
  for (const b of bodies) {
    const core = b.knot === 0;
    ctx.fillStyle = rgba(
      core ? PALETTE.latchSkinDark : PALETTE.latchKnot,
      core ? 0.8 : 0.45 + 0.4 * p.rear,
    );
    ctx.beginPath();
    ctx.arc(b.x, b.y + b.r * 0.05, b.r * (core ? 0.32 : 0.38), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
