import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { lampreyHeadPull, lampreyTailHeld, step, type World } from "@neon-spore/sim";
import { handleCircle } from "../src/handles.js";
import {
  lampreyHeadCircle,
  lampreyTailCircle,
  lampreyTailRest,
  lampreyToothCircle,
} from "../src/lamprey-grip.js";
import { lampreyPose } from "../src/lamprey-pose.js";
import { lampreyToothAt } from "../src/lamprey-shape.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { BITE, GULLET, PULL, posed, stood } from "./lamprey-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LAMPREY's hands as controls (`lamprey-grip.ts`): the holder's thumb on
 * the tail, the other seat's pull on the head, and its tap on the tooth
 * nearest it in the mouth. The rules
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

/** A bite posed on BITE: the pilot holds the tail, the navigator taps, tooth 0 lit. */
function biting(): { world: World; l1: ReturnType<typeof layout>; l2: ReturnType<typeof layout> } {
  const world = stood();
  posed(world);
  return { world, l1: layout("p1"), l2: layout("p2") };
}

describe("the teeth", () => {
  it("take the worker's press on a tooth as an edge on that tooth, and let go on the lift", () => {
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

  it("are never a tooth on the holder's screen", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    const at = lampreyToothAt(lampreyPose(l1, CFG, s, world.beat, 0), 0);
    const said = touchDown(l1, at.x, at.y, fieldOf(world, 1))?.command;
    expect(said?.kind === "drag" ? said.target : null).not.toBe("lampreyTooth");
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

describe("the tail", () => {
  it("takes the holder's thumb where the tail rests, and lets go on the lift", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    const at = lampreyTailRest(l1, CFG, s);
    const down = touchDown(l1, at.x, at.y, fieldOf(world, 1));
    expect(down?.command).toEqual({
      kind: "drag",
      target: "lampreyTail",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    const up = touchUp(l1, down?.hold as Hold, at);
    expect(up?.command).toMatchObject({ target: "lampreyTail", on: false });
  });

  it("holds the tail in the simulation once the press is sent", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    const at = lampreyTailRest(l1, CFG, s);
    const down = touchDown(l1, at.x, at.y, fieldOf(world, 1));
    if (!down?.command) throw new Error("the holder's press sent nothing");
    step(world, [{ tick: world.tick, player: 1, command: down.command }]);
    expect(lampreyTailHeld(s)).toBe(true);
  });

  it("refuses the worker's thumb on the tail, so it falls through to the ship", () => {
    const { world, l2 } = biting();
    const s = posed(world);
    const at = lampreyTailRest(l2, CFG, s);
    const said = touchDown(l2, at.x, at.y, fieldOf(world, 2))?.command;
    expect(said?.kind === "drag" ? said.target : null).not.toBe("lampreyTail");
  });

  it("is nobody's while the eel leaps or rears", () => {
    for (const [phase, lit] of [
      ["leap", BITE],
      ["rearing", GULLET],
    ] as const) {
      const world = stood();
      const s = posed(world, phase, lit);
      const l1 = layout("p1");
      const at = lampreyTailRest(l1, CFG, s);
      const said = touchDown(l1, at.x, at.y, fieldOf(world, 1))?.command;
      expect(said?.kind === "drag" ? said.target : null, phase).not.toBe("lampreyTail");
    }
  });

  it("stands where the tail rests for the director's hand, only in a bite", () => {
    const { world, l1 } = biting();
    const s = posed(world);
    expect(handleCircle(l1, world, "lampreyTail", 0)).toEqual(lampreyTailCircle(l1, CFG, s));
    posed(world, "leap");
    expect(handleCircle(l1, world, "lampreyTail", 0)).toBeNull();
  });
});

describe("the head", () => {
  it("takes the worker's pull up off the tile in a pull, and the simulation lifts it", () => {
    const world = stood();
    const s = posed(world, "bite", PULL);
    const l2 = layout("p2");
    const head = lampreyHeadCircle(l2, CFG, s);
    if (head === null) throw new Error("a pull drew no head");
    const down = touchDown(l2, head.x, head.y, fieldOf(world, 2));
    expect(down?.command).toMatchObject({ target: "lampreyHead", on: true });
    const moved = touchMove(l2, down?.hold as Hold, head.x, head.y - l2.tile);
    expect(moved?.command).toMatchObject({ target: "lampreyHead", fromYMilli: -1000 });
    if (!down?.command || !moved?.command) throw new Error("the worker's pull sent nothing");
    step(world, [
      { tick: world.tick, player: 2, command: down.command },
      { tick: world.tick, player: 2, command: moved.command },
    ]);
    expect(lampreyHeadPull(s)).toBe(1000);
  });

  it("is no handle in a teeth", () => {
    const { world, l2 } = biting();
    const s = posed(world);
    expect(lampreyHeadCircle(l2, CFG, s)).toBeNull();
    expect(handleCircle(l2, world, "lampreyHead", 0)).toBeNull();
  });
});
