import { describe, expect, it } from "bun:test";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  instarMarkCol,
  instarMarkDone,
  type NettleState,
  type NettleStep,
  type SceneMark,
  type SimConfig,
  sceneBoss,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { NOT_FAILED } from "../src/wave-fail.js";

/**
 * THE NETTLE: THE INSTAR's engine with the panel given back (§11.39).
 *
 * The engine's own rules — the morph, the window, the together beats, the
 * strike — are pinned in `instar.test.ts`. What is new here is the other kind
 * of answer: a SHOOT, SHIELD or SUCK mark counted by the press the panel
 * already sends, in the column the mark stands over, and nothing else about
 * the press judged (`scene-panel.ts`). And that a panel mark, which nobody
 * can hold, never slips while a thumb's partner mark is still being worked.
 */

const CFG: SimConfig = { ...DEFAULT_CONFIG };
const TPB = ticksPerBeat(CFG);
const MORPH = 2;
const WINDOW = 8;

function mark(gesture: SceneMark["gesture"], xMilli: number, need = 1) {
  const seat = gesture === "tap" ? ("p2" as const) : ("both" as const);
  return { seat, part: "core" as const, gesture, xMilli, yMilli: 400, need };
}

function scripted(...marks: ReturnType<typeof mark>[]): NettleStep {
  return {
    pose: "core",
    arrive: "stay",
    morphBeats: MORPH,
    windowBeats: WINDOW,
    landBeats: 2,
    marks,
  };
}

function install(steps: NettleStep[]): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "nettle", steps });
  return world;
}

function nettle(world: World): NettleState {
  const s = sceneBoss(world);
  if (s?.kind !== "nettle") throw new Error("the wave installed no nettle");
  return s;
}

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

/** One press now, and the beat after it run out. */
function press(world: World, player: 1 | 2, command: Command, beats = 0): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1 + beats * TPB, [{ tick: t, player, command }]);
}

const shown = (world: World) => runTo(world, TPB * MORPH + 1);
const colOf = (xMilli: number) => instarMarkCol(CFG, mark("shoot", xMilli));

describe("THE NETTLE comes in", () => {
  it("as a scene of its own kind, morphing with the marks hidden", () => {
    const world = install([scripted(mark("shoot", 318))]);
    const s = nettle(world);
    expect(s.phase).toBe("morph");
    expect(world.events.some((e) => e.type === "instarMorph" && e.pose === "core")).toBe(true);
    shown(world);
    expect(s.phase).toBe("act");
  });
});

describe("a SHOOT mark", () => {
  it("counts a bolt out of the top of its own column, and not one out of another", () => {
    const world = install([scripted(mark("shoot", 318, 2), mark("shoot", 681, 2))]);
    const s = nettle(world);
    shown(world);
    press(world, 1, { kind: "cannonCol", col: colOf(681) });
    press(world, 2, { kind: "fire", color: "red" }, 2);
    expect(s.progress).toEqual([0, 1]);
    press(world, 1, { kind: "cannonCol", col: colOf(318) });
    press(world, 2, { kind: "fire", color: "cyan" }, 2);
    expect(s.progress).toEqual([1, 1]);
  });
});

describe("a SHIELD mark", () => {
  it("counts the guard pressed with the shield under it, one mark a press", () => {
    const world = install([
      scripted(mark("shield", 227), mark("shield", 227), mark("shield", 772)),
    ]);
    const s = nettle(world);
    shown(world);
    press(world, 1, { kind: "guard" });
    expect(s.progress).toEqual([0, 0, 0]);
    press(world, 2, { kind: "shieldCol", col: colOf(227) });
    press(world, 1, { kind: "guard" });
    expect(instarMarkDone(s, 0)).toBe(true);
    expect(instarMarkDone(s, 1)).toBe(false);
    press(world, 1, { kind: "guard" });
    expect(instarMarkDone(s, 1)).toBe(true);
    press(world, 2, { kind: "shieldCol", col: colOf(772) });
    const seen = press(world, 1, { kind: "guard" });
    expect(seen.has("instarLand")).toBe(true);
  });
});

describe("a SUCK mark", () => {
  it("counts the maw opened with the cannon under it, and waits for its partner without slipping", () => {
    const world = install([scripted(mark("tap", 600, 1), mark("suck", 772))]);
    const s = nettle(world);
    shown(world);
    press(world, 1, { kind: "intake" });
    expect(instarMarkDone(s, 1)).toBe(false);
    press(world, 1, { kind: "cannonCol", col: colOf(772) });
    press(world, 1, { kind: "intake" });
    expect(instarMarkDone(s, 1)).toBe(true);
    const seen = runTo(world, world.tick + TPB * (CFG.instarTogetherBeats + 2));
    expect(seen.has("instarSlip")).toBe(false);
    expect(instarMarkDone(s, 1)).toBe(true);
    const t = world.tick;
    const drag = (on: boolean): TimedCommand => ({
      tick: t,
      player: 2,
      command: { kind: "drag", target: "instarMark", on, fromMilli: -1, fromYMilli: 0, id: 0 },
    });
    expect(runTo(world, t + 1, [drag(true), drag(false)]).has("instarLand")).toBe(true);
  });

  it("is not a thumb: a drag on it moves nothing", () => {
    const world = install([scripted(mark("suck", 500))]);
    const s = nettle(world);
    shown(world);
    const t = world.tick;
    runTo(world, t + 1, [
      {
        tick: t,
        player: 1,
        command: {
          kind: "drag",
          target: "instarMark",
          on: true,
          fromMilli: -1,
          fromYMilli: 0,
          id: 0,
        },
      },
    ]);
    expect(s.progress).toEqual([0]);
  });
});

describe("a panel mark left undone", () => {
  it("strikes the hull when its window closes, which is the wave", () => {
    const world = install([scripted(mark("shoot", 500))]);
    shown(world);
    const seen = runTo(world, world.tick + TPB * (WINDOW + 1));
    expect(seen.has("instarStrike")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });
});

describe("the fingerprint", () => {
  it("is the same for the same presses, and moves with a panel mark's count", () => {
    const play = (fire: boolean) => {
      const world = install([scripted(mark("shoot", 500, 2))]);
      shown(world);
      press(world, 1, { kind: "cannonCol", col: colOf(500) });
      if (fire) press(world, 2, { kind: "fire", color: "red" }, 2);
      else runTo(world, world.tick + 1 + 2 * TPB);
      return hashWorld(world);
    };
    expect(play(true)).toBe(play(true));
    expect(play(true)).not.toBe(play(false));
  });
});
