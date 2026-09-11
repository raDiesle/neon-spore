import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  hullRow,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE CHOKE, drawn: the strand coming down with its hooks opening, the loops
 * on the cannon walking with it, the loose end growing as the taps land, the
 * thumb held down, and the strip going live again when it lets go.
 *
 * Nothing here can answer whether the loops read as a count or the ring as
 * an invitation to keep tapping; those need an eye. What it holds is that
 * every one of those states has been through a canvas that refuses what a
 * real one refuses, on every seat — the dead strip is player 1's alone, and
 * a run as player 2 has to cross the same beats without a strip to kill.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const STUCK_BY = TPB * (hullRow(CFG) + 2);

const queue = (): SpawnEntry[] => [{ beat: 0, col: 2, kind: "choke", color: null }];

function chokeFrames(role: (typeof ROLES)[number], ticks: number, tapping: boolean) {
  let id = 0;
  const { ctx, events, world } = runFrames(createWorld(CFG, 1, queue()), role, ticks, {
    every: 3,
    onTick: (tick, w) => {
      if (id === 0) id = w.creatures[0]?.id ?? 0;
      const inputs: TimedCommand[] = [];
      // A press every fourth tick and its lift two later, with one long hold
      // in the middle so the held state is drawn too.
      if (tapping && id !== 0 && tick > STUCK_BY) {
        const k = tick - STUCK_BY;
        const holding = k > 40 && k < 70;
        if (k % 4 === 1 && !holding)
          inputs.push({
            tick,
            player: 1,
            command: { kind: "drag", target: "choke", on: true, fromMilli: 0, id },
          });
        if (k % 4 === 3 && !holding)
          inputs.push({
            tick,
            player: 1,
            command: { kind: "drag", target: "choke", on: false, fromMilli: 0, id },
          });
        if (k === 41)
          inputs.push({
            tick,
            player: 1,
            command: { kind: "drag", target: "choke", on: true, fromMilli: 0, id },
          });
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    ctx,
    world,
    grip: count("chokeGrip"),
    taps: count("chokeTap"),
    freed: count("chokeFreed"),
  };
}

describe("THE CHOKE through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws the fall, the grip and the walk as ${role}`, () => {
      const { ctx, grip } = chokeFrames(role, STUCK_BY + TPB * 4, false);
      expect(ctx.calls).toBeGreaterThan(0);
      expect(grip).toBe(1);
    });
  }

  it("draws the taps landing, the hold, and the strip coming back", () => {
    const ticks = STUCK_BY + CFG.chokeTaps * 4 + 60 + TPB;
    const { taps, freed, world } = chokeFrames("p1", ticks, true);
    expect(taps).toBe(CFG.chokeTaps);
    expect(freed).toBe(1);
    expect(world.creatures).toHaveLength(0);
  });
});
