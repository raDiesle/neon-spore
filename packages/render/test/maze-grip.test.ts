import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { DEFAULT_CONFIG, type MazeState } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { mazeHeartCircle, mazeHeartUnder } from "../src/maze-grip.js";
import { mazeStringCircle } from "../src/maze-string.js";
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals } from "./frame-harness.js";
import { gripState as grip } from "./maze-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE MAZE's heart as a control (`maze-grip.ts`): that either seat's thumb
 * takes hold of it and only under `grip`, that a move reports the thumb's
 * displacement on both axes so the sim can shake the heart by it, and that
 * the string asks nothing meanwhile. The rule is the simulation's
 * (`sim/test/maze-gestures.test.ts`); this file proves the picture hands it a
 * thumb, and `maze-grip-ring.test.ts` that the ring, the arrows, the word and
 * the green count reach the canvas.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function fieldWith(seat: 1 | 2, boss: MazeState | null): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

const heart = (l: ReturnType<typeof layout>, m: MazeState) => mazeHeartCircle(l, DEFAULT_CONFIG, m);

describe("a thumb on the heart", () => {
  it("is either seat's, under grip, and takes a hold on both", () => {
    const l = layout("p2");
    const at = heart(l, grip());
    const touch = mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip()));
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "mazeHeart",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "mazeHeart", player: 2 });
    expect(mazeHeartUnder(layout("p1"), at.x, at.y, fieldWith(1, grip()))).toMatchObject({
      player: 1,
      command: { target: "mazeHeart", on: true },
      hold: { kind: "drag", target: "mazeHeart", player: 1 },
    });
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip({ phase: "read" })))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, grip({ phase: "travel" })))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y, fieldWith(2, null))).toBeNull();
    expect(mazeHeartUnder(l, at.x, at.y + at.r * 2, fieldWith(2, grip()))).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const l = layout("p2");
    const at = heart(l, grip());
    expect(touchDown(l, at.x, at.y, fieldWith(2, grip()))?.command).toMatchObject({
      target: "mazeHeart",
    });
  });

  it("reports where it has come on both axes, and lets go on the lift", () => {
    const l = layout("p1");
    const field = fieldWith(1, grip());
    const at = heart(l, grip());
    const hold = touchDown(l, at.x, at.y, field)?.hold as Hold;
    const pulled = touchMove(l, hold, at.x - l.tile * 0.4, at.y + l.tile * 0.6)?.command;
    expect(pulled).toMatchObject({
      target: "mazeHeart",
      on: true,
      fromMilli: -400,
      fromYMilli: 600,
    });
    const lifted = touchUp(l, hold, { x: at.x, y: at.y + l.tile })?.command;
    expect(lifted).toMatchObject({ target: "mazeHeart", on: false });
  });
});

describe("the string under grip", () => {
  it("asks nobody: both hands belong on the heart", () => {
    const l = layout("p1");
    const at = mazeStringCircle(l, DEFAULT_CONFIG);
    const command = touchDown(l, at.x, at.y, fieldWith(1, grip()))?.command;
    expect(command?.kind === "drag" && command.target === "mazeString").toBe(false);
  });
});
