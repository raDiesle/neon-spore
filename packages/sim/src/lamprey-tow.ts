import type { SimConfig } from "./config.js";
import { midCol } from "./config.js";
import { type LampreyState, type LampreyStep, lampreyWorker } from "./lamprey.js";
import { lampreyLeapTo, type Tile } from "./lamprey-leap.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **THE LAMPREY's tow** (the owner, 9 October 2026: *the worm approaches from
 * the middle of screen to aim for bottom of ship … player has to pull it away
 * from ship … not straight vertical to pull but in curve … reaching around ⅔
 * of distance, the worm starts to be angry … pushes back current state of
 * pulling to ⅓ and the pulling dot stays there*).
 *
 * The eel crawls to the middle of the field and comes straight down at the
 * hull (`lamprey-roam.ts`), and stops a row or two short of it under THE SLOW
 * (`lampreyTowRow`). The holder pulls the tail out along the body, an
 * `apart`'s pull; the worker pulls the head back along **a curve** that sets
 * off straight up and bends an eighth of a turn to one side, `lampreyTowMilli`
 * long, and the head rides it. **The knob stays where it is let go**, so a
 * pull may be taken in several presses (`towMilli`, `towFrom`).
 *
 * **Two thirds of the way the eel loses its temper**, once a tow: it lunges
 * back at the hull, the head is thrown back to a third
 * (`lampreyTowBackMilli`), and the thumb is thrown off it — it has to lift and
 * take the knob again where it now waits, and pull it all the way.
 *
 * The curve is a table of integers, never `Math.sin` (`purity.test.ts`): eight
 * equal pieces of an arc an eighth of a turn round, a thousand long, scaled
 * to the tow and mirrored to its side.
 */

/** The arc, `[x, y]` thousandths of its length from the head's tile: up the field, bending right. */
const ARC: readonly (readonly [number, number])[] = [
  [0, 0],
  [6, -125],
  [24, -248],
  [55, -370],
  [97, -487],
  [150, -600],
  [215, -707],
  [289, -808],
  [373, -900],
];
const PIECES = ARC.length - 1;

/** A diagonal's share of a straight, in thousandths: the tail lies up and away from the curve. */
const DIAGONAL = 707;

/** The tile a tow stops on: the middle column, nearly on the hull. */
export function lampreyTowTile(cfg: SimConfig): Tile {
  return { col: midCol(cfg), row: cfg.lampreyTowRow };
}

/** The table's point `i`, as thousandths of a tile from the tile's middle, scaled and mirrored. */
function point(cfg: SimConfig, s: LampreyState, i: number): { x: number; y: number } {
  const [x, y] = ARC[Math.max(0, Math.min(PIECES, i))] ?? [0, 0];
  const len = cfg.lampreyTowMilli;
  // `+ 0`: a mirrored nought is -0, and a hash or a test has no use for one.
  return { x: Math.trunc((x * len * s.towSide) / 1000) + 0, y: Math.trunc((y * len) / 1000) };
}

/** The curve's points, thousandths of a tile from the tile's middle: what the channel is drawn along. */
export function lampreyTowPoints(cfg: SimConfig, s: LampreyState): { x: number; y: number }[] {
  return ARC.map((_, i) => point(cfg, s, i));
}

/** The point `milli` along the curve, thousandths of a tile from the tile's middle. */
export function lampreyTowAt(
  cfg: SimConfig,
  s: LampreyState,
  milli: number,
): { x: number; y: number } {
  const len = Math.max(1, cfg.lampreyTowMilli);
  const u = Math.trunc((Math.max(0, Math.min(len, milli)) * PIECES * 1000) / len);
  const i = Math.min(PIECES - 1, Math.trunc(u / 1000));
  const f = u - i * 1000;
  const a = point(cfg, s, i);
  const b = point(cfg, s, i + 1);
  return {
    x: a.x + Math.trunc(((b.x - a.x) * f) / 1000),
    y: a.y + Math.trunc(((b.y - a.y) * f) / 1000),
  };
}

