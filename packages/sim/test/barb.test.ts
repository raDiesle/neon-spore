import { describe, expect, it } from "bun:test";
import { domeScarred } from "../src/barb.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import { guardArmed, shieldRow } from "../src/hull-guard.js";
import type { Color, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * THE BARB, and the thing about it that is new to this simulation: a creature
 * the pair's own **defence** is the wrong answer to.
 *
 * THE LURE already made that argument about the cannon — a shot that lands is
 * the mistake — so what is tested here is the half that has no precedent. The
 * ward is not merely useless against a barb; it costs the hull, and then it
 * takes the shield away for three beats, which is a price paid on whatever
 * arrives next. Four things follow, and each has a test below: the catch
 * itself, the fact that the dome then wards nothing at all, the fact that a
 * torn dome cannot be torn again while it is torn, and the fingerprint, which
 * would otherwise agree across two devices that disagree about whether the
 * next rock was turned away.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

const barb = (col: number, color: Color): SpawnEntry => ({ beat: 0, col, kind: "barb", color });
const rock = (beat: number, col: number): SpawnEntry => ({
  beat,
  col,
  kind: "meteor",
  color: null,
});
const guard = (tick: number): TimedCommand => ({ tick, player: 1, command: { kind: "guard" } });
const shieldTo = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "shieldCol", col },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

describe("the ward catches on a barb instead of turning it away", () => {
  it("leaves the ship alone while the dome is in another column", () => {
    const { world, events } = run([barb(5, "cyan")], TPB * 3, [shieldTo(10, 2), guard(TPB)]);
    expect(events.some((e) => e.type === "barbTear")).toBe(false);
    expect(world.hullMilli).toBe(100_000);
  });

  it("tears the dome when the trigger comes up in its column", () => {
    const { world, events } = run([barb(5, "cyan")], TPB * 3, [shieldTo(10, 5), guard(TPB)]);
    const tear = events.find((e) => e.type === "barbTear");
    expect(tear).toBeDefined();
    // The shield's column, not the body's row of arrival: the ship is holed
    // where the plate was standing (`barb.ts`).
    expect(tear && "col" in tear ? tear.col : -1).toBe(5);
    expect(world.hullMilli).toBeLessThan(100_000);
  });

  it("reaches a barb standing anywhere on the field, not only at the shield's row", () => {
    // The clasp's rule with the sign turned round. A barb one beat into its
    // fall is nowhere near the hull, and the trigger still finds it.
    const { events } = run([barb(3, "red")], TPB * 2, [shieldTo(4, 3), guard(TPB)]);
    expect(events.some((e) => e.type === "barbTear")).toBe(true);
  });

  it("leaves the shield answering nothing at all for the beats that follow", () => {
    const world = createWorld({ ...CFG }, 0, [barb(3, "red")]);
    for (let t = 0; t < TPB; t++) step(world, []);
    step(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col: 3 } }]);
    step(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
    expect(domeScarred(world)).toBe(true);
    // The trigger was pressed a tick ago, so the guard window is wide open and
    // the dome still answers nothing: that is the whole of what the scar costs.
    expect(guardArmed(world)).toBe(false);
    for (let t = 0; t < CFG.barbScarBeats * TPB; t++) step(world, []);
    expect(domeScarred(world)).toBe(false);
  });

  it("does not charge the hull twice for a dome that is already torn", () => {
    // Under a shield malfunction the trigger comes up on every beat by itself,
    // so a barb left standing in the plate's column would otherwise bill the
    // pair once a beat until it landed (`barb.ts`).
    const once = run([barb(3, "red")], TPB * 2, [shieldTo(4, 3), guard(TPB)]);
    const twice = run([barb(3, "red")], TPB * 2, [
      shieldTo(4, 3),
      guard(TPB),
      guard(TPB + 5),
      guard(TPB + 10),
    ]);
    expect(twice.world.hullMilli).toBe(once.world.hullMilli);
    expect(twice.events.filter((e) => e.type === "barbTear")).toHaveLength(1);
  });

  it("takes the rock beside it with it", () => {
    // The tail is the creature. A rock arriving inside the three beats a scar
    // is open is a rock the pair cannot ward, however right their column and
    // their timing are — which is the price a barb charges on whatever comes
    // next rather than on itself.
    const world = createWorld({ ...CFG }, 0, [barb(1, "red"), rock(0, 5)]);
    const guardRow = shieldRow(CFG);
    // Up to the beat the rock is one row above the dome, so the tear and the
    // ward that fails because of it are two beats the pair could count.
    while ((world.creatures.find((c) => c.kind === "meteor")?.row ?? -1) < guardRow - 1) {
      step(world, []);
    }
    step(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col: 1 } }]);
    step(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
    expect(domeScarred(world)).toBe(true);
    // Now the ward the pair would otherwise have made: right column, right beat.
    step(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col: 5 } }]);
    for (let t = 0; t < TPB * 4; t++) {
      step(
        world,
        t % TPB === 0 ? [{ tick: world.tick, player: 1, command: { kind: "guard" } }] : [],
      );
    }
    // Right column, wrong moment is what `mistimed` counts, and there was no
    // moment to get right: the dome was torn for every beat the rock was in
    // reach of it (`hull.ts`).
    expect(world.guard.deflected).toBe(0);
    expect(world.guard.mistimed).toBe(1);
  });

  it("is not warded away, so nothing about it is deflected", () => {
    // A barb is not `isWardable`: it falls past the dome and breaks the hull
    // like any other body that arrived. The trigger has nothing to offer it in
    // either direction, which is the sentence the wave is named for.
    const world = createWorld({ ...CFG }, 0, [barb(3, "red")]);
    for (let beat = 0; beat < CFG.rows + 3; beat++) {
      for (let t = 0; t < TPB; t++) {
        step(world, t === 0 ? [{ tick: world.tick, player: 1, command: { kind: "guard" } }] : []);
      }
    }
    expect(world.guard.deflected).toBe(0);
    expect(world.hullMilli).toBeLessThan(100_000);
  });

  it("is ended by the matching cannon, the way a slick is", () => {
    const { world } = run([barb(3, "red")], TPB * 3, [
      { tick: 4, player: 1, command: { kind: "cannonCol", col: 3 } },
      { tick: TPB, player: 2, command: { kind: "fire", color: "red" } },
    ]);
    expect(world.creatures).toHaveLength(0);
  });

  it("puts the scar in the fingerprint, so two devices cannot disagree about it", () => {
    const torn = run([barb(3, "red")], TPB * 2, [shieldTo(4, 3), guard(TPB)]);
    const clear = run([barb(3, "red")], TPB * 2, [shieldTo(4, 1), guard(TPB)]);
    expect(hashWorld(torn.world)).not.toBe(hashWorld(clear.world));
  });

  it("fingerprints the same run the same way twice", () => {
    const a = run([barb(3, "red")], TPB * 4, [shieldTo(4, 3), guard(TPB)]);
    const b = run([barb(3, "red")], TPB * 4, [shieldTo(4, 3), guard(TPB)]);
    expect(hashWorld(a.world)).toBe(hashWorld(b.world));
  });
});
