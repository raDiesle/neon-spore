import { LIGHT_HALF } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { keyAxis } from "./meteor-look.js";
import { PALETTE } from "./palette.js";
import { chip, pieces, puff, rockPhase, thread } from "./rock-wake.js";
import { flame, tongue } from "./rock-wake-fire.js";

/**
 * The paint BLAZE is made of: a scorched stone inside a torch's fireball.
 *
 * Built the way `torch-fire.ts` builds the torch — the ball of fire behind,
 * the far tongues, the stone, the near tongues over it — because that is the
 * fire the owner pointed at. Everything is drawn from `r`, `time` and the key
 * axis; nothing caches a frame.
 */

/** Scorched basalt: near-black with a warm cast, so the fire's light on it
 * reads as *on it* rather than as a lighter grey. */
const BASALT = "#2C2420";
const BASALT_LIT = "#5A4A40";
const BASALT_DARK = "#120E0C";
/** Where the rock's own craters sit, in its own frame: angle, distance, size. */
const CRATERS: readonly (readonly [number, number, number])[] = [
  [0.6, 0.5, 0.22],
  [2.5, 0.55, 0.16],
  [4.3, 0.42, 0.2],
  [5.6, 0.7, 0.12],
];

/** The ball of fire the rock sits in, the flames rising off it and the pieces
 * coming away up the wake — behind the stone, in the screen's frame, so all
 * of it goes up. */
export function fireBehind(ctx: CanvasRenderingContext2D, r: number, turn: number, time: number) {
  const ph = rockPhase(turn, time);
  ctx.save();
  ctx.rotate(-turn);
  // Smoke first, furthest up the wake, so the fire is drawn over it.
  pieces(5, time, ph, 3.0, 0.45, (p) => {
    puff(
      ctx,
      p.x * r,
      p.y * r - r * 0.5,
      r * (0.3 + p.age * 0.6),
      0.5 * (1 - p.age) * Math.min(1, p.age * 4),
    );
  });
  // The ball, as the torch has it: one round bloom of heat round the stone.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const ball = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.7);
  ball.addColorStop(0, rgba(PALETTE.emberRim, 0.7));
  ball.addColorStop(0.4, rgba(PALETTE.ember, 0.6));
  ball.addColorStop(0.75, rgba(PALETTE.ember, 0.18));
  ball.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // The mass of the fire: three boiling bodies of flame standing on the
  // stone's shoulders and its crown, the tallest twice the rock's height.
  flame(ctx, 0, -r * 0.1, r * 1.25, r * 3.2, time, 3 + ph, 0.8);
  flame(ctx, -r * 0.55, r * 0.2, r * 0.8, r * 2.2, time * 1.3, 11 + ph, 0.85);
  flame(ctx, r * 0.5, r * 0.2, r * 0.75, r * 2.5, time * 1.15, 19 + ph, 0.85);
  // Tongues licking out of it, all rising, each one bending on its own beat.
  for (let i = 0; i < 8; i++) {
    const x = (i / 7 - 0.5) * r * 1.7;
    const flick = 0.6 + 0.4 * Math.sin(time * 8 + i * 1.9 + ph * 6);
    const len = r * (1.2 + 1.1 * flick) * (1 - Math.abs(i - 3.5) * 0.14);
    const bend = Math.sin(time * 3.1 + i * 2.6) * r * 0.5;
    tongue(ctx, x, -r * 0.4, len, r * 0.2, -Math.PI * 0.5, 0.9 * flick, bend);
  }
  // Glowing pieces of the stone coming away up the wake, each trailing its
  // own small smoke, cooling from white to ember to dark as it rises.
  pieces(6, time, ph, 2.4, 0.5, (p) => {
    const hot = 1 - p.age;
    const size = r * (0.1 + p.seed * 0.1) * (1 - p.age * 0.3);
    thread(ctx, p.x * r, p.y * r, size, 0.7 * hot, "#A29AA8");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    puff(ctx, p.x * r, p.y * r, size * 2.6, 0.8 * hot, PALETTE.ember);
    ctx.restore();
    chip(
      ctx,
      p.x * r,
      p.y * r,
      size,
      p.spin,
      hot > 0.6 ? PALETTE.emberRim : hot > 0.25 ? PALETTE.ember : BASALT_LIT,
      BASALT_DARK,
    );
  });
  ctx.restore();
}

