import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, WARDEN_PHASES, type World } from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import type { ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE WARDEN's hatch is a track that fills before the lift**
 * (`warden-track.ts`): under GLARE the carry the thumb has made is drawn green
 * along the bar on both screens, the rim goes green once the lift would
 * throw, and the navigator's copy wears the partner's clock.
 */

beforeAll(installCanvasGlobals);

const GLARE = WARDEN_PHASES[1]!.above;

function carried(milli: number): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("warden");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "warden") throw new Error("the warden's wave installed no warden");
  b.plates = GLARE;
  b.hatchCarryMilli = milli;
  return world;
}

function drawn(role: ViewRole, world: World): string {
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (_tick, w) => {
      step(w, []);
    },
  });
  return log.join("|");
}

const count = (text: string, colour: string): number => text.split(colour).length - 1;

describe("THE WARDEN's hatch track", () => {
  it.each(ROLES)("fills green with the carry, and not before it, on %s", (role) => {
    const none = count(drawn(role, carried(0)), PALETTE.good);
    const some = count(drawn(role, carried((CFG.wardenThrowMilli * 3) / 4)), PALETTE.good);
    const full = count(drawn(role, carried(-CFG.wardenThrowMilli)), PALETTE.good);
    expect(none).toBe(0);
    expect(some).toBeGreaterThan(0);
    // The whole way: the rim goes green as well as the fill.
    expect(full).toBeGreaterThan(some);
  });

  it("wears the partner's ring and clock on the navigator's screen alone", () => {
    const theirs = rgba(PALETTE.text, 0.8);
    const world = () => carried(CFG.wardenThrowMilli / 2);
    expect(count(drawn("p2", world()), theirs)).toBeGreaterThan(0);
    expect(count(drawn("p1", world()), theirs)).toBe(0);
    expect(count(drawn("test", world()), theirs)).toBe(0);
  });
});
