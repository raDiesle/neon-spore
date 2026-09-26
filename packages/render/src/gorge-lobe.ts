import { blobPoints, circleSubpath } from "@neon-spore/content";
import { type GorgeIntake, gorgeFull, type SimConfig } from "@neon-spore/sim";
import { paintDrop } from "./baton-flesh.js";
import { halo, strokeGlow } from "./glow.js";
import type { LobeDepth } from "./gorge-depth.js";
import { paintLobeRim, paintLobeSkin } from "./gorge-flesh.js";
import { paintFlap, paintPucker } from "./gorge-flesh-torn.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
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
 *
 * What the skin, the beads and the flaps are made of is `gorge-flesh.ts`.
 */

/** Beats the beads take to rise to the top of a full lobe. */
const RISE_BEATS = 3;
/** A lobe's radii, as a share of a tile — wide enough to hold four beads. */
const RX = 0.4;
const RY = 0.5;
/** A bead's radius. */
const BEAD = 0.09;
/** How far round its lobe a bead swims, in bead radii, and how fast, in radians a second. */
const ORBIT = 0.55;
const ORBIT_SPEED = 1.1;
/** How much a bead swells coming round the near side, and what is left of it behind the skin. */
const ORBIT_LENS = 0.12;
const VEILED = 0.75;

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
  /** Where it stands in the sack's bow this frame (`gorge-depth.ts`). */
  depth: LobeDepth,
): void {
  const full = gorgeFull(k, cfg);
  const swell = (full ? 1 + 0.18 * Math.min(1, since / RISE_BEATS) : 1) * depth.s;
  const rx = tile * RX * swell;
  const ry = tile * RY * swell * (1 + 0.12 * breath);
  const cy = y - ry;

  if (k.ruptured) {
    drawRuptured(ctx, tile, x, y, rx, ry, time, seed);
    return;
  }

  const body = splinePath(blobPoints(x, cy, rx, ry, 3, 0.1, 0.04, time * 0.5, seed, 24), true);
  const { hex, rim } = lobeHex(k.color);
  // A full lobe has no wash of skin at all — that is what *transparent* means
  // here, and it is the one state change a seat two rows down can read at a
  // glance. The colour the edge used to carry is lit in the floor instead.
  const floor = mouth ? PALETTE.ember : k.beads > 0 ? hex : PALETTE.dim;
  const rise = full ? since : -1;
  // The beads swim round inside: the ones behind go first, under the skin, so
  // the membrane veils them, and the ones in front come after it.
  drawBeads(ctx, tile, k, x, y, ry, rise, time, hex, rim, false);
  paintLobeSkin(ctx, body, {
    x,
    cy,
    rx,
    ry,
    tile,
    floor,
    floorAlpha: full ? 0.9 : mouth ? 0.75 : k.beads > 0 ? 0.6 : 0.3,
    wall: full ? rim : null,
    wallAlpha: 0.3 + 0.2 * breath,
    full,
    turn: depth.turn,
  });
  // Where it hangs from the sack, dark under its crown, so it is hung and not pasted.
  drawContact(ctx, body, x, cy - ry, rx * 1.1, 0.55);
  paintLobeRim(ctx, body, x, rx, tile, depth.turn, 1 - depth.back * 2);
  drawBeads(ctx, tile, k, x, y, ry, rise, time, hex, rim, true);
  hazeLobe(ctx, body, depth.back);

  // The mouth: the one lobe the beam is for, ringed in the fire's colour so
  // neither screen has to be told which of the three that are left it is.
  if (mouth) {
    const ring = new Path2D(circleSubpath(x, cy, Math.max(rx, ry) * 1.25));
    strokeGlow(ctx, ring, PALETTE.emberRim, STROKE.inner, 0.5 + 0.4 * breath);
  }
  // The pucker: the intake itself, a small dark mouth under the lobe that a
  // shot goes into. It is what makes the swallow a picture the rule teaches.
  paintPucker(ctx, x, y, tile, floor);
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
  /** The beads on the near side of the lobe, or the far. */
  front: boolean,
): void {
  if (k.beads <= 0) return;
  const r0 = tile * BEAD;
  const lift = rise < 0 ? 0 : Math.min(1, rise / RISE_BEATS);
  const room = ry * 2 - r0 * 3;
  const step = Math.min(r0 * 2.2, room / Math.max(1, k.beads));
  for (let i = 0; i < k.beads; i++) {
    const a = time * ORBIT_SPEED + i * 1.9;
    const z = Math.sin(a);
    if (z >= 0 !== front) continue;
    const r = r0 * (1 + ORBIT_LENS * z);
    const bx = x + Math.cos(a) * r0 * ORBIT;
    const by = y - r0 * 1.6 - i * step - lift * (room - (k.beads - 1) * step);
    const lit = (0.6 + 0.4 * lift) * (front ? 1 : VEILED);
    halo(ctx, bx, by, r * 3, hex, (0.35 + 0.4 * lift) * (front ? 1 : VEILED));
    const bead = new Path2D(circleSubpath(bx, by, r));
    paintDrop(ctx, bead, bx, by, r, hex, rim, tile, lit);
  }
}

/** A lobe further round the bow than its neighbours, gone a step toward the field. */
function hazeLobe(ctx: CanvasRenderingContext2D, body: Path2D, back: number): void {
  if (back <= 0) return;
  ctx.save();
  ctx.globalAlpha = back;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(body);
  ctx.restore();
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
    paintFlap(ctx, flap, x + side * rx * 0.6, y - ry * 2, y + ry * 0.35, tile);
  }
}
