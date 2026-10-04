import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  midCol,
  stareBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawStare } from "../src/stare-draw.js";
import { StareFx } from "../src/stare-fx.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE STARE (`stare-stop.ts`): the
 * glass dome up the middle in either colour, never a target, and clear air
 * past the dome.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own eye a few beats in, open or shut. */
function hung(open: boolean): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("stare");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = stareBoss(world);
  if (s === null) throw new Error("the stare wave hung no eye");
  s.phase = "live";
  s.phaseBeat = world.beat - 1;
  s.open = open;
  return world;
}

function aimed(l: Layout, world: World): BoltStops {
  const s = stareBoss(world);
  if (s === null) throw new Error("no eye");
  const stops = new BoltStops();
  drawStare(paper(), l, world, s, world.beat, 0.5, 0, new StareFx(), stops);
  return stops;
}

describe("THE STARE stops a bolt", () => {
  it.each(ROLES)("on the glass up the middle, open or shut, in either colour, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    for (const open of [true, false]) {
      const stops = aimed(l, hung(open));
      const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
      expect(cyan?.hit).toBe("body");
      expect(stops.meets(MID, tileCX(l, MID), "red")).toEqual(cyan);
      expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
      expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
    }
  });

  it("lets one past the dome go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(aimed(l, hung(false)).meets(0, tileCX(l, 0), "cyan")).toBeNull();
  });
});
