import type { GlobBall, Spark } from "./instar-spit.js";
import { PALETTE } from "./palette.js";
import { type SpriteSpec, spritePow2, spriteRng, tintedSprite } from "./sprite-bake.js";

/**
 * **THE INSTAR's fire, baked** — the eighth and ninth examples
 * (`sprite-bake.ts`): the second act's globs out of the mouth and the embers
 * off the wings (`instar-spit.ts`).
 *
 * The shipped glob is one gradient ball and five discs behind it. Here it is a
 * ball of fire: tongues of flame licking off its edge, darker smoke curls
 * inside, and a white-hot core, in
 * four frames the tongues churn through, longest up its back where the fall blows them. The trail is the same painting,
 * shrinking and fading, so the flame reads as one thing leaving itself
 * behind. An ember is a soft halo, a hot core and a four-point glint, one
 * `drawImage` where the game draws two discs.
 *
 * Not drawn by the game: offered in VERSUS on `instar:spit`
 * (`tools/versus/candidates/instar-spit/baked`).
 */

const TONGUES = 14;
/** How fast the tongues churn, in frames a second. */
const CHURN = 12;

/** The unit disc onto the `w` × `h` box: the ball's outer glow at radius 1. */
function frame(g: CanvasRenderingContext2D, w: number, h: number): void {
  g.translate(w / 2, h / 2);
  g.scale(w / 2, h / 2);
  g.lineCap = "round";
}

function soft(g: CanvasRenderingContext2D, x: number, y: number, r: number, a: number): void {
  const d = g.createRadialGradient(x, y, 0, x, y, r);
  d.addColorStop(0, `rgba(255,255,255,${a})`);
  d.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = d;
  g.fillRect(x - r, y - r, r * 2, r * 2);
}

function globBody(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  frame(g, w, h);
  soft(g, 0, 0, 0.8, 0.8);
  // Tongues of flame off the edge: puffs shrinking outward along a curling
  // ray, longer up the back, where the fall blows them.
  const rnd = spriteRng(71);
  for (let k = 0; k < TONGUES; k++) {
    const a = (k / TONGUES) * Math.PI * 2 + rnd() * 0.5;
    const up = 0.75 - 0.35 * Math.sin(a);
    const reach = (0.55 + 0.35 * Math.sin(i * 1.9 + k * 2.3) ** 2) * up + rnd() * 0.1;
    for (let n = 0; n < 4; n++) {
      const t = 0.35 + (reach - 0.35) * (n / 3);
      const curl = a + 0.15 * n * Math.sin(i + k);
      soft(g, Math.cos(curl) * t, Math.sin(curl) * t, 0.2 * (1 - n * 0.2), 0.5 - n * 0.08);
    }
  }
  // Smoke in the ball: dark puffs that roll with the churn.
  g.globalCompositeOperation = "destination-out";
  for (let k = 0; k < 4; k++) {
    const a = k * 1.7 + i * 0.6 + rnd() * 0.4;
    soft(g, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.14, 0.4);
  }
  g.globalCompositeOperation = "source-over";
}

function globLight(g: CanvasRenderingContext2D, w: number, h: number, i: number): void {
  frame(g, w, h);
  soft(g, 0, 0.05, 0.42, 1);
  // Hot licks inside the core, moving with the churn.
  const rnd = spriteRng(73);
  for (let k = 0; k < 5; k++) {
    const a = rnd() * Math.PI * 2 + i * 0.8;
    const d = 0.15 + rnd() * 0.2;
    soft(g, Math.cos(a) * d, Math.sin(a) * d, 0.12, 0.6);
  }
}

export const GLOB_SPRITE: SpriteSpec = {
  name: "instar-glob",
  frames: 4,
  aspect: 1,
  body: globBody,
  light: globLight,
};

function sparkBody(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  soft(g, 0, 0, 1, 0.5);
}

function sparkLight(g: CanvasRenderingContext2D, w: number, h: number): void {
  frame(g, w, h);
  soft(g, 0, 0, 0.42, 1);
  // A four-point glint: the spark caught mid-flare.
  g.strokeStyle = "rgba(255,255,255,0.7)";
  for (const [x, y, lw] of [
    [0.85, 0, 0.06],
    [0, 0.6, 0.05],
  ] as const) {
    g.lineWidth = lw;
    g.beginPath();
    g.moveTo(-x, -y);
    g.lineTo(x, y);
    g.stroke();
  }
}

export const SPARK_SPRITE: SpriteSpec = {
  name: "instar-spark",
  frames: 1,
  aspect: 1,
  body: sparkBody,
  light: sparkLight,
};

/** A glob from the baked fire, its trail the same painting shrinking behind it. */
export function drawBakedGlob(
  ctx: CanvasRenderingContext2D,
  ball: GlobBall,
  paint: (ctx: CanvasRenderingContext2D, ball: GlobBall) => void,
  dpr: number,
): void {
  const { at, r, trail, time, i } = ball;
  const side = r * 3.6;
  if (side < 4) {
    paint(ctx, ball);
    return;
  }
  const s = tintedSprite(GLOB_SPRITE, spritePow2(side, dpr), PALETTE.ember, PALETTE.podRim);
  const f = Math.floor(time * CHURN + i * 2) % s.frames;
  const a0 = ctx.globalAlpha;
  trail.forEach((p, n) => {
    const k = n + 1;
    const d = side * (1 - k * 0.13);
    ctx.globalAlpha = a0 * 0.45 * (1 - k / 6);
    ctx.drawImage(
      s.canvas,
      ((f + k) % s.frames) * s.w,
      0,
      s.w,
      s.h,
      p.x - d / 2,
      p.y - d / 2,
      d,
      d,
    );
  });
  ctx.globalAlpha = a0;
  ctx.drawImage(s.canvas, f * s.w, 0, s.w, s.h, at.x - side / 2, at.y - side / 2, side, side);
}

/** An ember from the baked spark: one draw at its flicker. */
export function drawBakedSpark(
  ctx: CanvasRenderingContext2D,
  spark: Spark,
  paint: (ctx: CanvasRenderingContext2D, spark: Spark) => void,
  dpr: number,
): void {
  const { at, r, flicker } = spark;
  const side = r * 4.8;
  if (side < 3) {
    paint(ctx, spark);
    return;
  }
  const s = tintedSprite(SPARK_SPRITE, spritePow2(side, dpr), PALETTE.ember, PALETTE.emberRim);
  const a0 = ctx.globalAlpha;
  ctx.globalAlpha = a0 * flicker;
  ctx.drawImage(s.canvas, 0, 0, s.w, s.h, at.x - side / 2, at.y - side / 2, side, side);
  ctx.globalAlpha = a0;
}
