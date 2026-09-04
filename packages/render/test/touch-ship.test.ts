import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { touchDown, touchMove, touchUp } from "../src/touch.js";
import { cannonGrab, shieldGrab, shipHand } from "../src/touch-ship.js";

/**
 * The ship answered where it is drawn: slide the cannon, press the shield,
 * carry the muzzle towards a colour.
 *
 * It sits beside `touch.test.ts` rather than in it because that file was
 * already at its length, and because these are a different claim: everything
 * next door is about the band, and every case here is about a swelling on the
 * hull that a wave draws for its own reasons and a finger may now take hold
 * of. Both go through the same `touchDown`, which is the point.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD = controlSet("default");
const FLEET = controlSet("fleet");
const layout = (role: ViewRole = "test") =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** A wave under way, so the field has bodies on it to be answered instead. */
function field(seat: 1 | 2, controls: ControlSet = STANDARD, cols?: [number, number]): Field {
  const world = createWorld(CFG, 2, [{ beat: 0, col: 4, kind: "slick", color: "red" }]);
  for (let i = 0; i < 200; i++) step(world, []);
  const [cannon, shield] = cols ?? [2, 8];
  return {
    creatures: world.creatures,
    cannonCol: cannon,
    shieldCol: shield,
    beatPhase: 0.5,
    seat,
    cfg: CFG,
    maze: null,
    warden: null,
    controls,
  };
}

describe("player 1 on the ship", () => {
  const l = layout();

  it("takes hold of the cannon where it is standing, and slides it", () => {
    const f = field(1);
    const at = cannonGrab(l, f.cannonCol);
    const press = touchDown(l, at.x, at.y, f);
    expect(press).toEqual({
      player: 1,
      command: { kind: "cannonCol", col: f.cannonCol },
      hold: { kind: "cannon", direct: true },
    });
    // The same absolute rule the strip has: the finger's x is a column.
    const moved = touchMove(l, { kind: "cannon", direct: true }, cannonGrab(l, 7).x, at.y);
    expect(moved?.command).toEqual({ kind: "cannonCol", col: 7 });
  });

  it("fires the shield where player 2 left it, and does not move it", () => {
    const f = field(1);
    const at = shieldGrab(l, f.shieldCol);
    expect(touchDown(l, at.x, at.y, f)).toEqual({
      player: 1,
      command: { kind: "guard" },
      hold: { kind: "guard" },
    });
    // The hold is there for the ring alone: the window is the simulation's
    // from the press onwards, so the lift has nothing left to say.
    expect(touchUp(l, { kind: "guard" }, f)).toBeNull();
  });
});

describe("player 2 on the ship", () => {
  const l = layout();

  it("takes hold of the shield and slides it", () => {
    const f = field(2);
    const at = shieldGrab(l, f.shieldCol);
    expect(touchDown(l, at.x, at.y, f)).toEqual({
      player: 2,
      command: { kind: "shieldCol", col: f.shieldCol },
      hold: { kind: "shield", direct: true },
    });
  });

  it("says nothing at all when the thumb lands on the muzzle", () => {
    const f = field(2);
    const at = cannonGrab(l, f.cannonCol);
    expect(touchDown(l, at.x, at.y, f)).toEqual({
      player: 2,
      command: null,
      hold: { kind: "shot", originX: at.x },
    });
  });

  it("fires red to the left, cyan to the right, and nothing in between", () => {
    const f = field(2);
    const at = cannonGrab(l, f.cannonCol);
    const hold = { kind: "shot", originX: at.x } as const;
    const lift = (dx: number) => touchUp(l, hold, f, { x: at.x + dx, y: at.y })?.command;
    expect(lift(-l.tile)).toEqual({ kind: "fire", color: "red" });
    expect(lift(l.tile)).toEqual({ kind: "fire", color: "cyan" });
    expect(lift(l.tile * 0.2)).toBeUndefined();
    expect(lift(0)).toBeUndefined();
  });

  it("fires nothing when the pointer is lost with no position to report", () => {
    const f = field(2);
    const at = cannonGrab(l, f.cannonCol);
    expect(touchUp(l, { kind: "shot", originX: at.x }, f)).toBeNull();
  });

  it("does not move the cannon, which is not theirs to move", () => {
    expect(touchMove(l, { kind: "shot", originX: 0 }, 300, 300)).toBeNull();
  });
});

