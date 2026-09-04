import { beforeAll, describe, expect, it } from "bun:test";
import { buildQueue } from "@neon-spore/content";
import { createWorld, ticksPerBeat } from "@neon-spore/sim";
import type { ShipHand } from "../src/touch-ship.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * The ring round the swelling a finger has hold of, through a canvas that
 * refuses what a real one refuses.
 *
 * It asserts nothing about how it looks — that is the owner's, on a phone —
 * only that every value it hands the canvas is one a canvas accepts, in each
 * of the states a hand can be in: hovering, held, held with one of player 2's
 * two colours locked in, and each of the three marks that say what letting go
 * would do (`ship-marks.ts`).
 */

beforeAll(installCanvasGlobals);

const HANDS: ShipHand[] = [
  { on: "cannon", held: false, color: null, marks: ["slide"] },
  { on: "cannon", held: true, color: null, marks: ["slide"] },
  // The pilot standing still on the cannon: the arrows and the maw at once.
  { on: "cannon", held: false, color: null, marks: ["slide", "suck"] },
  { on: "cannon", held: true, color: null, marks: ["slide", "suck"] },
  { on: "muzzle", held: false, color: null, marks: [] },
  { on: "muzzle", held: true, color: null, marks: [] },
  { on: "muzzle", held: true, color: "red", marks: [] },
  { on: "muzzle", held: true, color: "cyan", marks: [] },
  { on: "shield", held: false, color: null, marks: ["slide"] },
  { on: "shield", held: true, color: null, marks: ["slide"] },
  // Player 1 on the plate: the bolt, and no arrows — it is not theirs to move.
  { on: "shield", held: false, color: null, marks: ["guard"] },
  { on: "shield", held: true, color: null, marks: ["guard"] },
];

describe("a hand on the ship", () => {
  for (const role of ROLES) {
    it(`draws every state of the ring for ${role} without the canvas refusing a value`, () => {
      for (const hand of HANDS) {
        const { ctx } = runFrames(
          createWorld(CFG, 7, buildQueue(0, CFG.cols)),
          role,
          ticksPerBeat(CFG) * 2,
          { hand },
        );
        expect(ctx.calls).toBeGreaterThan(100);
      }
    });
  }

  it("draws nothing at all when no hand is on it", () => {
    const bare = runFrames(createWorld(CFG, 7, buildQueue(0, CFG.cols)), "p1", 40).ctx.calls;
    const ringed = runFrames(createWorld(CFG, 7, buildQueue(0, CFG.cols)), "p1", 40, {
      hand: { on: "muzzle", held: true, color: "red", marks: [] },
    }).ctx.calls;
    expect(ringed).toBeGreaterThan(bare);
  });
});
