import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { type Bullet, type KeelState, midCol, type World } from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import { installCanvasGlobals } from "./canvas-stub.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";
import { aimed } from "./keel-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A bolt stops on what it meets**, for THE KEEL's two targets that want
 * either colour (`keel-stop.ts`): the marrow's lens up the middle, each half
 * once, and the rock the tail throws, up its column. The socket, which wants
 * one colour, is its row in `core-stop-rows.ts`.
 */

beforeAll(() => installCanvasGlobals());

const MID = midCol(CFG);
const ROCK_COL = CFG.cols - 2;

/** The marrow lit a beat in, the halves in `marrow` already sealed. */
const marrow =
  (sealed: [boolean, boolean]) =>
  (s: KeelState, world: World): void => {
    s.phase = "marrow";
    s.phaseBeat = world.beat - 1;
    s.marrow = sealed;
  };

/** Every segment locked and the tail's rock a beat into its fall. */
const thrown = (s: KeelState, world: World): void => {
  s.locked = s.locked.map(() => true);
  s.phase = "rock";
  s.phaseBeat = world.beat - 1;
  s.rockCol = ROCK_COL;
  s.rockBeat = world.beat - 1;
};

describe("THE KEEL stops a bolt", () => {
  it.each(ROLES)("on the lit marrow in either colour, over the field, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, marrow([false, false]));
    const cyan = stops.meets(MID, tileCX(l, MID), "cyan");
    const red = stops.meets(MID, tileCX(l, MID), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it("and scuffs on the lens in the colour already sealed", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, marrow([true, false]));
    const x = tileCX(l, MID);
    expect(stops.meets(MID, x, "red")?.hit).toBe("body");
    expect(stops.meets(MID, x, "cyan")?.hit).toBe("target");
  });

  it.each(ROLES)("on the thrown rock in either colour, up its column, on %s", (role) => {
    const l = computeLayout(VIEWPORT, CFG, role);
    const stops = aimed(l, thrown);
    const cyan = stops.meets(ROCK_COL, tileCX(l, ROCK_COL), "cyan");
    const red = stops.meets(ROCK_COL, tileCX(l, ROCK_COL), "red");
    expect(cyan?.hit).toBe("target");
    expect(red).toEqual(cyan);
    expect(cyan?.y ?? 0).toBeGreaterThan(l.gridTop);
    expect(cyan?.y ?? 0).toBeLessThan(l.hullY);
  });

  it("drawn no further than the rock", () => {
    const l = computeLayout(VIEWPORT, CFG, "test");
    const stops = aimed(l, thrown);
    const x = tileCX(l, ROCK_COL);
    const y = stops.meets(ROCK_COL, x, "cyan")?.y ?? 0;
    expect(stops.stopped(bolt(), x, y + l.tile, "#fff")).toBe(false);
    expect(stops.stopped(bolt(), x, y, "#fff")).toBe(true);
  });
});

function bolt(): Bullet {
  return {
    id: 1,
    col: ROCK_COL,
    row: 0,
    subMilli: 0,
    color: "cyan",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}
