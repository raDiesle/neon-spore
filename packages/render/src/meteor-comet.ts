import { LIGHT_HALF } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { keyAxis } from "./meteor-look.js";
import { PALETTE } from "./palette.js";
import { chip, pieces, puff, rockPhase, thread } from "./rock-wake.js";
import { flame, tongue } from "./rock-wake-fire.js";

/**
 * The paint COMET is made of: a rusted iron stone with a long plume of fire
 * standing off it, three radii up the lane, and rock chips tumbling up
 * inside the plume.
 *
 * Everything is drawn from `r`, `time` and the key axis; nothing caches a
 * frame.
 */

/** Rusted iron: a red-brown that is nobody's ammunition — `red` is the bolt
 * at 345°, this is a brown at 15° with the saturation of old metal. */
const IRON = "#6E3A24";
const IRON_LIT = "#A5623C";
const IRON_DARK = "#2C170E";
/** The stone's own craters, in its frame: angle, distance, size. Shallow and
 * round, the way an iron meteorite's regmaglypts are — thumbprints, not bowls. */
const DIMPLES: readonly (readonly [number, number, number])[] = [
  [0.3, 0.45, 0.2],
  [1.5, 0.7, 0.13],
  [2.7, 0.35, 0.17],
  [3.9, 0.65, 0.15],
  [5.1, 0.5, 0.19],
];

/** How far the plume reaches up behind the stone, in radii. */
const REACH = 3.2;

/** The plume: one long tapered flame standing off the top of the stone, with
 * tongues moving inside it and chips of the stone tumbling up it. Screen
 * frame, behind the rock. */
export function plume(ctx: CanvasRenderingContext2D, r: number, turn: number, time: number) {
  const ph = rockPhase(turn, time);
  ctx.save();
  ctx.rotate(-turn);
  // Threads of smoke the chips leave, drawn first so the fire is over them.
  pieces(4, time, ph, REACH + 0.8, 0.35, (p) => {
    thread(ctx, p.x * r, p.y * r, r * (0.08 + p.seed * 0.06), 0.6 * (1 - p.age), "#A89E98");
  });
  // The plume's body: three boiling flames stacked on the stone's crown, the
  // tallest reaching the tip, swaying a little with time so it reads as
  // flame and not as a painted cone.
  const sway = Math.sin(time * 1.7 + ph * 6.28) * r * 0.25;
  flame(ctx, sway * 0.3, -r * 0.2, r * 1.05, r * (1.2 + REACH), time, 5 + ph, 0.6);
  flame(ctx, -r * 0.3 + sway * 0.5, -r * 0.1, r * 0.7, r * (0.4 + REACH), time * 1.2, 13 + ph, 0.8);
  flame(ctx, r * 0.3 + sway * 0.7, -r * 0.1, r * 0.65, r * REACH, time * 1.35, 21 + ph, 0.8);
  // Tongues rising inside the plume, each one born at the stone and gone at
  // the tip — the flame's own motion, upward.
  for (let i = 0; i < 7; i++) {
    const life = (time * 1.1 + i / 7 + ph) % 1;
    const y = -r * (0.8 + life * REACH * 0.8);
    const x = Math.sin(time * 3 + i * 2.1) * r * (0.3 + life * 0.25) + sway * life;
    const len = r * (1.3 + 0.5 * Math.sin(time * 10 + i * 1.3)) * (1 - life * 0.5);
    const bend = Math.sin(time * 2.7 + i * 1.9) * r * 0.4;
    tongue(
      ctx,
      x,
      y,
      Math.max(0.1, len),
      r * (0.16 - life * 0.08),
      -Math.PI * 0.5,
      0.85 * (1 - life),
      bend,
    );
  }
  // Chips of the stone tumbling up the plume, dark against the fire.
  pieces(4, time, ph, REACH + 0.8, 0.35, (p) => {
    const size = r * (0.1 + p.seed * 0.09);
    chip(ctx, p.x * r, p.y * r, size, p.spin, IRON, IRON_DARK);
    // Its hot side, toward the stone it just left.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    puff(ctx, p.x * r, p.y * r + size * 0.6, size * 1.6, 0.5 * (1 - p.age), PALETTE.ember);
    ctx.restore();
  });
  ctx.restore();
}

/** The stone: rusted iron, dimpled all over, with a bright bow of heat along
 * its underside. In the rock's own frame. */
export function iron(ctx: CanvasRenderingContext2D, path: Path2D, r: number, turn: number) {
  const { dx, dy } = keyAxis(turn);
  const stone = ctx.createLinearGradient(dx * r, dy * r, -dx * r, -dy * r);
  stone.addColorStop(0, IRON_LIT);
  stone.addColorStop(0.5, IRON);
  stone.addColorStop(1, IRON_DARK);
  ctx.fillStyle = stone;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  litRound(ctx, 0, 0, r, LIGHT_HALF.rock, turn);
  for (const [a, d, s] of DIMPLES) {
    dimple(ctx, Math.cos(a) * r * d, Math.sin(a) * r * d, r * s, dx, dy);
  }
  // The bow: the underside is white-hot where it meets the air. Screen frame
  // inside the clip, so it stays on the bottom whatever the stone is doing.
  ctx.rotate(-turn);
  ctx.globalCompositeOperation = "lighter";
  const bow = ctx.createLinearGradient(0, r * 1.05, 0, r * 0.1);
  bow.addColorStop(0, rgba(PALETTE.emberRim, 1));
  bow.addColorStop(0.25, rgba(PALETTE.ember, 0.8));
  bow.addColorStop(0.6, rgba(PALETTE.ember, 0.25));
  bow.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = bow;
  ctx.fillRect(-r * 1.3, -r * 1.3, r * 2.6, r * 2.6);
  ctx.restore();
  // A dark edge, and a warm rim on it.
  ctx.strokeStyle = IRON_DARK;
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke(path);
  strokeGlow(ctx, path, IRON_LIT, Math.max(0.8, r * 0.04), 0.5);
}

/** A regmaglypt: a shallow round dimple, dark toward the light, a soft pale
 * lip away from it. */
function dimple(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rad: number,
  dx: number,
  dy: number,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, rgba(IRON_DARK, 0.7));
  g.addColorStop(0.75, rgba(IRON_DARK, 0.3));
  g.addColorStop(1, rgba(IRON_DARK, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rgba(IRON_LIT, 0.7);
  ctx.lineWidth = Math.max(0.6, rad * 0.16);
  ctx.beginPath();
  const far = Math.atan2(-dy, -dx);
  ctx.arc(x, y, rad * 0.85, far - 0.9, far + 0.9);
  ctx.stroke();
}

/** A shot's mark: a dark hole with a white-hot lip — the metal under the
 * crust, bright where the bolt opened it. */
export function struck(ctx: CanvasRenderingContext2D, x: number, y: number, rad: number): void {
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fillStyle = IRON_DARK;
  ctx.fill();
  const g = ctx.createRadialGradient(x, y, rad * 0.3, x, y, rad);
  g.addColorStop(0, rgba(IRON_DARK, 0));
  g.addColorStop(0.7, rgba(PALETTE.ember, 0.35));
  g.addColorStop(1, rgba(PALETTE.emberRim, 0.9));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  const lip = new Path2D();
  lip.arc(x, y, rad, 0, Math.PI * 2);
  strokeGlow(ctx, lip, "#FFF1E0", 0.8, 0.7);
}
