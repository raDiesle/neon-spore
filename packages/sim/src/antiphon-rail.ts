import {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonFamilyOf,
  antiphonFull,
  antiphonRailSize,
  antiphonTight,
  antiphonTwins,
} from "./antiphon.js";
import { nextInt } from "./rng.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **What grows and what she is shown beside it** — one cycle's organs and
 * the rail they are hidden on, drawn by the seed.
 *
 * Its own file beside `antiphon-step.ts` so the clock reads as a clock: this
 * is the one part of THE ANTIPHON that chooses, and every choice in it goes
 * through `nextInt` in one order, so two phones grow the same organ in the
 * same column with the same decoys beside it. The order is fixed here and
 * nowhere else: shapes, then columns, then colours, then the rail's own
 * shuffle.
 *
 * **A decoy is never the organ by another road.** Columns are distinct
 * across the whole rail, so a column names one candidate; shapes are
 * distinct across the rail too, so the contour he describes is on it once.
 * Colours are free, because a decoy in the organ's colour is what makes the
 * column matter, and one in the other colour is what makes the colour
 * matter.
 */

/** `n` of `pool`, drawn without replacement in the seed's order. */
function draw(world: World, pool: number[], n: number): number[] {
  const out: number[] = [];
  const rest = pool.slice();
  while (out.length < n && rest.length > 0) {
    const i = nextInt(world.rng, rest.length);
    out.push(rest[i] ?? 0);
    rest.splice(i, 1);
  }
  return out;
}

/** Every shape index not yet a pit and not in `taken`. */
function fresh(world: World, s: AntiphonState, taken: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < world.cfg.antiphonShapes; i++) {
    if (!s.pits.includes(i) && !taken.includes(i)) out.push(i);
  }
  return out;
}

/** The organs' shapes: fresh ones, or from `antiphonEchoPits` a pit's own for the first. */
function organShapes(world: World, s: AntiphonState, count: number): number[] {
  const cfg = world.cfg;
  const shapes: number[] = [];
  if (s.pits.length >= cfg.antiphonEchoPits && s.pits.length > 0) {
    shapes.push(...draw(world, s.pits, 1));
  }
  const pool = fresh(world, s, shapes);
  // The table run dry — every contour a pit — is a fight longer than any
  // the numbers allow, but a pit grown again is a cycle, and an empty rail
  // is a hang.
  shapes.push(...draw(world, pool.length > 0 ? pool : s.pits, count - shapes.length));
  return shapes;
}

/** The decoys' shapes: the organs' own families first once the rail is tight, then anything fresh, then the pits. */
function decoyShapes(world: World, s: AntiphonState, organs: number[], n: number): number[] {
  const cfg = world.cfg;
  const out: number[] = [];
  const taken = () => [...organs, ...out];
  if (antiphonTight(s, cfg)) {
    const families = organs.map((o) => antiphonFamilyOf(cfg, o));
    const kin = fresh(world, s, taken()).filter((i) => families.includes(antiphonFamilyOf(cfg, i)));
    out.push(...draw(world, kin, n));
  }
  if (out.length < n) out.push(...draw(world, fresh(world, s, taken()), n - out.length));
  if (out.length < n) {
    const pits = s.pits.filter((i) => !taken().includes(i));
    out.push(...draw(world, pits, n - out.length));
  }
  return out;
}

/** Distinct columns for the whole rail, and a colour each. */
function places(world: World, n: number): { col: number; color: Color }[] {
  const cols: number[] = [];
  for (let c = 0; c < world.cfg.cols; c++) cols.push(c);
  const drawn = draw(world, cols, n);
  return drawn.map((col) => ({ col, color: nextInt(world.rng, 2) === 0 ? "red" : "cyan" }));
}

/** The candidates in the seed's order, so the organ is not the first on the rail every time. */
function shuffled(world: World, rail: AntiphonCandidate[]): AntiphonCandidate[] {
  const out = rail.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = nextInt(world.rng, i + 1);
    const a = out[i];
    const b = out[j];
    if (a !== undefined && b !== undefined) {
      out[i] = b;
      out[j] = a;
    }
  }
  return out;
}

/**
 * Grow this cycle's organs and lay the rail: one organ, two from
 * `antiphonTwinPits`, or the ship once the pits are all there. Writes
 * `organs` and `rail` on the state and returns the organs, for the clock
 * to announce.
 */
export function growCycle(world: World, s: AntiphonState): AntiphonOrgan[] {
  const cfg = world.cfg;
  const ship = antiphonFull(s, cfg);
  const count = ship ? 1 : antiphonTwins(s, cfg) ? 2 : 1;
  const size = antiphonRailSize(s, cfg, count);
  const organShapeList = ship ? [ANTIPHON_SHIP] : organShapes(world, s, count);
  const decoys = ship
    ? new Array<number>(size - 1).fill(ANTIPHON_SHIP)
    : decoyShapes(world, s, organShapeList, size - count);
  const shapes = [...organShapeList, ...decoys];
  const at = places(world, shapes.length);
  const rail: AntiphonCandidate[] = shapes.map((shape, i) => ({
    shape,
    col: at[i]?.col ?? 0,
    color: at[i]?.color ?? "red",
  }));
  const organs: AntiphonOrgan[] = rail
    .slice(0, count)
    .map((c) => ({ ...c, grownBeat: world.beat }));
  s.organs = organs;
  s.rail = shuffled(world, rail);
  return organs;
}
