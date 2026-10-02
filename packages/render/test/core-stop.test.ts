import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, type Color, midCol } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { installCanvasGlobals } from "./canvas-stub.js";
import { ROWS, type Row } from "./core-stop-rows.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for the bosses whose shot is a core
 * over the middle column (`core-stop.ts`, `sim/core-verdict.ts`): each drawn
 * through its own drawer, open on a cyan fire step and shut, and asked where
 * a bolt in a column meets it — the core in its colour bursts, the other
 * colour scuffs there, the shell scuffs at its foot, and clear air lets it
 * go. One row a boss, in `core-stop-rows.ts`; the next lane adds its own.
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);

function aimed(row: Row, l: Layout, open: boolean): BoltStops {
  const stops = new BoltStops();
  row.draw(stops, l, open);
  return stops;
}

const meets = (stops: BoltStops, l: Layout, col: number, color: Color) =>
  stops.meets(col, tileCX(l, col), color);

describe.each(ROWS)("$name stops a bolt", (row) => {
  it.each(ROLES)(
    "bursting on the open core in its colour, scuffing in the other, on %s",
    (role) => {
      const l = computeLayout(VIEWPORT, CFG, role);
      const stops = aimed(row, l, true);
      const right = meets(stops, l, MID, "cyan");
      const wrong = meets(stops, l, MID, "red");
      expect(right?.hit).toBe("target");
      expect(wrong?.hit).toBe("wrong");
      expect(wrong?.y).toBe(right?.y ?? Number.NaN);
      // Above the hull, and over the field: the core is where it is drawn.
      expect(right?.y ?? 0).toBeGreaterThan(l.gridTop);
      expect(right?.y ?? 0).toBeLessThan(l.hullY);
    },
  );

  it.each(ROLES)("on the shell beside the core, and on the shut core, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    if (row.wide) expect(meets(aimed(row, l, true), l, MID + 1, "cyan")?.hit).toBe("body");
    expect(meets(aimed(row, l, false), l, MID, "cyan")?.hit).toBe("body");
  });

  it("and lets one past the body go on into the sky, or scuffs it on one that spans the field", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const edge = meets(aimed(row, l, true), l, 0, "cyan");
    if (row.spans) expect(edge?.hit).toBe("body");
    else expect(edge).toBeNull();
  });

  it("drawn no further than where it meets the core", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(row, l, true);
    const at = meets(stops, l, MID, "cyan");
    const x = tileCX(l, MID);
    const below = (at?.y ?? 0) + l.tile;
    expect(stops.stopped(bolt(MID), x, below, "#fff")).toBe(false);
    expect(stops.stopped(bolt(MID), x, at?.y ?? 0, "#fff")).toBe(true);
  });
});

function bolt(col: number): Bullet {
  return {
    id: 1,
    col,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
