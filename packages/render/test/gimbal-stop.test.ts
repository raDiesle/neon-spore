import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Bullet,
  createWorld,
  gimbalBoss,
  midCol,
  NO_SEAM,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { drawGimbal } from "../src/gimbal-draw.js";
import { GimbalFx } from "../src/gimbal-fx.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE GIMBAL (`gimbal-stop.ts`): the
 * leaking bead in either colour up the seam's column, the cradle anywhere
 * else this screen draws it, and clear air past the ring it is shown.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own cradle a few beats in, leaking `beatsIn` beats ago or not at all. */
function hung(leakBeatsIn: number | null): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  s.seamCol = leakBeatsIn === null ? NO_SEAM : MID;
  s.seamBeat = world.beat - (leakBeatsIn ?? 0);
  return world;
}

function aimed(l: Layout, world: World): BoltStops {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("no cradle");
  const stops = new BoltStops();
  drawGimbal(paper(), l, world, s, world.beat, 0.5, 0, new GimbalFx(), stops);
  return stops;
}

describe("THE GIMBAL stops a bolt", () => {
  it.each(ROLES)("on the leaking bead in either colour, over the field, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, hung(2));
    const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
    const red = stops.meets(MID, tileCX(l, MID), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it.each(ROLES)("on the cradle up the middle while nothing leaks, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const at = aimed(l, hung(null)).meets(MID, tileCX(l, MID), "cyan");
    expect(at?.hit).toBe("body");
    expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
  });

  it("on the outer hoop three columns out where it is shown, and not past the inner one", () => {
    const shown = computeLayout(VIEWPORT, CFG, "p1");
    const inner = computeLayout(VIEWPORT, CFG, "p2");
    const col = MID - 3;
    expect(aimed(shown, hung(null)).meets(col, tileCX(shown, col), "cyan")?.hit).toBe("body");
    expect(aimed(inner, hung(null)).meets(col, tileCX(inner, col), "cyan")).toBeNull();
  });

  it("drawn no further than the bead", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, hung(2));
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
