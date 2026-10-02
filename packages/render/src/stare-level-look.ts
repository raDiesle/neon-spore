import { type SimConfig, type StareState, stareTurnsLeft } from "@neon-spore/sim";
import type { EyeInk } from "./eye.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **How angry THE STARE is, and how dangerous it looks**: the colour a level
 * opens in, the brow that comes down over the eye, and the count of turns
 * left before the next level.
 *
 * The owner, 2 October 2026: *every level it looks more angry and in more
 * dangerous colour. There is only green opening eye colour.* The green was
 * real: the ball's wash and rim were the game's eye fluid, `eyeFluid`, and
 * brightened every time the eye opened. They take the level's colour now
 * (`stare-eye-globe.ts`), and so do the open eye, the halo on the cowl and
 * the brow's lit edge — yellow, then orange, red, and a red gone violet.
 *
 * **The brow is a V of the cowl's own rock** over the top of the ball, its
 * point lower every level, so the eye frowns, then scowls, then glares out
 * from under it. The lashes stand on the brow's edge (`stare-lashes.ts`,
 * `stare-lash-pull.ts`), so the lashes that count the beats are the eye's
 * upper lashes and the only ones it has.
 */

/** The colour each level opens in, from a warning to the worst the palette has. */
const LEVEL_INKS: readonly EyeInk[] = [
  { hex: PALETTE.pod, rim: PALETTE.podRim },
  { hex: PALETTE.ember, rim: PALETTE.emberRim },
  { hex: PALETTE.red, rim: PALETTE.redRim },
  { hex: mixHex(PALETTE.red, PALETTE.hull, 0.55), rim: mixHex(PALETTE.redRim, PALETTE.hull, 0.4) },
];

/** The level's colour; past the last, the last. */
export function stareLevelInk(s: StareState): EyeInk {
  const at = Math.max(0, Math.min(s.level, s.levels.length - 1, LEVEL_INKS.length - 1));
  return LEVEL_INKS[at] as EyeInk;
}

/** How angry the eye is, a quarter on the first level and whole on the last. */
export function stareAnger(s: StareState): number {
  const last = Math.max(1, s.levels.length - 1);
  return 0.25 + (0.75 * Math.min(s.level, last)) / last;
}

/** The brow's half-width, in socket half-widths, and where its ends stand, in socket heights above the middle. */
const BROW_W = 1.3;
const BROW_OUTER = 1.45;
/** Where its point stands with no anger, and how far the anger brings it down. */
const BROW_INNER = 1.25;
const BROW_DROP = 0.65;
/** How much of its spread from the middle a lash leans out by. */
const FAN = 0.5;

/**
 * A point on the brow's edge, and the way a lash rooted there points: out
 * from the eye's middle, so the lashes fan rather than lean together over the
 * brow's point.
 */
export interface BrowPoint {
  x: number;
  y: number;
  nx: number;
  ny: number;
}

/** The brow's edge at `t`, nought at its left end and one at its right, in canvas pixels. */
export function browPoint(e: StareEye, anger: number, t: number): BrowPoint {
  const inner = BROW_INNER - BROW_DROP * anger;
  const u = -1 + 2 * t;
  const up = inner + (BROW_OUTER - inner) * Math.abs(u);
  // Out from the middle, in socket units so the fan is the almond's own —
  // and half as splayed, so a low brow does not lay its lashes flat.
  const ox = u * BROW_W;
  const lean = ox * FAN;
  const len = Math.hypot(lean, up) || 1;
  return { x: e.cx + ox * e.rx, y: e.cy - e.ry * up, nx: lean / len, ny: -up / len };
}

/**
 * The brow over the eye: the rock above its edge, clipped to the ball's
 * almond, and the edge lit in the level's colour, thicker as it angers.
 */
export function drawStareBrow(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  anger: number,
  ink: EyeInk,
): void {
  const left = browPoint(e, anger, 0);
  const mid = browPoint(e, anger, 0.5);
  const right = browPoint(e, anger, 1);
  const top = e.cy - e.ry * 2.2;
  const rock = new Path2D();
  rock.moveTo(left.x, top);
  rock.lineTo(left.x, left.y);
  rock.lineTo(mid.x, mid.y);
  rock.lineTo(right.x, right.y);
  rock.lineTo(right.x, top);
  rock.closePath();
  const ball = new Path2D();
  ball.ellipse(e.cx, e.cy, e.rx * 1.2, e.ry * 1.32, 0, 0, Math.PI * 2);
  ctx.save();
  ctx.clip(ball);
  // Darker than the cowl, so the brow is a cap the eye glares out from under.
  ctx.fillStyle = mixHex(PALETTE.background, PALETTE.rockDark, 0.45);
  ctx.fill(rock);
  ctx.restore();
  const edge = new Path2D();
  const a = browPoint(e, anger, 0.08);
  const b = browPoint(e, anger, 0.92);
  edge.moveTo(a.x, a.y);
  edge.lineTo(mid.x, mid.y);
  edge.lineTo(b.x, b.y);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  strokeGlow(ctx, edge, ink.hex, STROKE.outline * (1.6 + 2 * anger), 1 + 1.6 * anger);
  ctx.restore();
}

/** The count's size, and its word's, in tiles; and how far under the eye it stands, in socket heights. */
const COUNT_SIZE = 0.62;
const WORD_SIZE = 0.24;
const COUNT_DROP = 2.05;

/**
 * **Turns left before the next level**, under the eye in the level's colour —
 * the owner's *show somewhere number of turns for next level*. A number,
 * because what a pair says is *three left*, and over a dark stroke of the sky
 * so it reads through the gaze.
 */
export function drawStareTurns(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  e: StareEye,
  s: StareState,
  ink: EyeInk,
): void {
  const left = stareTurnsLeft(s, cfg);
  const y = e.cy + e.ry * COUNT_DROP;
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.font = `700 ${Math.round(l.tile * COUNT_SIZE)}px "Courier New",monospace`;
  ctx.lineWidth = l.tile * 0.12;
  ctx.strokeText(String(left), e.cx, y);
  ctx.fillStyle = ink.rim;
  ctx.fillText(String(left), e.cx, y);
  const wordY = y + l.tile * (COUNT_SIZE * 0.5 + WORD_SIZE * 0.75);
  ctx.font = `700 ${Math.round(l.tile * WORD_SIZE)}px "Courier New",monospace`;
  ctx.lineWidth = l.tile * 0.08;
  const word = left === 1 ? "TURN LEFT" : "TURNS LEFT";
  ctx.strokeText(word, e.cx, wordY);
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(word, e.cx, wordY);
  ctx.restore();
}
