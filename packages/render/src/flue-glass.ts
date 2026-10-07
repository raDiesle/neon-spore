import type { Color } from "@neon-spore/sim";
import { flueGlassPath, flueSightH, flueSightR, type Point } from "./flue-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { type GripVerdict, VERDICT_SECONDS } from "./grip-verdict.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { noteMark } from "./mark-spots.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE FLUE's sight as a length of glass pipe** (the owner, 7 October 2026:
 * *change visual in middle area to be more like a rounded rectangle … the
 * glass should look integrated … like a glass pipe*). Where a ring stood
 * over the cannon, the gullet now runs through a rounded rectangle of glass
 * as wide as a shot's reach (`flueSightR`, `flueHitMilli`), so the coloured
 * glass is exactly where a spore is met.
 *
 * Seen through, the flesh behind it goes dark like the inside of a tube; the
 * glass is tinted in the level's colour, thicker-looking at its top and
 * bottom where a round pipe is seen edge on; a dark collar holds each end in
 * the flesh; and a gloss runs along its top, drawn over the spore so the
 * spore reads as inside it (`drawFlueGlassGloss`).
 */

/** The collar at each end: how wide, and how far over the glass it stands, in tiles. */
const COLLAR = 0.16;
const COLLAR_OVER = 0.1;

/** The glass, in `color`, at `pulse` of its glow: dark inside, tinted, rimmed and collared. */
export function drawFlueGlass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  color: Color | "either",
  pulse: number,
): void {
  const hex = stepColour(color).rim;
  const h = flueSightH(l);
  const glass = flueGlassPath(l, at);
  ctx.fillStyle = rgba(PALETTE.flueSlot, 0.45);
  ctx.fill(glass);
  const tint = ctx.createLinearGradient(0, at.y - h, 0, at.y + h);
  tint.addColorStop(0, rgba(hex, 0.5 * pulse));
  tint.addColorStop(0.28, rgba(hex, 0.14 * pulse));
  tint.addColorStop(0.72, rgba(hex, 0.14 * pulse));
  tint.addColorStop(1, rgba(hex, 0.42 * pulse));
  ctx.fillStyle = tint;
  ctx.fill(glass);
  strokeGlowFaded(ctx, glass, hex, STROKE.outline, pulse, 1);
  const w = flueSightR(l);
  const cw = COLLAR * l.tile;
  const ch = h + COLLAR_OVER * l.tile;
  const collars = new Path2D();
  for (const side of [-1, 1]) {
    const x = at.x + side * w - cw / 2;
    collars.roundRect(x, at.y - ch, cw, ch * 2, cw / 2);
  }
  ctx.fillStyle = PALETTE.flueSootDark;
  ctx.fill(collars);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.45);
  ctx.stroke(collars);
}

/** The gloss along the glass's top and the faint one along its foot, over whatever is inside. */
export function drawFlueGlassGloss(ctx: CanvasRenderingContext2D, l: Layout, at: Point): void {
  const w = flueSightR(l) - COLLAR * l.tile;
  const h = flueSightH(l);
  const gloss = new Path2D();
  gloss.moveTo(at.x - w * 0.82, at.y - h * 0.62);
  gloss.lineTo(at.x + w * 0.55, at.y - h * 0.62);
  ctx.lineCap = "round";
  ctx.lineWidth = l.tile * 0.09;
  ctx.strokeStyle = rgba(PALETTE.text, 0.5);
  ctx.stroke(gloss);
  const foot = new Path2D();
  foot.moveTo(at.x - w * 0.4, at.y + h * 0.7);
  foot.lineTo(at.x + w * 0.8, at.y + h * 0.7);
  ctx.lineWidth = l.tile * 0.05;
  ctx.strokeStyle = rgba(PALETTE.text, 0.18);
  ctx.stroke(foot);
}

/**
 * A shot's verdict on the glass: the glass washed green or red for the first
 * third, and its outline opening out as it fades — `drawVerdictRing`'s
 * answer in the glass's own shape (`grip-verdict.ts`).
 */
export function drawFlueGlassVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  v: GripVerdict,
  alpha: number,
): void {
  noteMark(ctx, at.x, at.y, flueSightH(l), v);
  const t = Math.min(1, Math.max(0, v.age / VERDICT_SECONDS));
  const fade = 1 - t;
  const colour = v.good ? PALETTE.good : PALETTE.red;
  if (t < 0.35) {
    ctx.fillStyle = rgba(colour, 0.55 * (1 - t / 0.35) * alpha);
    ctx.fill(flueGlassPath(l, at));
  }
  const ring = flueGlassPath(l, at, t * flueSightH(l));
  strokeGlowFaded(ctx, ring, colour, STROKE.outline * (1.5 - 0.5 * t), 1.4 * fade, fade * alpha);
}
