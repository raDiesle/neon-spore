import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type UndertowLobe,
  type UndertowState,
  undertowBoss,
  undertowLevelLeft,
  undertowLobeAt,
  undertowPlateBeside,
  type World,
} from "../src/index.js";

/**
 * THE UNDERTOW, and the sentence it is built to make true: **the attack
 * comes up through the floor, and its colour says who answers it** — the maw
 * with the cannon under a yellow lobe, the shield raised under a cyan one.
 *
 * What is checked is each answer and each miss, on the rework of 1 October
 * 2026: a lobe taken by the control its colour names and by no other, a lobe
 * left standing growing tall, a tap putting it back, a tall one left alone
 * bursting through the hull and losing the wave, and the three levels that
 * each end on a clock rather than a count.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

function open(seed = 3, cfg: SimConfig = CFG): World {
  const world = createWorld(cfg, seed);
  startWave(world, WAVE, [], [], { kind: "undertow" });
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/** Run `n` beats, and say which events went by. */
function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Run until a lobe stands somewhere, or give up. */
function untilLobe(world: World, cap = 40): UndertowLobe {
  for (let i = 0; i < cap * TPB; i++) {
    const l = floor(world).lobes.find((x) => x.stage === "standing");
    if (l) return l;
    step(world, []);
  }
  throw new Error("no lobe ever stood");
}

/** Player 1's cannon under the column with the maw open: one tick. */
function maw(world: World, col: number): void {
  step(world, [cmd(world, 1, { kind: "cannonCol", col }), cmd(world, 1, { kind: "intake" })]);
}

/** Player 2's shield under the column and player 1 raising it: one tick. */
function shield(world: World, col: number): void {
  step(world, [cmd(world, 2, { kind: "shieldCol", col }), cmd(world, 1, { kind: "guard" })]);
}

/** Either seat's thumb on a lobe: the press. */
function tap(world: World, col: number): void {
  step(world, [
    cmd(world, 2, { kind: "drag", target: "undertowTap", on: true, fromMilli: 0, id: col }),
  ]);
}

/** Every lobe answered by its own colour as it stands, until the level changes. */
function answerAll(world: World, until: UndertowState["phase"]): void {
  for (let i = 0; i < 400 * TPB && floor(world).phase !== until; i++) {
    const l = floor(world).lobes.find((x) => x.stage === "standing");
    if (l === undefined) step(world, []);
    else if (l.answer === "maw") maw(world, l.col);
    else shield(world, l.col);
  }
}

