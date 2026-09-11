import { LIGHT_HALF } from "../../../../../packages/content/src/index.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { keyAxis } from "../../../../../packages/render/src/meteor-look.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { chip, pieces, puff, rockPhase } from "../../../wake.js";
import { tongue } from "../../../wake-fire.js";

/**
 * The paint SMOULDER is made of: a black stone burning only where it meets
 * the air, under a thick column of dark smoke with ash coming off it.
 *
 * Everything is drawn from `r`, `time` and the key axis; nothing caches a
 * frame.
 */

/** Charcoal: the rock is black, and everything lighter on it is heat. */
const CHAR = "#1A181C";
const CHAR_LIT = "#3A363E";
const CHAR_DARK = "#08070A";
/** Smoke over this field has to be *lighter* than the field to read as
 * smoke at all — a dark grey over a dark violet lane is nothing. */
const SMOKE = "#8A8494";
const ASH = "#B8B4BE";
/** Deep red: the colour of stone hot enough to glow but not to flame. */
const GLOW = "#B8341A";
/** The stone's own craters, in its frame: angle, distance, size. Big and few
 * — a rock this dark shows its shape by its holes. */
const CRATERS: readonly (readonly [number, number, number])[] = [
  [0.9, 0.5, 0.26],
  [2.9, 0.6, 0.18],
  [4.6, 0.4, 0.24],
];

/** The smoke: a thick, dark, rolling column up the wake, with flakes of ash
 * coming off the stone and tumbling up through it, and a rare ember among
 * them. Screen frame, behind the rock. */
export function smoke(ctx: CanvasRenderingContext2D, r: number, turn: number, time: number) {
  const ph = rockPhase(turn, time);
  ctx.save();
  ctx.rotate(-turn);
  // The column: eight big puffs, each growing as it rises, dense near the
  // stone and thin at the top. Drawn dark over the field, which is what smoke
  // does to what is behind it.
  pieces(14, time, ph, 3.0, 0.3, (p) => {
    const grow = 0.45 + p.age * 1.0;
    // Densest a little way up, where the puffs have swelled and not yet
    // thinned; lit by the stone for the first part of the climb.
    const dense = Math.min(1, p.age * 5) * (1 - p.age * p.age);
    puff(ctx, p.x * r * 0.7, p.y * r + r * 0.3, r * grow, 0.5 * dense, SMOKE);
    if (p.age < 0.35) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      puff(ctx, p.x * r * 0.7, p.y * r + r * 0.3, r * grow * 0.8, 0.35 * (1 - p.age / 0.35), GLOW);
      ctx.restore();
    }
  });
  // The glow the stone throws up into its own smoke, just behind it.
  ctx.globalCompositeOperation = "lighter";
  const under = ctx.createRadialGradient(0, -r * 0.6, 0, 0, -r * 0.6, r * 1.3);
  under.addColorStop(0, rgba(GLOW, 0.35));
  under.addColorStop(1, rgba(GLOW, 0));
  ctx.fillStyle = under;
  ctx.beginPath();
  ctx.arc(0, -r * 0.6, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  // Ash: large flat flakes, grey, tumbling; every fourth one is still an
  // ember, and leaves a thin thread of its own smoke.
  pieces(7, time, ph, 2.6, 0.4, (p) => {
    const size = r * (0.11 + p.seed * 0.11) * (1 - p.age * 0.2);
    const ember = p.seed > 0.75 && p.age < 0.6;
    if (ember) {
      puff(ctx, p.x * r, p.y * r - size * 2.5, size * 1.8, 0.4 * (1 - p.age), "#6A6470");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      puff(ctx, p.x * r, p.y * r, size * 2.6, 0.8 * (1 - p.age), PALETTE.ember);
      ctx.restore();
    }
    chip(
      ctx,
      p.x * r,
      p.y * r,
      size,
      p.spin,
      ember ? PALETTE.ember : ASH,
      ember ? PALETTE.emberRim : CHAR,
    );
  });
  ctx.restore();
}

