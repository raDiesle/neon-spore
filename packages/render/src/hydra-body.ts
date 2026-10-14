import { LIGHT_HALF } from "@neon-spore/content";
import type { HydraState } from "@neon-spore/sim";
import { smoothClosed } from "./chrysalis-shape.js";
import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { glow } from "./hydra-head.js";
import type { HydraPose } from "./hydra-pose.js";
import type { At } from "./hydra-shape.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HYDRA's body** (§11.64): the slime every neck runs out of — an
 * abyssal teal mass, wider than tall, its lobes rippling as it breathes, and
 * a crown along its top with **one place for every level of heads** in the
 * script: a bud still asleep for every level to come, an empty socket for
 * the level out now, and a seared stump for every level stopped. The crown is
 * the fight's length read off the body, never a bar.
 *
 * **It is drawn in the round**: the pale ribbed belly on one face and the
 * spined back with two rows of glowing spots on the other, each at its own
 * longitude and foreshortened as the pose's `yaw` turns it, so a level
 * stopped turns the body half round (`hydra-pose.ts`).
 *
 * **The fire in its throat** burns in a cannon's colour behind the maws —
 * the pilot's screen alone is handed that colour (`showsHydraFire`); the
 * other is handed nothing, and its throat is only warm.
 */

/** The contour's points, the angle from straight up, clockwise. */
const SIDES = 36;

/** The body's outline at its pose: a lobed slime, sagging toward its necks. */
export function hydraBodyPath(p: HydraPose, time: number): Path2D {
  return smoothClosed(hydraBodyPoints(p, time));
}

/** The points the body's outline is drawn through: what a bolt is stopped on (`hydra-stop.ts`). */
export function hydraBodyPoints(p: HydraPose, time: number): At[] {
  const pts: At[] = [];
  for (let k = 0; k < SIDES; k++) {
    const a = (k / SIDES) * Math.PI * 2;
    const lower = Math.max(0, -Math.cos(a));
    const lobe = 1 + 0.04 * Math.sin(4 * a + time * 0.8) + 0.02 * Math.sin(7 * a - time * 1.3);
    const rx = p.rx * (1 + 0.1 * lower) * lobe;
    const ry = p.ry * (1 + 0.12 * lower * lower + 0.1 * p.hunch * lower) * lobe;
    pts.push({ x: p.c.x + Math.sin(a) * rx, y: p.c.y - Math.cos(a) * ry });
  }
  return pts;
}

/** The body, its crown, its markings and its throat. `fire` the throat's colour, or null. Answers its outline. */
export function drawHydraBody(
  ctx: CanvasRenderingContext2D,
  p: HydraPose,
  s: HydraState,
  tile: number,
  fire: string | null,
  time: number,
): Path2D {
  drawCrown(ctx, p, s, tile, time);
  const body = hydraBodyPath(p, time);
  ctx.save();
  ctx.translate(0, tile * 0.16);
  ctx.fillStyle = PALETTE.hydraHideDark;
  ctx.fill(body);
  ctx.restore();
  ctx.fillStyle = PALETTE.hydraHide;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, p.c.x, p.c.y, Math.max(p.rx, p.ry), LIGHT_HALF.creature);
  drawBelly(ctx, p);
  drawSpots(ctx, p, tile);
  drawThroat(ctx, p, tile, fire);
  ctx.restore();
  strokeGlowFaded(ctx, body, PALETTE.hydraScale, STROKE.outline, 1 + 0.5 * p.pulse * p.threat);
  return body;
}

/** Where longitude `lon` lies across the body, and how squarely it faces the screen. */
function across(p: HydraPose, lon: number): { x: number; facing: number } {
  return { x: p.c.x + Math.sin(lon) * p.rx * 0.85, facing: Math.cos(lon) };
}

/** The pale belly: ribs across its lower half, on the face the yaw has round. */
function drawBelly(ctx: CanvasRenderingContext2D, p: HydraPose): void {
  const { x, facing } = across(p, p.yaw);
  if (facing <= 0.05) return;
  ctx.strokeStyle = rgba(PALETTE.hydraScale, 0.3 * facing);
  ctx.lineWidth = STROKE.outline;
  for (let j = 0; j < 5; j++) {
    const y = p.c.y + p.ry * (-0.1 + 0.2 * j);
    const half = p.rx * 0.45 * facing * Math.sqrt(Math.max(0, 1 - ((y - p.c.y) / p.ry) ** 2));
    ctx.beginPath();
    ctx.moveTo(x - half, y);
    ctx.quadraticCurveTo(x, y + p.ry * 0.12, x + half, y);
    ctx.stroke();
  }
}

