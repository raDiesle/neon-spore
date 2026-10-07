import { LIGHT_HALF } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { drawGovernorAlloy, drawGovernorVeins, governorVeinPulse } from "./governor-face-baked.js";
import { type Dial, dialAt, dialRing, rimDepth, TRACK_IN, TRACK_OUT } from "./governor-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/** The graduations round the track: a long one every other. */
const GRADUATIONS = 16;
/** The ribs down the flywheel's edge, round the whole lap; only the near half's are seen. */
const RIBS = 40;

/**
 * The flywheel: its ribbed brass edge showing under the face, a vent glowing
 * between every other pair of ribs; the rim lit from the key over the whole
 * disc and red with a blow taken; the dark face inside it; the baked alloy
 * over both and its veins breathing on the beat (`governor-face-baked.ts`);
 * and the graduations round the track.
 */
export function drawGovernorWheel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  hurt: number,
  beatPhase: number,
): void {
  const drop = rimDepth(l, d);
  ctx.fillStyle = PALETTE.governorBrassDark;
  ctx.fill(dialRing(d, 1, drop));
  ctx.fillRect(d.cx - d.r, d.cy, d.r * 2, drop);
  drawEdge(ctx, d, drop, beatPhase);
  const rim = dialRing(d, 1);
  ctx.save();
  ctx.fillStyle = PALETTE.governorBrass;
  ctx.fill(rim);
  ctx.clip(rim);
  ctx.translate(d.cx, d.cy);
  ctx.scale(1, d.tilt);
  litRound(ctx, 0, 0, d.r + 2, LIGHT_HALF.rock);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.governorBrassDark, 0.95);
  ctx.stroke(rim);
  drawHurt(ctx, rim, hurt);

  ctx.fillStyle = PALETTE.governorFace;
  ctx.fill(dialRing(d, TRACK_OUT + 0.02));
  drawGovernorAlloy(ctx, d);
  drawGovernorVeins(ctx, d, governorVeinPulse(beatPhase));
  const ticks = new Path2D();
  for (let i = 0; i < GRADUATIONS; i++) {
    const milli = (1000 * i) / GRADUATIONS;
    const from = dialAt(d, milli, i % 2 === 0 ? TRACK_IN : (TRACK_IN + TRACK_OUT) / 2);
    const to = dialAt(d, milli, TRACK_OUT);
    ticks.moveTo(from.x, from.y);
    ticks.lineTo(to.x, to.y);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.8);
  ctx.stroke(ticks);
  ctx.stroke(dialRing(d, TRACK_IN));
}

/**
 * The flywheel's edge below its face: ribs standing down it, lit on the
 * key's side and dark away from it, and a slot between every other pair
 * with the veins' light inside, breathing with them.
 */
function drawEdge(ctx: CanvasRenderingContext2D, d: Dial, drop: number, beatPhase: number): void {
  if (drop < 2) return;
  const lit = new Path2D();
  const dark = new Path2D();
  const vents = new Path2D();
  for (let i = 0; i < RIBS; i++) {
    const milli = (1000 * (i + 0.5)) / RIBS;
    const top = dialAt(d, milli, 1);
    // Only the near half of the edge shows, below the face's own outline.
    if (top.y < d.cy) continue;
    const ribs = top.x < d.cx ? lit : dark;
    ribs.moveTo(top.x, top.y + 1);
    ribs.lineTo(top.x, top.y + drop - 1);
    if (i % 2 === 0) continue;
    const next = dialAt(d, (1000 * (i + 1.5)) / RIBS, 1);
    if (next.y < d.cy) continue;
    const x = (top.x + next.x) / 2;
    const y = (top.y + next.y) / 2 + drop * 0.5;
    const half = Math.max(1, Math.abs(next.x - top.x) * 0.22);
    vents.ellipse(x, y, half, drop * 0.22, 0, 0, Math.PI * 2);
  }
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.75);
  ctx.stroke(lit);
  ctx.strokeStyle = rgba(PALETTE.governorBrass, 0.35);
  ctx.stroke(dark);
  ctx.fillStyle = rgba(PALETTE.governorGlow, 0.35 * governorVeinPulse(beatPhase));
  ctx.fill(vents);
}
