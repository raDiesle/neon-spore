import { facet, KEY, pin } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import type { Dial } from "./gauge.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE GAUGE's flesh, lit.** The owner, 7 October 2026: *improve "the gauge"
 * graphics with more details and 3d depth*. The body was one flat fill with a
 * glowing edge; this is what stands on it, drawn inside the body's clip by
 * `gauge-alien.ts`:
 *
 * - **A dome of light** off the key (`KEY`, top left): the shoulder nearest
 *   it lifted, the far side sunk to the cool shadow `#0B1024`, never black.
 * - **A tendon up every arm**, raised: a lit edge toward the light, a shadow
 *   edge away from it and the flesh between — an emboss out of three strokes
 *   of one path.
 * - **Pores placed on a ball**, not scattered on the picture (`depth`'s
 *   rule: the surface is placed). `pin`/`facet` give each its spot and its
 *   foreshortening, so the ones toward the edge narrow into slivers and the
 *   body reads as round rather than as a sheet with dots on it.
 *
 * None of it is red, cyan or ember: those are the wound and the gashes.
 * The paths depend only on the dial, which is the layout's, so they are built
 * once per size (`bakedCache`) and a frame pays the strokes.
 */

/** The body's middle distance and the arms' reach, as `gauge-alien.ts` has them. */
const BODY = 1.62;
const ARM_REACH = 0.42;
const ARMS = 6;

const FLESH = "#120B1E";
const LIT = mixHex("#46305E", PALETTE.venom, 0.12);
const SHADOW = "#0B1024";
const TENDON = mixHex(FLESH, "#4A3360", 0.55);
const TENDON_LIT = mixHex("#5E4478", PALETTE.venom, 0.25);
const PIT = "#06040B";
const PIT_LIP = mixHex("#4A3360", PALETTE.venom, 0.3);

interface FleshPaths {
  tendons: Path2D;
  pits: Path2D;
  lips: Path2D;
}

const paths = bakedCache<string, FleshPaths>();

/** The lit dome, the tendons and the pores. Called inside the body's clip. */
export function drawGaugeFlesh(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const R = dial.r * BODY;
  const fx = dial.cx + KEY.x * R * 0.55;
  const fy = dial.cy + KEY.y * R * 0.55;
  const g = ctx.createRadialGradient(fx, fy, 0, dial.cx, dial.cy, R * 1.45);
  g.addColorStop(0, LIT);
  g.addColorStop(0.3, mixHex(LIT, FLESH, 0.35));
  g.addColorStop(0.6, FLESH);
  g.addColorStop(0.86, SHADOW);
  // The bounce: a little light back off the edge furthest from the key.
  g.addColorStop(1, mixHex(SHADOW, "#2A1E44", 0.6));
  ctx.fillStyle = g;
  ctx.fillRect(dial.cx - R * 1.6, dial.cy - R * 1.6, R * 3.2, R * 3.2);

  const p = fleshPaths(dial);
  const off = Math.max(1.2, dial.r * 0.012);
  // Raised: its shadow side away from the light, its lit side toward it, and
  // the ridge itself over both, so a rim of each shows.
  ctx.save();
  ctx.translate(-KEY.x * off, -KEY.y * off);
  ctx.fillStyle = rgba(SHADOW, 0.95);
  ctx.fill(p.tendons);
  ctx.translate(KEY.x * off * 2, KEY.y * off * 2);
  ctx.fillStyle = rgba(TENDON_LIT, 0.7);
  ctx.fill(p.tendons);
  ctx.restore();
  ctx.fillStyle = TENDON;
  ctx.fill(p.tendons);

  ctx.fillStyle = PIT;
  ctx.fill(p.pits);
  ctx.strokeStyle = rgba(PIT_LIP, 0.7);
  ctx.lineWidth = Math.max(1.2, dial.r * 0.01);
  ctx.stroke(p.lips);
}

function fleshPaths(dial: Dial): FleshPaths {
  const key = `${Math.round(dial.cx)},${Math.round(dial.cy)},${Math.round(dial.r)}`;
  const cached = paths.get(key);
  if (cached) return cached;
  const built = { tendons: tendonPath(dial), ...porePaths(dial) };
  paths.set(key, built);
  return built;
}

