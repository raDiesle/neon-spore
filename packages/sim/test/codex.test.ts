import { describe, expect, it } from "bun:test";
import { bulletShown } from "../src/bullet-types.js";
import { codexSwapped, shotMeans } from "../src/codex.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { faultSwallows } from "../src/fault-swallow.js";
import { hashWorld } from "../src/hash.js";
import type { Creature, TimedCommand } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE CODEX, and the thing about it that is new to this simulation: a fault that
 * **takes nothing away**.
 *
 * The other three break a control — the button is on the panel and answers
 * nobody — so what the tests for those hold is that a press does nothing. Here
 * every press works, and what has changed is what it *means*: a red bolt kills
 * what cyan kills. So what is held below is mostly the opposite of a refusal —
 * the shot goes out, it is drawn in the colour that was pressed, and the wrong
 * body dies.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const HOLD = CFG.codexHoldBeats;

const slick = (col: number): SpawnEntry => ({ beat: 0, col, kind: "slick", color: "red" });
const bulb = (col: number): SpawnEntry => ({ beat: 0, col, kind: "bulb", color: "cyan" });

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

/** A wave with the fault on it, or without. */
function codexWorld(queue: SpawnEntry[], fault = true): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, queue, [], null, false, 0, fault ? [{ kind: "codex", at: 0, beats: 0 }] : []);
  return world;
}

function play(world: World, ticks: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < ticks; t++) step(world, byTick.get(t) ?? []);
  return world;
}

const kinds = (world: World): string[] => world.creatures.map((c: Creature) => c.kind);

describe("the key", () => {
  it("opens turned over, so the first shot of the wave is the one that lies", () => {
    // The owner's kind of opening: a wave that opened clear would let the pair
    // fire a bar of ordinary shots before anything was at stake.
    expect(codexSwapped(codexWorld([slick(3)]))).toBe(true);
  });

  it("turns over every codexHoldBeats and back again", () => {
    const world = codexWorld([slick(3)]);
    const at = (beat: number) => {
      const w = codexWorld([slick(3)]);
      play(w, TPB * beat + 1);
      return codexSwapped(w);
    };
    expect(codexSwapped(world)).toBe(true);
    expect(at(HOLD - 1)).toBe(true);
    expect(at(HOLD + 1)).toBe(false);
    expect(at(HOLD * 2 + 1)).toBe(true);
  });

  it("is nothing at all on a wave with no fault, or with another one", () => {
    expect(codexSwapped(codexWorld([slick(3)], false))).toBe(false);
    const steered = createWorld({ ...CFG }, 0);
    startWave(steered, 0, [slick(3)], [], null, false, 0, [{ kind: "steer", at: 0, beats: 0 }]);
    expect(codexSwapped(steered)).toBe(false);
  });
});

describe("what a colour means", () => {
  it("is the other one while the key is over, and itself while it is not", () => {
    const on = codexWorld([slick(3)]);
    expect(shotMeans(on, "red")).toBe("cyan");
    expect(shotMeans(on, "cyan")).toBe("red");

    const off = codexWorld([slick(3)], false);
    expect(shotMeans(off, "red")).toBe("red");
    expect(shotMeans(off, "cyan")).toBe("cyan");
  });
});

describe("a shot under the fault", () => {
  it("takes nothing away: the press goes through and the bolt leaves", () => {
    // The whole difference from the other three faults, in one assertion.
    const world = codexWorld([slick(3)]);
    expect(faultSwallows(world, { kind: "fire", color: "red" })).toBe(false);
    expect(faultSwallows(world, { kind: "prime", on: true, color: "red" })).toBe(false);
    expect(faultSwallows(world, { kind: "guard" })).toBe(false);
    expect(faultSwallows(world, { kind: "cannonCol", col: 2 })).toBe(false);

    play(world, TPB + 4, [aim(1, 3), fire(TPB, "red")]);
    expect(world.bullets).toHaveLength(1);
  });

  it("is drawn in the colour the thumb pressed, and kills what the other one kills", () => {
    // The secret: `shown` is what the navigator sees leave the muzzle, `color`
    // is what the body is matched against.
    const world = codexWorld([slick(3)]);
    play(world, TPB + 4, [aim(1, 3), fire(TPB, "red")]);
    const shot = world.bullets[0];
    expect(shot).toBeDefined();
    if (!shot) return;
    expect(bulletShown(shot)).toBe("red");
    expect(shot.color).toBe("cyan");
  });

  it("kills the cyan body when cyan was not pressed", () => {
    // A bulb is cyan. Under the swap, red takes it — which is the sentence the
    // wave is written about, and the pair only finds out by watching it happen.
    const world = codexWorld([bulb(3)]);
    play(world, TPB * 3, [aim(1, 3), fire(TPB, "red")]);
    expect(kinds(world)).toEqual([]);
  });

  it("leaves the red body standing when red was pressed", () => {
    const world = codexWorld([slick(3)]);
    play(world, TPB * 3, [aim(1, 3), fire(TPB, "red")]);
    expect(kinds(world)).toEqual(["slick"]);
    expect(world.balance.colorMisses).toBe(1);
  });

  it("kills the red body when the pair presses the other colour", () => {
    // The answer, and the only one: press what the partner says, not what the
    // body looks like.
    const world = codexWorld([slick(3)]);
    play(world, TPB * 3, [aim(1, 3), fire(TPB, "cyan")]);
    expect(kinds(world)).toEqual([]);
    expect(world.balance.colorHits).toBe(1);
  });

  it("behaves ordinarily once the key has turned back", () => {
    // Past the first hold the colours mean themselves again, so the same press
    // that missed now lands. This is what makes the fault a thing to keep
    // calling rather than a relabelling to learn once.
    const world = codexWorld([slick(3)]);
    play(world, TPB * (HOLD + 3), [aim(1, 3), fire(TPB * (HOLD + 1), "red")]);
    expect(kinds(world)).toEqual([]);
  });
});

describe("determinism", () => {
  it("fingerprints the same twice, and differently from the same run unfaulted", () => {
    const inputs = [aim(1, 3), fire(TPB, "red")];
    const a = play(codexWorld([slick(3), bulb(5)]), TPB * 3, inputs);
    const b = play(codexWorld([slick(3), bulb(5)]), TPB * 3, inputs);
    expect(hashWorld(b)).toBe(hashWorld(a));

    // The shot's two colours are both in the fingerprint, so a world where a
    // bolt means one thing and looks like another is not the world where it
    // means what it looks like.
    const plain = play(codexWorld([slick(3), bulb(5)], false), TPB * 3, inputs);
    expect(hashWorld(plain)).not.toBe(hashWorld(a));
  });
});
