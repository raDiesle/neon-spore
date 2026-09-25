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
 * **One seat holds while the other strikes**: the split lunge of THE
 * INSTAR's script (`content/instar-script.ts`, step 7). A hold on a mark of
 * one seat's own counts that seat's thumb alone, where a `both` mark waits
 * for two (`instar.test.ts`); the tap beside it is an ordinary count, and the
 * step lands when the two are done inside the together beats. A lift before
 * the landing is the brow let go, back to nought.
 */

const CFG = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;

const SPLIT: BossSequenceStep = {
  pose: "lunge",
  arrive: "cross",
  morphBeats: MORPH,
  windowBeats: 8,
  landBeats: 2,
  marks: [
    { seat: "p1", part: "head", gesture: "hold", xMilli: 440, yMilli: 300, need: 3 },
    { seat: "p2", part: "eye", gesture: "tap", xMilli: 632, yMilli: 280, need: 2 },
  ],
};

function install(): { world: World; s: InstarState } {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "instar", steps: [SPLIT] });
  const s = instarBoss(world);
  if (s === null) throw new Error("the wave installed no instar");
  return { world, s };
}

const thumb = (tick: number, player: 1 | 2, id: number, on: boolean): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "instarMark", on, fromMilli: -1, fromYMilli: 0, id },
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

function taps(world: World, n: number): void {
  for (let i = 0; i < n; i++) {
    const t = world.tick;
    runTo(world, t + 1, [thumb(t, 2, 1, true), thumb(t, 2, 1, false)]);
  }
}

describe("THE INSTAR's split lunge", () => {
  it("counts a hold of one seat's own by that seat's thumb alone", () => {
    const { world, s } = install();
    runTo(world, TPB * MORPH + 1);
    const t = world.tick;
    runTo(world, t + TPB * 2, [thumb(t, 1, 0, true)]);
    expect(s.thumbs[0]).toBe(1);
    expect(s.progress[0]).toBe(2);
  });

  it("lands when the brow is held and the eye struck, together", () => {
    const { world, s } = install();
    runTo(world, TPB * MORPH + 1);
    const t = world.tick;
    runTo(world, t + TPB * 2, [thumb(t, 1, 0, true)]);
    taps(world, 2);
    const seen = runTo(world, world.tick + TPB * 2);
    expect(seen.has("instarLand")).toBe(true);
    expect(s.phase).toBe("land");
  });

  it("lets the brow go on a lift before the eye is done", () => {
    const { world, s } = install();
    runTo(world, TPB * MORPH + 1);
    const t = world.tick;
    runTo(world, t + TPB * 2, [thumb(t, 1, 0, true)]);
    const u = world.tick;
    const seen = runTo(world, u + 1, [thumb(u, 1, 0, false)]);
    expect(seen.has("instarSlip")).toBe(true);
    expect(s.progress[0]).toBe(0);
    expect(s.phase).toBe("act");
  });
});