/**
 * Three tendons up each arm — one down its spine and one up either flank,
 * leaning together toward the spike — from the lip of the mouth out to near
 * the tip, each a filled lens fat in the middle and drawn to a point at both
 * ends. The arm straight up keeps only its spine, which runs between the eyes
 * as a crest; its flanks would cut through them.
 */
function tendonPath(dial: Dial): Path2D {
  const path = new Path2D();
  const slot = (Math.PI * 2) / ARMS;
  const from = dial.r * 1.14;
  const to = dial.r * BODY * (1 + ARM_REACH * 0.8);
  // The arm whose spine stands at three quarters of a turn: straight up.
  const up = ARMS * 0.75 - 0.5;
  for (let k = 0; k < ARMS; k++) {
    const a = (k + 0.5) * slot;
    for (const [root, tip, bow, wide] of FLANKS) {
      if (k === up && root !== 0) continue;
      lens(path, dial, a, root, tip, bow, from, to * (root === 0 ? 1 : 0.86), dial.r * wide);
    }
  }
  return path;
}

/** Each tendon's angle off the arm's spine at the lip and at its end, its
 * bow, and its half-width at the middle as a share of the dial's radius. */
const FLANKS: readonly (readonly [number, number, number, number])[] = [
  [0, 0, 0.02, 0.04],
  [-0.2, -0.04, -0.05, 0.028],
  [0.2, 0.04, 0.05, 0.028],
];

/** One tendon, appended to `path`: two curves from root to tip, `wide` apart at the middle. */
function lens(
  path: Path2D,
  dial: Dial,
  a: number,
  root: number,
  tip: number,
  bow: number,
  from: number,
  to: number,
  wide: number,
): void {
  const at = (ang: number, d: number): [number, number] => [
    dial.cx + Math.cos(ang) * d,
    dial.cy + Math.sin(ang) * d,
  ];
  const [x0, y0] = at(a + root, from);
  const [x2, y2] = at(a + tip, to);
  const [mx, my] = at(a + (root + tip) * 0.5 + bow, (from + to) * 0.5);
  const len = Math.hypot(x2 - x0, y2 - y0) || 1;
  // Square to the tendon, so the two sides bulge out either way of it.
  const nx = -(y2 - y0) / len;
  const ny = (x2 - x0) / len;
  path.moveTo(x0, y0);
  path.quadraticCurveTo(mx + nx * wide * 2, my + ny * wide * 2, x2, y2);
  path.quadraticCurveTo(mx - nx * wide * 2, my - ny * wide * 2, x0, y0);
  path.closePath();
}

/**
 * Pores on a ball the size of the body about the pivot, on a golden-angle
 * spiral so they are spread and never in rows. Only those on the near side,
 * clear of the mouth and above the hull, are kept.
 */
function porePaths(dial: Dial): { pits: Path2D; lips: Path2D } {
  const pits = new Path2D();
  const lips = new Path2D();
  const reach = dial.r * BODY * 1.05;
  const size = dial.r * 0.045;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const count = 140;
  for (let i = 0; i < count; i++) {
    const lat = Math.asin(-1 + (2 * (i + 0.5)) / count) * 0.92;
    const f = facet(pin(i * golden, lat, reach), 0);
    if (!f.near) continue;
    const d = Math.hypot(f.x, f.y);
    if (d < dial.r * 1.18 || f.y > dial.r * 0.1) continue;
    // Larger toward the middle of the body, where the flesh is thickest.
    const s = size * (0.7 + (0.6 * ((i * 7) % 5)) / 4);
    const rx = Math.max(0.6, s * f.sx);
    const ry = Math.max(0.6, s * f.sy * 0.75);
    const x = dial.cx + f.x;
    const y = dial.cy + f.y;
    pits.moveTo(x + rx, y);
    pits.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    // A pit's lit wall is the one facing the light: its far side.
    if (f.lit > 0.35) {
      lips.moveTo(x - rx * 0.9, y + ry * 0.5);
      lips.ellipse(x, y, rx * 1.05, ry * 1.05, 0, Math.PI * 0.85, Math.PI * 0.15, true);
    }
  }
  return { pits, lips };
}
