import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  tasterPhase,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { PALETTE } from "../src/palette.js";
import { PRY_PAST, pryLean, tasterPryOpen } from "../src/taster-pry.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

/**
 * **THE TASTER's SLOW, on the fan** (`taster-pry.ts`): the interlock parts
 * under the pilot's haul, springs open when it gives, and closes over THE
 * SLOW's window until it crosses again as the window shuts — with the gap the
 * beams go up lit while it stands open.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);

/** The fan down to its interlock: every blade but the last two struck off, those two set. */
function closed(): { world: World; t: TasterState } {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  const keep = t.blades.length - CFG.tasterClosedBlades;
  t.blades.forEach((k, i) => {
    k.shorn = i < keep;
    k.growBeat = 0;
    k.setBeat = i < keep ? -1 : 0;
    k.edge = i < keep ? null : "red";
    k.layers = i < keep ? 0 : 1;
  });
  t.shorn = keep;
  expect(tasterPhase(t, CFG)).toBe("closed");
  return { world, t };
}

/** Pried on this beat, with THE SLOW opened over it as `pry` opens it. */
function pried(): { world: World; t: TasterState } {
  const { world, t } = closed();
  t.pryBeat = world.beat;
  // The window `pry` opens (`sim/slow.ts` `openSlow`), its fields set as it sets them.
  world.slowFromBeat = world.beat;
  world.slowAskBeat = world.beat;
  world.slowToBeat = world.beat + CFG.tasterPryBeats;
  return { world, t };
}

describe("THE TASTER's interlock under the pry", () => {
  it("stands crossed while nobody hauls it", () => {
    const { world, t } = closed();
    expect(tasterPryOpen(world, t, 0.5)).toBe(0);
  });

  it("parts a little under the pilot's carry, before it gives", () => {
    const { world, t } = closed();
    t.pryMilli = Math.round(CFG.tasterPryMilli / 2);
    const half = tasterPryOpen(world, t, 0);
    expect(half).toBeGreaterThan(0);
    t.pryMilli = CFG.tasterPryMilli;
    expect(tasterPryOpen(world, t, 0)).toBeGreaterThan(half);
  });

  it("springs open when it gives, then closes over the window until it crosses again", () => {
    const { world, t } = pried();
    const opened = tasterPryOpen(world, t, 0.6);
    expect(opened).toBeGreaterThan(0.8);
    world.beat += CFG.tasterPryBeats / 2;
    const half = tasterPryOpen(world, t, 0);
    expect(half).toBeLessThan(opened);
    expect(half).toBeGreaterThan(0.3);
    world.beat = t.pryBeat + CFG.tasterPryBeats - 1;
    expect(tasterPryOpen(world, t, 0.99)).toBeLessThan(0.05);
  });

  it("reads THE SLOW's own window, so a window the beams shut early shuts the fan with it", () => {
    const { world, t } = pried();
    world.beat += 2;
    const running = tasterPryOpen(world, t, 0);
    // The last beam: `closeSlow` brings the window's end back to now.
    world.slowToBeat = world.beat;
    expect(tasterPryOpen(world, t, 0)).toBeLessThan(running);
  });

  it("is nothing outside the closed fan", () => {
    const { world, t } = pried();
    t.outBeat = world.beat;
    expect(tasterPryOpen(world, t, 0.5)).toBe(0);
  });

  it("leans a crossed blade back past upright, the far way, as it opens", () => {
    expect(pryLean(1, 0.55, 0)).toBeCloseTo(0.55, 9);
    expect(pryLean(1, 0.55, 1)).toBeCloseTo(-PRY_PAST, 9);
    expect(pryLean(-1, 0.55, 1)).toBeCloseTo(PRY_PAST, 9);
    expect(pryLean(0, 0.55, 1)).toBeCloseTo(0, 9);
  });

  it.each(ROLES)("lights the gap the beams go up while it stands pried, on %s", (role) => {
    const lit = (world: World) => {
      const log: string[] = [];
      runFrames(world, role, 3, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
      });
      return log.join("|").split(`strokeStyle=${PALETTE.text}`).length - 1;
    };
    expect(lit(pried().world)).toBeGreaterThan(lit(closed().world));
  });
});
