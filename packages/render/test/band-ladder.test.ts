import { describe, expect, it } from "bun:test";
import { type ControlSet, type ControlSetId, controlSet, setHas } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG, step } from "@neon-spore/sim";
import { bandLobes, computeLayout, hitCircle, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchUp } from "../src/touch.js";
import { cannonGrab } from "../src/touch-ship.js";

/**
 * The standard ladder, drawn and answered.
 *
 * The owner's instruction about the reduced panels was one sentence — *elements
 * should stay on exact position as in full standard version* — and it is the
 * one thing about them that cannot be seen by reading a set: a rung lists two
 * lobes where the full panel has three, and every layout in the game centres
 * what it is given. So this asks the drawing directly, in every role, for every
 * rung: the button that is there is on the pixel it will keep, and the place
 * the held-back one will take answers nothing at all.
 */

const CFG = DEFAULT_CONFIG;
const LADDER: ControlSetId[] = ["standard1", "standard2", "standard3", "standard4"];
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const STANDARD = controlSet("default");

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The middle of the cannon swelling, which is player 2's muzzle. */
function muzzle(l: ReturnType<typeof layout>, f: Field): { x: number; y: number } {
  const c = cannonGrab(l, f.cannonCol);
  return { x: c.x, y: c.y };
}

function field(seat: 1 | 2, controls: ControlSet): Field {
  const world = createWorld(CFG, 2, []);
  for (let i = 0; i < 60; i++) step(world, []);
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    // Two columns apart, so a press on one swelling is never a press that
    // could have meant the other (`shipUnder` breaks a tie in favour of the
    // lobe the seat carries, which for player 2 is the plate).
    shieldCol: world.shieldCol + 2,
    beatPhase: 0.5,
    seat,
    cfg: CFG,
    maze: null,
    warden: null,
    controls,
  };
}

describe("a rung of the standard ladder on the band", () => {
  it("stands every button it has on the pixel the full panel stands it on", () => {
    for (const role of ROLES) {
      const l = layout(role);
      const full = new Map(
        [1, 2].flatMap((p) =>
          bandLobes(l, STANDARD, p as 1 | 2).map((b) => [b.control.id, b.circle] as const),
        ),
      );
      for (const id of LADDER) {
        const set = controlSet(id);
        for (const player of [1, 2] as const) {
          for (const lobe of bandLobes(l, set, player)) {
            expect(lobe.circle, `${id} moved ${lobe.control.id} on ${role}`).toEqual(
              full.get(lobe.control.id) as { x: number; y: number; r: number },
            );
          }
        }
      }
    }
  });

  it("draws no button at all where one is held back", () => {
    for (const role of ROLES) {
      const l = layout(role);
      for (const id of LADDER) {
        const set = controlSet(id);
        const drawn = [1, 2].flatMap((p) => bandLobes(l, set, p as 1 | 2).map((b) => b.control.id));
        for (const held of STANDARD.controls) {
          if (setHas(set, held)) continue;
          expect(drawn, `${id} on ${role} still draws ${held}`).not.toContain(held);
        }
      }
    }
  });

  /**
   * The other half: a place with no button on it must not answer a thumb. It
   * is `bandLobes` that makes that true — the hit test walks the same list the
   * drawing does — and this is what keeps the two from being separated again.
   */
  it("answers nothing where the full panel would have had a button", () => {
    const l = layout("test");
    const set = controlSet("standard2");
    const f = field(1, set);
    for (const player of [1, 2] as const) {
      for (const lobe of bandLobes(l, STANDARD, player)) {
        const answer = touchDown(l, lobe.circle.x, lobe.circle.y, { ...f, seat: player });
        if (setHas(set, lobe.control.id)) {
          expect(answer, `STANDARD 2 stopped answering ${lobe.control.id}`).not.toBeNull();
          continue;
        }
        expect(answer, `STANDARD 2 answers ${lobe.control.id}, which it has not got`).toBeNull();
      }
    }
  });

  /**
   * The muzzle is the one gesture that reads a *direction* for a colour, so a
   * panel with one colour on it has no order to read. Either way sends the one
   * that exists rather than half the swipe firing nothing.
   */
  it("sends the one colour it has, whichever way the muzzle is carried", () => {
    const l = layout("p2");
    const f = field(2, controlSet("standard1"));
    const start = muzzle(l, f);
    const hold = touchDown(l, start.x, start.y, f)?.hold;
    if (hold?.kind !== "shot") throw new Error("the muzzle was not taken hold of");
    for (const dx of [-l.tile, l.tile]) {
      expect(touchUp(l, hold, f, { x: start.x + dx, y: start.y })?.command).toEqual({
        kind: "fire",
        color: "red",
      });
    }
  });

  it("still reads the direction on a panel that carries both colours", () => {
    const l = layout("p2");
    const f = field(2, STANDARD);
    const start = muzzle(l, f);
    const hold = touchDown(l, start.x, start.y, f)?.hold;
    if (hold?.kind !== "shot") throw new Error("the muzzle was not taken hold of");
    expect(touchUp(l, hold, f, { x: start.x - l.tile, y: start.y })?.command).toEqual({
      kind: "fire",
      color: "red",
    });
    expect(touchUp(l, hold, f, { x: start.x + l.tile, y: start.y })?.command).toEqual({
      kind: "fire",
      color: "cyan",
    });
  });

  /** The two strips are placed by the layout and not by the set, so a rung
   * without one has to be refused by the hit test rather than moved. */
  it("refuses the strip a rung has not got, and keeps the one it has", () => {
    const l = layout("test");
    const f = field(1, controlSet("standard3"));
    expect(touchDown(l, l.width / 2, l.cannonStrip.y, f)?.command?.kind).toBe("cannonCol");
    expect(touchDown(l, l.width / 2, l.shieldStrip.y, { ...f, seat: 2 })).toBeNull();
    const four = field(2, controlSet("standard4"));
    expect(touchDown(l, l.width / 2, l.shieldStrip.y, four)?.command?.kind).toBe("shieldCol");
  });

  it("keeps a hit region on every button it does carry", () => {
    const l = layout("test");
    for (const id of LADDER) {
      for (const player of [1, 2] as const) {
        for (const lobe of bandLobes(l, controlSet(id), player)) {
          expect(hitCircle(lobe.circle, lobe.circle.x, lobe.circle.y)).toBe(true);
        }
      }
    }
  });
});
