import { describe, expect, it } from "bun:test";
import { gorgeAsks, gorgeHeard, gorgeOffers } from "../src/gorge-hand.js";
import { gorgeStruck } from "../src/gorge-step.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeState,
  gorgeBoss,
  type SimConfig,
  startWave,
  type World,
} from "../src/index.js";
import type { Bullet } from "../src/types.js";

/**
 * **Which of THE GORGE's rings ask a seat for a thumb** (`gorge-hand.ts`
 * `gorgeOffers`, `gorgeAsks`): the rings the picture draws, the ones that
 * still ask, and that the press is gated on the asking and nothing else — so
 * the halo the picture draws and the thumb the sack hears are one question.
 */

const CFG: SimConfig = DEFAULT_CONFIG;

function open(): World {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "gorge" });
  return world;
}

function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("no sack installed");
  return g;
}

function shot(world: World, col: number): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color: "red",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

function fill(world: World, i: number): void {
  for (let n = 0; n < CFG.gorgeFullBeads; n++) gorgeStruck(world, shot(world, sack(world).col + i));
}

function lobe(world: World, player: 1 | 2, id: number, on: boolean): void {
  gorgeHeard(world, player, {
    kind: "drag",
    target: "gorgeLobe",
    on,
    fromMilli: 0,
    fromYMilli: 0,
    id,
  });
}

describe("THE GORGE's rings asking", () => {
  it("offers the pilot every full intake, and asks only while none is pinched", () => {
    const world = open();
    const g = sack(world);
    expect(gorgeOffers(g, CFG, 1)).toEqual([]);
    fill(world, 1);
    fill(world, 4);
    expect(gorgeOffers(g, CFG, 1)).toEqual([1, 4]);
    expect(gorgeAsks(g, CFG, 1)).toEqual([1, 4]);
    lobe(world, 1, 4, true);
    expect(g.pinch).toBe(4);
    expect(gorgeOffers(g, CFG, 1)).toEqual([1, 4]);
    expect(gorgeAsks(g, CFG, 1)).toEqual([]);
    lobe(world, 1, 1, true);
    expect(g.pinch).toBe(4);
  });

  it("offers the navigator the mouth alone, and asks until her thumb is on it", () => {
    const world = open();
    const g = sack(world);
    fill(world, 2);
    expect(gorgeOffers(g, CFG, 2)).toEqual([]);
    g.mouth = 2;
    expect(gorgeOffers(g, CFG, 2)).toEqual([2]);
    expect(gorgeAsks(g, CFG, 1)).toEqual([]);
    expect(gorgeAsks(g, CFG, 2)).toEqual([2]);
    lobe(world, 2, 1, true);
    expect(g.pry).toBe(-1);
    lobe(world, 2, 2, true);
    expect(g.pry).toBe(2);
    expect(gorgeAsks(g, CFG, 2)).toEqual([]);
    lobe(world, 2, 2, false);
    expect(gorgeAsks(g, CFG, 2)).toEqual([2]);
  });

  it("asks nobody once the sack is out", () => {
    const world = open();
    const g = sack(world);
    fill(world, 0);
    g.mouth = 3;
    g.outBeat = world.beat;
    expect(gorgeOffers(g, CFG, 1)).toEqual([]);
    expect(gorgeOffers(g, CFG, 2)).toEqual([]);
    lobe(world, 1, 0, true);
    expect(g.pinch).toBe(-1);
  });
});
