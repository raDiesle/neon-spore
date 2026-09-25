import { describe, expect, it } from "bun:test";
import {
  type BossSequenceStep,
  createWorld,
  DEFAULT_CONFIG,
  type InstarState,
  instarBoss,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * **The third bite is three marks**: player 2 pulls the upper jaw down
 * against the push, player 1 taps the fire in the mouth out and then pulls the
 * lower jaw up to meet it (`content/instar-script.ts`, the owner's *combine
 * with some other movement action in between or during*). The fire is a count
 * of taps, so it is not held once it is answered: it waits for player 1's jaw
 * as long as any count waits for its partner (`instarTogetherBeats`), and a
 * jaw that comes later than that finds the fire lit again.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;
const NEED = 4000;
const TAPS = 6;

const BITE: BossSequenceStep = {
  pose: "breath",
  arrive: "stay",
  morphBeats: MORPH,
  windowBeats: 8,
  landBeats: 2,
  pushMilli: 500,
  marks: [
    { seat: "p2", part: "jaw", gesture: "pullDown", xMilli: 560, yMilli: 220, need: NEED },
    { seat: "p1", part: "fire", gesture: "tap", xMilli: 460, yMilli: 360, need: TAPS },
    { seat: "p1", part: "jaw", gesture: "pullUp", xMilli: 440, yMilli: 500, need: NEED },
  ],
};

function install(): { world: World; s: InstarState } {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "instar", steps: [BITE] });
  const s = instarBoss(world);
  if (s === null) throw new Error("the wave installed no instar");
  return { world, s };
}

function drag(tick: number, player: 1 | 2, id: number, on: boolean, depth = 0): TimedCommand {
  const command = { kind: "drag", target: "instarMark", on, fromMilli: -1, fromYMilli: depth, id };
  return { tick, player, command } as TimedCommand;
}

/** Player 2's thumb carried far enough down on every tick to outrun the push. */
function upper(from: number, to: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let t = from; t < to; t++) out.push(drag(t, 2, 0, true, NEED + 3000));
  return out;
}

/** Player 1's slaps on the fire, one on and one off each. */
function taps(from: number): TimedCommand[] {
  const out: TimedCommand[] = [];
  for (let k = 0; k < TAPS; k++)
    out.push(drag(from + 2 * k, 1, 1, true), drag(from + 2 * k + 1, 1, 1, false));
  return out;
}

function runTo(world: World, tick: number, cmds: TimedCommand[]): Set<string> {
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

describe("THE INSTAR's third bite", () => {
  it("lands when the fire is out and both jaws are shut", () => {
    const { world, s } = install();
    runTo(world, TPB * MORPH + 1, []);
    const t = world.tick;
    const lower = t + 2 * TAPS;
    const cmds = [...upper(t, lower + 2), ...taps(t), drag(lower, 1, 2, true, -NEED)];
    const seen = runTo(world, lower + 2, cmds);
    expect(s.progress[1]).toBe(TAPS);
    expect(seen.has("instarSlip")).toBe(false);
    expect(seen.has("instarLand")).toBe(true);
  });

  it("lights the fire again when player 1's jaw comes too late", () => {
    const { world, s } = install();
    runTo(world, TPB * MORPH + 1, []);
    const t = world.tick;
    const late = t + TPB * (CFG.instarTogetherBeats + 2);
    const seen = runTo(world, late, [...upper(t, late), ...taps(t)]);
    expect(seen.has("instarSlip")).toBe(true);
    expect(s.progress[1]).toBe(0);
    expect(s.phase).toBe("act");
  });
});
