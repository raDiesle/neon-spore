import { describe, expect, it } from "bun:test";
import { colourArmourTicks, colourIsArmoured } from "../src/colour-armour.js";
import { DEFAULT_CONFIG, ticksPerBeat } from "../src/config.js";
import { hashWorld } from "../src/hash.js";
import type { Color, Creature, TimedCommand } from "../src/types.js";
import { createWorld, type SimEvent, type SpawnEntry, step, type World } from "../src/world.js";

/**
 * What a shot of the wrong colour leaves behind on an ordinary body.
 *
 * The rule is docs/spec/structure.md's — *a missed shot in the wrong colour:
 * brief invulnerability* — and what makes it worth a test of its own is the
 * second half of it, which is easy to get wrong in a way nothing else notices:
 * the window is shut to **both** colours. A window that only refused the wrong
 * one again would be the old grey outline with a longer clock, and a pair
 * whose second bolt still landed on the beat would never feel it.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const COL = 5;

const bulb = (): SpawnEntry => ({ beat: 0, col: COL, kind: "bulb", color: "cyan" });
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: Color): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});

interface Run {
  world: World;
  events: SimEvent[];
}

function run(ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 7, [bulb()]);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

const only = (world: World): Creature => {
  const c = world.creatures[0];
  if (c === undefined) throw new Error("the field is empty");
  return c;
};

describe("a body struck in the wrong colour", () => {
  it("refuses the right colour while the window is still open", () => {
    // Two beats apart is more than the reload gap and less than the armour, so
    // the second bolt is a shot the pair could really have fired and really
    // does lose. Both go up the body's own column.
    const { world, events } = run(TPB * 8, [aim(0, COL), fire(TPB, "red"), fire(TPB * 2, "cyan")]);
    expect(world.creatures.length).toBe(1);
    expect(events.filter((e) => e.type === "reject").length).toBe(2);
    // One colour mistake, not two: the second bolt carried the right
    // ammunition at a moment the body was shut, which `resolveThrob` calls a
    // shot at the wrong *moment* and books to nobody.
    expect(world.balance.colorMisses).toBe(1);
  });

  it("takes the right colour again once the window has run out", () => {
    // The window is longer than the reload gap, which is the whole of why it
    // costs anything: the pair cannot simply fire again and carry on.
    expect(colourArmourTicks(CFG)).toBeGreaterThan(TPB * CFG.fireEveryBeats);
    // Four beats, which is past the window *and* past the flight time of the
    // bolt that opened it — a bolt is timed from the tick it lands, not from
    // the tick the thumb went down.
    const { world } = run(TPB * 8, [aim(0, COL), fire(TPB, "red"), fire(TPB * 4, "cyan")]);
    expect(world.creatures.length).toBe(0);
  });

  it("opens by itself with nothing else happening", () => {
    const world = createWorld({ ...CFG }, 7, [bulb()]);
    for (let t = 0; t < TPB; t++) step(world, []);
    const body = only(world);
    body.colourStruckTick = world.tick;
    expect(colourIsArmoured(world, body)).toBe(true);
    for (let t = 0; t < colourArmourTicks(CFG); t++) step(world, []);
    expect(colourIsArmoured(world, body)).toBe(false);
  });
});

describe("two devices playing the same body", () => {
  it("disagree about the fingerprint when one of them thinks it is answerable", () => {
    // `colourStruckTick` earns its place in `hashWorld` here: two devices that
    // disagree about it disagree about whether the bolt that just went up was
    // a kill or a spark off a shut body.
    const shut = createWorld({ ...CFG }, 7, [bulb()]);
    const open = createWorld({ ...CFG }, 7, [bulb()]);
    for (let t = 0; t < TPB; t++) {
      step(shut, []);
      step(open, []);
    }
    expect(hashWorld(shut)).toBe(hashWorld(open));
    only(shut).colourStruckTick = shut.tick;
    expect(hashWorld(shut)).not.toBe(hashWorld(open));
  });
});