/** The stone: black, deeply cratered, with the entry fire as a crown along
 * its underside — white at the edge, red a little way in, black above. In
 * the rock's own frame. */
export function charcoal(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  r: number,
  turn: number,
  time: number,
) {
  const { dx, dy } = keyAxis(turn);
  const stone = ctx.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
  stone.addColorStop(0, CHAR_LIT);
  stone.addColorStop(0.5, CHAR);
  stone.addColorStop(1, CHAR_DARK);
  ctx.fillStyle = stone;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  for (const [a, d, s] of CRATERS) {
    crater(ctx, Math.cos(a) * r * d, Math.sin(a) * r * d, r * s, dx, dy);
  }
  // The heat, in the screen frame so it stays on the bottom: a deep red bloom
  // over the lower half of the stone, hottest at the edge, and a white-hot
  // rim right at it, pulsing a little.
  ctx.rotate(-turn);
  ctx.globalCompositeOperation = "lighter";
  const pulse = 0.85 + 0.15 * Math.sin(time * 6 + rockPhase(turn, time) * 6.28);
  const heat = ctx.createLinearGradient(0, r * 1.02, 0, -r * 0.2);
  heat.addColorStop(0, rgba("#FFF3E6", pulse));
  heat.addColorStop(0.08, rgba(PALETTE.emberRim, pulse));
  heat.addColorStop(0.25, rgba(PALETTE.ember, 0.85 * pulse));
  heat.addColorStop(0.55, rgba(GLOW, 0.55 * pulse));
  heat.addColorStop(1, rgba(GLOW, 0));
  ctx.fillStyle = heat;
  ctx.fillRect(-r * 1.3, -r * 0.3, r * 2.6, r * 1.6);
  ctx.restore();
  // The dark edge, everywhere: the white heat at the bottom of it is the
  // gradient above, which the clip cuts along the stone's own outline.
  ctx.strokeStyle = CHAR_DARK;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke(path);
  // The crown: short tongues off the underside sweeping up round the sides,
  // the way air on fire wraps a falling thing — short, so the top of the
  // stone stays black.
  ctx.save();
  ctx.rotate(-turn);
  for (let i = 0; i < 8; i++) {
    const at = Math.PI * 0.08 + (i / 7) * Math.PI * 0.84;
    const flick = 0.6 + 0.4 * Math.sin(time * 12 + i * 1.7);
    const x = Math.cos(at) * r * 1.0;
    const y = Math.sin(at) * r * 1.0;
    // Up, and leaning out the side it is on.
    const up = -Math.PI * 0.5 + (x / r) * 0.9;
    tongue(ctx, x, y, r * (0.3 + 0.4 * flick), r * 0.11, up, 0.9 * flick, -(x / r) * r * 0.2);
  }
  ctx.restore();
}

/** A crater the rock was born with: a big dark bowl with a thin grey lip on
 * the far side, and the heat showing faintly at its floor. */
function crater(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rad: number,
  dx: number,
  dy: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, rgba(CHAR_DARK, 0.95));
  g.addColorStop(0.6, rgba(CHAR_DARK, 0.6));
  g.addColorStop(1, rgba(CHAR_DARK, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  const floor = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.5);
  floor.addColorStop(0, rgba(GLOW, 0.45));
  floor.addColorStop(1, rgba(GLOW, 0));
  ctx.fillStyle = floor;
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(ASH, 0.55);
  ctx.lineWidth = Math.max(0.6, rad * 0.1);
  ctx.beginPath();
  const far = Math.atan2(-dy, -dx);
  ctx.arc(x, y, rad * 0.92, far - 1.2, far + 1.2);
  ctx.stroke();
}

/** A shot's mark: a hole glowing deep red from the floor up, with a grey
 * lip — the shot broke the crust and found the heat under it. */
export function redPit(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number): void {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = CHAR_DARK;
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 0.85);
  g.addColorStop(0, rgba(PALETTE.ember, 0.95));
  g.addColorStop(0.45, rgba(GLOW, 0.8));
  g.addColorStop(1, rgba(GLOW, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad * 0.85, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(ASH, 0.8);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.stroke();
}
