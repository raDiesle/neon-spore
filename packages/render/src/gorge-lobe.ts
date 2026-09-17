import { blobPoints, circleSubpath } from "@neon-spore/content";
import { type GorgeIntake, gorgeFull, type SimConfig } from "@neon-spore/sim";
import { halo, strokeGlow } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * One lobe of THE GORGE: the intake puckered under it, the beads hanging in
 * it, and the four states a lobe can be in — filling, full, ruptured, the
 * mouth (`gorge-draw.ts` places seven of these across the sack).
 *
 * **The beads are the health bar**, the Bulb Queen's bargain again
 * (`docs/spec/bosses.md` §11.0): a lobe with three red beads stacked up it
 * is a lobe one red shot from full, and nothing has to be written down for a
 * seat to know it. The pilot is given the number as well (`gorge-draw.ts`),
 * and that is a different fact — it is the *count*, which he has to say out
 * loud — not a second picture of the same one.
 *
 * **THE SLOW is here**, and it is the only one this boss has: on the beat a
 * lobe comes full, the skin goes transparent and the beads *rise* through it
 * over `RISE_BEATS`, a third of the rate anything else in the fight moves at.
 * It is the whole warning before a one-beat pierce, so it is long rather than
 * loud — a bright flash would read as *done* on a lobe that is exactly not
 * (`docs/spec/bosses-choreographed.md` §3, THE SLOW).
 */

/** Beats the beads take to rise to the top of a full lobe. */
const RISE_BEATS = 3;
/** A lobe's radii, as a share of a tile — wide enough to hold four beads. */
const RX = 0.4;
const RY = 0.5;
/** A bead's radius. */
const BEAD = 0.09;

export function lobeHex(color: GorgeIntake["color"]): { hex: string; rim: string } {
  if (color === "cyan") return { hex: PALETTE.cyan, rim: PALETTE.cyanRim };
  if (color === "red") return { hex: PALETTE.red, rim: PALETTE.redRim };
  return { hex: PALETTE.dim, rim: PALETTE.text };
}

/**
 * The lobe at `(x, y)`, `y` the intake's own height: the lobe stands above
 * it and its beads stack up from it. `breath` is the sack's, 0 to 1 over the
 * beat, and `since` is beats since the lobe came full (`-1` while it is not).
 */
export function drawLobe(
  ctx: CanvasRenderingContext2D,
  tile: number,
  cfg: SimConfig,
  k: GorgeIntake,
  x: number,
  y: number,
  breath: number,
  since: number,
  mouth: boolean,
  time: number,
  seed: number,
): void {
  const full = gorgeFull(k, cfg);
  const swell = full ? 1 + 0.18 * Math.min(1, since / RISE_BEATS) : 1;
  const rx = tile * RX * swell;
  const ry = tile * RY * swell * (1 + 0.12 * breath);
  const cy = y - ry;

  if (k.ruptured) {
    drawRuptured(ctx, tile, x, y, rx, ry, time, seed);
    return;
  }

  const body = splinePath(blobPoints(x, cy, rx, ry, 3, 0.1, 0.04, time * 0.5, seed, 24), true);
  const { hex, rim } = lobeHex(k.color);
  // Translucent: the skin is a wash the beads show through, and a full lobe
  // has no wash at all — that is what *transparent* means here, and it is the
  // one state change a seat two rows down can read at a glance.
  if (!full) {
    ctx.save();
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = PALETTE.hull;
    ctx.fill(body);
    ctx.restore();
  }
  const edge = mouth ? PALETTE.ember : k.beads > 0 ? hex : PALETTE.dim;
  strokeGlow(ctx, body, edge, STROKE.inner, full ? 0.9 : mouth ? 0.7 : 0.35);
  if (full) strokeGlow(ctx, body, rim, STROKE.inner, 0.4 + 0.3 * breath);

  drawBeads(ctx, tile, k, x, y, ry, full ? since : -1, time, hex, rim);

  // The mouth: the one lobe the beam is for, ringed in the fire's colour so
  // neither screen has to be told which of the three that are left it is.
  if (mouth) {
    const ring = new Path2D(circleSubpath(x, cy, Math.max(rx, ry) * 1.25));
    strokeGlow(ctx, ring, PALETTE.emberRim, STROKE.inner, 0.5 + 0.4 * breath);
  }
  // The pucker: the intake itself, a small dark mouth under the lobe that a
  // shot goes into. It is what makes the swallow a picture the rule teaches.
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.ellipse(x, y, tile * 0.14, tile * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  const pucker = new Path2D();
  pucker.ellipse(x, y, tile * 0.14, tile * 0.06, 0, 0, Math.PI * 2);
  strokeGlow(ctx, pucker, edge, STROKE.inner, 0.5);
}

/**
 * The beads, stacked up the lobe from the intake, each drifting a little
 * against its neighbours so the body reads as fluid. `rise` is beats since
 * the lobe came full: the stack lifts to the top of the lobe over
 * `RISE_BEATS` and stays there. The mouth can hold more than four, and they
 * keep stacking, which is the point of step 13 — dozens up one lobe.
 */
function drawBeads(
  ctx: CanvasRenderingContext2D,
  tile: number,
  k: GorgeIntake,
  x: number,
  y: number,
  ry: number,
  rise: number,
  time: number,
  hex: string,
  rim: string,
): void {
  if (k.beads <= 0) return;
  const r = tile * BEAD;
  const lift = rise < 0 ? 0 : Math.min(1, rise / RISE_BEATS);
  const room = ry * 2 - r * 3;
  const step = Math.min(r * 2.2, room / Math.max(1, k.beads));
  for (let i = 0; i < k.beads; i++) {
    const drift = Math.sin(time * 1.7 + i * 1.3) * r * 0.5;
    const by = y - r * 1.6 - i * step - lift * (room - (k.beads - 1) * step);
    halo(ctx, x + drift, by, r * 3, hex, 0.35 + 0.4 * lift);
    ctx.save();
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(x + drift, by, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * A pierced lobe, hanging open for good: the skin split down its front and
 * two flaps of it hanging either side of where the intake was. It takes no
 * colour at all — a shot up this column meets nothing, and grey is what
 * nothing looks like on this field.
 */
function drawRuptured(
  ctx: CanvasRenderingContext2D,
  tile: number,
  x: number,
  y: number,
  rx: number,
  ry: number,
  time: number,
  seed: number,
): void {
  for (const side of [-1, 1]) {
    const sway = Math.sin(time * 0.9 + seed + side) * tile * 0.03;
    const flap = new Path2D();
    flap.moveTo(x + side * rx * 0.2, y - ry * 2);
    flap.quadraticCurveTo(
      x + side * rx * 1.1 + sway,
      y - ry * 1.2,
      x + side * rx * 0.75 + sway * 2,
      y + ry * 0.35,
    );
    flap.quadraticCurveTo(
      x + side * rx * 0.45 + sway,
      y - ry * 0.4,
      x + side * rx * 0.2,
      y - ry * 2,
    );
    ctx.save();
    ctx.fillStyle = PALETTE.rockDark;
    ctx.fill(flap);
    ctx.restore();
    strokeGlow(ctx, flap, PALETTE.rock, STROKE.inner, 0.3);
  }
}
