import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { pinMouthHalfWidth, pinMouthShown } from "../src/pinball-mouth.js";
import { pinTable } from "../src/pinball-table.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **While the ball is up, the cannon is a funnel** — the owner, 1 October 2026
 * (`src/pinball-mouth.ts`). What has to hold: it opens for a flight and for
 * nothing else, its rim is exactly as wide as the catch, and a flight draws on
 * both seats.
 */

beforeAll(installCanvasGlobals);

function playing(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * ticksPerBeat(CFG); i++) {
    if (pinballRound(world)?.phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never reached play");
}

function round(world: World): PinballState {
  const state = pinballRound(world);
  if (state === null) throw new Error("PINBALL's wave installed no round");
  return state;
}

describe("PINBALL's funnel", () => {
  it("opens for a ball in the air, in play, and for nothing else", () => {
    const boss = round(playing());
    for (const shot of ["aim", "power", "flight"] as const) {
      boss.shot = shot;
      expect(pinMouthShown(boss)).toBe(shot === "flight");
    }
    boss.phase = "verdict";
    expect(pinMouthShown(boss)).toBe(false);
  });

  it("is as wide as the catch, either side of the mouth", () => {
    const table = pinTable(computeLayout(VIEWPORT, CFG, "p1"), CFG);
    const reach = (CFG.pinballCatchReachMilli / 1000) * table.tile;
    expect(pinMouthHalfWidth(table, CFG)).toBeCloseTo(reach, 6);
  });

  it("draws through a flight, on either seat", () => {
    for (const seat of ["p1", "p2"] as const) {
      const world = playing();
      const boss = round(world);
      runFrames(world, seat, 3, {
        every: 1,
        onTick: () => {
          boss.shot = "flight";
        },
      });
      expect(pinMouthShown(boss)).toBe(true);
    }
  });
});
