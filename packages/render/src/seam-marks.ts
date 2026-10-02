import {
  type SeamState,
  type SeamStep,
  seamLitStep,
  seamStepBeats,
  seamStepCol,
  seamWantsShot,
  type World,
} from "@neon-spore/sim";
import { fieldX } from "./field-flip.js";
import { strokeGlow } from "./glow.js";
import { heartLight } from "./heartbeat.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { phaseInto } from "./phase-into.js";
import { type Point, seamLobe, seamMouth, seamPointPath } from "./seam-shape.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE SEAM's marks**: the three things that say what a step asks — the lit
 * point, which is *shoot here, in this colour*; the grit, which is *shield
 * under the ridge*; and the rock, which is *shoot it out, in its column*.
 * Cut from `seam-draw.ts` the day it was written, along the line its second
 * half will grow on — the cue words come here. Where the lit step's throw
 * stands is here too (`seamThrow`), read by the drawer and told to the fx
 * (`seam-fx.ts`), which bursts a rock shot out where it was.
 */

/**
 * The lit point: its opening on the crack glowing in the step's colour, and a
 * ring round it closing as the step's beats run out. Laid in the ridge's own
 * frame, like the crack it sits on.
 *
 * **It beats like a heart** — the owner, 1 October 2026: the part to shoot
 * "must clearly highlight what to shoot in this colour … and it must beat
 * like vulnerable hearth". The lens brightens on the lub and again, softer,
 * on the dub (`heartbeat.ts`); at rest between beats it is still lit, never
 * dark. **It is lit from inside and nowhere else** (`part-light.ts`, the
 * owner, 2 October 2026): no glow behind it, no swell past the crack, and its
 * edge the crack's own grey, so the ridge round it still reads.
 */
export function drawSeamPoint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  k: number,
  step: SeamStep,
  left: number,
  beatPhase: number,
): void {
  const { body } = stepColour(step.color);
  const { y, h } = seamLobe(l, k);
  const lens = seamPointPath(l, k);
  lightWithin(ctx, lens, body, heartLight(beatPhase), { x: 0, y, r: h * 0.5 });
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.7);
  ctx.stroke(lens);
  const ring = new Path2D();
  ring.arc(0, y, h * 0.75, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  ctx.strokeStyle = rgba(body, 0.75);
  ctx.stroke(ring);
}

/**
 * The grit: shards thrown from the gaping crack and falling down the middle
 * column to the hull over the step's beats, spread as they go — the shield
 * under the ridge is what takes them. Grey, like the ridge they came off.
 */
export function drawSeamGrit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  along: number,
  time: number,
): void {
  const shards = 7;
  for (let i = 0; i < shards; i++) {
    const lag = (i % 3) * 0.12;
    const t = Math.max(0, Math.min(1, along - lag));
    if (t <= 0) continue;
    const spread = (i - (shards - 1) / 2) * 0.16 * l.tile * t;
    const x = from.x + spread;
    const y = from.y + (l.hullY - from.y) * t;
    const r = l.tile * (0.07 + 0.02 * (i % 2));
    const shard = new Path2D();
    const turn = time * 3 + i;
    for (let j = 0; j < 3; j++) {
      const a = turn + (j * Math.PI * 2) / 3;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (j === 0) shard.moveTo(px, py);
      else shard.lineTo(px, py);
    }
    shard.closePath();
    ctx.fillStyle = rgba(PALETTE.rock, 0.5 + 0.4 * t);
    ctx.fill(shard);
  }
}

/**
 * The rock: spat from the crack's mouth across to its column and falling to
 * the hull over the step's beats — in the colour a shot must be to break it,
 * or white when either will. Shot out, it is gone.
 */
export function drawSeamRock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: Point,
  toX: number,
  step: SeamStep,
  along: number,
  time: number,
): void {
  const { body, rim } = stepColour(step.color);
  const { x, y } = seamRockAt(l, from, toX, along);
  const r = l.tile * 0.3;
  const pts = 7;
  const lump = new Path2D();
  for (let i = 0; i < pts; i++) {
    const a = time * 1.5 + (i * Math.PI * 2) / pts;
    const m = r * (1 + 0.14 * Math.sin(i * 2.3));
    if (i === 0) lump.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else lump.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  lump.closePath();
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(lump);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(body, 0.9);
  ctx.stroke(lump);
  strokeGlow(ctx, lump, rim, STROKE.inner, 1);
}

/** Where the rock is, `along` of the way through its step: across to its column in the first third, arcing, then down. */
export function seamRockAt(l: Layout, from: Point, toX: number, along: number): Point {
  const across = Math.min(1, along * 3);
  const arc = -Math.sin(across * Math.PI) * 0.6 * l.tile;
  return { x: from.x + (toX - from.x) * across, y: from.y + (l.hullY - from.y) * along + arc };
}

/**
 * What the lit step throws, off the ridge standing at `c`: the mouth it leaves,
 * how far down it has fallen, and the column the rock falls to — `null` while
 * no rock is owed.
 */
export interface SeamThrow {
  step: SeamStep;
  from: Point;
  along: number;
  toX: number | null;
}

export function seamThrow(
  l: Layout,
  world: World,
  s: SeamState,
  c: Point,
  beat: number,
  beatPhase: number,
): SeamThrow | null {
  const step = seamLitStep(s);
  if (step === null) return null;
  const mouth = seamMouth(l);
  const from = { x: c.x + mouth.x, y: c.y + mouth.y };
  const along = Math.min(1, phaseInto(s, beat, beatPhase) / Math.max(1, seamStepBeats(world, s)));
  const rocks = (step.ask === "rock" || step.ask === "both") && seamWantsShot(s);
  return { step, from, along, toX: rocks ? fieldX(l, seamStepCol(world, step)) : null };
}

/** Where the thrown rock is, or `null` with none in flight. */
export function seamRockNow(l: Layout, t: SeamThrow | null): Point | null {
  return t === null || t.toX === null ? null : seamRockAt(l, t.from, t.toX, t.along);
}
