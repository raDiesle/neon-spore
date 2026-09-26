import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { PALETTE } from "../src/palette.js";
import { VerdictFx } from "../src/simon-verdict.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * The blows `boss-hurt.test.ts`'s table cannot hold, because no event deals
 * them at once. THE MAZE's is timed by the right verdict on the picture, as
 * its wound is (`maze-heart.ts`); THE MIRROR's does have an event, but it
 * lands half a second after it, with the first glyph thrown into the copy
 * (`simon-verdict.ts`). The cases here change the world, or wait, rather than
 * push a landing and look at once. THE VANE's was here, watched as a pin
 * fewer than last frame, until its knock became an event (`vaneKnock`) and a
 * row of that table.
 */

beforeAll(installCanvasGlobals);

describe("THE MAZE's blow", () => {
  it("washes the heart red while a right verdict's wound shows, and not after", () => {
    const rims = (fresh: boolean): number => {
      const world = fourBeatsIn("maze");
      const m = world.boss;
      if (m?.kind !== "maze") throw new Error("the maze wave hung no drum");
      // A cyan heart, so the only red rim on it is the blow's.
      m.round = 1;
      // The same verdict both times, and only the wound's age differs: two
      // beats on it is over (`maze-pulse.ts`).
      m.phase = "verdict";
      m.verdict = 1;
      m.phaseBeat = world.beat - (fresh ? 0 : 2);
      const log: string[] = [];
      runFrames(world, "p1", 3, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: () => {},
      });
      return log.join("|").split(PALETTE.redRim).length;
    };
    expect(rims(true)).toBeGreaterThan(rims(false));
  });
});

describe("THE MIRROR's blow", () => {
  it("lands with the first glyph of a right sequence, never a wrong one, and is forgotten on clear", () => {
    const flights = [{ step: "fireRed" as const, x: 0, r: 1 }];
    const fx = new VerdictFx();
    fx.start(flights, false, "step", 0, 100);
    for (let i = 0; i < 60; i++) fx.update(1 / 60);
    expect(fx.hurt.value).toBe(0);
    fx.start(flights, true, "step", 100, 0);
    for (let i = 0; i < 29; i++) fx.update(1 / 60);
    expect(fx.hurt.value).toBe(0);
    for (let i = 0; i < 2; i++) fx.update(1 / 60);
    expect(fx.hurt.value).toBeGreaterThan(0.9);
    fx.clear();
    expect(fx.hurt.value).toBe(0);
  });

  it("washes the copy red on the frames after a right sequence arrives", () => {
    const rims = (dealt: boolean): number => {
      const off = dealt ? null : spyOn(BossHurt.prototype, "hit").mockImplementation(() => {});
      const log: string[] = [];
      runFrames(fourBeatsIn("mirror"), "p1", 84, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 0)
            w.events.push({ type: "mirrorVerdict", right: true, col: 3, reason: "step" });
        },
      });
      off?.mockRestore();
      return log.join("|").split(PALETTE.redRim).length;
    };
    expect(rims(true)).toBeGreaterThan(rims(false));
  });
});

function fourBeatsIn(boss: "maze" | "mirror"): World {
  const world = createWorld(CFG, 3);
  const index = waveWith(boss);
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  if (world.boss?.kind !== boss) throw new Error(`the ${boss} wave installed no boss`);
  return world;
}
