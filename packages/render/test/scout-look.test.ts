import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  enterScoutPhase,
  type ScoutState,
  scoutCurrent,
  scoutRound,
  startWave,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { scoutGlimpse } from "../src/scout-look.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * THE SCOUT's moments (`scout-look.ts`), each proved by what taking it off
 * the round costs the frame: the launch rings, the suck, the pilot's glimpse
 * of the arena, the catcher shown to both, the clock, and no words over the
 * arena while it is flown.
 */

function flying(): { world: World; r: ScoutState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("scout");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const r = scoutRound(world);
  if (r === null) throw new Error("THE SCOUT is not on the world");
  enterScoutPhase(r, "play", world.beat);
  r.arenaBeat = world.beat;
  r.arenaTick = world.tick;
  r.launchTick = -1_000;
  r.colMilli = 3_200;
  r.rowMilli = 4_700;
  return { world, r };
}

function drawn(world: World, role: ViewRole): { calls: number; words: string[] } {
  const words: { text: string }[] = [];
  const { ctx } = runFrames(world, role, 1, {
    every: 1,
    onCanvas: (c) => {
      c.texts = words as NonNullable<typeof c.texts>;
    },
    onTick: () => {},
  });
  return { calls: ctx.calls, words: words.map((w) => w.text) };
}

function calls(role: ViewRole, set: (w: World, r: ScoutState) => void): number {
  const { world, r } = flying();
  set(world, r);
  return drawn(world, role).calls;
}

const none = () => {};

describe("THE SCOUT's moments", () => {
  it("throws rings off the ship the tick it is let go, on both screens", () => {
    for (const role of ["p1", "p2"] as const) {
      const launched = calls(role, (w, r) => {
        r.launchTick = w.tick;
      });
      expect(launched, role).toBeGreaterThan(calls(role, none));
    }
  });

  it("draws the mouth's reach with a mote aboard, and the stream while it sucks", () => {
    const light = calls("p1", none);
    const laden = calls("p1", (_, r) => {
      r.carrying = [0];
    });
    const sucking = calls("p1", (_, r) => {
      r.carrying = [0];
      r.sucking = true;
    });
    expect(laden).toBeGreaterThan(light);
    expect(sucking).toBeGreaterThan(laden);
  });

  it("gives the pilot a glimpse of the arena, torn in, whole, torn out", () => {
    const first = CFG.scoutRevealFirstTicks;
    const at = (since: number) => (w: World, r: ScoutState) => {
      r.arenaTick = w.tick - since;
    };
    expect(calls("p1", at(first + CFG.scoutRevealTicks / 2))).toBeGreaterThan(calls("p1", none));
    // Torn at the edges of the showing, whole in the middle.
    const { r } = flying();
    expect(scoutGlimpse(CFG, r, first)?.s).toBe(1);
    expect(scoutGlimpse(CFG, r, first + CFG.scoutRevealTicks / 2)?.s).toBe(0);
    expect(scoutGlimpse(CFG, r, first - 1)).toBeNull();
    expect(scoutGlimpse(CFG, r, first + CFG.scoutRevealTicks)).toBeNull();
  });

  it("shows the pilot the hazard that caught the ship, and only that one", () => {
    const caught = (w: World, r: ScoutState) => {
      r.caughtTick = w.tick;
      r.caughtBy = 0;
    };
    const withIt = calls("p1", caught);
    const without = calls("p1", (w, r) => {
      caught(w, r);
      r.hazards = [];
    });
    expect(withIt).toBeGreaterThan(without);
  });

  it("burns the clock down across the top, and it is gone when the time is", () => {
    const spent = calls("test", (w, r) => {
      r.arenaBeat = w.beat - scoutCurrent(r).beats - 1;
    });
    expect(calls("test", none)).toBeGreaterThan(spent);
  });

  it("writes no words over the arena while it is flown", () => {
    for (const role of ["p1", "p2", "test"] as const) {
      const { world } = flying();
      // The band's own lobe words are the panel's, not the arena's.
      const over = drawn(world, role).words.join("|");
      for (const word of ["THE SCOUT", "MOTES", "ARENA", "you fly it", "you see the arena"]) {
        expect(over, `${role} ${word}`).not.toContain(word);
      }
    }
  });
});
