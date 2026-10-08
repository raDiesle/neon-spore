import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TrapezeAsk,
  type TrapezeState,
  ticksPerBeat,
  trapezeBoss,
  trapezePeriod,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE TRAPEZE set rather than played to, for the render tests: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
/** A quarter of a whole swing, in ticks. */
export const Q = trapezePeriod(CFG) / 4;
/** Ticks into the swing where it comes back over the left zone, and over the right. */
export const BACK_LEFT = 2 * Q + Q / 2;
export const BACK_RIGHT = Q / 2;

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trapeze");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * A level asking `ask` lit a beat in — or a rest, for `null` — the swing at
 * `swingTick` and 8° high, nothing pushed, locked or held unless `arrange`
 * says so.
 */
export function posed(
  world: World,
  ask: TrapezeAsk | null,
  swingTick = 0,
  arrange: (s: TrapezeState) => void = () => {},
): TrapezeState {
  const s = trapezeBoss(world);
  if (s === null) throw new Error("the trapeze wave stood no trapeze");
  s.phase = ask === null ? "rest" : "level";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.ampMilli = 8000;
  s.swingTick = swingTick;
  s.half = 3;
  s.pushedHalf = -1;
  s.callers = [0, 1];
  s.down = [0, 0];
  s.lockBeats = 0;
  s.gongs = 0;
  s.steps[0] = { ask: ask ?? "push", gongSide: 1, gongMilli: 10000, beats: 40 };
  arrange(s);
  return s;
}

/** The field a seat's screen hands a touch, off `world`. */
export function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/**
 * The frames of a pose, joined, the world held where it was posed, with
 * `thrown` pushed onto the first tick's events.
 */
export function frame(role: ViewRole, arrange: (world: World) => void, thrown?: SimEvent): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