describe("what the ship refuses", () => {
  const l = layout();

  it("answers nothing on a panel that has neither lobe", () => {
    for (const seat of [1, 2] as const) {
      const f = field(seat, FLEET);
      expect(
        touchDown(l, cannonGrab(l, f.cannonCol).x, cannonGrab(l, f.cannonCol).y, f),
      ).toBeNull();
      expect(
        touchDown(l, shieldGrab(l, f.shieldCol).x, shieldGrab(l, f.shieldCol).y, f),
      ).toBeNull();
    }
  });

  it("does not swallow a grip aimed at something up the field", () => {
    const f = field(1);
    const c = f.creatures[0];
    if (!c) throw new Error("the field is empty");
    const at = creatureCenter(l, c, f.beatPhase);
    expect(touchDown(l, at.x, at.y, f)?.command).toEqual({ kind: "grip", id: c.id });
  });

  it("gives the finger to the lobe whose column it is nearer", () => {
    const f = field(1, STANDARD, [3, 4]);
    expect(touchDown(l, cannonGrab(l, 3).x, cannonGrab(l, 3).y, f)?.hold).toEqual({
      kind: "cannon",
      direct: true,
    });
    expect(touchDown(l, shieldGrab(l, 4).x, shieldGrab(l, 4).y, f)?.hold).toEqual({
      kind: "guard",
    });
  });

  /**
   * The two lobes sit within a few pixels of each other vertically, so a
   * column they share is a genuine tie — and the lobe this seat *carries*
   * takes it. What each seat loses that way still has its own button on the
   * band: the guard for player 1, both colours for player 2.
   */
  it("gives a shared column to the lobe this seat slides", () => {
    const at = cannonGrab(l, 5);
    expect(touchDown(l, at.x, at.y, field(1, STANDARD, [5, 5]))?.hold).toEqual({
      kind: "cannon",
      direct: true,
    });
    expect(touchDown(l, at.x, at.y, field(2, STANDARD, [5, 5]))?.hold).toEqual({
      kind: "shield",
      direct: true,
    });
  });
});

describe("the ring that says a hand is on the ship", () => {
  const l = layout();

  it("is drawn for a hold taken on the hull and never for one on a strip", () => {
    expect(shipHand(l, { kind: "cannon", direct: true }, 0, true)).toEqual({
      on: "cannon",
      held: true,
      color: null,
    });
    expect(shipHand(l, { kind: "cannon" }, 0, true)).toBeNull();
    expect(shipHand(l, { kind: "shield" }, 0, true)).toBeNull();
    expect(shipHand(l, { kind: "lance" }, 0, true)).toBeNull();
    expect(shipHand(l, { kind: "grip" }, 0, true)).toBeNull();
  });

  it("names the colour the lift would fire, and only past the threshold", () => {
    const hold = { kind: "shot", originX: 200 } as const;
    expect(shipHand(l, hold, 200, true)).toEqual({ on: "muzzle", held: true, color: null });
    expect(shipHand(l, hold, 200 - l.tile, true)?.color).toBe("red");
    expect(shipHand(l, hold, 200 + l.tile, true)?.color).toBe("cyan");
  });

  it("says whether a finger is down or a mouse is only over it", () => {
    const hold = { kind: "guard" } as const;
    expect(shipHand(l, hold, 0, true)?.held).toBe(true);
    expect(shipHand(l, hold, 0, false)?.held).toBe(false);
  });
});
