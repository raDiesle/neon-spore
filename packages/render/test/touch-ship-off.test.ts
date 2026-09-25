import { describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { cannonGrab, shieldGrab, shipUnder } from "../src/touch-ship.js";
import { wellCannonGrab, wellShieldGrab } from "../src/touch-well.js";

/**
 * SETTINGS' TOUCH THE SHIP, off — the game's default since 25 September 2026.
 *
 * `Field.ship` false is the whole switch: neither lobe answers a hand on
 * either picture, and the hover ring asks the same `shipUnder`, so a lobe
 * that takes nothing lights nothing either. The panel is untouched, which
 * `touch.test.ts` already holds for every wave.
 */

const CFG = DEFAULT_CONFIG;
const l = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, "test");

function field(seat: 1 | 2, ship: boolean | undefined, well = false): Field {
  return {
    creatures: [],
    cannonCol: 2,
    shieldCol: 8,
    beatPhase: 0.5,
    skinY: null,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat,
    cfg: CFG,
    boss: null,
    controls: controlSet("default"),
    faults: [],
    well,
    ...(ship === undefined ? {} : { ship }),
  };
}

const SHIP_HOLDS = ["cannon", "shield", "shot", "guard"];

describe("the hull with TOUCH THE SHIP off", () => {
  for (const seat of [1, 2] as const) {
    it(`answers no press on either lobe, seat ${seat}, flat hull`, () => {
      for (const at of [cannonGrab(l, 2), shieldGrab(l, 8)]) {
        expect(SHIP_HOLDS).toContain(touchDown(l, at.x, at.y, field(seat, true))?.hold?.kind ?? "");
        const f = field(seat, false);
        expect(shipUnder(l, at.x, at.y, f)).toBeNull();
        const press = touchDown(l, at.x, at.y, f);
        expect(SHIP_HOLDS).not.toContain(press?.hold?.kind);
      }
    });

    it(`answers no press on either lobe, seat ${seat}, THE WELL`, () => {
      for (const at of [wellCannonGrab(l, 2), wellShieldGrab(l, 8)]) {
        expect(SHIP_HOLDS).toContain(
          touchDown(l, at.x, at.y, field(seat, true, true))?.hold?.kind ?? "",
        );
        const press = touchDown(l, at.x, at.y, field(seat, false, true));
        expect(SHIP_HOLDS).not.toContain(press?.hold?.kind);
      }
    });
  }

  it("still answers when the field says nothing, which the director and the tests do", () => {
    const at = cannonGrab(l, 2);
    expect(touchDown(l, at.x, at.y, field(1, undefined))?.hold?.kind).toBe("cannon");
    expect(touchDown(l, at.x, at.y, field(1, true))?.hold?.kind).toBe("cannon");
  });
});
