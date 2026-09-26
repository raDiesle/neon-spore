import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  vaneColor,
  vaneOpening,
  vaneWeakCol,
  type World,
} from "../src/index.js";

/**
 * **A pin knocked out is said** (`vane.ts` `vaneStruck`): one `vaneKnock` per
 * pin, with what is left, so the one moment the pair beat the bearing has a
 * sound and a blow of its own rather than a count the picture has to watch.
 * `vane.test.ts` has the rules of the knock; this holds only what it tells.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);

/** The bearing full, so the fight is under SWING and a shot is all a pin asks. */
function open(): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, [], [], { kind: "vane" });
  return world;
}

/** Steps `n` beats and gives back every event they pushed. */
function beats(world: World, n: number, inputs: TimedCommand[] = []): SimEvent[] {
  const out: SimEvent[] = [];
  for (let t = 0; t < n * TPB; t++) {
    step(
      world,
      inputs.filter((i) => i.tick === world.tick),
    );
    out.push(...world.events);
  }
  return out;
}

/** A shot of the opening's colour up the split, and what three beats said. */
function knock(world: World): SimEvent[] {
  const col = vaneWeakCol(CFG, world.waveBeat);
  const color = vaneColor(vaneOpening(world.waveBeat));
  const at = world.tick;
  return beats(world, 3, [
    { tick: at, player: 1, command: { kind: "cannonCol", col } },
    { tick: at + 2, player: 2, command: { kind: "fire", color } },
  ]);
}

const knocks = (events: SimEvent[]) => events.filter((e) => e.type === "vaneKnock");

describe("a pin knocked out", () => {
  it("is one event, in the split's column, with the pins left", () => {
    const world = open();
    beats(world, 1);
    const col = vaneWeakCol(CFG, world.waveBeat);
    expect(knocks(knock(world))).toEqual([{ type: "vaneKnock", pins: CFG.vanePins - 1, col }]);
  });

  it("says nothing for a shot the bearing refused", () => {
    const world = open();
    beats(world, 4);
    expect(knocks(knock(world))).toEqual([]);
  });
});
