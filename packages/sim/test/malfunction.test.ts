import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { guardArmed } from "../src/hull-guard.js";
import { type Malfunction, reliefHolds, reliefReady, reliefSeat } from "../src/malfunction.js";
import type { TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE MALFUNCTION: a wave where one seat does not have its control — the
 * control has it.
 *
 * Three things about it have no precedent in this simulation and each has a
 * test below. A command that leaves the world *without a command* — the beat
 * itself fires the cannon and arms the dome. A press that is **swallowed**
 * rather than answered, above the switch, so that every way into the same
 * command is closed at once and not merely the lobe. And a window one seat
 * buys for the other, which is the only thing in the game either of them can
 * do about it.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const slick = (beat: number, col: number): SpawnEntry => ({
  beat,
  col,
  kind: "slick",
  color: "red",
});

interface Run {
  world: World;
  events: SimEvent[];
}

function open(fault: Malfunction, queue: SpawnEntry[] = []): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, queue, [], null, false, 0, fault);
  return world;
}

function play(world: World, ticks: number, inputs: TimedCommand[] = []): Run {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(world.tick) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

describe("a cannon that fires itself", () => {
  it("puts a shot out on the beat with nobody pressing anything", () => {
    const world = open({ kind: "cannon", color: "red" });
    const { events } = play(world, TPB * 2);
    expect(events.filter((e) => e.type === "fire").length).toBeGreaterThan(0);
  });

  it("fires up whichever column player 1 is standing in", () => {
    const world = open({ kind: "cannon", color: "red" });
    const { events } = play(world, TPB * 2, [
      { tick: 2, player: 1, command: { kind: "cannonCol", col: 1 } },
    ]);
    const shot = events.find((e) => e.type === "fire");
    expect(shot && "col" in shot ? shot.col : -1).toBe(1);
  });

  it("alternates red and cyan on the wave's own clock when asked to", () => {
    const world = open({ kind: "cannon", color: "alternating" });
    const { events } = play(world, TPB * 4);
    const colours = events.flatMap((e) => (e.type === "fire" ? [e.color] : []));
    expect(colours.length).toBeGreaterThanOrEqual(3);
    expect(colours[0]).toBe("red");
    expect(colours[1]).toBe("cyan");
    expect(colours[2]).toBe("red");
  });

  it("swallows player 2's own press, so the fault is the only thing firing", () => {
    // Checked above the switch in `applyCommand`, not in the panel: the lobe is
    // not the only way into a `fire` — a swipe on the hull is a second and the
    // wire is a third, and a rule enforced only where it is drawn is a rule
    // both of those walk straight past (`malfunction.ts`).
    const world = open({ kind: "cannon", color: "red" });
    const { events } = play(world, 10, [
      { tick: 2, player: 2, command: { kind: "fire", color: "cyan" } },
    ]);
    expect(events.some((e) => e.type === "fire")).toBe(false);
  });

  it("hands the relief to player 2, and refuses it to player 1", () => {
    expect(reliefSeat({ kind: "cannon", color: "red" })).toBe(2);
    const wrong = open({ kind: "cannon", color: "red" });
    play(wrong, 4, [{ tick: 1, player: 1, command: { kind: "relief" } }]);
    expect(reliefHolds(wrong)).toBe(false);
  });
});

describe("the relief", () => {
  it("stops the fault for the beats it buys, and no longer", () => {
    const world = open({ kind: "cannon", color: "red" });
    play(world, 4, [{ tick: 1, player: 2, command: { kind: "relief" } }]);
    expect(reliefHolds(world)).toBe(true);
    const shots = play(world, TPB * CFG.reliefPauseBeats - 8).events.filter(
      (e) => e.type === "fire",
    );
    expect(shots).toHaveLength(0);
    expect(play(world, TPB * 2).events.some((e) => e.type === "fire")).toBe(true);
  });

  it("cannot be spent again until the rest has run", () => {
    // The pause is shorter than the rest on purpose: a seat that could tap on a
    // rhythm would hold the fault off for the whole wave, and the mechanic
    // would be nothing at all (`config-malfunction.ts`).
    const world = open({ kind: "cannon", color: "red" });
    play(world, 4, [{ tick: 1, player: 2, command: { kind: "relief" } }]);
    play(world, TPB * CFG.reliefPauseBeats, [
      { tick: TPB, player: 2, command: { kind: "relief" } },
    ]);
    expect(reliefHolds(world)).toBe(false);
    expect(reliefReady(world)).toBe(false);
    play(world, TPB * (CFG.reliefRestBeats - CFG.reliefPauseBeats));
    expect(reliefReady(world)).toBe(true);
  });

  it("is nothing at all on a wave with no fault", () => {
    const world = createWorld({ ...CFG }, 0, []);
    play(world, 4, [{ tick: 1, player: 2, command: { kind: "relief" } }]);
    expect(reliefHolds(world)).toBe(false);
    expect(reliefReady(world)).toBe(false);
  });
});

describe("a shield that arms itself", () => {
  it("brings the dome up on the beat with nobody triggering it", () => {
    const world = open({ kind: "shield" });
    play(world, TPB + 2);
    expect(guardArmed(world)).toBe(true);
  });

  it("swallows player 1's trigger, so the beat is the only thing arming it", () => {
    const world = open({ kind: "shield" });
    // Far enough past a beat that the automatic arming's own window has shut.
    play(world, TPB * 2 - 4);
    const before = world.guardTick;
    play(world, 2, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
    expect(world.guardTick).toBe(before);
  });

  it("hands the relief to player 1", () => {
    expect(reliefSeat({ kind: "shield" })).toBe(1);
    const world = open({ kind: "shield" });
    play(world, 4, [{ tick: 1, player: 1, command: { kind: "relief" } }]);
    expect(reliefHolds(world)).toBe(true);
  });

  it("keeps the dome down for as long as the relief holds", () => {
    const world = open({ kind: "shield" });
    play(world, TPB - 2, [{ tick: 1, player: 1, command: { kind: "relief" } }]);
    const before = world.guardTick;
    play(world, TPB);
    expect(world.guardTick).toBe(before);
  });
});

describe("the fingerprint", () => {
  it("notices a fault that two devices disagree about", () => {
    const red = open({ kind: "cannon", color: "red" });
    const cyan = open({ kind: "cannon", color: "cyan" });
    play(red, 4);
    play(cyan, 4);
    expect(hashWorld(red)).not.toBe(hashWorld(cyan));
  });

  it("notices a relief one device answered and the other did not", () => {
    const held = open({ kind: "cannon", color: "red" }, [slick(0, 3)]);
    const loose = open({ kind: "cannon", color: "red" }, [slick(0, 3)]);
    play(held, TPB, [{ tick: 1, player: 2, command: { kind: "relief" } }]);
    play(loose, TPB);
    expect(hashWorld(held)).not.toBe(hashWorld(loose));
  });

  it("fingerprints the same run the same way twice", () => {
    const a = open({ kind: "cannon", color: "alternating" }, [slick(0, 3)]);
    const b = open({ kind: "cannon", color: "alternating" }, [slick(0, 3)]);
    play(a, TPB * 4, [{ tick: 20, player: 2, command: { kind: "relief" } }]);
    play(b, TPB * 4, [{ tick: 20, player: 2, command: { kind: "relief" } }]);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