/** The stone: scorched and deeply cratered. In the rock's own frame. */
export function scorched(ctx: CanvasRenderingContext2D, path: Path2D, r: number, turn: number) {
  const { dx, dy } = keyAxis(turn);
  const stone = ctx.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
  stone.addColorStop(0, BASALT_LIT);
  stone.addColorStop(0.5, BASALT);
  stone.addColorStop(1, BASALT_DARK);
  ctx.fillStyle = stone;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  // The rock's own craters — the ones it was born with, deeper and larger
  // than the pits a shot leaves, so a rock that has been shot reads as a
  // cratered rock with fresh holes in it rather than as a different rock.
  for (const [a, d, s] of CRATERS) {
    crater(ctx, Math.cos(a) * r * d, Math.sin(a) * r * d, r * s, dx, dy);
  }
  ctx.restore();
  // A dark edge, then the fire's light on the rim of it.
  ctx.strokeStyle = BASALT_DARK;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke(path);
  strokeGlow(ctx, path, PALETTE.ember, Math.max(0.8, r * 0.05), 0.45);
}

/** A crater the rock was born with: a bowl darker toward the light, with a
 * pale lip on the far side. */
function crater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rad: number,
  dx: number,
  dy: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, rgba(BASALT_DARK, 0.9));
  g.addColorStop(0.7, rgba(BASALT_DARK, 0.55));
  g.addColorStop(1, rgba(BASALT_DARK, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(BASALT_LIT, 0.8);
  ctx.lineWidth = Math.max(0.6, rad * 0.14);
  ctx.beginPath();
  const far = Math.atan2(-dy, -dx);
  ctx.arc(x, y, rad * 0.9, far - 1.1, far + 1.1);
  ctx.stroke();
}

/** The near tongues, licking up over the sides and the bottom of the stone,
 * and a thin veil of heat over the whole thing. Screen frame. */
export function fireInFront(ctx: CanvasRenderingContext2D, r: number, turn: number, time: number) {
  const ph = rockPhase(turn, time);
  ctx.save();
  ctx.rotate(-turn);
  for (let i = 0; i < 7; i++) {
    // Off the lower half of the rim, curling upward and out over the sides.
    const at = Math.PI * 0.1 + (i / 6) * Math.PI * 0.8;
    const flick = 0.6 + 0.4 * Math.sin(time * 11 + i * 2.3 + ph * 9);
    const len = r * (0.7 + 0.7 * flick);
    const x = Math.cos(at) * r * 0.85;
    const y = Math.sin(at) * r * 0.85;
    const up = -Math.PI * 0.5 + (x / r) * 0.7;
    tongue(ctx, x, y, len, r * 0.16, up, 0.8 * flick, -(x / r) * r * 0.3);
  }
  ctx.globalCompositeOperation = "lighter";
  const veil = ctx.createRadialGradient(0, r * 0.4, 0, 0, 0, r * 1.15);
  veil.addColorStop(0, rgba(PALETTE.emberRim, 0.22));
  veil.addColorStop(0.7, rgba(PALETTE.ember, 0.12));
  veil.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = veil;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A shot's mark: a fresh hole with the heat showing through — a glowing
 * bowl with a hot lip, so the rock reads as hit and unhurt. */
export function hotPit(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number): void {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = BASALT_DARK;
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.8);
  g.addColorStop(0, rgba(PALETTE.emberRim, 0.9));
  g.addColorStop(0.5, rgba(PALETTE.ember, 0.7));
  g.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.8, 0, Math.PI * 2);
  ctx.fill();
  const lip = new Path2D();
  lip.arc(x, y, rad, 0, Math.PI * 2);
  strokeGlow(ctx, lip, PALETTE.emberRim, 0.7, 0.5);
}
