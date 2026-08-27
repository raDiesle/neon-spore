import { circleSubpath, openSmoothPath, type Point } from "@neon-spore/content";
import {
  type SimConfig,
  type VaneState,
  vaneColor,
  vaneOpening,
  vanePivotCol,
  vaneReachMilli,
  vaneTipCol,
  vaneWeakCol,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * THE VANE, drawn: an arm sweeping the top of the field, and the bearing it
 * turns on.
 *
 * One open stroke and no inside. It is the second open contour in the game
 * after the Warden's tether, and it is open for a reason the encounter depends
 * on: the moment a shape encloses an area it starts reading as a body holding a
 * weapon, and this is a mechanism. A vane is the thing that turns when
 * something pushes it.
 *
 * The pivot is not decoration — it is the only part of the boss that can be
 * reached, and it hangs above row 0 where nothing else in the game is, so a
 * shot answers it by leaving the field entirely (`vane.ts`). The casing around
 * it wears the pins, and a pin gone is a gap that never fills: the arm reaches
 * a phase further out for it, so the silhouette says how far in the pair are by
 * getting *longer*, which is the same bargain the Bulb Queen makes by sinking.
 *
 * Nothing here is held between frames. Everything it draws comes off the world
 * and the beat, so there is no `Effects` field to clear and no way for a
 * restart to show this fight the last one's arm.
 */

/** Beats a throw's streak takes to go out. Short — it is a flick, not a trail. */
const THROW_FADE = 1.4;

/** How far the tip dips below the bearing at mid-swing, in tiles. */
const DROOP = 0.85;

/** Points along the arm, from the hub's rim out to the tip. */
function armPoints(px: number, py: number, tx: number, ty: number, whip: number): Point[] {
  const pts: Point[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const f = i / N;
    // The bend is cubed in `f` so the arm is stiff at the bearing and loose at
    // the tip: a lever bends where it is thin, and the eye reads the direction
    // of travel off the lag rather than off the position.
    const lag = whip * f * f * f;
    pts.push({ x: px + (tx - px) * f - lag, y: py + (ty - py) * f + Math.abs(lag) * 0.25 });
  }
  return pts;
}

export function drawVane(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  waveBeat: number,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const pivotCol = vanePivotCol(cfg);
  const px = tileCX(l, pivotCol);
  const py = tileCY(l, 0) - l.tile * 0.2;
  const hub = l.tile * 0.34;

  // Where the arm stands between two beats. The tip is interpolated in columns
  // rather than in pixels so it travels along the grid the pair is naming, and
  // it is the same number on both screens because both read it out of the sim.
  const from = vaneTipCol(cfg, b.pins, waveBeat);
  const to = vaneTipCol(cfg, b.pins, waveBeat + 1);
  const tipCol = from + (to - from) * beatPhase;
  const mFrom = vaneReachMilli(waveBeat);
  const mTo = vaneReachMilli(waveBeat + 1);
  const m = mFrom + (mTo - mFrom) * beatPhase;

  const tx = tileCX(l, tipCol);
  const ty = py + l.tile * DROOP * (1 - Math.abs(m) / 1000);
  // Lag against the direction of travel, so a held arm hangs straight and a
  // sweeping one trails. `to - from` is columns per beat, which is exactly how
  // hard it is being swung.
  const whip = (to - from) * l.tile * 0.18 + Math.sin(time * 1.7) * l.tile * 0.03;

  const opening = vaneOpening(waveBeat);
  const open = opening !== -1 && opening !== b.spentOpening;
  const hex =
    opening === -1 ? PALETTE.rock : vaneColor(opening) === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = hex === PALETTE.red ? PALETTE.redRim : PALETTE.cyanRim;

  drawCasing(ctx, l, cfg, b, px, py, hub, waveBeat, open, hex, rim);

  const arm = new Path2D(
    openSmoothPath(armPoints(px + Math.sign(tx - px) * hub * 0.6, py, tx, ty, whip)),
  );
  strokeGlow(ctx, arm, PALETTE.rock, STROKE.outline * 1.6, 0.75);

  // The tip, which is the fold line and the only column anybody has to watch.
  const tip = new Path2D(circleSubpath(tx, ty, l.tile * 0.11));
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(tip);
  ctx.restore();
  strokeGlow(ctx, tip, PALETTE.rock, STROKE.inner, 0.9);

  drawThrow(ctx, l, b, beat, beatPhase, tx, ty);
}

/**
 * The bearing's casing: a bar across three columns at the very top, with the
 * pins in it. One side of it splits at each end of a sweep, and the side is the
 * fold's own direction in miniature — the arm hard right loads the bearing on
 * its left, and that is the column the shot has to leave the field in.
 */
function drawCasing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: VaneState,
  px: number,
  py: number,
  hub: number,
  waveBeat: number,
  open: boolean,
  hex: string,
  rim: string,
): void {
  const body = new Path2D(circleSubpath(px, py, hub));
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body);
  ctx.restore();
  strokeGlow(ctx, body, PALETTE.rock, STROKE.outline, 0.7);

  // The pins, as notches round the hub. One per pin left, in the same places on
  // both screens and across a restart, because the place follows from the index.
  const total = Math.max(1, cfg.vanePins);
  const arc = (Math.PI * 2) / total;
  ctx.save();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 1.8;
  ctx.lineCap = "butt";
  for (let k = 0; k < b.pins; k++) {
    const a0 = k * arc + arc * 0.15;
    ctx.beginPath();
    ctx.arc(px, py, hub * 0.99, a0, a0 + arc * 0.7);
    ctx.stroke();
  }
  ctx.restore();

  const weak = vaneWeakCol(cfg, waveBeat);
  if (weak === -1) return;
  // The split, drawn where the shot has to go rather than where the load is:
  // a mouth at the top of the weak column, in the colour it will take.
  const wx = tileCX(l, weak);
  const mouth = new Path2D(circleSubpath(wx, py, l.tile * (open ? 0.2 : 0.12)));
  strokeGlow(ctx, mouth, open ? rim : hex, STROKE.outline, open ? 1.1 : 0.5);
  if (!open) return;
  const seam = new Path2D(
    `M ${px.toFixed(2)} ${py.toFixed(2)} L ${wx.toFixed(2)} ${py.toFixed(2)}`,
  );
  strokeGlow(ctx, seam, hex, STROKE.inner, 0.8);
}

/**
 * The flick the arm leaves when it throws an arrival: a line from the tip to
 * the column the body came down in, going out over about a beat. It is the one
 * moment the fold is a picture rather than an arithmetic, so it is drawn even
 * though the body it threw is already standing in its new column.
 */
function drawThrow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  b: VaneState,
  beat: number,
  beatPhase: number,
  tx: number,
  ty: number,
): void {
  if (b.throwBeat === -1 || b.throwCol === -1) return;
  const since = beat - b.throwBeat + beatPhase;
  if (since < 0 || since > THROW_FADE) return;
  const fade = 1 - since / THROW_FADE;
  const cx = tileCX(l, b.throwCol);
  const cy = tileCY(l, 0);
  const streak = new Path2D(
    `M ${tx.toFixed(2)} ${ty.toFixed(2)} L ${cx.toFixed(2)} ${cy.toFixed(2)}`,
  );
  strokeGlow(ctx, streak, PALETTE.rock, STROKE.inner, fade * 0.9);
}
