import { describe, expect, it } from "bun:test";
import { type ControlSet, controlSet } from "@neon-spore/content";
import { createWorld, DEFAULT_CONFIG } from "@neon-spore/sim";
import { bandLobes, computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";

/**
 * How near a strip a thumb may land and still mean it.
 *
 * The owner reported the cannon slider as *often* not working on his phone
 * while the buttons beside it always did, and guessed at the grab area being
 * too small. It was not: the slab was 48 px tall and the width of the stage.
 * What was wrong is that the slab was a rectangle round the *cord*, and the
 * node a thumb aims at is drawn with a halo half again as wide — 70 px of
 * visible control against 48 px of answer, with 36 px of screen between the
 * cannon on the hull and the cannon on the panel that answered nothing at all.
 *
 * So the check is not that the strip is big but that the **band has no dead
 * rows in it**: between the top of the panel and the first button, every press
 * belongs to something. `strip-band.ts` carries the rule.
 */

const CFG = DEFAULT_CONFIG;
/** A real phone, and the viewport the miss was measured on. */
const PHONE = { width: 390, height: 844, dpr: 3 };
const STANDARD = controlSet("default");

function layout(role: ViewRole): Layout {
  return computeLayout(PHONE, CFG, role);
}

function field(seat: 1 | 2, controls: ControlSet = STANDARD): Field {
  const world = createWorld(CFG, 2);
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.5,
    skinY: null,
    beat: 0,
    waveBeat: 0,
    tick: 0,
    seat,
    cfg: CFG,
    boss: null,
    controls,
    faults: [],
    well: false,
  };
}

/** What a press down the middle of the panel says, or null. */
function at(l: Layout, f: Field, y: number): string | null {
  return touchDown(l, l.width / 2, y, f)?.command?.kind ?? null;
}

describe("a strip's share of the band", () => {
  for (const [name, role, seat, kind] of [
    ["the pilot's cannon", "p1", 1, "cannonCol"],
    ["the navigator's shield", "p2", 2, "shieldCol"],
  ] as const) {
    it(`${name} answers every row from the band's top down to the buttons`, () => {
      const l = layout(role);
      const f = field(seat);
      const strip = seat === 1 ? l.cannonStrip : l.shieldStrip;
      // Down to where the nearest button starts answering — `hitCircle` widens
      // a lobe by 30%, which is why the reach stops short of the drawn row.
      const untilRow = Math.floor(l.lobeY - l.lobeR * 1.3);
      const dead: number[] = [];
      for (let y = Math.ceil(l.bandTop); y < untilRow; y++) if (at(l, f, y) !== kind) dead.push(y);
      expect(dead, `${dead.length} rows of the panel answer nothing`).toEqual([]);
      expect(strip.top).toBeLessThanOrEqual(l.bandTop);
    });

    it(`${name} reaches the whole of the node a thumb aims at`, () => {
      // The halo `spine` draws round the node held is `1.1` of the strip's own
      // height, so a press anywhere on the thing the player can see has to
      // land inside the answer (`gland-fluid.ts`).
      const l = layout(role);
      const f = field(seat);
      const strip = seat === 1 ? l.cannonStrip : l.shieldStrip;
      const halo = strip.height * 1.1;
      expect(at(l, f, strip.y - halo)).toBe(kind);
      expect(at(l, f, strip.y + halo)).toBe(kind);
    });
  }

  it("leaves the buttons to the buttons", () => {
    // The strip is the band's fallback now, so it is asked after the lobes and
    // never over one: a press on the guard is still the guard.
    const l = layout("p1");
    const f = field(1);
    for (const lobe of bandLobes(l, STANDARD, 1)) {
      const said = touchDown(l, lobe.circle.x, lobe.circle.y, f);
      expect(said?.command?.kind, `${lobe.control.id} was answered as something else`).not.toBe(
        "cannonCol",
      );
    }
  });

  it("splits the band between the two strips where one screen carries both", () => {
    const l = layout("test");
    // No gap between them: the two meet, and where the floor on a strip's own
    // reach makes them overlap by a few pixels the one asked first takes it —
    // which is a decision rather than a coin toss (`strip-band.ts`).
    expect(l.cannonStrip.bottom).toBeGreaterThanOrEqual(l.shieldStrip.top);
    // And neither reaches the row the other is drawn on, which is the one way
    // a shared panel could answer a press as the wrong seat's control.
    expect(l.cannonStrip.bottom).toBeLessThan(l.shieldStrip.y);
    expect(l.shieldStrip.top).toBeGreaterThan(l.cannonStrip.y);
    expect(touchDown(l, l.width / 2, l.cannonStrip.y, field(1))?.command?.kind).toBe("cannonCol");
    expect(touchDown(l, l.width / 2, l.shieldStrip.y, field(1))?.command?.kind).toBe("shieldCol");
  });

  it("never answers a press on the field as a press on the panel", () => {
    // The fix is the panel's alone. Above the band the cannon is still reached
    // through its swelling on the hull, and that hold is marked `direct` —
    // which is how the two are told apart here, both of them saying
    // `cannonCol` (`touch-ship.ts`).
    const l = layout("p1");
    const f = field(1);
    for (let y = Math.ceil(l.gridTop); y < l.bandTop; y++) {
      const hold = touchDown(l, l.width / 2, y, f)?.hold;
      if (hold?.kind !== "cannon") continue;
      expect(hold.direct, `y ${y} on the field was answered as the panel's strip`).toBe(true);
    }
  });
});
