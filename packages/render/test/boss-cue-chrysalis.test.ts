import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { chrysalisPieceCol, chrysalisRubsOf, midCol, type World } from "@neon-spore/sim";
import { type BossCue, bossCues } from "../src/boss-cue.js";
import { chrysalisKnobAt, chrysalisRubAt } from "../src/chrysalis-grip.js";
import { chrysalisCentre, chrysalisPoreAt } from "../src/chrysalis-shape.js";
import { fieldX } from "../src/field-flip.js";
import { computeLayout } from "../src/layout.js";
import { hung, posed } from "./chrysalis-harness.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE CHRYSALIS, and the words the field may say about it**
 * (`render/src/boss-cue-read-zw.ts`): `RUB` on each half of the slime with
 * THE RUB LAB's drop, `PULL` on each side's quill, `SHIELD` under the sac
 * swelling, and on the heart `COLOUR` to the pilot who sees it and `FIRE` to
 * the navigator. What is *not* said: a word over a knob being carried, a
 * half already wiped, the heart's colour, and anything while no skin is lit.
 */

beforeAll(installCanvasGlobals);

const l = computeLayout(VIEWPORT, CFG, "test");

function cues(world: World): readonly BossCue[] {
  return bossCues(l, world, 0, () => l.hullY);
}

const said = (world: World) => cues(world).map((c) => `${c.seat}:${c.word}`);

describe("THE CHRYSALIS", () => {
  it("tells each seat to rub its own half, wearing the turns it has had", () => {
    const world = hung();
    const s = posed(world, "slime", "skin", (c) => {
      c.rubbed = [2, 0];
      c.rubAt = [3, -1];
    });
    expect(said(world)).toEqual(["1:RUB", "2:RUB"]);
    const [left, right] = cues(world);
    const at = chrysalisRubAt(l, CFG, 0);
    expect(left).toMatchObject({ x: at.x, y: at.y });
    expect(left?.rubs).toEqual({ turns: chrysalisRubsOf(s), done: 2, held: true });
    expect(right?.rubs).toEqual({ turns: chrysalisRubsOf(s), done: 0, held: false });
    s.goneMask = 1;
    expect(said(world)).toEqual(["2:RUB"]);
  });

  it("tells each seat to pull its own quill, on the knob, until a thumb is on it", () => {
    const world = hung();
    const s = posed(world, "quills");
    expect(said(world)).toEqual(["1:PULL", "2:PULL"]);
    cues(world).forEach((cue, side) => {
      const knob = chrysalisKnobAt(l, CFG, s, side as 0 | 1);
      expect(cue).toMatchObject({ x: knob.x, y: knob.y });
    });
    s.down = [true, false];
    expect(said(world)).toEqual(["2:PULL"]);
  });

  it("asks for the shield under a sac only while it swells", () => {
    const world = hung();
    const s = posed(world, "sacs");
    expect(said(world)).toEqual([]);
    s.sprayBeat = world.beat + 4;
    expect(said(world)).toEqual(["null:SHIELD"]);
    expect(cues(world)[0]?.x).toBeCloseTo(fieldX(l, chrysalisPieceCol(world, s, 0)));
  });

  it("gives the heart's colour to the pilot to say and its shot to the navigator", () => {
    const world = hung();
    const s = posed(world, "heart");
    expect(said(world)).toEqual(["1:COLOUR", "2:FIRE"]);
    const [call, fire] = cues(world);
    const col = chrysalisPieceCol(world, s, 0);
    const pore = chrysalisPoreAt(l, CFG, chrysalisCentre(l, CFG), col - midCol(CFG));
    expect(call).toMatchObject({ kind: "CALL", x: pore.x, y: pore.y });
    expect(fire).toMatchObject({ kind: "PRESS", y: l.hullY, aim: pore });
    // The colour is the sentence the pair has to say: the fire button is never told it.
    expect(fire?.shows).toBeUndefined();
  });

  it("says nothing while no skin is lit", () => {
    const world = hung();
    for (const phase of ["enter", "shed", "regrow", "spent"] as const) {
      posed(world, "quills", phase);
      expect(said(world)).toEqual([]);
    }
  });
});
