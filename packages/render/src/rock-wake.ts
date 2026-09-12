import { hash01 } from "./backdrop.js";
import { rgba } from "./hex.js";

/**
 * WHAT A BURNING ROCK LEAVES BEHIND IT — the marks the three `creature:meteor`
 * candidates of 11 September 2026 share.
 *
 * The owner asked for meteors that are *very different* from the grey stone the
 * game draws: *the direction of the torch fireball I like, with more fire — it
 * must look like a real meteor with craters and nice torch and fire, and some
 * small smokes on small pieces behind it falling off.* Three answers to that
 * live under `candidates/creature-meteor/`, and they differ in kind — where the
 * fire is, what the stone is made of, what comes off it — while every one of
 * them needs a tongue of flame, a puff of smoke, a chip of rock and a stream of
 * pieces rising up the wake. The smoke, the chips and the stream are here,
 * once; the fire is next door in `wake-fire.ts`, for the file limit.
 *
 * **Everything is in the screen's frame and drawn from `time`.** `MeteorLook.body`
 * is called inside the rock's own rotation, so a candidate turns the context
 * back by `turn` before it draws any of this: a rock falls straight down its
 * lane, and its wake goes straight up behind it whatever the stone is doing.
 * Nothing here caches a frame — a candidate lives inside two renderers
 * stepping one world, and a module-level cache would be state shared between
 * the two sides of the pair.
 */

/** A rock's own phase, taken back out of `turn`: `drawRockBody` spins the
 * stone at 0.12 rad/s from a start that is the creature's id, so the start is
 * the one per-rock number a look is handed. In 0..1. */
export function rockPhase(turn: number, time: number): number {
  const turns = (turn - time * 0.12) / (Math.PI * 2);
  return turns - Math.floor(turns);
}

/** A puff of smoke: a soft grey disc, dense at its heart and gone at its
 * edge. Drawn over whatever is under it — smoke is the one thing here that is
 * not light. Concentric, like every gradient in these candidates: a radial
 * gradient with two centres came out flat or blank in the shots. */
export function puff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  alpha: number,
  tone = "#6B6C74",
): void {
  if (r <= 0 || alpha <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(tone, alpha));
  g.addColorStop(0.55, rgba(tone, alpha * 0.55));
  g.addColorStop(1, rgba(tone, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A chip of rock: five uneven sides round `(x, y)`, turned by `angle`. The
 * shape is fixed so a chip tumbling reads as one thing turning, not a thing
 * changing. */
export function chip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  fill: string,
  stroke: string,
): void {
  if (r <= 0) return;
  const R = [1, 0.7, 0.95, 0.6, 0.85];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < R.length; i++) {
    const a = (i / R.length) * Math.PI * 2;
    const m = R[i] ?? 1;
    const px = Math.cos(a) * r * m;
    const py = Math.sin(a) * r * m;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(0.6, r * 0.25);
  ctx.stroke();
  ctx.restore();
}

/** One piece on its way up the wake, everything a candidate needs to draw it. */
export interface Piece {
  /** Screen-frame position, in the rock's own radii; y is negative — behind. */
  readonly x: number;
  readonly y: number;
  /** 0 as it leaves the stone, 1 as it is gone. */
  readonly age: number;
  /** A per-piece number in 0..1 that never changes while the piece lives. */
  readonly seed: number;
  /** How far it has turned, in radians, growing with age. */
  readonly spin: number;
}

/**
 * The stream of pieces coming off the stone, each on its own clock: it leaves
 * at the rock's top, rises `reach` radii behind it while drifting sideways,
 * and is born again when it is spent. `speed` is pieces' lives per second.
 * The rock's phase goes into every seed, so two rocks in two lanes never shed
 * in step.
 */
export function pieces(
  count: number,
  time: number,
  phase: number,
  reach: number,
  speed: number,
  draw: (p: Piece) => void,
): void {
  for (let i = 0; i < count; i++) {
    const seed = hash01(i * 131 + Math.floor(phase * 977) + 7);
    const life = (time * speed * (0.7 + seed * 0.6) + seed) % 1;
    const age = life;
    const drift = (hash01(i * 17 + 3) - 0.5) * 1.6;
    const x = drift * age + Math.sin(time * 2.3 + seed * 6.28) * 0.12 * age;
    const y = -(0.7 + age * reach);
    draw({ x, y, age, seed, spin: seed * 6.28 + time * (2 + seed * 3) });
  }
}

/** A thread of smoke above a piece: three puffs growing as they rise, the
 * small smoke the owner asked for on every piece that comes off. */
export function thread(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  tone = "#7A7480",
): void {
  for (let k = 0; k < 3; k++) {
    const t = (k + 1) / 3;
    puff(
      ctx,
      x + Math.sin(k * 2.3) * size * 0.6,
      y - size * (1.5 + t * 3),
      size * (0.9 + t),
      alpha * (1 - t * 0.6),
      tone,
    );
  }
}

/** The rock's underside, in the screen frame: the half that meets the air.
 * A clip to it lets a candidate light the leading edge without lighting the
 * whole stone. */
export function underside(ctx: CanvasRenderingContext2D, r: number): void {
  ctx.beginPath();
  ctx.rect(-r * 1.6, 0, r * 3.2, r * 1.6);
  ctx.clip();
}
