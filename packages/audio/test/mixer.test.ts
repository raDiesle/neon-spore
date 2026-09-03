import { beforeEach, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  guardArmed,
  mawOpen,
  type SimEvent,
  type SpawnEntry,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { Mixer } from "../src/mixer.js";
import type { PlayOptions } from "../src/plan.js";
import type { SoundDef } from "../src/types.js";

/**
 * The stateful half of the mixer, which is the one dangerous thing in the
 * package: it remembers a frame of world and sounds the difference, and
 * `world.tick` and `world.beat` are not monotonic, so a restart that is not
 * noticed is heard as the middle of the last run.
 *
 * `Engine.play` needs an `AudioContext` and returns without one, so nothing
 * here would make a sound even by accident. It is replaced anyway, by a
 * recorder — what this file is about is *which* id the mixer reached for, and
 * an engine returning early records nothing at all.
 */
function recorder(opts?: { clickTrack?: boolean }): {
  mixer: Mixer;
  played: { id: string; gain?: number }[];
  ids: () => string[];
} {
  const mixer = new Mixer(opts);
  const played: { id: string; gain?: number }[] = [];
  mixer.engine.play = (def: SoundDef, o: PlayOptions = {}) => {
    played.push({ id: def.id, gain: o.gain });
  };
  return { mixer, played, ids: () => played.map((p) => p.id) };
}

/** A world with nothing in it unless the caller queues something. */
function world(queue: SpawnEntry[] = []): World {
  return createWorld(DEFAULT_CONFIG, 11, queue);
}

/**
 * A world with the queue's first beat already on the field. A wave spawns on
 * a beat rather than at construction, so this steps the simulation rather than
 * pushing a body in by hand — a hand-built `Creature` is a second copy of what
 * a creature is, and it would go stale without ever failing.
 */
function fielded(queue: SpawnEntry[]): World {
  const w = world(queue);
  for (let i = 0; i <= ticksPerBeat(w.cfg); i++) step(w, []);
  w.events.length = 0;
  return w;
}

describe("the mixer's first frame", () => {
  it("sounds no edge, because there is nothing to compare it to", () => {
    const { mixer, ids } = recorder();
    const w = world();
    w.cannonCol = 0;
    w.shieldCol = 6;
    w.hullMilli -= 40_000;
    mixer.frame(w, []);
    expect(ids()).toEqual([]);
  });

  /**
   * A standing condition is not an edge, and the two the game has are the two
   * it would be worst to swallow: the alarm repeats until the hull is mended,
   * and a device that joined a run already over has to say so.
   */
  it("still sounds a condition that is true rather than newly true", () => {
    const { mixer, ids } = recorder();
    const w = world();
    w.hullMilli = 1_000;
    w.over = true;
    mixer.frame(w, []);
    expect(ids()).toEqual(["hull.alarm", "hull.dead"]);
  });

  it("sounds what happened, because an event is not a difference", () => {
    const { mixer, ids } = recorder();
    mixer.frame(world(), [{ type: "beat", beat: 4 }]);
    expect(ids()).toEqual(["beat.accent"]);
  });
});

describe("the mixer's remembered frame", () => {
  let rec: ReturnType<typeof recorder>;
  let w: World;

  beforeEach(() => {
    rec = recorder();
    w = world();
    rec.mixer.frame(w, []);
    rec.played.length = 0;
  });

  it("hears the cannon and the shield step, one sound per move", () => {
    w.tick++;
    w.cannonCol++;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["ship.cannonStep"]);

    w.tick++;
    w.shieldCol--;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["ship.cannonStep", "ship.shieldStep"]);
  });

  it("hears both edges of the guard window, and asks the simulation where they are", () => {
    w.tick++;
    w.guardTick = w.tick;
    expect(guardArmed(w)).toBe(true);
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["ship.guard"]);

    w.tick++;
    w.guardTick = -1_000_000;
    expect(guardArmed(w)).toBe(false);
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["ship.guard", "ship.guardLapse"]);
  });

  it("hears both edges of the maw the same way", () => {
    w.tick++;
    w.intakeTick = w.tick;
    expect(mawOpen(w)).toBe(true);
    rec.mixer.frame(w, []);

    w.tick++;
    w.intakeTick = -1_000_000;
    expect(mawOpen(w)).toBe(false);
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["ship.intake", "ship.intakeShut"]);
  });

  it("sounds a mend when the hull goes up, and nothing when it goes down", () => {
    w.tick++;
    w.hullMilli -= 20_000;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual([]);

    w.tick++;
    w.hullMilli += 20_000;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["hull.mend"]);
  });

  it("repeats the alarm on every fourth beat below a quarter hull, and only there", () => {
    w.hullMilli = 20_000;
    const sounded: number[] = [];
    for (let beat = 0; beat <= 8; beat++) {
      w.tick++;
      w.beat = beat;
      rec.played.length = 0;
      rec.mixer.frame(w, []);
      if (rec.ids().includes("hull.alarm")) sounded.push(beat);
    }
    expect(sounded).toEqual([0, 4, 8]);
  });

  it("does not sound the alarm twice on one beat", () => {
    w.hullMilli = 20_000;
    w.beat = 4;
    w.tick++;
    rec.mixer.frame(w, []);
    w.tick++;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["hull.alarm"]);
  });

  it("sounds the end of the run once", () => {
    w.tick++;
    w.over = true;
    rec.mixer.frame(w, []);
    w.tick++;
    rec.mixer.frame(w, []);
    expect(rec.ids()).toEqual(["hull.dead"]);
  });
});

/**
 * The case the whole of `Memory` exists for. A restart builds a fresh `World`
 * whose tick starts at zero again, so a mixer still holding the last run's
 * frame would read a full hull as a mend and the cannon's home column as a
 * step it never took.
 */
