import { type ControlSet, controlSet } from "@neon-spore/content";
import {
  type AntiphonState,
  antiphonBoss,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import type { Field, touchDown } from "../src/touch.js";

/**
 * The world, the field and the reading a touch's own `hold` gives back, that
 * both `antiphon-touch.test.ts` (the organ, his) and
 * `antiphon-rail-touch.test.ts` (the rail, hers) build their presses against.
 */

export const CFG = DEFAULT_CONFIG;
export const STANDARD: ControlSet = controlSet("default");
const WAVE = 9;

export const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The body up with one organ standing — set, not grown to (`antiphon-frame.test.ts`). */
export function hung(organs = 1): World {
  const world = createWorld(CFG, 5);
  startWave(world, WAVE, [], [], { kind: "antiphon" });
  const s = organ(world);
  s.organs = [];
  for (let i = 0; i < organs; i++) {
    s.organs.push({ shape: i + 1, col: 2 + i * 3, color: "red", grownBeat: world.beat });
  }
  return world;
}

export function organ(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("the antiphon wave hung no body");
  return s;
}

export function field(
  world: World,
  seat: 1 | 2,
  antiphon: AntiphonState | null = organ(world),
): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: antiphon,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

export function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}
