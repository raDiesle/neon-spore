import { gaugeRoundHeard } from "../src/gauge-round.js";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  GAUGE_FULL,
  type GaugeState,
  gaugeHolds,
  gaugeRound,
  gaugeSeated,
  gaugeTongueAsks,
  gaugeToothAsks,
  roundSpent,
  type SimConfig,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { landNow } from "./gauge-land.js";

/**
 * THE GAUGE's rig: a round opened on a wave, and a pair who talk it through.
 *
 * Split out of `gauge.test.ts` when the tongue's lane took that file past its
 * line ceiling. `talking` is the one driver every rest the round asks for is
 * answered by, and both halves of the old file run it — the round reached and
 * played in `gauge.test.ts`, the round left and fingerprinted in
 * `gauge-leave.test.ts`. The thumbs' helpers after `runToEnd` serve the two
 * states and their hands, in `gauge-bind.test.ts`.
 */

/**
 * No `PAIR_ON`. The round needed the pair's switch when it was a category
 * reached between waves; a boss wave needs nothing turned on, which is most of
 * what this change bought and is worth saying in the rig rather than only in a
 * comment.
 */
export const CFG: SimConfig = DEFAULT_CONFIG;
export const TPB = ticksPerBeat(CFG);
/** The wave THE GAUGE is installed on. Any number: it is a wave like any other. */
export const WAVE = 4;

export type Bot = (world: World) => TimedCommand[];
export const SILENT: Bot = () => [];

export function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "gauge" });
  return world;
}

export function round(world: World): GaugeState {
  const g = gaugeRound(world);
  if (g === null) throw new Error("no round running");
  return g;
}

export function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/**
 * A pair who are talking: the pilot turns towards the band he cannot see and
 * the navigator calls the moment the needle is between her marks. It reads the
 * whole world because a test rig may — what it stands in for is two people and
 * a sentence. Between the first two levels he counts the loose tooth out and
 * she pulls it (`src/gauge-tooth.ts`).
 */
export function talking(world: World): TimedCommand[] {
  const gauge = gaugeRound(world);
  if (gauge === null || gauge.phase !== "play") return [];
  const out: TimedCommand[] = [];
  if (gaugeToothAsks(gauge)) {
    const pull = { kind: "drag", target: "gaugeTooth", on: true, id: gauge.looseTooth } as const;
    out.push(cmd(world, 2, { ...pull, fromMilli: 0, fromYMilli: 2000 }));
  }
  if (gaugeTongueAsks(gauge)) {
    const wring = { kind: "drag", target: "gaugeTongue", on: true, id: 0, fromYMilli: 0 } as const;
    out.push(
      cmd(world, 1, { ...wring, fromMilli: 2000 }),
      cmd(world, 2, { ...wring, fromMilli: -2000 }),
    );
  }
  const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
  if (gauge.valve !== want) out.push(cmd(world, 1, { kind: "valve", on: true, dir: want }));
  if (gaugeSeated(world, gauge)) out.push(cmd(world, 2, { kind: "call", color: gauge.woundColor }));
  return out;
}

export function run(world: World, ticks: number, bot: Bot = SILENT): SimEvent[] {
  const seen: SimEvent[] = [];
  for (let i = 0; i < ticks; i++) {
    step(world, bot(world));
    seen.push(...world.events);
  }
  return seen;
}

/**
 * Tick until the round is over, and hand back the round itself.
 *
 * "Over" is `spent` and not gone: a round that has run its course stays
 * installed so the field does not come back for the beats of rest before the
 * next wave (`sim/wave-end.ts`), and the state object is still the world's.
 */
export function runToEnd(
  world: World,
  cap: number,
  bot: Bot = SILENT,
): { events: SimEvent[]; result: GaugeState } {
  const events: SimEvent[] = [];
  const result = round(world);
  for (let i = 0; i < cap && gaugeHolds(world) && !roundSpent(world); i++) {
    step(world, bot(world));
    events.push(...world.events);
  }
  return { events, result };
}

/** The round, already past its lead-in and taking commands. */
export function playing(seed = 5): { world: World; g: GaugeState } {
  const world = open(seed);
  const g = gaugeRound(world);
  if (g === null) throw new Error("the gauge's wave installed no gauge");
  let guard = 0;
  while (g.phase !== "play" && guard++ < 40 * TPB) step(world, []);
  if (g.phase !== "play") throw new Error("the round never reached its play");
  return { world, g };
}

/** Her call, in the wound's colour: the colour is `gauge-call.ts`'s to test. */
export function call(world: World): Command {
  return { kind: "call", color: gaugeRound(world)?.woundColor ?? "red" };
}

/** A command the round hears straight away, its bolt landed at once. */
export function heard(world: World, player: 1 | 2, command: Command): void {
  gaugeRoundHeard(world, player, command);
  const g = gaugeRound(world);
  if (g !== null) landNow(world, g);
}

export function band(on: boolean): Command {
  return { kind: "drag", target: "gaugeBand", on, fromMilli: 0 };
}

/** A call that is allowed to land: the rest between calls already spent. */
export function callable(world: World, g: GaugeState): void {
  g.calledBeat = world.beat - CFG.gaugeCallRestBeats;
}

/** A call that will miss: the needle as far from the band as the dial allows. */
export function offBand(g: GaugeState): void {
  g.needleMilli = g.markMilli > GAUGE_FULL / 2 ? 0 : GAUGE_FULL;
}