describe("THE UNDERTOW", () => {
  it("opens quiet, then bows one column and stands a lobe in it after the bow", () => {
    const world = open();
    const u = floor(world);
    expect(u.phase).toBe("one");
    expect(u.lobes).toHaveLength(0);
    expect(beats(world, CFG.undertowRestBeats + 1).has("undertowBow")).toBe(true);
    expect(u.lobes).toHaveLength(1);
    expect(u.lobes[0]?.stage).toBe("bowing");
    const bowed = u.lobes[0]?.stageBeat ?? 0;
    const l = untilLobe(world);
    expect(world.beat - bowed).toBe(CFG.undertowBowBeats);
    expect(undertowLobeAt(u, l.col)).toBe(l);
    expect(world.events.some((e) => e.type === "undertowLobe")).toBe(true);
  });

  it("takes a yellow lobe with the maw open over it, and not with the shield", () => {
    const world = open();
    const l = untilLobe(world);
    l.answer = "maw";
    shield(world, l.col);
    expect(floor(world).lobes).toHaveLength(1);
    maw(world, l.col);
    const u = floor(world);
    expect(u.lobes).toHaveLength(0);
    expect(u.taken).toBe(1);
    expect(world.scars).toHaveLength(0);
    expect(world.events.some((e) => e.type === "undertowTaken")).toBe(true);
  });

  it("takes a cyan lobe with the shield raised under it, and not with the maw", () => {
    const world = open();
    const l = untilLobe(world);
    l.answer = "shield";
    maw(world, l.col);
    expect(floor(world).lobes).toHaveLength(1);
    shield(world, l.col);
    expect(floor(world).lobes).toHaveLength(0);
    expect(floor(world).taken).toBe(1);
  });

  it("does not take a lobe from the next column over", () => {
    const world = open();
    const l = untilLobe(world);
    l.answer = "maw";
    maw(world, l.col === 0 ? 1 : l.col - 1);
    expect(floor(world).lobes).toHaveLength(1);
  });

  it("leaves both seats free to move while a lobe is up", () => {
    const world = open();
    const l = untilLobe(world);
    const to = l.col === 0 ? 1 : 0;
    step(world, [
      cmd(world, 1, { kind: "cannonCol", col: to }),
      cmd(world, 2, { kind: "shieldCol", col: to }),
    ]);
    expect(world.cannonCol).toBe(to);
    expect(world.shieldCol).toBe(to);
  });

  it("grows a lobe left standing, and the colour no longer takes it", () => {
    const world = open();
    const l = untilLobe(world);
    l.answer = "maw";
    expect(beats(world, CFG.undertowStandBeats).has("undertowGrow")).toBe(true);
    expect(l.stage).toBe("tall");
    maw(world, l.col);
    expect(floor(world).lobes).toHaveLength(1);
  });

  it("shrinks a tall lobe back to standing on a tap, with its stand begun again", () => {
    const world = open();
    const l = untilLobe(world);
    beats(world, CFG.undertowStandBeats);
    expect(l.stage).toBe("tall");
    tap(world, l.col);
    expect(l.stage).toBe("standing");
    expect(l.stageBeat).toBe(world.beat);
    expect(l.tapped).toBe(true);
    expect(world.events.some((e) => e.type === "undertowTapped")).toBe(true);
    // A standing lobe is the colour's: a tap on it is nothing.
    tap(world, l.col);
    expect(world.events.some((e) => e.type === "undertowTapped")).toBe(false);
  });

  it("bursts a tall lobe nobody tapped: a hole two plates wide, and the wave lost", () => {
    const world = open();
    const l = untilLobe(world);
    beats(world, CFG.undertowStandBeats);
    const seen = beats(world, CFG.undertowTallBeats + 1);
    expect(seen.has("undertowBurst")).toBe(true);
    expect(seen.has("waveFailed")).toBe(true);
    const plates = world.scars.filter((s) => s.plate === true).map((s) => s.col);
    expect(plates.sort()).toEqual([l.col, undertowPlateBeside(CFG, l.col)].sort());
  });

  it("ends a level on its clock and draws the lobes still up back in", () => {
    const world = open();
    const u = floor(world);
    expect(undertowLevelLeft(CFG, u, world.beat)).toBe(CFG.undertowLevelBeats);
    let ebbed = false;
    for (let i = 0; i < (CFG.undertowLevelBeats + 1) * TPB && !ebbed; i++) {
      const l = u.lobes.find((x) => x.stage === "standing");
      if (l === undefined) step(world, []);
      else if (l.answer === "maw") maw(world, l.col);
      else shield(world, l.col);
      ebbed = world.events.some((e) => e.type === "undertowEbb");
    }
    expect(ebbed).toBe(true);
    expect(undertowLevelLeft(CFG, u, world.beat)).toBe(0);
    beats(world, CFG.undertowEbbBeats + 1);
    expect(u.phase).toBe("two");
    expect(u.lobes.length).toBeLessThanOrEqual(1);
  });

  it("stands two lobes at once in the second level", () => {
    const world = open();
    answerAll(world, "two");
    let most = 0;
    for (let i = 0; i < 20 * TPB; i++) {
      step(world, []);
      most = Math.max(most, floor(world).lobes.length);
    }
    expect(most).toBe(CFG.undertowTwoLobes);
  });

  it("is gone after the third level, and holds the wave open until then", () => {
    const world = open();
    beats(world, 1);
    expect(world.events.some((e) => e.type === "needWave")).toBe(false);
    answerAll(world, "three");
    for (let i = 0; i < 400 * TPB && world.boss !== null; i++) {
      const l = floor(world).lobes.find((x) => x.stage === "standing");
      if (l === undefined) step(world, []);
      else if (l.answer === "maw") maw(world, l.col);
      else shield(world, l.col);
    }
    expect(world.boss).toBeNull();
    expect(world.scars).toHaveLength(0);
  });

  it("fingerprints the same run the same way twice", () => {
    const run = (): number => {
      const world = open(11);
      const l = untilLobe(world);
      maw(world, l.col);
      beats(world, 3);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
