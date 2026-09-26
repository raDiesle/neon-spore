import { describe, expect, it } from "bun:test";
import {
  type BossSequenceStep,
  createWorld,
  DEFAULT_CONFIG,
  type InstarState,
  instarBoss,
  instarMarkCol,
  type SimEvent,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **The jaw pushes back**: THE INSTAR's second and third bites of the breath
 * (`content/instar-script.ts`, `pushMilli`). Every beat a thumb is on a pull,
 * the part takes back that much of the carry, so a jaw shut early and held
 * still opens again under the thumb, and the thumb has to go that much
 * further to shut it — the owner's *pulling it is required to be stronger*.
 * A step with no push is the first bite, and stays where the thumb put it.
 * Every shove is said (`instarShove`), for the lips to tremble and the ear.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;
const NEED = 1000;
const PUSH = 250;

function bite(pushMilli?: number): BossSequenceStep {
  return {
    pose: "breath",
    arrive: "stay",
    morphBeats: MORPH,
    windowBeats: 8,
    landBeats: 2,
    ...(pushMilli === undefined ? {} : { pushMilli }),
    marks: [
      { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: NEED },
      { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: NEED },
    ],
  };
}

function install(pushMilli?: number): { world: World; s: InstarState } {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "instar", steps: [bite(pushMilli)] });
  const s = instarBoss(world);
  if (s === null) throw new Error("the wave installed no instar");
  return { world, s };
}

/** Player 2's thumb on the upper jaw, carried `depth` thousandths of a tile down. */
const pull = (tick: number, depth: number): TimedCommand => ({
  tick,
  player: 2,
  command: {
    kind: "drag",
    target: "instarMark",
    on: true,
    fromMilli: -1,
    fromYMilli: depth,
    id: 0,
  },
});

function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Into the window, and the upper jaw shut and held still for `beats`. */
function shutAndWait(
  pushMilli: number | undefined,
  beats: number,
): { world: World; s: InstarState } {
  const { world, s } = install(pushMilli);
  runTo(world, TPB * MORPH + 1);
  const t = world.tick;
  runTo(world, t + TPB * beats, [pull(t, NEED)]);
  return { world, s };
}

describe("THE INSTAR's jaw pushing back", () => {
  it("stays where the thumb put it on a bite with no push", () => {
    const { s } = shutAndWait(undefined, 3);
    expect(s.progress[0]).toBe(NEED);
    expect(s.doneBeat[0]).not.toBe(-1);
  });

  it("opens again under a thumb held still, by the push a beat", () => {
    const { s } = shutAndWait(PUSH, 2);
    expect(s.progress[0]).toBe(NEED - 2 * PUSH);
    expect(s.doneBeat[0]).toBe(-1);
    expect(s.phase).toBe("act");
  });

  it("takes the thumb that much further to shut it again", () => {
    const { world, s } = shutAndWait(PUSH, 2);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, NEED)]);
    expect(s.progress[0]).toBe(NEED - 2 * PUSH);
    const u = world.tick;
    runTo(world, u + 1, [pull(u, NEED + 2 * PUSH)]);
    expect(s.progress[0]).toBe(NEED);
    expect(s.doneBeat[0]).not.toBe(-1);
  });

  it("lands when both jaws are shut at once, against the push", () => {
    const { world, s } = install(PUSH);
    runTo(world, TPB * MORPH + 1);
    const t = world.tick;
    const lower: TimedCommand = {
      tick: t,
      player: 1,
      command: {
        kind: "drag",
        target: "instarMark",
        on: true,
        fromMilli: -1,
        fromYMilli: -NEED,
        id: 1,
      },
    };
    const seen = runTo(world, t + 2, [pull(t, NEED), lower]);
    expect(seen.has("instarLand")).toBe(true);
    expect(s.phase).toBe("land");
  });
});

describe("THE INSTAR's shove, said", () => {
  /** Every shove a thumb held on the upper jaw for `beats` met. */
  function shoves(pushMilli: number | undefined, beats: number): SimEvent[] {
    const { world } = install(pushMilli);
    runTo(world, TPB * MORPH + 1);
    const t = world.tick;
    const out: SimEvent[] = [];
    while (world.tick < t + TPB * beats) {
      step(world, world.tick === t ? [pull(t, NEED)] : []);
      out.push(...world.events.filter((e) => e.type === "instarShove"));
    }
    return out;
  }

  it("is one event a beat, on the thumb's mark, with the push", () => {
    const upper = bite(PUSH).marks[0];
    if (upper === undefined) throw new Error("the bite has no upper jaw");
    const col = instarMarkCol(CFG, upper);
    const said = shoves(PUSH, 2);
    expect(said).toEqual([
      { type: "instarShove", mark: 0, part: "jaw", pushMilli: PUSH, col },
      { type: "instarShove", mark: 0, part: "jaw", pushMilli: PUSH, col },
    ]);
  });

  it("is never said on a bite with no push", () => {
    expect(shoves(undefined, 3)).toEqual([]);
  });
});
