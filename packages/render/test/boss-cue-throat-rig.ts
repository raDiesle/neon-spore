import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Creature,
  createWorld,
  NO_SHELL,
  startWave,
  step,
  type ThroatState,
  throatBoss,
  throatMouthCol,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { type BossCue, bossCue } from "../src/boss-cue.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { CFG, VIEWPORT, waveWith } from "./frame-harness.js";

/**
 * THE THROAT's fight stood up for its cue tests, and the two questions they
 * ask a seat: which word, and which whole cue. Shared by
 * `boss-cue-throat.test.ts` (the gum, and a body in the mouth) and
 * `boss-cue-throat-rock.test.ts` (a rock in the mouth, and one climbing), cut
 * in two on 26 September 2026 when the one file was 345 lines.
 */

const TPB = ticksPerBeat(CFG);
export const LAYOUT: Record<ViewRole, Layout> = {
  p1: computeLayout(VIEWPORT, CFG, "p1"),
  p2: computeLayout(VIEWPORT, CFG, "p2"),
  test: computeLayout(VIEWPORT, CFG, "test"),
};

const HULL = (l: Layout) => () => l.hullY;

export function opened(): { world: World; t: ThroatState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const t = throatBoss(world);
  if (t === null) throw new Error("the throat's wave installed no boss");
  return { world, t };
}

/** Which column the mouth is under this beat — the only column that holds. */
export function mouthCol(world: World, t: ThroatState): number {
  return throatMouthCol(CFG, t, world.beat);
}

/** A column the mouth is not under, for the half of a pair that misses. */
export function elsewhere(world: World, t: ThroatState): number {
  return mouthCol(world, t) === 0 ? 1 : 0;
}

/** A body put on the field where the test wants it, and handed back. */
export function put(world: World, kind: Creature["kind"], col: number, row: number): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    color: null,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature;
  world.creatures.push(c);
  return c;
}

/** The word this seat is given, or nothing. */
export function word(world: World, role: ViewRole): string | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l))?.word ?? null;
}

/** The whole cue this seat is given. */
export function cue(world: World, role: ViewRole): BossCue | null {
  const l = LAYOUT[role];
  return bossCue(l, world, 0, HULL(l));
}
