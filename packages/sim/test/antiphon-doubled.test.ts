import { describe, expect, it } from "bun:test";
import {
  type AntiphonState,
  antiphonBoss,
  antiphonGrown,
  antiphonIsOrgan,
  antiphonSinkBeat,
} from "../src/antiphon.js";
import { antiphonStruck } from "../src/antiphon-shot.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  slowing,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE ANTIPHON doubled (`docs/spec/choreographed-windows.md`, 24 September
 * 2026): the window 28 beats and the tight one 16, the pull carried 800
 * thousandths of a tile — and **THE SLOW over the window exactly**, opened on
 * the beat the organ has pushed all the way out and shut by every way the
 * cycle ends (`antiphon-step.ts`). The fight is `antiphon.test.ts` and the
 * pull `antiphon-pull.test.ts`.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, 6, [], [], { kind: "antiphon" });
  return world;
}

function body(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

/** Run until the standing organ has grown all the way out. */
function grown(world: World): AntiphonState {
  const s = body(world);
  for (let n = 0; n < 40 * TPB; n++) {
    const o = s.organs[0];
    if (o !== undefined && antiphonGrown(o, CFG, world.beat)) return s;
    step(world, []);
  }
  throw new Error("nothing grew");
}

function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

describe("THE ANTIPHON, doubled", () => {
  it("stands an organ twenty-eight beats, and sixteen once the rail is tight", () => {
    expect(CFG.antiphonWindowBeats).toBe(28);
    expect(CFG.antiphonTightWindowBeats).toBe(16);
    expect(CFG.antiphonPullMilli).toBe(800);
  });

  it("asks nothing slowly while the organ is still pushing out", () => {
    const world = open();
    const s = body(world);
    while (s.organs.length === 0) step(world, []);
    expect(slowing(world)).toBe(false);
  });

  it("slows the window for exactly its beats from the beat the organ stands", () => {
    const world = open();
    const s = grown(world);
    expect(slowing(world)).toBe(true);
    expect(world.slowFromBeat).toBe(world.beat);
    expect(world.slowToBeat).toBe(antiphonSinkBeat(s, CFG));
  });

  it("shuts THE SLOW the tick the organ is shot to a pit", () => {
    const world = open();
    const s = grown(world);
    const o = s.organs[0];
    if (o === undefined) throw new Error("no organ");
    antiphonStruck(world, shot(world, o.col, o.color));
    expect(s.pits).toHaveLength(1);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW the tick a decoy hardens the cycle", () => {
    const world = open();
    const s = grown(world);
    const d = s.rail.find((c) => !antiphonIsOrgan(s, c));
    if (d === undefined) throw new Error("no decoy");
    antiphonStruck(world, shot(world, d.col, d.color));
    expect(s.organs).toHaveLength(0);
    expect(slowing(world)).toBe(false);
  });

  it("shuts THE SLOW with a window that ran out, the organ sunk", () => {
    const world = open();
    const s = grown(world);
    const end = antiphonSinkBeat(s, CFG);
    while (world.beat < end) step(world, []);
    expect(s.organs).toHaveLength(0);
    expect(slowing(world)).toBe(false);
  });
});
