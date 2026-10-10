import {
  mazeCosMilli,
  mazeSinMilli,
  type ScoutState,
  type SimConfig,
  scoutPrimed,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawAlienEye } from "./scout-alien.js";
import { drawScoutArms, drawScoutFlesh } from "./scout-arms.js";
import { scoutAt } from "./scout-draw.js";
import { type ScoutPose, scoutPose } from "./scout-pose.js";
import { drawScoutShell } from "./scout-shell.js";

/**
 * THE SCOUT's little ship, drawn. Split off `scout-draw.ts` — the arena it
 * flies in — on that file's line count.
 *
 * **It is a living nautilus** (`scout-shell.ts`) — the owner, 7 October 2026,
 * in place of the alien pacman of 29 September: *anything which looks cool
 * alien natural living, similar style to the ship*. It still collects the
 * stuff: the tentacles open and shut where the mouth chomped, and what is
 * aboard is held in them.
 *
 * **The tentacles are the heading, so only the pilot sees them reach**
 * (`showsScoutNose`). On the navigator's screen the ship hangs at rest, its
 * tentacles shut and dangling down the screen like the hull's own roots,
 * whichever way it is really pointing: a place and nothing more, which is
 * exactly what that seat is meant to have.
 *
 * Nothing is held between frames; every number comes off the round, the tick
 * and the frame clock.
 */

/** How far the tentacles open, at their narrowest and widest, as a share. */
const GRASP_SHUT = 0.1;
const GRASP_WIDE = 1;
/** Grasps a second. */
const CHOMP_HZ = 3;
/**
 * How much bigger the body is drawn than it touches (`scoutRadiusMilli`): at
 * the touch radius it is fourteen pixels across a phone and nothing on it
 * reads. A hazard's own rock is drawn at its touch radius, so a body this
 * size still meets one only once the two are really touching.
 */
const DRAWN = 1.35;

/**
 * The little ship. `nose` is the pilot's half of the split: the tentacles
 * reaching along the heading, the wake and what it carries.
 */
export function drawScout(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  round: ScoutState,
  tick: number,
  time: number,
  nose: boolean,
): void {
  const { x, y } = scoutAt(l, round);
  const r = (DRAWN * cfg.scoutRadiusMilli * l.tile) / 1000;
  const sin = mazeSinMilli(round.headingMilli) / 1000;
  const cos = mazeCosMilli(round.headingMilli) / 1000;
  // The screen angle the tentacles reach along: down, hanging, on the
  // navigator's screen.
  const face = nose ? Math.atan2(-cos, sin) : Math.PI / 2;
  const pose = scoutPose(x, y, r, face);

  // Caught: a red flash that fades over the verdict, so the touch is seen.
  if (round.caughtTick >= 0) {
    const age = Math.max(0, tick - round.caughtTick);
    const flash = Math.max(0, 1 - age / 60);
    halo(ctx, x, y, r * 3, PALETTE.red, 0.3 + 0.6 * flash);
  }
  halo(ctx, x, y, r * 1.9, PALETTE.hull, 0.35);
  // **The wake says the thruster is firing, so it is asked whether it is.**
  // A burn held on a heavy ship with no thumb on the thruster adds nothing at all
  // (`sim/scout-fly.ts`), and a wake for it would be a control answering
  // while it is refused. `scoutPrimed` is the flight's own reading.
  if (nose && round.burning && scoutPrimed(cfg, round)) {
    drawScoutWake(ctx, x, y, r, sin, cos, time);
  }

  drawScoutShell(ctx, pose, time);
  drawScoutFlesh(ctx, pose, time);
  const chomp = 0.5 + 0.5 * Math.sin(time * CHOMP_HZ * Math.PI * 2);
  const open = nose && round.caughtTick < 0 ? GRASP_SHUT + (GRASP_WIDE - GRASP_SHUT) * chomp : 0;
  drawScoutArms(ctx, pose, open, !nose, time);
  // What it is carrying, held in the tentacles: one amber bead a mote, so the
  // pilot can count them without being told.
  if (nose) drawCarried(ctx, x, y, r, face, round.carrying.length);
  // The eye sits at the opening, on the back's side of the soft body.
  drawAlienEye(ctx, eyeX(pose), eyeY(pose), r * 0.8, time);
}

function eyeX(p: ScoutPose): number {
  return p.x + (p.fx * 0.58 + p.dx * 0.1) * p.r;
}
function eyeY(p: ScoutPose): number {
  return p.y + (p.fy * 0.58 + p.dy * 0.1) * p.r;
}

function drawCarried(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  face: number,
  beads: number,
): void {
  ctx.save();
  for (let i = 0; i < beads; i++) {
    const spread = (i - (beads - 1) / 2) * 0.32;
    const bx = x + Math.cos(face + spread) * r * 1.15;
    const by = y + Math.sin(face + spread) * r * 1.15;
    halo(ctx, bx, by, r * 0.45, PALETTE.pod, 0.4);
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(bx, by, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * The wake: the nautilus jets, so the burn is a spurt of the hull's light out
 * of the back and a stream of bubbles in it, each one travelling away and
 * shrinking on the frame clock.
 */
function drawScoutWake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sin: number,
  cos: number,
  time: number,
): void {
  const bx = x - sin * r * 0.9;
  const by = y + cos * r * 0.9;
  ctx.save();
  // The jet: a tongue thinning away from the shell.
  const len = r * (1.5 + 0.15 * Math.sin(time * 23));
  const half = r * 0.32;
  ctx.fillStyle = rgba(PALETTE.hull, 0.55);
  ctx.beginPath();
  ctx.moveTo(bx + cos * half, by + sin * half);
  ctx.quadraticCurveTo(
    bx - sin * len * 0.5 + cos * half * 0.6,
    by + cos * len * 0.5 + sin * half * 0.6,
    bx - sin * len,
    by + cos * len,
  );
  ctx.quadraticCurveTo(
    bx - sin * len * 0.5 - cos * half * 0.6,
    by + cos * len * 0.5 - sin * half * 0.6,
    bx - cos * half,
    by - sin * half,
  );
  ctx.closePath();
  ctx.fill();
  // The bubbles in it.
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = Math.max(1, r * 0.06);
  for (let i = 0; i < 4; i++) {
    const t = (time * 2.2 + i / 4) % 1;
    const back = r * (0.3 + 1.6 * t);
    const side = r * 0.18 * Math.sin(time * 7 + i * 2.1);
    ctx.globalAlpha = 0.9 * (1 - t);
    ctx.beginPath();
    ctx.arc(
      bx - sin * back + cos * side,
      by + cos * back + sin * side,
      r * (0.16 - 0.08 * t),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
