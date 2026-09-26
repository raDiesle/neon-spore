import { describe, expect, it } from "bun:test";
import { TURN } from "../src/bearing.js";
import {
  type BossSequenceStep,
  createWorld,
  DEFAULT_CONFIG,
  type InstarGesture,
  type InstarState,
  instarBoss,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **A wound mark counts one way round only** (`instar-hand.ts`): `turn`
 * clockwise like the crank, `turnBack` anticlockwise, and the other way is
 * nothing on either — so the coil's two thumbs, winding opposite ways, each
 * have to be the way their own mark says.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;

function wound(gesture: InstarGesture): { world: World; s: InstarState } {
  const steps: BossSequenceStep[] = [
    {
      pose: "coil",
      arrive: "approach",
      morphBeats: MORPH,
      windowBeats: 8,
      landBeats: 2,
      marks: [{ seat: "p1", part: "tail", gesture, xMilli: 380, yMilli: 330, need: 2000 }],
    },
  ];
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "instar", steps });
  const s = instarBoss(world);
  if (s === null) throw new Error("the wave installed no instar");
  run(world, TPB * MORPH + 1);
  return { world, s };
}

/** Player 1's thumb on the mark, at each bearing in turn, one a tick. */
function windThrough(world: World, bearings: number[]): void {
  for (const fromMilli of bearings) {
    const cmd: TimedCommand = {
      tick: world.tick,
      player: 1,
      command: { kind: "drag", target: "instarMark", on: true, fromMilli, fromYMilli: 0, id: 0 },
    };
    run(world, world.tick + 1, [cmd]);
  }
}

function run(world: World, tick: number, cmds: TimedCommand[] = []): void {
  while (world.tick < tick)
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
}

describe("THE INSTAR's wound marks", () => {
  it("count a turnBack anticlockwise and a clockwise wind on it not at all", () => {
    const { world, s } = wound("turnBack");
    windThrough(world, [0, 200, 400]);
    expect(s.progress[0]).toBe(0);
    windThrough(world, [100]);
    expect(s.progress[0]).toBe(300);
  });

  it("still count a turn clockwise only", () => {
    const { world, s } = wound("turn");
    windThrough(world, [0, TURN - 200, TURN - 400]);
    expect(s.progress[0]).toBe(0);
    windThrough(world, [TURN - 100]);
    expect(s.progress[0]).toBe(300);
  });
});
