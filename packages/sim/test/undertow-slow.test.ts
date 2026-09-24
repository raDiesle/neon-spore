import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type UndertowState,
  undertowBoss,
  undertowLastCol,
  undertowUnseated,
  type World,
} from "../src/index.js";

/**
 * THE UNDERTOW doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): **the floor under the cannon follows a slide short of the last**,
 * and **THE SLOW spans every ask exactly** — a lobe standing, the floor
 * under the cannon, the last lobe — shut the moment it is answered or missed
 * (`undertow-slow.ts`). `undertow.test.ts` is the fight itself.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, 6, [], [], { kind: "undertow" });
  return world;
}

function floor(world: World): UndertowState {
  const u = undertowBoss(world);
  if (u === null) throw new Error("no floor installed");
  return u;
}

function cmd(world: World, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player: 1, command };
}

function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

function maw(world: World, col: number): void {
  step(world, [cmd(world, { kind: "cannonCol", col }), cmd(world, { kind: "intake" })]);
}

/** Run until a breach is in the stage asked, or give up. */
function until(world: World, stage: "bowing" | "standing"): number {
  for (let i = 0; i < 60 * TPB; i++) {
    const b = floor(world).breaches.find((x) => x.stage === stage);
    if (b) return b.col;
    step(world, []);
  }
  throw new Error(`nothing ever ${stage}`);
}

/** Every ordinary lobe taken as it stands, until the phase changes. */
function takeAll(world: World, phase: UndertowState["phase"]): void {
  for (let i = 0; i < 600 * TPB && floor(world).phase !== phase; i++) {
    const b = floor(world).breaches.find((x) => x.stage === "standing" && !x.tall);
    if (b) maw(world, b.col);
    else step(world, []);
  }
}

describe("THE UNDERTOW, doubled", () => {
  it("asks nothing slowly while an ordinary push only bows", () => {
    const world = open();
    until(world, "bowing");
    expect(slowing(world)).toBe(false);
  });

  it("slows a standing lobe, and shuts the moment the maw takes it", () => {
    const world = open();
    const col = until(world, "standing");
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(world.beat + CFG.undertowStandBeats);
    maw(world, col);
    expect(floor(world).breaches).toHaveLength(0);
    expect(slowing(world)).toBe(false);
  });

  it("follows the cannon a slide short of the last, and unseats a pilot who stops there", () => {
    const world = open();
    takeAll(world, "seat");
    const col = until(world, "bowing");
    expect(col).toBe(world.cannonCol);
    expect(slowing(world)).toBe(true);
    const to = col === 0 ? 1 : col - 1;
    step(world, [cmd(world, { kind: "cannonCol", col: to })]);
    expect(beats(world, 1).has("undertowBow")).toBe(true);
    const u = floor(world);
    expect(u.breaches[0]?.col).toBe(to);
    expect(u.slid).toBe(1);
    expect(slowing(world)).toBe(true);
    expect(beats(world, CFG.undertowUnseatBeats).has("undertowUnseated")).toBe(true);
    expect(undertowUnseated(u, world.beat)).toBe(true);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW on the beat after the last slide off", () => {
    const world = open();
    takeAll(world, "seat");
    const col = until(world, "bowing");
    const to = col === 0 ? 1 : col - 1;
    step(world, [cmd(world, { kind: "cannonCol", col: to })]);
    beats(world, 1);
    step(world, [cmd(world, { kind: "cannonCol", col: to === 0 ? 1 : to - 1 })]);
    beats(world, 1);
    expect(floor(world).breaches).toHaveLength(1);
    expect(slowing(world)).toBe(false);
  });

  it("slows the last lobe for its whole stand, and the body passing for its own", () => {
    const world = open();
    takeAll(world, "last");
    const mid = undertowLastCol(CFG);
    until(world, "standing");
    expect(slowing(world)).toBe(true);
    expect(world.slowToBeat).toBe(world.beat + CFG.undertowLastBeats);
    const u = floor(world);
    for (let i = 0; i < (CFG.undertowHoldBeats + 2) * TPB && u.phase === "last"; i++)
      maw(world, mid);
    expect(u.phase).toBe("taken");
    expect(world.slowToBeat).toBe(world.beat + CFG.undertowSlowBeats);
  });

  it("shuts THE SLOW when the last lobe comes through", () => {
    const world = open();
    takeAll(world, "last");
    until(world, "standing");
    expect(beats(world, CFG.undertowLastBeats + 1).has("undertowThrough")).toBe(true);
    expect(slowing(world)).toBe(false);
  });
});
