import {
  ANTIPHON_SHIP,
  type AntiphonCandidate,
  type AntiphonOrgan,
  type AntiphonState,
  antiphonFamilyOf,
  antiphonFull,
  antiphonRailSize,
  antiphonTight,
} from "./antiphon.js";
import { antiphonSlotCol } from "./antiphon-vein.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **What grows and what the chooser is shown beside it** — one level's
 * organ and the rail it is hidden on, drawn by the seed.
 *
 * Its own file beside `antiphon-step.ts` so the clock reads as a clock: this
 * is the one part of THE ANTIPHON that chooses, and every choice in it goes
 * through `nextInt` in one order, so two phones grow the same organ with the
 * same decoys beside it in the same places. The order is fixed here and
 * nowhere else: the organ's shape, the decoys', then the rail's own shuffle.
 *
 * **A decoy is never the organ by another road.** Shapes are distinct across
 * the rail, so the contour being described is on it once — except the
 * ship's rail, which is three ships told apart only by how they are drawn.
 * Where a candidate hangs is its place on the rail (`antiphonSlotCol`), so
 * the shuffle is what puts the organ somewhere new each level.
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

/** The organ's shape: a fresh one, or from `antiphonEchoPits` a pit's own. */
function organShape(world: World, s: AntiphonState): number {
  if (s.pits.length >= world.cfg.antiphonEchoPits && s.pits.length > 0) {
    return draw(world, s.pits, 1)[0] ?? 0;
  }
  const pool = fresh(world, s, []);
  // The table run dry — every contour a pit — is a fight longer than any the
  // numbers allow, but a pit grown again is a level, and an empty rail a hang.
  return draw(world, pool.length > 0 ? pool : s.pits, 1)[0] ?? 0;
}

/** The decoys' shapes: the organ's own family first once the rail is tight, then anything fresh, then the pits. */
function decoyShapes(world: World, s: AntiphonState, organ: number, n: number): number[] {
  const cfg = world.cfg;
  const out: number[] = [];
  const taken = () => [organ, ...out];
  if (antiphonTight(s, cfg)) {
    const family = antiphonFamilyOf(cfg, organ);
    const kin = fresh(world, s, taken()).filter((i) => antiphonFamilyOf(cfg, i) === family);
    out.push(...draw(world, kin, n));
  }
  if (out.length < n) out.push(...draw(world, fresh(world, s, taken()), n - out.length));
  if (out.length < n) {
    const pits = s.pits.filter((i) => !taken().includes(i));
    out.push(...draw(world, pits, n - out.length));
  }
  return out;
}

/** The shapes in the seed's order, the organ's place among them returned with them. */
function shuffled(world: World, shapes: number[]): { order: number[]; answer: number } {
  const idx = shapes.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = nextInt(world.rng, i + 1);
    const a = idx[i] ?? 0;
    idx[i] = idx[j] ?? 0;
    idx[j] = a;
  }
  return { order: idx.map((i) => shapes[i] ?? 0), answer: idx.indexOf(0) };
}

/**
 * Grow this level's organ and lay the rail: a contour, or the ship once the
 * pits are all there. Writes `organ`, `rail` and `answer` on the state and
 * returns the organ, for the clock to announce.
 */
export function growCycle(world: World, s: AntiphonState): AntiphonOrgan {
  const cfg = world.cfg;
  const ship = antiphonFull(s, cfg);
  const size = antiphonRailSize(s, cfg);
  const organ = ship ? ANTIPHON_SHIP : organShape(world, s);
  const decoys = ship
    ? new Array<number>(size - 1).fill(ANTIPHON_SHIP)
    : decoyShapes(world, s, organ, size - 1);
  const { order, answer } = shuffled(world, [organ, ...decoys]);
  const rail: AntiphonCandidate[] = order.map((shape, i) => ({
    shape,
    col: antiphonSlotCol(cfg, order.length, i),
  }));
  s.organ = { shape: organ, grownBeat: world.beat };
  s.rail = rail;
  s.answer = answer;
  return s.organ;
}
