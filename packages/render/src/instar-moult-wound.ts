import { mixHex } from "./hex.js";
import type { PaleSkin } from "./instar-moult.js";
import type { Point } from "./instar-place.js";
import { faded } from "./instar-plate.js";
import { PALETTE } from "./palette.js";

/**
 * **The edges of THE INSTAR's wound**, drawn every frame. Only a frame knows
 * where the split is; `instar-moult-baked.ts` lays the flesh. There are
 * five things, and each is one path, so their cost does not grow with the
 * number of beads:
 *
 * - the rim, dark and raw, just inside the split;
 * - the old hide torn along the back and curled back off it, its edge lit;
 * - runs of blood from the back down into the wound;
 * - beads of blood hanging off the torn lip onto the hide below;
 * - one glint on each run and each bead.
 *
 * The runs and the beads sit at fixed places along the split, so they hold
 * still while the split opens under them. The hide that is setting over the
 * wound takes them with it (`soft`).
 */

/** Where the runs hang from the back, as fractions of it, and how long each is in head radii. */
const RUNS: readonly [number, number][] = [
  [0.14, 0.16],
  [0.31, 0.26],
  [0.47, 0.12],
  [0.62, 0.22],
  [0.8, 0.18],
];
/** Where the beads hang off the lip, as fractions of it, and their sizes in head radii. */
const BEADS: readonly [number, number][] = [
  [0.2, 0.035],
  [0.38, 0.05],
  [0.55, 0.03],
  [0.71, 0.045],
  [0.88, 0.03],
];
/** Blood: darker than the flesh it runs over, so a run reads against it. */
const BLOOD = mixHex(PALETTE.red, PALETTE.redDark, 0.5);
/** How many curled flaps of hide along the back. */
const FLAPS = 9;

const at = (ps: readonly Point[], u: number): Point =>
  ps[Math.round(u * (ps.length - 1))] ?? { x: 0, y: 0 };

/** A unit vector from `a` to `b`, straight down if they coincide. */
function unit(a: Point, b: Point): Point {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return d > 1e-6 ? { x: (b.x - a.x) / d, y: (b.y - a.y) / d } : { x: 0, y: 1 };
}

/** A drop from `o` along `n`, `len` long, `w` wide at its round end. */
function drop(p: Path2D, o: Point, n: Point, len: number, w: number): void {
  const e = { x: o.x + n.x * len, y: o.y + n.y * len };
  const s = { x: -n.y * w, y: n.x * w };
  p.moveTo(o.x + s.x * 0.4, o.y + s.y * 0.4);
  p.quadraticCurveTo(e.x + s.x, e.y + s.y, e.x + n.x * w, e.y + n.y * w);
  p.quadraticCurveTo(e.x - s.x, e.y - s.y, o.x - s.x * 0.4, o.y - s.y * 0.4);
  p.closePath();
}

export function drawWoundEdges(ctx: CanvasRenderingContext2D, skin: PaleSkin): void {
  const { pale, back, lip, r, fade, soft } = skin;
  const a = fade * soft;
  if (a <= 0.01 || back.length < 2 || lip.length < 2) return;
  const blood = new Path2D();
  const glint = new Path2D();
  // Runs down from the back into the wound, no longer than it is deep; beads
  // off the torn lip onto the hide below it.
  const hang = (from: readonly Point[], u: number, len: number, w: number) => {
    const o = at(from, u);
    const b = at(back, u);
    const n = unit(b, at(lip, u));
    const l = Math.min(len, Math.hypot(at(lip, u).x - b.x, at(lip, u).y - b.y) * 0.8);
    if (l < 1) return;
    drop(blood, o, n, l, w);
    const g = { x: o.x + n.x * l - w * 0.3, y: o.y + n.y * l - w * 0.3 };
    glint.moveTo(g.x + w * 0.3, g.y);
    glint.arc(g.x, g.y, w * 0.3, 0, Math.PI * 2);
  };
  for (const [u, len] of RUNS) hang(back, u, len * r, r * 0.035);
  for (const [u, size] of BEADS) hang(lip, u, size * r * 1.6, size * r);
  ctx.save();
  // The rim: raw and dark, just inside the split.
  ctx.save();
  ctx.clip(pale);
  ctx.strokeStyle = faded(PALETTE.redDark, fade, 0.75 * soft);
  ctx.lineWidth = r * 0.12;
  ctx.lineJoin = "round";
  ctx.stroke(pale);
  ctx.restore();
  // The hide along the back, torn and curled back off the wound.
  const flaps = new Path2D();
  for (let i = 0; i < FLAPS; i++) {
    const u = (i + 0.5) / FLAPS;
    const o = at(back, u);
    const n = unit(at(lip, u), o);
    const t = unit(at(back, u - 0.5 / FLAPS), at(back, u + 0.5 / FLAPS));
    const h = r * (0.07 + 0.04 * (i % 3));
    const w = (r * 0.5) / FLAPS;
    // Leaning along the back, the way a strip pulled off it curls.
    flaps.moveTo(o.x - t.x * w, o.y - t.y * w);
    flaps.lineTo(o.x + n.x * h + t.x * w, o.y + n.y * h + t.y * w);
    flaps.lineTo(o.x + t.x * w, o.y + t.y * w);
    flaps.closePath();
  }
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, soft);
  ctx.fill(flaps);
  ctx.strokeStyle = faded(PALETTE.sheenRim, fade, 0.55 * soft);
  ctx.lineWidth = Math.max(1, r * 0.012);
  ctx.stroke(flaps);
  ctx.fillStyle = faded(BLOOD, fade, 0.95 * soft);
  ctx.fill(blood);
  ctx.fillStyle = faded(PALETTE.redRim, fade, 0.9 * soft);
  ctx.fill(glint);
  ctx.restore();
}