/** The back: a spined ridge down it and two rows of spots glowing either side. */
function drawSpots(ctx: CanvasRenderingContext2D, p: HydraPose, tile: number): void {
  const ridge = across(p, p.yaw + Math.PI);
  if (ridge.facing > 0.05) {
    ctx.strokeStyle = rgba(PALETTE.hydraHideDark, 0.8 * ridge.facing);
    ctx.lineWidth = tile * 0.12 * ridge.facing;
    ctx.beginPath();
    ctx.moveTo(ridge.x, p.c.y - p.ry * 0.85);
    ctx.quadraticCurveTo(ridge.x + p.rx * 0.05, p.c.y, ridge.x, p.c.y + p.ry * 0.85);
    ctx.stroke();
  }
  for (const off of [-0.45, -0.22, 0.22, 0.45]) {
    const row = across(p, p.yaw + Math.PI + off);
    if (row.facing <= 0.05) continue;
    for (let j = 0; j < 4; j++) {
      const y = p.c.y + p.ry * (-0.55 + 0.36 * j);
      const r = tile * 0.12 * row.facing * (1 - 0.15 * Math.abs(off));
      glow(
        ctx,
        { x: row.x, y },
        r * 4,
        PALETTE.hydraSpot,
        0.35 * row.facing * (0.7 + 0.3 * p.pulse),
      );
      ctx.fillStyle = rgba(PALETTE.hydraSpot, 0.85 * row.facing);
      ctx.beginPath();
      ctx.ellipse(row.x, y, r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** The fire rising in its throat: in its colour on the pilot's screen, a dull heat on the other. */
function drawThroat(
  ctx: CanvasRenderingContext2D,
  p: HydraPose,
  tile: number,
  fire: string | null,
) {
  if (p.throat <= 0) return;
  const hue = fire ?? PALETTE.hydraFire;
  const lit = p.throat * (fire === null ? 0.25 : 0.65 + 0.35 * p.pulse);
  const top = { x: p.c.x, y: p.c.y - p.ry * 0.2 };
  const bottom = { x: p.c.x, y: p.c.y + p.ry * 1.05 };
  ctx.lineCap = "round";
  for (const [w, a] of [
    [0.7, 0.25],
    [0.34, 0.6],
    [0.12, 1],
  ] as const) {
    ctx.strokeStyle = rgba(hue, lit * a);
    ctx.lineWidth = tile * w;
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.bezierCurveTo(
      top.x - tile * 0.3,
      p.c.y + p.ry * 0.3,
      top.x + tile * 0.3,
      p.c.y + p.ry * 0.6,
      bottom.x,
      bottom.y,
    );
    ctx.stroke();
  }
  glow(ctx, { x: p.c.x, y: p.c.y + p.ry * 0.4 }, tile * 1.6, hue, 0.45 * lit);
}

/** A place on the crown for every level: a bud to come, the socket out now, a stump stopped. */
function drawCrown(
  ctx: CanvasRenderingContext2D,
  p: HydraPose,
  s: HydraState,
  tile: number,
  time: number,
): void {
  const n = s.steps.length;
  for (let j = 0; j < n; j++) {
    const a = -1.05 + (2.1 * (j + 0.5)) / n;
    const base = { x: p.c.x + Math.sin(a) * p.rx * 0.92, y: p.c.y - Math.cos(a) * p.ry * 0.92 };
    const out = { x: Math.sin(a), y: -Math.cos(a) };
    if (j === s.cursor && s.phase !== "spent") continue;
    const stopped = j < s.cursor;
    const len = tile * (stopped ? 0.32 : 0.55 + 0.05 * Math.sin(time * 1.7 + j));
    const tip = { x: base.x + out.x * len, y: base.y + out.y * len };
    ctx.lineCap = "round";
    ctx.strokeStyle = PALETTE.hydraHideDark;
    ctx.lineWidth = tile * 0.36;
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.strokeStyle = stopped ? PALETTE.hydraStump : PALETTE.hydraHide;
    ctx.lineWidth = tile * 0.26;
    ctx.stroke();
    if (stopped) {
      ctx.fillStyle = rgba(PALETTE.hydraIchor, 0.6);
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, tile * 0.08, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    // A bud asleep: its eye a shut amber line.
    ctx.fillStyle = PALETTE.hydraHide;
    ctx.beginPath();
    ctx.ellipse(tip.x, tip.y, tile * 0.2, tile * 0.15, a - Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.hydraIris, 0.6);
    ctx.lineWidth = STROKE.inner;
    ctx.beginPath();
    ctx.moveTo(tip.x - tile * 0.08, tip.y);
    ctx.lineTo(tip.x + tile * 0.08, tip.y);
    ctx.stroke();
  }
}
