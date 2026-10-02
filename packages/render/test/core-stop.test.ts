import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, type Color, midCol } from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawBurgee } from "../src/burgee-draw.js";
import { BurgeeFx } from "../src/burgee-fx.js";
import { drawCapstan } from "../src/capstan-draw.js";
import { CapstanFx } from "../src/capstan-fx.js";
import { drawDavit } from "../src/davit-draw.js";
import { DavitVerdicts } from "../src/davit-verdicts.js";
import { drawFlue } from "../src/flue-draw.js";
import { FlueFx } from "../src/flue-fx.js";
import { drawGovernor } from "../src/governor-draw.js";
import { GovernorFx } from "../src/governor-fx.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import * as burgee from "./burgee-harness.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import * as capstan from "./capstan-harness.js";
import * as davit from "./davit-harness.js";
import * as flue from "./flue-harness.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import * as governor from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for the bosses whose shot is a core
 * over the middle column (`core-stop.ts`, `sim/core-verdict.ts`): each drawn
 * through its own drawer, open on a cyan fire step and shut, and asked where
 * a bolt in a column meets it — the core in its colour bursts, the other
 * colour scuffs there, the shell scuffs at its foot, and clear air lets it
 * go. One row a boss; the next lane adds its own.
 */

interface Row {
  name: string;
  /** The boss stood and drawn with `stops`, its core open on a cyan fire step or shut. */
  draw(stops: BoltStops, l: Layout, open: boolean): void;
  /**
   * Whether the body stands over the column beside the middle one while the
   * core is open; a boss hung from one point over the middle column does not.
   */
  wide: boolean;
}

const ROWS: Row[] = [
  {
    name: "THE FLUE",
    draw(stops, l, open) {
      const world = flue.stood();
      const s = flue.posed(world, open ? flue.FIRE : flue.DAMPER, 0, (f) => {
        f.bared = open;
        f.vents = 2;
      });
      drawFlue(paper(), l, world, s, world.beat, 0.5, 0, new FlueFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE GOVERNOR",
    draw(stops, l, open) {
      const world = governor.stood();
      const s = governor.posed(world, open ? governor.FIRE : governor.TAP, 0, (g) => {
        g.hubLit = open;
      });
      drawGovernor(paper(), l, world, s, world.beat, 0.5, 0, new GovernorFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE BURGEE",
    draw(stops, l, open) {
      const world = burgee.stood();
      const s = burgee.posed(world, open ? burgee.FIRE : burgee.CATCH, 0, (b) => {
        b.spindleLit = open;
      });
      drawBurgee(paper(), l, world, s, world.beat, 0.5, 0, new BurgeeFx(), stops);
    },
    wide: false,
  },
  {
    name: "THE CAPSTAN",
    draw(stops, l, open) {
      const world = capstan.stood();
      const s = capstan.posed(world, capstan.FIRE, (c) => {
        c.bared = open;
      });
      drawCapstan(paper(), l, world, s, world.beat, 0.5, 0, new CapstanFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE DAVIT",
    draw(stops, l, open) {
      const world = davit.stood();
      const s = davit.posed(world, davit.FIRE, 0, (d) => {
        d.pivotLit = open;
      });
      drawDavit(paper(), l, world, s, world.beat, 0.5, 0, new DavitVerdicts(), stops);
    },
    wide: false,
  },
];

beforeAll(() => installCanvasGlobals());

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;
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

  it("and lets one past the body go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(meets(aimed(row, l, true), l, 0, "cyan")).toBeNull();
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
