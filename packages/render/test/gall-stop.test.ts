import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Color, gallPointCol } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawGall } from "../src/gall-draw.js";
import { GallFx } from "../src/gall-fx.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { FIRE, LEAP, posed, stood } from "./gall-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Where a bolt meets THE GALL** (`gall-stop.ts`): the alien in its own
 * column, not the middle one — out of `core-stop.test.ts`'s rows on 8 October
 * 2026, when the owner's rework set it down on a point of either half. On a
 * fire step a bolt in the alien's column bursts on it in the step's colour
 * and scuffs in the other; on a leap step it scuffs on the alien; and the
 * seam, which spans the field, scuffs a bolt anywhere else.
 */

beforeAll(installCanvasGlobals);

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

function aimed(l: Layout, fire: boolean, point: number): BoltStops {
  const stops = new BoltStops();
  const world = stood();
  const s = posed(world, fire ? FIRE : LEAP, point);
  drawGall(paper(), l, world, s, world.beat, 0.5, 0, new GallFx(), stops);
  return stops;
}

const meets = (stops: BoltStops, l: Layout, col: number, color: Color) =>
  stops.meets(col, tileCX(l, col), color);

describe.each([0, 3])("THE GALL on point %i stops a bolt", (point) => {
  const col = gallPointCol(CFG, point);

  it.each(ROLES)(
    "bursting on it in the fire step's colour, scuffing in the other, on %s",
    (role) => {
      const l = computeLayout(VIEWPORT, CFG, role);
      const stops = aimed(l, true, point);
      const right = meets(stops, l, col, "cyan");
      const wrong = meets(stops, l, col, "red");
      expect(right?.hit).toBe("target");
      expect(wrong?.hit).toBe("wrong");
      expect(right?.y ?? 0).toBeGreaterThan(l.gridTop);
      expect(right?.y ?? 0).toBeLessThan(l.hullY);
    },
  );

  it.each(ROLES)(
    "on the alien on a leap step, and on the seam in any other column, on %s",
    (role) => {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(meets(aimed(l, false, point), l, col, "cyan")?.hit).toBe("body");
      const other = col === 0 ? CFG.cols - 1 : 0;
      expect(meets(aimed(l, true, point), l, other, "cyan")?.hit).toBe("body");
    },
  );
});
