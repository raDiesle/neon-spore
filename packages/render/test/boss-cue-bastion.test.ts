import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { bastionPieceCol, midCol, type World } from "@neon-spore/sim";
import { bastionKnobAt, bastionRimKnob } from "../src/bastion-grip.js";
import { type BossCue, bossCues, cueSeen } from "../src/boss-cue.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout } from "../src/layout.js";
import { posed, stood } from "./bastion-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE BASTION, and the words the field may say about it**
 * (`render/src/boss-cue-read-zv.ts`): `PULL` on each side's slab, `TURN` on
 * the rim until a gun stands at the front and then `FIRE` aimed at it,
 * `SHIELD` under the node charging, and `FIRE` under the open port to the
 * navigator alone. What is *not* said: a word over a knob being carried, the
 * port's column to the pilot, and anything while no shell is lit.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");

function cues(world: World): readonly BossCue[] {
  return bossCues(l, world, 0, () => l.hullY);
}

const said = (world: World) => cues(world).map((c) => `${c.seat}:${c.word}`);

describe("THE BASTION", () => {
  it("tells each seat to pull its own slab, on the knob", () => {
    const world = stood();
    const s = posed(world, "plates");
    expect(said(world)).toEqual(["1:PULL", "2:PULL"]);
    cues(world).forEach((cue, side) => {
      const knob = bastionKnobAt(l, CFG, s, side as 0 | 1);
      expect(cue).toMatchObject({ x: knob.x, y: knob.y });
    });
    s.down = [true, false];
    expect(said(world)).toEqual(["2:PULL"]);
  });

  it("tells the pilot to turn the rim, then fires at the gun brought to the front", () => {
    const world = stood();
    const s = posed(world, "ring", "layer", (b) => {
      b.yawMilli = 30_000;
    });
    expect(said(world)).toEqual(["1:TURN"]);
    const rim = bastionRimKnob(l, CFG, s);
    expect(cues(world)[0]).toMatchObject({ x: rim.x, y: rim.y });
    s.spinning = true;
    expect(said(world)).toEqual([]);
    s.yawMilli = 0;
    const fire = cues(world)[0];
    expect(said(world)).toEqual(["null:FIRE"]);
    expect(fire?.x).toBeCloseTo(fieldX(l, midCol(CFG)));
    expect(fire?.aim).toBeDefined();
  });

  it("asks for the shield under the node charging, and nothing while none is", () => {
    const world = stood();
    const s = posed(world, "lattice");
    expect(said(world)).toEqual([]);
    s.dischargeBeat = world.beat + 2;
    expect(said(world)).toEqual(["null:SHIELD"]);
    expect(cues(world)[0]?.x).toBeCloseTo(fieldX(l, bastionPieceCol(world, s, 0)));
  });

  it("fires under the open port to the navigator, and never shows the pilot its column", () => {
    const world = stood();
    const s = posed(world, "port");
    const fire = cues(world)[0];
    expect(said(world)).toEqual(["2:FIRE"]);
    expect(fire?.x).toBeCloseTo(fieldX(l, bastionPieceCol(world, s, 0)));
    expect(fire?.aim).toBeDefined();
    if (fire === undefined) throw new Error("no word");
    expect(cueSeen(fire, "p1")).toBe(false);
    expect(cueSeen(fire, "p2")).toBe(true);
  });

  it.each(["enter", "shed", "regrow", "spent"] as const)("says nothing while %s", (phase) => {
    const world = stood();
    posed(world, "ring", phase);
    expect(said(world)).toEqual([]);
  });
});
