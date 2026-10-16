import { type Color, type GeodeState, midCol, ticksPerBeat, type World } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { fieldX } from "./field-flip.js";
import { type At, GEODE_TALL, geodeCentre, geodeReach } from "./geode-shape.js";
import type { Layout } from "./layout.js";

/**
 * **Where THE GEODE's pieces stand on a frame**: how far the stone has sunk,
 * and how a level's cracks cut it into pieces across the field.
 *
 * A level's pieces **share the field's whole width between them**, one per
 * crack column, the seam between two halfway from one crack to the next — so
 * every column the simulation chips a bolt in is stone on the picture too.
 * Two cracks down one column are two pieces stacked in it, one over the
 * other. The **heart**, the script's last level, is the exception: its pieces
 * are crystal, narrow in their column, with the opened rind either side.
 */

/** Tiles the stone sinks over a level's whole window: the clock, read off the body. */
const SINK_TILES = 1;
/** How far either side of its column a heart piece reaches, in tiles. */
const HEART_TILES = 1.4;
/** How much shorter each level is than the one it came out of. */
const LEVEL_SHRINK = 0.08;

/** A level's piece, laid out on the screen before it is posed. */
export interface PieceBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  /** Where its crack runs down, on the screen. */
  crackX: number;
  color: Color;
  /** Beats since it was cut, or -1 while it is whole. */
  cut: number;
  heart: boolean;
  seed: number;
}

/** A piece of rind either side of the heart: stone with nothing in it to cut. */
export interface HuskBox {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  seed: number;
}

/** The stone as it hangs this frame: its centre, its size, and how far its sinking has got. */
export interface GeodePose {
  c: At;
  reach: number;
  /** Half the height of the level drawn. */
  half: number;
  /** 0..1 of the lit level's window gone: the tremble as it runs out. */
  late: number;
  /** 0..1 of the way in: it looms up out of the dark where it hangs, never above it. */
  come: number;
}

/** Beats since the phase began, with the beat's own fraction. */
export function geodeSince(s: GeodeState, beat: number, beatPhase: number): number {
  return beat - s.phaseBeat + beatPhase;
}

/** Whether `level` is the heart: the script's last, when there is more than one. */
export function geodeIsHeart(s: GeodeState, level: number): boolean {
  return s.steps.length > 1 && level === s.steps.length - 1;
}

/** Half the height of level `level`'s stone. */
function halfOf(l: Layout, level: number): number {
  return geodeReach(l) * GEODE_TALL * (1 - LEVEL_SHRINK * level);
}

/**
 * Where the stone hangs: looming in where it will hang — grown and faded in
 * rather than dropped from above the frame, where the seat switcher stands
 * (`render/test/boss-top.test.ts`) — sinking on the window, landed on the hull.
 */
export function geodePose(
  l: Layout,
  world: World,
  s: GeodeState,
  level: number,
  beat: number,
  beatPhase: number,
): GeodePose {
  const c0 = geodeCentre(l, world.cfg);
  const half = halfOf(l, level);
  const since = geodeSince(s, beat, beatPhase);
  const step = s.steps[s.cursor];
  let dy = 0;
  let late = 0;
  const come = s.phase === "enter" ? smoothstep(since / world.cfg.geodeEnterBeats) : 1;
  if (s.phase === "crack" && step !== undefined) {
    late = Math.min(1, since / step.beats);
    dy = late * SINK_TILES * l.tile;
  } else if (s.phase === "struck") {
    // From where the window left it to the hull, falling faster as it goes.
    const k = Math.min(1, since * 1.5);
    const from = SINK_TILES * l.tile;
    dy = from + k * k * (l.hullY - (c0.y + half) - from);
  }
  return { c: { x: c0.x, y: c0.y + dy }, reach: geodeReach(l), half, late, come };
}

/** Beats since tick `tick`, or -1 for one never cut. */
function beatsSince(world: World, tick: number): number {
  return tick < 0 ? -1 : (world.tick - tick) / ticksPerBeat(world.cfg);
}

/** Level `level`'s pieces, cut as `cutTick` says, laid over the pose. */
export function geodePieces(
  l: Layout,
  world: World,
  s: GeodeState,
  level: number,
  p: GeodePose,
  cutTick: readonly number[],
): PieceBox[] {
  const step = s.steps[level];
  if (step === undefined) return [];
  const mid = midCol(world.cfg);
  const heart = geodeIsHeart(s, level);
  const xs = step.cracks.map((c) => fieldX(l, mid + c.at));
  const cols = [...new Set(xs)].sort((a, b) => a - b);
  const left = p.c.x - p.reach;
  const right = p.c.x + p.reach;
  const top = p.c.y - p.half;
  const tall = p.half * 2;
  return step.cracks.map((c, i) => {
    const x = xs[i] as number;
    const j = cols.indexOf(x);
    let x0 = j === 0 ? left : ((cols[j - 1] as number) + x) / 2;
    let x1 = j === cols.length - 1 ? right : ((cols[j + 1] as number) + x) / 2;
    if (heart) {
      x0 = Math.max(x0, x - HEART_TILES * l.tile);
      x1 = Math.min(x1, x + HEART_TILES * l.tile);
    }
    // Stacked in one column, in the level's own order from the top down.
    const stack = xs.filter((o) => o === x).length;
    const row = xs.slice(0, i).filter((o) => o === x).length;
    const y0 = top + (tall * row) / stack;
    const y1 = top + (tall * (row + 1)) / stack;
    const cut = beatsSince(world, cutTick[i] ?? -1);
    return { x0, x1, y0, y1, crackX: x, color: c.color, cut, heart, seed: level * 7 + i * 3 + 1 };
  });
}

/** The rind left and right of the heart's pieces, where there is any. */
export function geodeHusks(pieces: readonly PieceBox[], p: GeodePose, tile: number): HuskBox[] {
  if (pieces.length === 0 || !pieces[0]?.heart) return [];
  const lo = Math.min(...pieces.map((q) => q.x0));
  const hi = Math.max(...pieces.map((q) => q.x1));
  const y0 = p.c.y - p.half;
  const y1 = p.c.y + p.half;
  const out: HuskBox[] = [];
  if (lo - (p.c.x - p.reach) > tile * 0.4)
    out.push({ x0: p.c.x - p.reach, x1: lo, y0, y1, seed: 91 });
  if (p.c.x + p.reach - hi > tile * 0.4)
    out.push({ x0: hi, x1: p.c.x + p.reach, y0, y1, seed: 97 });
  return out;
}
