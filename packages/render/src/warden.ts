import { catmullRomToBezierPath, hullRadiusMul, type Point } from "@neon-spore/content";
import {
  type Creature,
  type SimConfig,
  WARDEN_COLS,
  type WardenState,
  wardenColor,
  wardenCycle,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawEye, drawHatch, HATCH } from "./warden-eye.js";

/**
 * THE WARDEN, drawn: a ring with a hole you can see the field through.
 *
 * Two lobed loops under different seeds, cut against each other with an
 * even-odd fill — the same trick the hull's fire opening plays, so nothing had
 * to be invented and no loop has to be wound a particular way. The two
 * deliberately disagree: eight shallow lobes and almost no wobble on the body,
 * five deeper ones with three times the wobble on the pupil, so the edge you
 * look *through* is the one that moves.
 *
 * The numbers are `tools/shape-sheet/src/drafts/bosses.ts`'s, which is where
 * they were tuned and where they can be looked at as a still.
 */

const OUTER = { lobes: 8, depth: 0.035, wobble: 0.012, seed: 5.0 };
const PUPIL = { lobes: 5, depth: 0.1, wobble: 0.075, seed: 9.0 };

/** The pupil at rest, and open, as fractions of the body's radius. */
const PUPIL_REST = 0.44;
const PUPIL_OPEN = 0.62;

/**
 * How far off centre the pupil sits when it has slid all the way to one side,
 * in fractions of the body's radius. Far enough that the material visibly
 * bunches on one side and thins on the other — a smaller offset reads as a
 * hole that happens to be off centre, which is a manufacturing defect rather
 * than a thing looking at you.
 */
const PUPIL_TRAVEL = 0.28;

function loop(
  l: { lobes: number; depth: number; wobble: number; seed: number },
  cx: number,
  cy: number,
  r: number,
  t: number,
): Point[] {
  const pts: Point[] = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = hullRadiusMul(a, l.lobes, l.depth, l.wobble, t, l.seed);
    pts.push({ x: cx + Math.cos(a) * r * m, y: cy + Math.sin(a) * r * m });
  }
  return pts;
}

/** How far the ring reaches from its own centre, in screen pixels. */
function wardenRadius(l: Layout): number {
  return (l.tile * WARDEN_COLS) / 2;
}

/**
 * The y a tether leaves from: the underside of the rim, not the ring's centre.
 * A line that starts at the centre is a line drawn *through* the boss, and the
 * one thing this body has to say about itself is that its middle is a hole.
 */
export function wardenRimY(l: Layout, row: number): number {
  return tileCY(l, row) + wardenRadius(l) * 0.86;
}

export function drawWarden(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  body: Creature,
  b: WardenState,
  waveBeat: number,
  beat: number,
  beatPhase: number,
  time: number,
  openness: number,
): void {
  const cx = tileCX(l, body.col + (WARDEN_COLS - 1) / 2);
  const cy = tileCY(l, body.row);
  const r = wardenRadius(l);
  const hex = wardenColor(wardenCycle(cfg, waveBeat)) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  // Where the hole is, in the body's own units: its column against the body's,
  // clamped to the travel the shape can take without breaching the rim.
  const centreCol = body.col + (WARDEN_COLS - 1) / 2;
  const away = (b.pupilCol - centreCol) / ((WARDEN_COLS - 1) / 2);
  const dx = away * PUPIL_TRAVEL * r;
  const pupilR = r * (PUPIL_REST + (PUPIL_OPEN - PUPIL_REST) * openness);

  const outer = catmullRomToBezierPath(loop(OUTER, cx, cy, r, time));
  const inner = catmullRomToBezierPath(loop(PUPIL, cx + dx, cy, pupilR, time));
  // Two closed subpaths in one `d`, the way the hull composes its fire opening
  // out of `circleSubpath` — not two `Path2D`s added together, which asks the
  // canvas for a method the shape only ever needed as a string.
  const ring = new Path2D(`${outer} ${inner}`);

  // Even-odd is what cuts the hole, and it cuts it whichever way either loop
  // happens to wind — so neither has to be reversed and neither may be.
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(ring, "evenodd");
  ctx.restore();

  strokeGlow(ctx, new Path2D(outer), PALETTE.rock, STROKE.outline, 0.7);
  // The edge you look through carries the cycle's colour, and it is the only
  // part of the body that does: the rim says what ammunition the one shot
  // needs, a whole cycle before there is anything to shoot at.
  strokeGlow(
    ctx,
    new Path2D(inner),
    openness > 0 ? rim : hex,
    STROKE.outline,
    0.6 + openness * 0.8,
  );

  drawPlates(ctx, cx, cy, r, b, cfg, time);
  drawHatch(ctx, cx + dx, cy, pupilR * HATCH, openness);
  // The eye behind the door — the same one THE LID wears, `eye.ts`. The fluid
  // and the fringe are drawn whether or not the hatch is open, because they are
  // what makes the hole read as an eye at all rather than as a porthole that
  // sometimes lights up; only the lens is gated, and it gates itself on
  // `openness` (`warden-eye.ts`).
  drawEye(ctx, cx + dx, cy, pupilR * HATCH, hex, rim, openness, beat + beatPhase, time);
}

/**
 * The plates, as gaps rather than as a bar. One comes off per opened eye and
 * the gap never fills, so the silhouette says how far in the pair is without
 * a number anywhere on the screen.
 *
 * Which plate is missing follows from the index, so a plate that has gone
 * stays gone in the same place on both screens and across a restart.
 */
function drawPlates(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  b: WardenState,
  cfg: SimConfig,
  time: number,
): void {
  const total = Math.max(1, cfg.wardenPlates);
  const arc = (Math.PI * 2) / total;
  ctx.save();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 2.2;
  ctx.lineCap = "butt";
  for (let k = 0; k < b.plates; k++) {
    const a0 = k * arc + arc * 0.12 + Math.sin(time * 0.2) * 0.01;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.94, a0, a0 + arc * 0.76);
    ctx.stroke();
  }
  ctx.restore();
}
