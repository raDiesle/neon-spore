import { MAGNET_SHAPE, type MagnetShape } from "@neon-spore/content";
import { magnetPoleColor } from "@neon-spore/sim";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { sinHash } from "./hash.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import {
  DOWN,
  type MagnetDraw,
  magnetArchPath,
  magnetHang,
  magnetRadius,
  magnetSlabPath,
  TURN,
} from "./magnet.js";
import { pole, slab } from "./magnet-coil.js";
import { lanes } from "./magnet-lanes.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * ORE — THE MAGNET's body as the game draws it since 11 September 2026, when
 * the owner decided `creature:magnet` with "apply to game CREATURE:MAGNET ·
 * ORE and remove other related alternatives". Written as a VERSUS candidate
 * over `coil` and moved here whole; `MAGNET_LOOK` points at it.
 *
 * ORE, drawn: the horseshoe is a lump of something dug up, and the colour in
 * its poles is a vein running through the stone.
 *
 * The shipped body is machined — a bevel, a ramp, a hard edge. This one is
 * *found*: the arch is pitted, each pit a hollow with its far wall catching
 * the light, placed once per body off the creature's id so no two magnets
 * are pitted alike; the plate is layered, three strata across it in three
 * greys, the way a slab of split rock is; and the poles are not lamps but
 * **veins** — two or three crooked lines of the pole's own colour running up
 * from the tip into the arm, with a bead of light travelling down each one
 * *toward* the tip on the pose clock. The colour is seen to be flowing to
 * the end of the arm, which is the end a shot has to reach.
 *
 * The motion is the veins, and it is the only motion here: rock does not
 * turn and should not. The key light, the pole gradient, the plate and the
 * lanes are the shipped passes called as they are.
 */

/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** Pits on the arch: how many, how big as a share of the band's half-width,
 * and how much of the band they wander across. */
const PITS = 7;
const PIT = 0.34;
const PIT_SPREAD = 0.55;

/** Strata across the plate: how many lines, and how far apart in plate
 * thicknesses. */
const STRATA = 3;

/** Veins in one pole: how many, how far up the arm they run as a turn of the
 * arch, how far they zig, and how many beats a bead takes to run one. */
const VEINS = 3;
const VEIN_TURN = 0.17;
const VEIN_ZIG = 0.32;
const VEIN_BEATS = 1.9;

/** The arch as stone: the dark mass, its pits, and the key over both. */
function stone(
  ctx: CanvasRenderingContext2D,
  r: number,
  s: MagnetShape,
  id: number,
  haze: (h: string) => string,
  spin: number,
): void {
  const path = magnetArchPath(r, s);
  ctx.fillStyle = haze(PALETTE.rockDark);
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  const mid = (s.outer + s.inner) * 0.5;
  const half = (s.outer - s.inner) * 0.5;
  // The band the arch actually spans, so no pit is placed in the gap.
  const span = TURN * (1 - 2 * s.gapTurn);
  for (let i = 0; i < PITS; i++) {
    const u = sinHash(id * 7 + i);
    const v = sinHash(id * 7 + i + 100);
    const a = DOWN + s.gapTurn * TURN + (0.06 + 0.88 * u) * span;
    const rho = r * (mid + (v - 0.5) * 2 * PIT_SPREAD * half);
    const px = Math.cos(a) * rho;
    const py = Math.sin(a) * rho;
    const size = r * half * PIT * (0.7 + 0.6 * sinHash(id + i * 3));
    // The hollow, then its far wall lit: the light is upper left, so the
    // lower-right inside of a pit is the part that faces it.
    ctx.beginPath();
    ctx.ellipse(px, py, size, size * 0.7, a, 0, TURN);
    ctx.fillStyle = rgba(SHADOW, 0.6);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px, py, size, size * 0.7, a, 0.2, Math.PI * 0.9);
    ctx.strokeStyle = haze(PALETTE.rock);
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  litRound(ctx, 0, 0, r, "value", spin);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = haze(PALETTE.dim);
  ctx.stroke(path);
}

