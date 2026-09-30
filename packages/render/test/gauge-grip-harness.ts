import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GaugeState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { gaugeBandGrip, gaugeNeedleGrip } from "../src/gauge-grip.js";
import { gaugeDial } from "../src/gauge-round.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE GAUGE's round in play, a touch field around it, and where its two rings
 * stand — shared by `gauge-grip.test.ts` and `gauge-bind-grip.test.ts`, cut in
 * two when THE GAUGE's loose tooth took the first to 261 lines.
 */
export const layout = (role: ViewRole) =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The round installed and stepped once, so its state is the world's own. */
export function round(): { world: World; g: GaugeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("gauge");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  step(world, []);
  const g = world.boss;
  if (g === null || g.kind !== "gauge") throw new Error("the gauge's wave installed no gauge");
  g.phase = "play";
  return { world, g };
}

/** The same round with the fields this case is about moved. */
export function playing(overrides: Partial<GaugeState> = {}): GaugeState {
  const { g } = round();
  return Object.assign(g, overrides);
}

export function fieldWith(seat: 1 | 2, boss: GaugeState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

export const needleAt = (l: Layout, g: GaugeState) =>
  gaugeNeedleGrip(l, DEFAULT_CONFIG, gaugeDial(l), g);
export const bandAt = (l: Layout, g: GaugeState) =>
  gaugeBandGrip(l, DEFAULT_CONFIG, gaugeDial(l), g);
