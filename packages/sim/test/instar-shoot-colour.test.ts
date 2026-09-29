import { describe, expect, it } from "bun:test";
import {
  type BossSequenceStep,
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  instarMarkCol,
  type SimConfig,
  sceneBoss,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE INSTAR's SHOOT marks each ask for one colour (the owner, 27 September
 * 2026): a bolt of it counts, a bolt of the other counts nothing and is
 * refused the way a thumb from the wrong seat is (`scene-panel.ts`).
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;

const GLARE: BossSequenceStep = {
  pose: "glare",
  arrive: "stay",
  morphBeats: MORPH,
  windowBeats: 12,
  landBeats: 2,
  marks: [
    {
      seat: "both",
      part: "eye",
      gesture: "shoot",
      xMilli: 380,
      yMilli: 238,
      need: 2,
      color: "red",
    },
    {
      seat: "both",
      part: "eye",
      gesture: "shoot",
      xMilli: 620,
      yMilli: 238,
      need: 2,
      color: "cyan",
    },
  ],
};

function install(): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "instar", steps: [GLARE] });
  return world;
}

function runTo(world: World, tick: number, cmds: TimedCommand[] = []): string[] {
  const seen: string[] = [];
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events)
      if (e.type === "instarRefuse") seen.push(`refuse:${e.mark}:${e.player}`);
  }
  return seen;
}

function press(world: World, player: 1 | 2, command: Command, beats = 0): string[] {
  const t = world.tick;
  return runTo(world, t + 1 + beats * TPB, [{ tick: t, player, command }]);
}

const col = (i: number): number => {
  const mark = GLARE.marks[i];
  if (mark === undefined) throw new Error(`no mark ${i}`);
  return instarMarkCol(CFG, mark);
};

describe("a SHOOT mark that names a colour", () => {
  it("counts a bolt of its colour, and refuses the other for player 2", () => {
    const world = install();
    runTo(world, TPB * MORPH + 1);
    const s = sceneBoss(world);
    if (s === null) throw new Error("no scene");
    expect(s.phase).toBe("act");

    press(world, 1, { kind: "cannonCol", col: col(0) });
    const wrong = press(world, 2, { kind: "fire", color: "cyan" }, 2);
    expect(s.progress).toEqual([0, 0]);
    expect(wrong).toEqual(["refuse:0:2"]);

    const right = press(world, 2, { kind: "fire", color: "red" }, 2);
    expect(s.progress).toEqual([1, 0]);
    expect(right).toEqual([]);

    press(world, 1, { kind: "cannonCol", col: col(1) });
    expect(press(world, 2, { kind: "fire", color: "red" }, 2)).toEqual(["refuse:1:2"]);
    press(world, 2, { kind: "fire", color: "cyan" }, 2);
    expect(s.progress).toEqual([1, 1]);
  });

  it("is in the fingerprint: the same script in the other colour hashes apart", () => {
    const a = install();
    const b = createWorld({ ...CFG }, 0);
    const swapped = GLARE.marks.map(
      (m) => ({ ...m, color: m.color === "red" ? "cyan" : "red" }) as const,
    );
    startWave(b, 0, [], [], { kind: "instar", steps: [{ ...GLARE, marks: swapped }] });
    expect(hashWorld(a)).not.toBe(hashWorld(b));
  });
});
