import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { darkBeats, darkInWave, darkOn, litNow } from "../src/dark.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { hashWorld } from "../src/hash.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE DARK: a finger's light is world state, shared by both seats, and it
 * goes out on its own (`sim/dark.ts`). Nothing here reaches a rule, so the
 * cases are about the list of lit squares and nothing else.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });

function darkWorld(dark: boolean, at = 0, beats = 0): World {
  const world = createWorld({ ...CFG }, 4);
  startWave(world, 0, [slick(1)], [], null, false, 0, dark ? [{ kind: "dark", at, beats }] : []);
  return world;
}

const light = (tick: number, col: number, row: number, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "light", col, row },
});

function play(world: World, ticks: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

describe("when the dark is down", () => {
  it("is down from the pencil's beat, and a fact about the wave before it", () => {
    const before = play(darkWorld(true, 4, 4), TPB * 2);
    expect(darkOn(before)).toBe(false);
    expect(darkBeats(before)).toBe(-1);
    expect(darkInWave(before)).toBe(true);
    const during = play(darkWorld(true, 4, 4), TPB * 6);
    expect(darkOn(during)).toBe(true);
    // Counted up from the beat it fell, for the picture's fade.
    const fell = darkBeats(during);
    expect(fell).toBeGreaterThanOrEqual(0);
    expect(darkBeats(play(during, TPB))).toBe(fell + 1);
    expect(darkOn(play(darkWorld(true, 4, 4), TPB * 9))).toBe(false);
    expect(darkInWave(darkWorld(false))).toBe(false);
  });

  it("swallows no press: every button still works", () => {
    const world = play(darkWorld(true), TPB);
    const commands: Command[] = [
      { kind: "fire", color: "red" },
      { kind: "fire", color: "cyan" },
      { kind: "cannonCol", col: 3 },
      { kind: "shieldCol", col: 3 },
    ];
    for (const c of commands) expect(faultSwallows(world, c)).toBe(false);
  });
});

describe("a finger's light", () => {
  it("lights the square from either seat, for darkLitBeats", () => {
    const world = play(darkWorld(true), 20, [light(10, 3, 5, 1), light(12, 7, 2, 2)]);
    expect(litNow(world).map((t) => [t.col, t.row])).toEqual([
      [3, 5],
      [7, 2],
    ]);
    expect(litNow(world)[0]?.untilTick).toBe(10 + CFG.darkLitBeats * TPB);
    play(world, CFG.darkLitBeats * TPB);
    expect(litNow(world)).toEqual([]);
  });

  it("lights a square again rather than twice", () => {
    const world = play(darkWorld(true), 40, [light(10, 3, 5), light(30, 3, 5)]);
    expect(world.lit).toHaveLength(1);
    expect(world.lit[0]?.untilTick).toBe(30 + CFG.darkLitBeats * TPB);
  });

  it("is refused while the dark is up, and off the field", () => {
    expect(play(darkWorld(false), 20, [light(10, 3, 5)]).lit).toEqual([]);
    const off = play(darkWorld(true), 20, [
      light(10, -1, 5),
      light(11, CFG.cols, 5),
      light(12, 3, CFG.rows),
    ]);
    expect(off.lit).toEqual([]);
  });

  it("is hashed, so two phones that disagree about it are told", () => {
    const lit = play(darkWorld(true), 20, [light(10, 3, 5)]);
    const unlit = play(darkWorld(true), 20);
    expect(hashWorld(lit)).not.toBe(hashWorld(unlit));
  });

  it("changes nothing the wave does", () => {
    const fire: TimedCommand = {
      tick: TPB * 2,
      player: 2,
      command: { kind: "fire", color: "red" },
    };
    const aim: TimedCommand = { tick: 5, player: 1, command: { kind: "cannonCol", col: 1 } };
    const lit = play(darkWorld(true), TPB * 6, [aim, fire, light(20, 1, 3)]);
    const unlit = play(darkWorld(true), TPB * 6, [aim, fire]);
    lit.lit = [];
    expect(hashWorld(lit)).toBe(hashWorld(unlit));
  });
});