/**
 * How far along the curve the point nearest `(x, y)` is, thousandths of a
 * tile: the nearest piece, and the share of it the point lies over.
 */
export function lampreyTowAlong(cfg: SimConfig, s: LampreyState, x: number, y: number): number {
  let best = 0;
  let near = Number.POSITIVE_INFINITY;
  for (let i = 0; i < PIECES; i++) {
    const a = point(cfg, s, i);
    const b = point(cfg, s, i + 1);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const den = Math.max(1, dx * dx + dy * dy);
    const dot = (x - a.x) * dx + (y - a.y) * dy;
    const f = Math.max(0, Math.min(1000, Math.trunc((dot * 1000) / den)));
    const px = a.x + Math.trunc((dx * f) / 1000) - x;
    const py = a.y + Math.trunc((dy * f) / 1000) - y;
    const d = px * px + py * py;
    if (d < near) {
      near = d;
      best = i * 1000 + f;
    }
  }
  return Math.trunc((best * cfg.lampreyTowMilli) / (PIECES * 1000));
}

/** The tile under the curve's far end: where the head is when the tow lets go of the hull. */
export function lampreyTowEnd(world: World, s: LampreyState): Tile {
  const end = lampreyTowAt(world.cfg, s, world.cfg.lampreyTowMilli);
  const cfg = world.cfg;
  const col = s.col + Math.round(end.x / 1000);
  const row = s.row + Math.round(end.y / 1000);
  return {
    col: Math.max(cfg.lampreyEdgeCols, Math.min(cfg.cols - 1 - cfg.lampreyEdgeCols, col)),
    row: Math.max(cfg.lampreyRowTop, row),
  };
}

/**
 * Down on the tow's tile: the curve's side drawn from the seeded `Rng`, the
 * tail laid up and away from it, and the next tile drawn from the curve's
 * end, where the head will be when it lets go.
 */
export function lampreyTowLand(
  world: World,
  s: LampreyState,
  after: LampreyStep | undefined,
): void {
  s.towSide = nextInt(world.rng, 2) === 0 ? -1 : 1;
  s.tailX = -s.towSide * DIAGONAL;
  s.tailY = -DIAGONAL;
  const next =
    after === undefined ? null : lampreyLeapTo(world, s, lampreyTowEnd(world, s), after.jump, -1);
  s.nextCol = next?.col ?? -1;
  s.nextRow = next?.row ?? -1;
}

/**
 * The worker's thumb on the head in a tow, `fromMilli` across and
 * `fromYMilli` down from where it took hold: the head carried to the point of
 * the curve nearest the thumb, and the lunge at two thirds, once.
 */
export function lampreyTowHeard(
  world: World,
  s: LampreyState,
  side: 0 | 1,
  on: boolean,
  fromMilli: number,
  fromYMilli: number,
): void {
  if (lampreyWorker(s) !== side + 1) return;
  if (!on) {
    s.towFrom = -1;
    s.slipped[side] = false;
    return;
  }
  if (s.slipped[side]) return;
  if (s.towFrom < 0) s.towFrom = s.towMilli;
  const cfg = world.cfg;
  const from = lampreyTowAt(cfg, s, s.towFrom);
  // A thumb where it took hold leaves the knob where it was, not a rounding off it.
  const still = fromMilli === 0 && fromYMilli === 0;
  s.towMilli = still ? s.towFrom : lampreyTowAlong(cfg, s, from.x + fromMilli, from.y + fromYMilli);
  if (s.angered || s.towMilli < cfg.lampreyTowAngerMilli) return;
  s.angered = true;
  s.towMilli = cfg.lampreyTowBackMilli;
  s.towFrom = -1;
  s.slipped[side] = true;
  world.events.push({ type: "lampreyAnger", side, col: s.col });
}
