import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { lampreyHeld, step, type World } from "@neon-spore/sim";
import { fieldX } from "../src/field-flip.js";
import { handleCircle } from "../src/handles.js";
import { lampreyJawCircle, lampreyToothCircle } from "../src/lamprey-grip.js";
import { lampreyPose } from "../src/lamprey-pose.js";
import { lampreyToothAt } from "../src/lamprey-shape.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { BITE, GULLET, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY's hands as controls (`lamprey-grip.ts`): the pinner's thumb
 * on the jaw's band, sending the column under it and following it as it
 * moves, and the tapper's tap on the tooth nearest it in the mouth. The rules
 * are the simulation's (`sim/test/lamprey.test.ts`); this file proves the
 * picture hands them a thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** A bite posed on BITE: the pilot pins, the navigator taps, tooth 0 lit. */
function biting(): { world: World; l1: ReturnType<typeof layout>; l2: ReturnType<typeof layout> } {
  const world = stood();
  posed(world);
  return { world, l1: layout("p1"), l2: layout("p2") };
}

describe("the teeth", () => {
  it("take the tapper's press on a tooth as an edge on that tooth, and let go on the lift", () => {
    const { world, l2 } = biting();
    const s = posed(world);
    const p = lampreyPose(l2, CFG, s, world.beat, 0);
    const at = lampreyToothAt(p, 3);
    const down = touchDown(l2, at.x, at.y, fieldOf(world, 2));
    expect(down?.command).toEqual({
      kind: "drag",
      target: "lampreyTooth",
      on: true,
      fromMilli: 0,
      id: 3,
    });
    const up = touchUp(l2, down?.hold as Hold, at);
    expect(up?.command).toMatchObject({ target: "lampreyTooth", on: false, id: 3 });
  });

  it("are the jaw on the pinner's screen, never a tooth", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    const at = lampreyToothAt(lampreyPose(l1, CFG, s, world.beat, 0), 0);
    expect(touchDown(l1, at.x, at.y, fieldOf(world, 1))?.command).toMatchObject({
      target: "lampreyJaw",
    });
  });

  it("stand on the lit tooth for the director's hand", () => {
    const { world, l2 } = biting();
    const s = posed(world, "bite", BITE, (t) => {
      t.litTooth = 4;
    });
    expect(handleCircle(l2, world, "lampreyTooth", 0)).toEqual(
      lampreyToothCircle(l2, CFG, s, world.beat, 0),
    );
  });
});

describe("the jaw", () => {
  it("takes the pinner's thumb on the band as the column under it, and follows it", () => {
    const { world, l1 } = biting();
    const x = fieldX(l1, BITE.col);
    const down = touchDown(l1, x, l1.hullY, fieldOf(world, 1));
    expect(down?.command).toEqual({
      kind: "drag",
      target: "lampreyJaw",
      on: true,
      fromMilli: 0,
      id: BITE.col,
    });
    expect(down?.hold).toMatchObject({ follows: true });
    const moved = touchMove(l1, down?.hold as Hold, fieldX(l1, BITE.col + 2), l1.hullY - l1.tile);
    expect(moved?.command).toMatchObject({ target: "lampreyJaw", on: true, id: BITE.col + 2 });
    const up = touchUp(l1, down?.hold as Hold, { x, y: l1.hullY });
    expect(up?.command).toMatchObject({ target: "lampreyJaw", on: false });
  });

  it("holds the jaw in the simulation once the press is sent", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    const down = touchDown(l1, fieldX(l1, BITE.col), l1.hullY, fieldOf(world, 1));
    if (!down?.command) throw new Error("the pinner's press sent nothing");
    step(world, [{ tick: world.tick, player: 1, command: down.command }]);
    expect(lampreyHeld(world, s)).toBe(true);
  });

  it("refuses the tapper's thumb off the mouth, so it falls through to the ship", () => {
    const { world, l2 } = biting();
    const s = posed(world);
    const p = lampreyPose(l2, CFG, s, world.beat, 0);
    // Past the lip, inside the band the pinner's thumb would be taken on.
    const x = p.x + (CFG.lampreyGripCols + 0.4) * l2.tile;
    const said = touchDown(l2, x, l2.hullY, fieldOf(world, 2))?.command;
    expect(said).not.toMatchObject({ target: "lampreyJaw" });
    expect(said).not.toMatchObject({ target: "lampreyTooth" });
  });

  it("is the next bite's pinner's while the eel pulls loose, and nobody's while it rears", () => {
    const world = stood();
    const next = { ...BITE, pinner: 2 as const };
    const s = posed(world, "loose", next);
    const l2 = layout("p2");
    const x = lampreyPose(l2, CFG, s, world.beat, 0).x;
    expect(touchDown(l2, x, l2.hullY, fieldOf(world, 2))?.command).toMatchObject({
      target: "lampreyJaw",
    });
    posed(world, "rearing", GULLET);
    const l1 = layout("p1");
    const under = touchDown(l1, fieldX(l1, 4), l1.hullY, fieldOf(world, 1));
    expect(under?.command).not.toMatchObject({ target: "lampreyJaw" });
  });

  it("stands on the band under the mouth for the director's hand, only in a bite", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    expect(handleCircle(l1, world, "lampreyJaw", 0)).toEqual(
      lampreyJawCircle(l1, CFG, s, world.beat, 0),
    );
    posed(world, "loose");
    expect(handleCircle(l1, world, "lampreyJaw", 0)).toBeNull();
  });
});
