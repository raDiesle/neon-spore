import { crystalRadiusMul, QUEEN_SHELL, surfaceDim, surfaceLit } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import type { ShellDraw } from "./queen-look.js";

/**
 * FACET — a kept look for THE BULB QUEEN's shell, drawn only on the GRAPHICS
 * page's LIBRARY.
 *
 * It stood in `creature:queen` on VERSUS, decided 11 September 2026: SCUTES
 * went into the game (`queen-scutes.ts`) and the owner said of this one
 * "move to 'shapes' page the CREATURE:QUEEN · FACET can be used for metal enemy or obstacle". It sits in this package, beside the record it once patched,
 * because it is written against this package's internals; nothing on the
 * field imports it, and the game's bundle drops it. The argument it made,
 * from its VERSUS card:
 *
 * FACET — the shell is a cut stone: a flat table raised off the rim, and a
 * crown of thirty-two planes running down from it to the sixteen corners
 * of her contour, every plane lit by its own normal against the key.
 *
 * The contour is the shipped one, sampled on the same clock the path was
 * walked at, so the corners of the crown are the corners of the silhouette.
 * The table breathes: its height rises and falls on a slow clock, which tips
 * every plane of the crown and moves its light — the one thing a flat fill
 * can never do, because a flat fill has no planes to tip.
 */

/** How far in the table's edge sits, as a share of the rim. */
const TABLE_SHARE = 0.52;
/** The table's height above the rim, as a share of her half-height, at rest
 * and at the top of a breath. Her half-height rather than her half-width:
 * she is three times as wide as she is tall, and a crown a third of her
 * width high would be a pyramid. */
const TABLE_RISE = 0.7;
const BREATH = 0.25;
const BREATH_SECONDS = 5;
/** The table's corners drift a share of a step either way, so the crown's
 * pattern turns a little under the fixed light without the contour moving. */
const TWIST = 0.3;
const TWIST_SECONDS = 17;
/** What a plane keeps of its colour turned fully from the light. A shadow
 * is cool and never black (`docs/style-guide.md`). */
const FLOOR = 0.16;
const SHADOW = "#0B1024";
/** The rock's own mid-tone, the one the meteor is filled with before its
 * light (`meteor-look.ts`), and its lit shoulder. */
const STONE = "#8A8F9C";
const SHEEN = "#F4F1EA";
/** Above this a plane is square enough to the key to catch a specular. */
const GLINT_FROM = 0.78;

interface P3 {
  x: number;
  y: number;
  z: number;
}

/**
 * The lambert term of a unit normal against the key, by `surfaceLit`. That
 * function takes a normal as a latitude and an apparent longitude on a ball;
 * any unit normal `(x, y, z)` — right, down, toward the viewer — is one of
 * those with `sin lat = y`, so this is the projection called and not a
 * second light written beside it.
 */
function lambert(n: P3): number {
  const cosLat = Math.sqrt(Math.max(0, 1 - n.y * n.y));
  if (cosLat < 1e-6) return surfaceLit(0, n.y, 0, 1);
  return surfaceLit(cosLat, n.y, n.x / cosLat, n.z / cosLat);
}

/** The unit normal of the plane through three points, facing the viewer. */
function normal(a: P3, b: P3, c: P3): P3 {
  const ux = b.x - a.x;
  const uy = b.y - a.y;
  const uz = b.z - a.z;
  const vx = c.x - a.x;
  const vy = c.y - a.y;
  const vz = c.z - a.z;
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  if (nz < 0) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }
  const len = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / len, y: ny / len, z: nz / len };
}

/** The sixteen corners of her contour this frame, on the rim (`z = 0`). */
function rim(rx: number, ry: number, t: number): P3[] {
  const s = QUEEN_SHELL;
  const out: P3[] = [];
  for (let i = 0; i < s.sides; i++) {
    const a = (i / s.sides) * Math.PI * 2;
    const m = crystalRadiusMul(a, s.sides, s.depth, s.wobble, t, s.seed);
    out.push({ x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m, z: 0 });
  }
  return out;
}

/** The table's corners: the rim drawn in, raised, and turned a fraction of a
 * step so each one stands over an edge of the rim rather than a corner. */
function table(rx: number, ry: number, t: number, time: number): P3[] {
  const s = QUEEN_SHELL;
  const rise = ry * TABLE_RISE * (1 + BREATH * Math.sin((time * Math.PI * 2) / BREATH_SECONDS));
  const twist = (0.5 + TWIST * Math.sin((time * Math.PI * 2) / TWIST_SECONDS)) / s.sides;
  const out: P3[] = [];
  for (let i = 0; i < s.sides; i++) {
    const a = ((i + twist) / s.sides) * Math.PI * 2;
    const m = crystalRadiusMul(a, s.sides, s.depth, s.wobble, t, s.seed);
    out.push({
      x: Math.cos(a) * rx * m * TABLE_SHARE,
      y: Math.sin(a) * ry * m * TABLE_SHARE,
      z: rise,
    });
  }
  return out;
}

function plane(ctx: CanvasRenderingContext2D, pts: readonly P3[], lit: number): void {
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.closePath();
  ctx.fillStyle = mixHex(SHADOW, STONE, surfaceDim(FLOOR, lit));
  ctx.fill();
  if (lit > GLINT_FROM) {
    ctx.fillStyle = rgba(SHEEN, ((lit - GLINT_FROM) / (1 - GLINT_FROM)) * 0.35);
    ctx.fill();
  }
  ctx.strokeStyle = rgba(PALETTE.rock, 0.18 + lit * 0.3);
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** The cut stone: the crown's planes from the rim up to the table, then the
 * table over them, then the rock's outline as the shipped shell wears it. */
export function facet(d: ShellDraw): void {
  const { ctx, path, rx, ry, t, time } = d;
  const outer = rim(rx, ry, t);
  const inner = table(rx, ry, t, time);
  const n = outer.length;
  ctx.save();
  ctx.clip(path);
  for (let i = 0; i < n; i++) {
    const o0 = outer[i]!;
    const o1 = outer[(i + 1) % n]!;
    const i0 = inner[i]!;
    const i1 = inner[(i + 1) % n]!;
    // Two planes per side: the one standing on the rim's edge with its apex
    // at a table corner, and the one hanging off the table's edge with its
    // apex at a rim corner. Together they tile the crown with no gap.
    plane(ctx, [o0, o1, i0], lambert(normal(o0, o1, i0)));
    plane(ctx, [o1, i1, i0], lambert(normal(o1, i1, i0)));
  }
  plane(ctx, inner, lambert({ x: 0, y: 0, z: 1 }));
  ctx.restore();
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(1, Math.min(rx, ry) * 0.06);
  ctx.stroke(path);
}
