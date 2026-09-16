import { type QueenState, ROCK_CYCLE } from "@neon-spore/sim";
import { PALETTE, STROKE } from "./palette.js";
import { dropShare } from "./queen-drop.js";

/**
 * THE CRANE — what holds each flank torch to the queen: an arm of two
 * segments with a claw on the end, reaching over the rock from her shoulder
 * and gripping it from above.
 *
 * The owner's own suggestion, drawn as a draft on the director's BULB QUEEN
 * VARIANTS page beside a collar and a cradle, and on 16 September 2026 asked
 * for by name for the game — the exemption `CLAUDE.md` names for a look that
 * lands on the field rather than in VERSUS. The draft gripped the rock from
 * the side, with a gap between her flank and the rock to reach across; on the
 * field the rock rides her hull's tip (`QUEEN_FIGURE`) with no gap, so the
 * arm goes up and over instead, and the rock falls straight down out of an
 * opened claw — the same drop `queen-egg.ts` already makes.
 *
 * What it buys over a bare rock is **time**. An arm has a pose: through the
 * last beat before a drop it straightens and the claw opens, so the picture
 * says *when* as well as *where*. Both arms do it together — one arm moving
 * on its own would say which side, and which side is player 2's half
 * (`queen-drop.ts`), the very thing `torchTremor` is built not to leak.
 */

/** Where the shoulder sits on her, in tiles from her body's centre. */
const SHOULDER_X = 1.35;
const SHOULDER_Y = -0.18;
/** Where the elbow sits between shoulder and wrist, and how far it lifts. */
const ELBOW_ALONG = 0.52;
const ELBOW_LIFT = 0.72;
/** How far the wrist stands off the rock's top, as a share of its radius. */
const WRIST_OFF = 1.0;
/** The fingers: their reach round the rock, and how far they swing open. */
const GRIP = 1.06;
const CLOSED = 0.62;
const SWING = 0.75;

/**
 * How far one arm is through letting go, 0..1.
 *
 * Opening runs off the wave's own clock, the way `dropShare` does: through the
 * last beat of `ROCK_CYCLE` both claws open together. Closing runs off what
 * the simulation remembers — the arm whose rock just fell stays open and
 * empty for that beat, then closes over the egg as it grows back
 * (`eggScale`, handed in as `grown`); an arm still holding its rock closes
 * again across the first beat of the new cycle.
 */
export function craneRelease(
  boss: QueenState,
  side: -1 | 1,
  beat: number,
  waveBeat: number,
  beatPhase: number,
  grown: number,
): number {
  if (boss.releaseSide === side) {
    if (beat === boss.releaseBeat) return 1;
    if (beat === boss.releaseBeat + 1) return 1 - grown;
  }
  const within = dropShare(waveBeat, beatPhase) * ROCK_CYCLE;
  if (within >= ROCK_CYCLE - 1) return within - (ROCK_CYCLE - 1);
  if (within < 1) return 1 - within;
  return 0;
}

/** Where the wrist is for a rock at `rx`,`ry` of radius `r`. */
function wrist(rx: number, ry: number, r: number): { x: number; y: number } {
  return { x: rx, y: ry - r * WRIST_OFF };
}

function joint(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

/**
 * The arm, drawn before the rock so the wrist sits behind it: from the
 * shoulder on her flank, up to the elbow, down to the rock's top. The elbow
 * lifts less as the arm lets go — straightening is what letting go looks like
 * in an arm, and a bent arm that merely opened its fingers would read as
 * dropping something by accident.
 */
export function drawCraneArm(
  ctx: CanvasRenderingContext2D,
  tile: number,
  bodyX: number,
  bodyY: number,
  side: -1 | 1,
  rx: number,
  ry: number,
  r: number,
  release: number,
): void {
  const sx = bodyX + side * SHOULDER_X * tile;
  const sy = bodyY + SHOULDER_Y * tile;
  const w = wrist(rx, ry, r);
  const ex = sx + (w.x - sx) * ELBOW_ALONG;
  const ey = sy + (w.y - sy) * ELBOW_ALONG - r * ELBOW_LIFT * (1 - release * 0.7);

  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = STROKE.outline * 2.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(ex, ey);
  ctx.lineTo(w.x, w.y);
  ctx.stroke();

  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = STROKE.outline;
  joint(ctx, ex, ey, r * 0.17);
  joint(ctx, sx, sy, r * 0.2);
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
}

/**
 * The claw, drawn after the rock so its two fingers close over the rock's
 * face — a claw behind the thing it holds is a claw that has already dropped
 * it. Held, the fingers reach down round the rock's sides; letting go, they
 * swing out sideways and the rock is free to fall.
 */
export function drawCraneClaw(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  r: number,
  release: number,
): void {
  const w = wrist(rx, ry, r);
  const grip = r * GRIP;
  ctx.lineCap = "round";
  // The arm's own colour under a lit core: the rock's rim is pale already,
  // and a pale finger laid along it was the rim's own outline drawn twice.
  for (const [hex, width] of [
    [PALETTE.hull, STROKE.outline * 2.6],
    [PALETTE.hullRim, STROKE.outline * 0.9],
  ] as const) {
    ctx.strokeStyle = hex;
    ctx.lineWidth = width;
    fingers(ctx, rx, ry, w, grip, release);
  }
  ctx.lineCap = "butt";
}

function fingers(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  w: { x: number; y: number },
  grip: number,
  release: number,
): void {
  for (const s of [-1, 1] as const) {
    // Angles about the rock's centre, from straight down: closed, the tips
    // are near its underside; open, they are out at its sides. The finger
    // bows round the rock, so its control point is half way round from the
    // wrist to the tip and just outside the rim.
    const a = Math.PI / 2 + s * (CLOSED + release * SWING);
    const mid = Math.PI / 2 + (s * (Math.PI + CLOSED + release * SWING)) / 2;
    ctx.beginPath();
    ctx.moveTo(w.x, w.y);
    ctx.quadraticCurveTo(
      rx + Math.cos(mid) * grip * 1.15,
      ry + Math.sin(mid) * grip * 1.15,
      rx + Math.cos(a) * grip,
      ry + Math.sin(a) * grip,
    );
    ctx.stroke();
  }
}
