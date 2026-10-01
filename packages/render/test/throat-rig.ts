import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
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
import type { Field, touchDown } from "../src/touch.js";
import { CFG, VIEWPORT, waveWith } from "./frame-harness.js";

/**
 * THE THROAT's fight stood up for every render test of it: the gullet as its
 * wave installs it, a body put where a test wants one, the field a press is
 * read against, and the two questions a cue test asks a seat — which word, and
 * which whole cue.
 */

const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

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

/** Which column the mouth stands over. */
export function mouthCol(t: ThroatState): number {
  return throatMouthCol(t);
}

/** A body put on the field where the test wants it, and handed back. */
export function put(
  world: World,
  kind: Creature["kind"],
  col: number,
  row: number,
  color: Creature["color"] = null,
): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    color,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: NO_SHELL,
  } as Creature;
  world.creatures.push(c);
  return c;
}

/** The field a press from this seat is read against. */
export function field(world: World, seat: 1 | 2, boss = world.boss): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

/** The handle a press took hold of, or nothing. */
export function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
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
