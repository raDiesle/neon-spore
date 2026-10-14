import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { type LampreyState, type LampreyStep, lampreyBoss } from "../src/lamprey.js";
import { lampreyStruck } from "../src/lamprey-shot.js";
import type { Bullet, Color } from "../src/types.js";
import { MILLI } from "../src/world.js";

/**
 * **THE LAMPREY's head is armour wherever it stands** (`lamprey-shot.ts`): a
 * bolt up its column while the gullet is shut — recoiling from a hit, bitten
 * into a tile — bursts on the head, costs nothing, and on HARD is not a
 * wasted shot. The owner's complaint of 10 October 2026 was the second bolt of
 * a double tap, drawn flying through the recoiling head to the top.
 */

const CFG = { ...DEFAULT_CONFIG, wastedShotFails: true };
const TPB = ticksPerBeat(CFG);

const GULLET: LampreyStep = {
  ask: "gullet",
  holder: 1,
  teeth: 0,
  jump: 1,
  beats: 12,
  color: "red",
};
const PULL: LampreyStep = { ask: "pull", holder: 2, teeth: 0, jump: 2, beats: 12, color: "either" };

function install(steps: readonly LampreyStep[]): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "lamprey", steps });
  return world;
}

function eel(world: World): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the wave installed no lamprey");
  return s;
}

function until(world: World, done: (s: LampreyState) => boolean): void {
  const end = world.tick + TPB * 80;
  while (!done(eel(world))) {
    if (world.tick >= end) throw new Error("the lamprey never got there");
    step(world, []);
  }
}

function bolt(color: Color, col: number, row: number): Bullet {
  return { id: 999, col, row, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** The bolt's `shotOut`, flown from `row` up `col` until it is off the field. */
function fly(world: World, col: number, row: number): Extract<SimEvent, { type: "shotOut" }> {
  world.bullets.push(bolt("cyan", col, row));
  for (let n = 0; n < TPB * 2; n++) {
    step(world, []);
    const out = world.events.find((e) => e.type === "shotOut");
    if (out?.type === "shotOut") return out;
  }
  throw new Error("the bolt never left the field");
}

describe("THE LAMPREY's head as armour", () => {
  it("stops the second bolt of a double tap on the recoiling head, and wastes nothing", () => {
    const world = install([GULLET, PULL]);
    until(world, (s) => s.phase === "rearing");
    const s = eel(world);
    expect(lampreyStruck(world, bolt("red", s.col, 20))).toBe(true);
    expect(s.phase).toBe("recoil");
    const out = fly(world, s.col, s.row + 3);
    expect(out.atMilli, "flew through the head to the top").toBeGreaterThan(0);
    // Met at or past the top of the jerk, never short of where it is drawn.
    expect(out.atMilli).toBeLessThanOrEqual(s.row * MILLI - CFG.lampreyRecoilLiftMilli);
    expect(out.wasted).toBe(false);
    expect(s.hits).toBe(1);
    expect(world.failTick).toBe(-1);
  });

  it("stops a bolt on the head bitten into a tile, and lets one by in the next column", () => {
    const world = install([PULL, GULLET]);
    until(world, (s) => s.phase === "bite");
    const s = eel(world);
    const met = fly(world, s.col, s.row + 3);
    expect(met.atMilli).toBeGreaterThan(0);
    expect(met.atMilli).toBeLessThanOrEqual(s.row * MILLI);
    expect(met.wasted).toBe(false);
    const by = s.col === 0 ? 1 : s.col - 1;
    expect(fly(world, by, s.row + 3).atMilli, "a column the head is not in").toBeLessThan(0);
  });
});
