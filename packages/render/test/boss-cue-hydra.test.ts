import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { hydraMawCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCues } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { hydraCoilKnob, hydraEyeMark, hydraNeckKnob } from "../src/hydra-grip.js";
import { hydraMawAt } from "../src/hydra-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { hung, posed } from "./hydra-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE HYDRA, and the words the field may say about it**
 * (`render/src/boss-cue-read-zx.ts`): `SWIPE` on each side's neck knob,
 * `TURN` on each side's coil lever, `TAP` on each side's open eye, and on the
 * maws `COLOUR` to the pilot who sees the fire and `FIRE` to the navigator
 * who sees the maw. What is *not* said: a word over a knob being carried or
 * a lever being turned, a shut eye, the fire's colour, and anything while no
 * level is lit.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");

function cues(world: World): readonly BossCue[] {
  return bossCues(l, world, 0, () => l.hullY);
}

const said = (world: World) => cues(world).map((c) => `${c.seat}:${c.word}`);

describe("THE HYDRA", () => {
  it("tells each seat to swipe its own neck, on the knob, until a thumb is on it", () => {
    const world = hung();
    const s = posed(world, "bite");
    expect(said(world)).toEqual(["1:SWIPE", "2:SWIPE"]);
    cues(world).forEach((cue, side) => {
      const knob = hydraNeckKnob(l, CFG, s, side as 0 | 1);
      expect(cue).toMatchObject({ kind: "CARRY", x: knob.x, y: knob.y });
    });
    s.down = [true, false];
    expect(said(world)).toEqual(["2:SWIPE"]);
  });

  it("tells each seat to turn its own coil, on the lever, until it is turning", () => {
    const world = hung();
    const s = posed(world, "coil");
    expect(said(world)).toEqual(["1:TURN", "2:TURN"]);
    const knob = hydraCoilKnob(l, CFG, s, 1);
    expect(cues(world)[1]).toMatchObject({ kind: "TURN", x: knob.x, y: knob.y });
    s.turning = [false, true];
    expect(said(world)).toEqual(["1:TURN"]);
  });

  it("asks for a tap on an eye only while it is open", () => {
    const world = hung();
    const s = posed(world, "eye");
    expect(said(world)).toEqual([]);
    s.lidOpen = [false, true];
    expect(said(world)).toEqual(["2:TAP"]);
    const eye = hydraEyeMark(l, CFG, s, 1);
    expect(cues(world)[0]).toMatchObject({ kind: "PRESS", x: eye.x, y: eye.y });
  });

  it("gives the fire's colour to the pilot to say and the maw's shot to the navigator", () => {
    const world = hung();
    const s = posed(world, "maw");
    expect(said(world)).toEqual(["1:COLOUR", "2:FIRE"]);
    const [call, fire] = cues(world);
    const step = s.steps[s.cursor];
    if (step === undefined) throw new Error("no maw level");
    expect(call?.kind).toBe("CALL");
    expect(fire).toMatchObject({
      kind: "PRESS",
      x: fieldX(l, hydraMawCol(world, s, 0)),
      y: l.hullY,
      aim: hydraMawAt(l, CFG, step, 0),
    });
    // The colour is the sentence the pair has to say: the fire button is never told it.
    expect(fire?.shows).toBeUndefined();
  });

  it("says nothing while no level is lit", () => {
    const world = hung();
    for (const phase of ["enter", "rear", "struck", "spent"] as const) {
      posed(world, "bite", phase);
      expect(said(world)).toEqual([]);
    }
  });
});
