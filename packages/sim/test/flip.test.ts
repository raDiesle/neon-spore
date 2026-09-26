import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { flipInWave, flipSeat } from "../src/flip.js";
import { hashWorld } from "../src/hash.js";
import type { Command, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE FLIP, and the thing about it that is new to this simulation: a fault
 * that **changes nothing at all**.
 *
 * THE CODEX takes nothing away and still changes what a press means. This one
 * does not even do that. Every command does exactly what it did, every body
 * falls where it fell, and the only thing the simulation carries is *whose
 * screen is turned* — a number that reaches no rule and is hashed anyway,
 * because two phones disagreeing about which of them is the mirror is two
 * people playing different games (`hash-faults.ts`).
 *
 * So the cases below are mostly the same case twice: with the pencil and
 * without, and the two runs are the same run.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });
const bulb = (col: number): SpawnEntry => ({ beat: 2, col, kind: "bulb", color: "cyan" });

const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

function flipWorld(seat: 1 | 2 | null, at = 0, beats = 0): World {
  const world = createWorld({ ...CFG }, 4);
  startWave(
    world,
    0,
    [slick(1), bulb(5)],
    [],
    null,
    false,
    0,
    seat === null ? [] : [{ kind: "flip", seat, at, beats }],
  );
  return world;
}

function play(world: World, ticks: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

/** The hash of a world with its pencils rubbed out — everything the wave has
 * *done*, with the one field the two runs are meant to differ in taken off. */
function playedHash(world: World): number {
  world.faults = [];
  return hashWorld(world);
}

describe("whose screen is turned", () => {
  it("is the seat the wave named, and nobody's on a wave without one", () => {
    expect(flipSeat(play(flipWorld(1), TPB * 2))).toBe(1);
    expect(flipSeat(play(flipWorld(2), TPB * 2))).toBe(2);
    expect(flipSeat(play(flipWorld(null), TPB * 2))).toBe(null);
  });

  it("is nobody's until the pencil's own beat, and nobody's after it", () => {
    // The wave ships with `at: 6`: two bodies come down an honest field, and
    // the turn is a thing the pair watch happen (`content/waves/act-10.ts`).
    const before = play(flipWorld(1, 6, 4), TPB * 3);
    expect(flipSeat(before)).toBe(null);
    const during = play(flipWorld(1, 6, 4), TPB * 8);
    expect(flipSeat(during)).toBe(1);
    const after = play(flipWorld(1, 6, 4), TPB * 13);
    expect(flipSeat(after)).toBe(null);
  });

  it("is a fact about the wave too, for a page that is drawn before a beat", () => {
    expect(flipInWave(flipWorld(1, 6, 4))).toBe(true);
    expect(flipInWave(flipWorld(null))).toBe(false);
    // Before its own beat and still true: a guide and a palette ask what the
    // wave holds, not what is in force this instant.
    expect(flipInWave(play(flipWorld(1, 6, 4), TPB))).toBe(true);
  });
});

describe("what it does to the play", () => {
  it("swallows no press, unlike every fault that takes a control", () => {
    // Every door into the two panels, in force, on the turned seat's own wave:
    // the mechanic is that the buttons all still work.
    const world = play(flipWorld(1), TPB * 2);
    const commands: Command[] = [
      { kind: "fire", color: "red" },
      { kind: "fire", color: "cyan" },
      { kind: "cannonCol", col: 3 },
      { kind: "shieldCol", col: 3 },
    ];
    for (const c of commands) expect(faultSwallows(world, c)).toBe(false);
  });

  it("leaves the wave exactly as it would have played unturned", () => {
    // The whole claim of the mechanic, as one line: the pilot walks the cannon
    // to the bulb's column and fires cyan, and the body that dies is the same
    // body on both runs. If this ever fails, the fault has reached a rule and
    // the pair is no longer looking at one game.
    const inputs = [aim(10, 5), fire(TPB * 3, "cyan"), aim(TPB * 5, 1), fire(TPB * 6, "red")];
    const turned = play(flipWorld(1), TPB * 8, inputs);
    const straight = play(flipWorld(null), TPB * 8, inputs);
    expect(turned.creatures.map((c) => `${c.kind}@${c.col}`)).toEqual(
      straight.creatures.map((c) => `${c.kind}@${c.col}`),
    );
    expect(turned.scars.length).toBe(straight.scars.length);
    expect(playedHash(turned)).toBe(playedHash(straight));
  });

  it("is in the hash, so the two phones cannot disagree about which is the mirror", () => {
    // The seat reaches no rule, which is exactly why it has to be hashed by
    // hand: nothing else in the world would ever come to differ because of it.
    expect(hashWorld(flipWorld(1))).not.toBe(hashWorld(flipWorld(2)));
    expect(hashWorld(flipWorld(1))).not.toBe(hashWorld(flipWorld(null)));
  });

  it("fingerprints the same twice, which is what lockstep is", () => {
    const inputs = [aim(10, 5), fire(TPB * 3, "cyan")];
    const a = play(flipWorld(2, 3, 6), TPB * 9, inputs);
    const b = play(flipWorld(2, 3, 6), TPB * 9, inputs);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
