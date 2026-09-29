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
import { drawAlienEye, drawFeelers } from "./scout-alien.js";
import { scoutAt } from "./scout-draw.js";

/**
 * THE SCOUT's little ship, drawn. Split off `scout-draw.ts` — the arena it
 * flies in — on that file's line count.
 *
 * **It is a pacman, but alien** — the owner, 29 September 2026: *make it look
 * like a pacman but alien, which collects the stuff*. A round of the mother
 * ship's violet with a wedge of a mouth chomping, lobed at the rim like
 * everything this game grows (`blobPath`'s wobble, done here on an arc), a
 * wet slit-pupilled eye, and two feelers with lit tips riding the back.
 *
 * **The mouth is the heading, so only the pilot sees it** (`showsScoutNose`).
 * On the navigator's screen the mouth is shut, the eye is centred and the
 * feelers stand straight up: a place and nothing more, which is exactly what
 * that seat is meant to have. What is aboard sits in the mouth, on the same
 * half.
 *
 * Nothing is held between frames; every number comes off the round, the tick
 * and the frame clock.
 */

/** The mouth's half-opening, in radians, at its narrowest and widest. */
const MOUTH_SHUT = 0.08;
const MOUTH_WIDE = 0.95;
/** Chomps a second. */
const CHOMP_HZ = 3;
/** The rim's lobes, and how deep they go as a share of the radius. */
const LOBES = 5;
const LOBE_DEPTH = 0.07;
/**
 * How much bigger the body is drawn than it touches (`scoutRadiusMilli`): at
 * the touch radius it is fourteen pixels across a phone and the mouth does
 * not read. A hazard's own rock is drawn at its touch radius, so a body this
 * size still meets one only once the two are really touching.
 */
const DRAWN = 1.35;

/**
 * The little ship. `nose` is the pilot's half of the split: the mouth, the
 * eye set forward, the feelers behind, the wake and what it carries.
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
  // The screen angle the mouth faces: up, on the navigator's screen, and shut.
  const face = nose ? Math.atan2(-cos, sin) : -Math.PI / 2;

  // Caught: a red flash that fades over the verdict, so the touch is seen.
  if (round.caughtTick >= 0) {
    const age = Math.max(0, tick - round.caughtTick);
    const flash = Math.max(0, 1 - age / 60);
    halo(ctx, x, y, r * 3, PALETTE.red, 0.3 + 0.6 * flash);
  }
  // **The wake says the thruster is firing, so it is asked whether it is.**
  // A burn held on a heavy ship outside `scoutPrimeTicks` adds nothing at all
  // (`sim/scout-fly.ts`), and a wake for it would be a control answering
  // while it is refused. `scoutPrimed` is the flight's own reading.
  if (nose && round.burning && scoutPrimed(cfg, round, tick)) {
    drawScoutWake(ctx, x, y, r, sin, cos, time);
  }

  drawFeelers(ctx, x, y, r, nose ? face + Math.PI : -Math.PI / 2, time);
  const chomp = 0.5 + 0.5 * Math.sin(time * CHOMP_HZ * Math.PI * 2);
  const mouth = nose && round.caughtTick < 0 ? MOUTH_SHUT + (MOUTH_WIDE - MOUTH_SHUT) * chomp : 0;
  paintScoutBody(ctx, pacPath(x, y, r, face, mouth, time), x, y, r);
  // The eye: forward of the middle and to the mouth's upper side for the
  // pilot; dead centre for the navigator, where it gives nothing away.
  const up = face - (Math.PI / 2) * Math.sign(Math.cos(face) || 1);
  const ex = nose ? x + Math.cos(face) * r * 0.12 + Math.cos(up) * r * 0.42 : x;
  const ey = nose ? y + Math.sin(face) * r * 0.12 + Math.sin(up) * r * 0.42 : y - r * 0.2;
  drawAlienEye(ctx, ex, ey, r, time);

  if (!nose) return;
  // What it is carrying, in the mouth: one amber bead a mote, so the pilot
  // can count them without being told.
  const beads = round.carrying.length;
  for (let i = 0; i < beads; i++) {
    const spread = (i - (beads - 1) / 2) * 0.45;
    const bx = x + Math.cos(face + spread) * r * 0.72;
    const by = y + Math.sin(face + spread) * r * 0.72;
    ctx.save();
    ctx.fillStyle = PALETTE.pod;
    ctx.beginPath();
    ctx.arc(bx, by, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * The body's outline: a lobed rim from one lip of the mouth round to the
 * other, and in to the middle. `mouth` 0 is a closed round.
 */
function pacPath(x: number, y: number, r: number, face: number, mouth: number, time: number) {
  const path = new Path2D();
  const steps = 36;
  const from = face + mouth;
  const span = Math.PI * 2 - mouth * 2;
  if (mouth > 0) path.moveTo(x, y);
  for (let i = 0; i <= steps; i++) {
    const a = from + (span * i) / steps;
    const k = r * (1 + LOBE_DEPTH * Math.sin(a * LOBES + time * 1.4));
    const px = x + Math.cos(a) * k;
    const py = y + Math.sin(a) * k;
    if (i === 0 && mouth === 0) path.moveTo(px, py);
    else path.lineTo(px, py);
  }
  path.closePath();
  return path;
}

/**
 * **The ship as a made thing** — the mother ship's violet with a curve to it,
 * lit from above like everything else on the field: shaded from a lit
 * shoulder to the deep underneath, a cold bounce off the water on its
 * underside, and a film of gloss over the top of the curve.
 */
function paintScoutBody(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  r: number,
): void {
  halo(ctx, x, y, r * 1.9, PALETTE.hull, 0.35);
  ctx.save();
  const flesh = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.1);
  flesh.addColorStop(0, PALETTE.sheenRim);
  flesh.addColorStop(0.28, PALETTE.hull);
  flesh.addColorStop(1, PALETTE.sheenDeep);
  ctx.fillStyle = flesh;
  ctx.fill(body);
  ctx.clip(body);
  // The bounce off the water, on the underside.
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.35);
  ctx.lineWidth = r * 0.16;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.12, r * 0.98, Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();
  // The film over the curve: a soft bloom on the shoulder.
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.45);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.46, r * 0.3, r * 0.13, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The wake: two chevrons behind the ship, jittering on the frame clock. */
function drawScoutWake(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  sin: number,
  cos: number,
  time: number,
): void {
  ctx.save();
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 2; i++) {
    const back = r * (1.3 + i * 0.6 + 0.1 * Math.sin(time * 19 + i));
    const cx = x - sin * back;
    const cy = y + cos * back;
    const half = r * 0.55;
    const dip = r * 0.3;
    ctx.globalAlpha = i === 0 ? 0.8 : 0.4;
    ctx.lineWidth = Math.max(1, r * 0.14);
    ctx.beginPath();
    ctx.moveTo(cx - cos * half - sin * dip, cy - sin * half + cos * dip);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + cos * half - sin * dip, cy + sin * half + cos * dip);
    ctx.stroke();
  }
  ctx.restore();
}