/** Strata across the plate, over `slab`'s own paint and inside its outline. */
function strata(
  ctx: CanvasRenderingContext2D,
  r: number,
  s: MagnetShape,
  haze: (h: string) => string,
): void {
  const path = magnetSlabPath(r, s);
  ctx.save();
  ctx.clip(path);
  const top = r * (s.plateDrop - s.plateThick);
  const height = r * s.plateThick * 2;
  for (let i = 1; i <= STRATA; i++) {
    const y = top + (height * i) / (STRATA + 1);
    ctx.beginPath();
    ctx.moveTo(-r * s.plateHalf, y);
    ctx.lineTo(r * s.plateHalf, y + r * 0.015 * (i % 2 === 0 ? 1 : -1));
    ctx.strokeStyle =
      i % 2 === 0 ? haze(mixHex(PALETTE.rockDark, SHADOW, 0.4)) : haze(PALETTE.rock);
    ctx.globalAlpha = i % 2 === 0 ? 0.7 : 0.35;
    ctx.lineWidth = STROKE.inner * 0.8;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

/** The veins in one pole, and the bead running down each toward the tip. */
function veins(
  d: MagnetDraw,
  r: number,
  s: MagnetShape,
  left: boolean,
  haze: (h: string) => string,
): void {
  const { ctx, c, beats } = d;
  const color = magnetPoleColor(c, left);
  if (color === null) return;
  const hex = haze(color === "red" ? PALETTE.red : PALETTE.cyan);
  const rim = haze(color === "red" ? PALETTE.redRim : PALETTE.cyanRim);
  const dir = left ? 1 : -1;
  const start = DOWN + dir * s.gapTurn * TURN;
  const mid = (s.outer + s.inner) * 0.5;
  const half = (s.outer - s.inner) * 0.5;
  ctx.save();
  ctx.clip(magnetArchPath(r, s));
  for (let k = 0; k < VEINS; k++) {
    const seed = c.id * 13 + k * 5 + (left ? 0 : 50);
    const steps = 5;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = start + dir * t * VEIN_TURN * TURN;
      const off = (sinHash(seed + i) - 0.5) * 2 * VEIN_ZIG * half + (k - 1) * 0.3 * half;
      const rho = r * (mid + off);
      pts.push({ x: Math.cos(a) * rho, y: Math.sin(a) * rho });
    }
    const first = pts[0];
    if (!first) continue;
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const p of pts) ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = hex;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = STROKE.inner * (k === 1 ? 1.1 : 0.7);
    ctx.stroke();
    // The bead: along the vein from the far end to the tip, and gone.
    const run = 1 - ((beats / VEIN_BEATS + k / VEINS) % 1);
    const at = run * steps;
    const i0 = Math.min(steps - 1, Math.floor(at));
    const f = at - i0;
    const a0 = pts[i0];
    const a1 = pts[i0 + 1];
    if (!a0 || !a1) continue;
    const bx = a0.x + (a1.x - a0.x) * f;
    const by = a0.y + (a1.y - a0.y) * f;
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(bx, by, STROKE.inner * 1.1, 0, TURN);
    ctx.fillStyle = rim;
    ctx.fill();
    halo(ctx, bx, by, r * 0.22, hex, 0.5 * (1 - run * 0.5));
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function ore(d: MagnetDraw): void {
  const { ctx, l, cfg, c, x, y, beats, struck, near } = d;
  const s = MAGNET_SHAPE;
  const r = magnetRadius(l, c);
  const haze = (h: string): string => hazed(cfg, h, near);
  const spin = magnetHang(c, beats);

  ctx.save();
  ctx.translate(x, y);
  lanes(d, r, s, haze);
  ctx.rotate(spin);
  slab(d, r, s, struck, haze);
  strata(ctx, r, s, haze);
  stone(ctx, r, s, c.id, haze, spin);
  pole(d, r, s, true, haze);
  pole(d, r, s, false, haze);
  veins(d, r, s, true, haze);
  veins(d, r, s, false, haze);
  ctx.restore();
}
