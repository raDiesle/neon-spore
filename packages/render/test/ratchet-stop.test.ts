import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type Bullet,
  createWorld,
  midCol,
  NO_BOLT,
  RATCHET_TEETH,
  type RatchetState,
  ratchetBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BoltStops } from "../src/bolt-stop.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { drawRatchet } from "../src/ratchet-draw.js";
import { RatchetFx } from "../src/ratchet-fx.js";
import { ratchetCatchBar } from "../src/ratchet-parts.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE RATCHET (`ratchet-stop.ts`): the
 * loose bolt in either colour up its column, the rack anywhere else, the
 * catch's bar on the one screen shown it, and clear air past them.
 */

beforeAll(() => installCanvasGlobals());

const TPB = ticksPerBeat(CFG);
const MID = midCol(CFG);
const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

/** The wave's own rack a few beats in, at work with every tooth left, then as `arrange` sets it. */
function hung(arrange: (s: RatchetState, world: World) => void = () => {}): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("ratchet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 6; i++) step(world, []);
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the ratchet wave hung no rack");
  s.phase = "work";
  s.phaseBeat = world.beat - 1;
  s.teeth = RATCHET_TEETH;
  s.clean = 0;
  s.boltCol = NO_BOLT;
  arrange(s, world);
  return world;
}

/** The bolt thrown, half way down to the hull. */
const loose = (s: RatchetState, world: World) => {
  s.boltCol = MID;
  s.boltBeat = world.beat - Math.floor(CFG.ratchetBoltBeats / 2);
};

function aimed(l: Layout, world: World): BoltStops {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("no rack");
  const stops = new BoltStops();
  drawRatchet(paper(), l, world, s, world.beat, 0.5, 0, new RatchetFx(), stops);
  return stops;
}

describe("THE RATCHET stops a bolt", () => {
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

  it.each(ROLES)("on the rack up the middle while nothing is loose, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const at = aimed(l, hung()).meets(MID, tileCX(l, MID), "cyan");
    expect(at?.hit).toBe("body");
    expect(at?.y ?? 0).toBeGreaterThan(l.gridTop);
  });

  it("lets one past the machine go on into the sky", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    expect(aimed(l, hung()).meets(0, tileCX(l, 0), "cyan")).toBeNull();
  });

  it("on the catch's bar on the navigator's screen, and not past it on the pilot's", () => {
    const nav = computeLayout(VIEWPORT, CFG, "p2");
    const pilot = computeLayout(VIEWPORT, CFG, "p1");
    const world = hung();
    const s = ratchetBoss(world);
    const bar = s === null ? null : ratchetCatchBar(nav, CFG, s);
    if (bar === null) throw new Error("no catch up");
    expect(aimed(nav, world).meets(MID - 2, bar.x, "cyan")?.hit).toBe("body");
    expect(aimed(pilot, world).meets(MID - 2, bar.x, "cyan")).toBeNull();
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