describe("a restart", () => {
  it("is forgotten rather than heard as the difference between two runs", () => {
    const { mixer, played, ids } = recorder();
    const first = world();
    first.tick = 400;
    first.cannonCol = 0;
    first.hullMilli = 20_000;
    first.over = true;
    mixer.frame(first, []);
    played.length = 0;

    mixer.frame(world(), []);
    expect(ids()).toEqual([]);
  });

  it("is noticed by the tick going backwards, and nothing else is thrown away with it", () => {
    const { mixer, played, ids } = recorder();
    const w = world();
    w.tick = 400;
    mixer.frame(w, []);
    played.length = 0;

    // The same run, one tick on: the step is heard, so the memory is being
    // kept between frames rather than cleared on every one of them.
    w.tick++;
    w.cannonCol++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["ship.cannonStep"]);
  });
});

describe("the duplicate guard", () => {
  it("drops the fourth identical sound in one frame, and quiets the second and third", () => {
    const { mixer, played } = recorder();
    const four: SimEvent[] = Array.from({ length: 4 }, () => ({
      type: "destroy" as const,
      col: 3,
      row: 4,
      color: "red" as const,
    }));
    mixer.frame(world(), four);
    expect(played.map((p) => p.id)).toEqual([
      "impact.destroyRed",
      "impact.destroyRed",
      "impact.destroyRed",
    ]);
    const gains = played.map((p) => p.gain ?? 1);
    expect(gains[1]!).toBeLessThan(gains[0]!);
    expect(gains[2]!).toBeLessThan(gains[1]!);
  });

  it("starts counting again on the next frame", () => {
    const { mixer, ids } = recorder();
    const one: SimEvent[] = [{ type: "destroy", col: 3, row: 4, color: "red" }];
    const w = world();
    mixer.frame(w, one);
    w.tick++;
    mixer.frame(w, one);
    expect(ids()).toHaveLength(2);
  });
});

describe("the click track", () => {
  it("is dropped when it is off, and nothing else is", () => {
    const { mixer, ids } = recorder({ clickTrack: false });
    mixer.frame(world(), [
      { type: "beat", beat: 4 },
      { type: "beat", beat: 5 },
      { type: "fire", col: 3, color: "red", lance: false },
    ]);
    expect(ids()).toEqual(["ship.fireRed"]);
  });
});

/**
 * A cue that names a seat is played on that seat's device and nowhere else,
 * and a device that has not been told which seat it is stays quiet — silence
 * rather than both, because the one such cue in the game is the lure's warning
 * and the two players are usually sitting next to each other.
 */
describe("a cue that belongs to one seat", () => {
  const seen: SimEvent[] = [{ type: "lureSeen", col: 3 }];

  it("is silent on a device that has not been told which seat it is", () => {
    const { mixer, ids } = recorder();
    mixer.frame(world(), seen);
    expect(ids()).toEqual([]);
  });

  it("is silent on the other seat", () => {
    const { mixer, ids } = recorder();
    mixer.setSeat(1);
    mixer.frame(world(), seen);
    expect(ids()).toEqual([]);
  });

  it("sounds on its own seat", () => {
    const { mixer, ids } = recorder();
    mixer.setSeat(2);
    mixer.frame(world(), seen);
    expect(ids()).toEqual(["signal.lureWarn"]);
  });
});

describe("the boss half", () => {
  it("announces a queen arriving, once", () => {
    const { mixer, ids } = recorder();
    const w = world();
    mixer.frame(w, []);
    startWave(w, 0, [], [], { kind: "queen", col: 3, petals: 4 });
    w.tick++;
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.arrive"]);
  });

  it("hears both edges of her armour", () => {
    const { mixer, played, ids } = recorder();
    const w = world();
    startWave(w, 0, [], [], { kind: "queen", col: 3, petals: 4 });
    mixer.frame(w, []);
    played.length = 0;

    const boss = w.boss;
    if (boss?.kind !== "queen") throw new Error("the wave did not install a queen");
    boss.openBeat = 2;
    boss.closeBeat = 4;
    w.beat = 2;
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.queenOpen"]);

    w.beat = 4;
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.queenOpen", "boss.queenShut"]);
  });

  it("sounds a torch arriving and not one that was already there", () => {
    const { mixer, played, ids } = recorder();
    const w = fielded([{ beat: 0, col: 2, kind: "torch", color: "red" }]);
    expect(w.creatures.map((c) => c.kind)).toEqual(["torch"]);
    mixer.frame(w, []);
    played.length = 0;

    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual([]);

    w.tick++;
    w.creatures.push({ ...w.creatures[0]!, id: 99, col: 5 });
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.torchWarn", "boss.torchDrop"]);
  });

  it("says nothing about a wave with no boss and no torches in it", () => {
    const { mixer, ids } = recorder();
    const w = world();
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual([]);
  });
});

describe("a wave running out", () => {
  it("is heard when the last creature of a fully spawned wave goes", () => {
    const { mixer, played, ids } = recorder();
    const w = fielded([{ beat: 0, col: 2, kind: "bulb", color: "red" }]);
    mixer.frame(w, []);
    played.length = 0;

    w.spawned = w.queue.length;
    w.creatures.length = 0;
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["ui.waveClear"]);
  });

  it("is not heard when the run ended instead", () => {
    const { mixer, played, ids } = recorder();
    const w = fielded([{ beat: 0, col: 2, kind: "bulb", color: "red" }]);
    mixer.frame(w, []);
    played.length = 0;

    w.spawned = w.queue.length;
    w.creatures.length = 0;
    w.over = true;
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["hull.dead"]);
  });
});
