import {
  type FilamentState,
  type FilamentTile,
  filamentsLeft,
  filamentTiles,
} from "@neon-spore/sim";
import { filamentHeartPoint, type Heart, type Point } from "./filament-heart.js";
import {
  filamentLeadAt,
  filamentPoint,
  filamentPullRise,
  filamentRunPath,
  GRAB_R,
} from "./filament-shape.js";
import { drawFilamentToolAt } from "./filament-tools.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The strike, and the spit** — the owner, 25 September 2026: *when both
 * reach … the hearth inside, then both weapons are applied and damaging the
 * alien. and it spits them out and a new vene is appearing they need to
 * travel next.*
 *
 * Over a pull, read off how far through it is and nothing else:
 *
 * - **In**, to `IN`: both tools ride up the lead from the root into the
 *   heart, shrinking as they go.
 * - **The strike**, to `SPAT`: they sit in the middle of the heart, and the
 *   heart swells, shakes and glows red — the blow is timed by the picture,
 *   not by the event, so it lands when the tools do (`hurtShake`).
 * - **The spit**, to `REST`: the heart throws them out along two arcs, one
 *   each way, down to the free end of the next vein; after the last vein
 *   they fly off the field and fade.
 * - **At rest**, to the end and through the next arm: both on the free end
 *   the pair starts from, the rasp inside the corona's ring.
 *
 * The success is said over the field the moment the tools hit: `HEART HIT`,
 * and how many veins are left.
 */

const IN = 0.3;
const SPAT = 0.45;
const REST = 0.8;
/** The middle of the strike, and how far either side of it the blow shows. */
const STRIKE_AT = 0.37;
const STRIKE_HALF = 0.12;
/** How far the heart swells at the strike. */
const STRIKE_SWELL = 0.1;
/** How small the tools are inside the heart. */
const INSIDE = 0.8;
/** How far the spit's arc bows out sideways, in tiles. */
const SPIT_BOW = 1.5;
/** The two tools nested on a free end: the corona's reach and the rasp's, in ring radii. */
const NEST_CORONA = 1.9;
const NEST_RASP = 0.85;

/** How hard the strike shows at `pull` of the pull, 0..1. */
export function filamentStrike(pull: number): number {
  return Math.max(0, 1 - Math.abs(pull - STRIKE_AT) / STRIKE_HALF);
}

/** The heart swollen by the strike. */
export function struckHeart(h: Heart, strike: number): Heart {
  const k = 1 + STRIKE_SWELL * strike;
  return { x: h.x, y: h.y, rx: h.rx * k, ry: h.ry * k };
}

/** Both tools resting on the free end of the armed vein: the corona round, the rasp in it. */
export function drawFilamentResting(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  own: readonly [boolean, boolean],
  time: number,
): void {
  const end = s.tiles[s.cursor]?.[0];
  if (end !== undefined) drawNest(ctx, l, filamentPoint(l, end), 1, own, time);
}

/**
 * The pull: the traced vein green, sliding up into the heart and going as
 * it does, the two tools in, the strike, the spit, and the win said over the
 * field — the owner's *very clear visible the success, and that a new level
 * is going to start*.
 */
export function drawFilamentPulled(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  heart: Heart,
  pull: number,
  own: readonly [boolean, boolean],
  time: number,
): void {
  const tiles = filamentTiles(s);
  if (tiles === null) return;
  const path = filamentRunPath(l, s, 0, tiles.length - 1, filamentPullRise(pull));
  if (path !== null) {
    strokeGlow(ctx, path, rgba(PALETTE.good, 1 - pull), STROKE.outline * 1.5, 1.5 * (1 - pull));
  }
  const root = tiles[tiles.length - 1];
  if (root !== undefined) drawFlight(ctx, l, s, heart, filamentPoint(l, root), pull, own, time);
  drawHit(ctx, l, filamentsLeft(s) - 1, pull);
}

function drawFlight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: FilamentState,
  heart: Heart,
  root: Point,
  pull: number,
  own: readonly [boolean, boolean],
  time: number,
): void {
  const tip = filamentHeartPoint(heart);
  const middle = { x: heart.x, y: heart.y };
  if (pull < IN) {
    const u = (pull / IN) ** 2;
    const at =
      u < 0.75 ? filamentLeadAt(root, tip, u / 0.75) : lerp(tip, middle, (u - 0.75) / 0.25);
    drawNest(ctx, l, at, 1 - (1 - INSIDE) * u, own, time);
    return;
  }
  if (pull < SPAT) {
    drawNest(ctx, l, middle, INSIDE, own, time * 3);
    return;
  }
  const next: FilamentTile | undefined = s.tiles[s.cursor + 1]?.[0];
  if (pull >= REST) {
    if (next !== undefined) drawNest(ctx, l, filamentPoint(l, next), 1, own, time);
    return;
  }
  const v = 1 - (1 - (pull - SPAT) / (REST - SPAT)) ** 2;
  const r = l.tile * GRAB_R * (INSIDE + (1 - INSIDE) * v);
  const bow = Math.sin(Math.PI * v) * SPIT_BOW * l.tile;
  ctx.save();
  if (next === undefined) ctx.globalAlpha = 1 - v;
  for (const seat of [2, 1] as const) {
    const side = seat === 1 ? -1 : 1;
    const to =
      next !== undefined
        ? filamentPoint(l, next)
        : { x: tip.x + side * 5 * l.tile, y: tip.y + 3 * l.tile };
    const at = lerp(middle, to, v);
    const k = seat === 1 ? NEST_RASP : NEST_CORONA;
    drawFilamentToolAt(ctx, seat, at.x + side * bow, at.y, r * k, own[seat - 1] ?? false, time);
  }
  ctx.restore();
}

/** The corona and the rasp together at `at`, `scale` of their resting size. */
function drawNest(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  scale: number,
  own: readonly [boolean, boolean],
  time: number,
): void {
  const r = l.tile * GRAB_R * scale;
  drawFilamentToolAt(ctx, 2, at.x, at.y, r * NEST_CORONA, own[1], time);
  drawFilamentToolAt(ctx, 1, at.x, at.y, r * NEST_RASP, own[0], time);
}

/** `HEART HIT` over the field from the moment the tools strike, and how many veins are left. */
function drawHit(ctx: CanvasRenderingContext2D, l: Layout, left: number, pull: number): void {
  const x = l.gridLeft + (l.cols * l.tile) / 2;
  const y = l.gridTop + l.gridHeight * 0.45;
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0, (pull - IN + 0.05) / 0.1));
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.good;
  ctx.font = `700 ${Math.round(l.tile * 0.7)}px system-ui, sans-serif`;
  ctx.fillText("HEART HIT", x, y);
  ctx.fillStyle = PALETTE.goodRim;
  ctx.font = `600 ${Math.round(l.tile * 0.35)}px system-ui, sans-serif`;
  if (left > 0)
    ctx.fillText(left === 1 ? "1 VEIN LEFT" : `${left} VEINS LEFT`, x, y + l.tile * 0.7);
  ctx.restore();
}

function lerp(a: Point, b: Point, u: number): Point {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}
