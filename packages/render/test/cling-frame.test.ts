import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import {
  createWorld,
  startWave,
  step,
  type TimedCommand,
  TO_THE_END,
  ticksPerBeat,
} from "@neon-spore/sim";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LIMPET and THE LEECH through a canvas that refuses what a real one does
 * (`frame-harness.ts`).
 *
 * **This file used to be about a creature and is about a fault.** It drew a
 * body falling down a lane, arriving along the plating, loosening as the moves
 * against it mounted, and a fuse of lights going out one a beat — and every one
 * of those went on 15 September 2026, when the owner ruled that these two exist
 * only as a pencil placed on the map (`docs/spec/ideas.md` keeps them). What is
 * left is the body itself on its control, which is still a picture nothing else
 * draws: the squat shape, its hooklets or needles, the halo of the barb going
 * in, and the slide out of the lantern's column on the beat it arrives.
 *
 * Both placements are run to their end so the reel home is drawn as well as the
 * hold, and the grip is asserted rather than assumed — a frame test that ran a
 * wave where nothing arrived would pass on an empty picture.
 */

beforeAll(installCanvasGlobals);

const TPB = ticksPerBeat(CFG);
const MID = Math.floor(CFG.cols / 2);

/** A world with both pencils on it from the first beat, for `beats` beats. */
function held(beats: number) {
  const world = createWorld({ ...CFG, hullInvulnerable: true }, 1);
  startWave(world, 0, [], [], null, false, 0, [
    { kind: "limpet", at: 0, beats },
    { kind: "leech", at: 0, beats },
  ]);
  return world;
}

/**
 * `walking` keeps both controls moving, which is the only way a placement ever
 * reaches its own end: the still-count is a beat and a half, so a pair that
 * stands still loses the round long before the shortest pencil runs out.
 */
function clingFrames(role: (typeof ROLES)[number], ticks: number, beats: number, walking = false) {
  const { ctx, events, world } = runFrames(held(beats), role, ticks, {
    every: 3,
    onTick: (tick, w) => {
      const inputs: TimedCommand[] = [];
      if (walking && tick % 4 === 0) {
        const col = (tick / 4) % 2 === 0 ? MID - 1 : MID + 1;
        inputs.push({ tick, player: 2, command: { kind: "shieldCol", col } });
        inputs.push({ tick, player: 1, command: { kind: "cannonCol", col } });
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return {
    ctx,
    world,
    grip: count("clingGrip"),
    freed: count("clingFreed"),
    blast: count("clingBlast"),
  };
}

describe("THE LIMPET and THE LEECH through a canvas that refuses what a real one does", () => {
  for (const role of ROLES) {
    it(`draws both bodies arriving on their controls and holding as ${role}`, () => {
      const { ctx, grip } = clingFrames(role, TPB * 3, TO_THE_END);
      expect(ctx.calls).toBeGreaterThan(0);
      expect(grip).toBe(2);
    });
  }

  it("draws the round lost when nobody moves either control", () => {
    // Nothing is pressed, so both counts run out — which is the whole of what
    // the fault asks for and the only way either body leaves early.
    const { blast, world } = clingFrames("test", TPB * 4, TO_THE_END);
    expect(blast).toBe(2);
    expect(world.creatures).toHaveLength(0);
  });

  it("draws both being reeled home when the placements run out", () => {
    // Both controls walked the whole way, so nothing is ever still for the
    // beat and a half that loses it and the two-beat pencils end on their own.
    const { freed, blast, world } = clingFrames("test", TPB * 4, 2, true);
    expect(freed).toBe(2);
    expect(blast).toBe(0);
    expect(world.creatures).toHaveLength(0);
  });
});
