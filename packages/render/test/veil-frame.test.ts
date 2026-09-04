import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  type SpawnEntry,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames } from "./frame-harness.js";

/**
 * THE VEIL, drawn: the cloud both seats see, the body and the morph clock only
 * player 1 does, and the two seconds of red a wrong colour buys.
 *
 * Nothing here can answer whether the cloud *reads* as weather, whether the
 * rim bolts land hard enough to count beats by, or whether the switch mark is
 * legible at eleven pixels. Those are the checks this lane owes and they need
 * an eye. What it holds is that every one of those states has actually been
 * through a canvas that refuses what a real one refuses — including the two
 * the old test never reached, because a run with no commands in it never
 * shuts a cloud and never tears one open.
 */

beforeAll(installCanvasGlobals);

function veilFrames(role: ViewRole, ticks: number, withVeil = true) {
  const queue: SpawnEntry[] = withVeil ? [{ beat: 0, col: 3, kind: "veil", color: null }] : [];
  const tpb = ticksPerBeat(CFG);
  const { ctx, events } = runFrames(createWorld(CFG, 1, queue), role, ticks, {
    onTick: (tick, w) => {
      const veil = w.creatures.find((c) => c.kind === "veil");
      const inputs: TimedCommand[] = [];
      if (tick === 1) inputs.push({ tick, player: 1, command: { kind: "cannonCol", col: 3 } });
      // The wrong colour first — that is the whole mistake this creature
      // punishes, and the red cloud is a picture nothing else in the game draws.
      if (tick === tpb * 2 && veil?.color) {
        inputs.push({
          tick,
          player: 2,
          command: { kind: "fire", color: veil.color === "red" ? "cyan" : "red" },
        });
      }
      // And then the right one, long after the armour has run out, so the tear
      // and the burst are drawn too.
      if (tick === tpb * 9 && veil?.color) {
        inputs.push({ tick, player: 2, command: { kind: "fire", color: veil.color } });
      }
      step(w, inputs);
    },
  });
  const count = (type: string) => events.filter((e) => e.type === type).length;
  return { ctx, morphs: count("veilMorph"), rebuffs: count("veilRebuff"), torn: count("veilTorn") };
}

describe("the veil", () => {
  const TICKS = ticksPerBeat(CFG) * 12;

  for (const role of ROLES) {
    it(`draws the cloud, its clock and its lightning for ${role}`, () => {
      const { ctx } = veilFrames(role, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really morphed, was rebuffed and was torn, or the frames proved nothing", () => {
    // Without all three the run drew one open cloud for twelve beats: the
    // switch mark never changed colour, the red never happened, and the tear
    // was never drawn. Asserted on `test`, which carries both seats' marks.
    const { morphs, rebuffs, torn } = veilFrames("test", TICKS);
    expect(morphs).toBeGreaterThan(0);
    expect(rebuffs).toBe(1);
    expect(torn).toBe(1);
  });

  it("puts the clock on player 1's screen and the question mark on player 2's", () => {
    // Player 1 draws the body inside the cloud as well as a ring with a switch
    // mark in it; player 2 draws a hook and a dot over weather. The gap is the
    // creature.
    //
    // **What each seat's run costs with the cloud taken out of it is subtracted
    // first**, and without that this test is not about THE VEIL at all. Most of
    // either number is the panel, and the two panels are not the same picture —
    // player 2's carries the fire buttons. The frame those buttons draw grew
    // (the creature on one is drawn the way the field draws it now, rather than
    // punched out of the ammunition colour), player 2's whole run overtook
    // player 1's, and this failed for a reason that had nothing to do with the
    // creature it is about. A run of the same script over an empty field is the
    // baseline for its seat; what is left over either side is the cloud.
    const cost = (role: ViewRole): number =>
      veilFrames(role, TICKS).ctx.calls - veilFrames(role, TICKS, false).ctx.calls;
    expect(cost("p1")).toBeGreaterThan(cost("p2"));
  });
});
