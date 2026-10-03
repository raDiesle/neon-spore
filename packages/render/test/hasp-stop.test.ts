import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Bullet,
  createWorld,
  HASP_COUNT,
  type HaspState,
  haspBoss,
  midCol,
  NO_BOLT,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawHasp } from "../src/hasp-draw.js";
import { HaspFx } from "../src/hasp-fx.js";
import { haspLatchBar } from "../src/hasp-parts.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE HASP (`hasp-stop.ts`): the
 * loose bolt in either colour up its column, the row of clasps anywhere else,
 * the latch's bar on the one screen shown it, and clear air past them.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own door a few beats in, as `arrange` sets it. */
function hung(arrange: (s: HaspState, world: World) => void): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no door");
  arrange(s, world);
  return world;
}

/** Two hasps swung and the second's bolt half way down to the hull. */
const loose = (s: HaspState, world: World) => {
  s.phase = "swing";
  s.phaseBeat = world.beat - 1;
  s.hasps = HASP_COUNT - 2;
  s.boltCol = MID;
  s.boltBeat = world.beat - Math.floor(CFG.haspBoltBeats / 2);
};

/** The row sealed, nothing loose. */
const sealed = (s: HaspState, world: World) => {
  s.phase = "still";
  s.phaseBeat = world.beat;
  s.hasps = HASP_COUNT;
  s.boltCol = NO_BOLT;
};

/** The first hasp at work, the latch up at no depth. */
const working = (s: HaspState, world: World) => {
  sealed(s, world);
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
};

function aimed(l: Layout, world: World): BoltStops {
  const s = haspBoss(world);
  if (s === null) throw new Error("no door");
  const stops = new BoltStops();
  drawHasp(paper(), l, world, s, world.beat, 0.5, 0, new HaspFx(), stops);
  return stops;
}

describe("THE HASP stops a bolt", () => {
  it.each(ROLES)("on the loose bolt in either colour, over the field, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung(loose));
    const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
    const red = stops.meets(MID, tileCX(l, MID), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it.each(ROLES)("on the row up the middle and beside it while nothing is loose, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung(sealed));
    for (const col of [MID, MID + 1, MID - 1]) {
      const at = stops.meets(col, tileCX(l, col), "cyan");
      expect(at?.hit).toBe("body");
      expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
    }
  });

  it("lets one past the row go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(aimed(l, hung(sealed)).meets(0, tileCX(l, 0), "cyan")).toBeNull();
  });

  it("on the latch's bar on the pilot's screen, and not past it on the navigator's", () => {
    const pilot = computeLayout(VIEWPORT, CFG, "p1");
    const nav = computeLayout(VIEWPORT, CFG, "p2");
    const world = hung(working);
    const s = haspBoss(world);
    const bar = s === null ? null : haspLatchBar(pilot, CFG, s);
    if (bar === null) throw new Error("no latch up");
    expect(aimed(pilot, world).meets(MID + 2, bar.x, "cyan")?.hit).toBe("body");
    expect(aimed(nav, world).meets(MID + 2, bar.x, "cyan")).toBeNull();
  });

  it("drawn no further than the loose bolt", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, hung(loose));
    const x = tileCX(l, MID);
    const y = stops.meets(MID, x, "cyan")?.y ?? 0;
    expect(stops.stopped(bolt(), x, y + l.tile, "#fff")).toBe(false);
    expect(stops.stopped(bolt(), x, y, "#fff")).toBe(true);
  });
});

function bolt(): Bullet {
  return {
    id: 1,
    col: MID,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
