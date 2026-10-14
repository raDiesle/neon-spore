import { describe, expect, it } from "bun:test";
import { hydraEyeOpen, hydraGone, hydraLeft, hydraPiecesAll } from "../src/hydra.js";
import { hydraStruck, hydraVerdict } from "../src/hydra-shot.js";
import {
  CFG,
  hashWorld,
  hydra,
  install,
  LAP,
  MID,
  only,
  runUntil,
  SCRIPT,
  shot,
  swipe,
  TPB,
  tap,
  tick,
  toHeads,
  turn,
} from "./hydra-rig.js";

/**
 * THE HYDRA's receipts, one rule a test (`sim/hydra.ts`): each seat cuts only
 * its own necks, the way the arrow points, and a short swipe glances; each
 * turns only its own coil, the way it unwinds, and keeps its laps through a
 * lift; an eye is tapped shut only while open; the open maw is met in its
 * column in its fire's colour, and the wrong colour loses the wave; a level
 * run out strikes the hull; and the last head stopped beats the hydra.
 */

const CUT = CFG.hydraCutMilli + 100;

describe("THE HYDRA", () => {
  it("installs every head to come, and sends the bites after it comes in", () => {
    const world = install();
    const s = hydra(world);
    expect(s.phase).toBe("enter");
    expect(hydraPiecesAll(s)).toBe(4 + 6 + 2 + 2 + 8 + 12 + 3 + 4);
    const seen = toHeads(world);
    expect(seen.has("hydraHeads")).toBe(true);
    expect(hydra(world).cursor).toBe(0);
  });

  it("cuts a neck swiped across the way its arrow points, and only that side's", () => {
    const world = install(only("bite"));
    toHeads(world);
    const s = hydra(world);
    expect(swipe(world, 0, -CUT)).toContain("hydraCut");
    expect(hydraGone(s, 0)).toBe(true);
    expect(hydraGone(s, 2)).toBe(false);
    expect(swipe(world, 1, CUT)).toContain("hydraCut");
    expect(hydraGone(s, 2)).toBe(true);
  });

  it("cuts nothing swiped the wrong way, and glances off a swipe let go short", () => {
    const world = install(only("bite"));
    toHeads(world);
    const s = hydra(world);
    expect(swipe(world, 0, CUT)).not.toContain("hydraCut");
    expect(swipe(world, 0, -CFG.hydraCutMilli / 2)).toContain("hydraGlance");
    expect(hydraLeft(s)).toBe(4);
  });

  it("follows the authored way in a harder course, the navigator's mirrored", () => {
    const world = install([SCRIPT[1]!]);
    toHeads(world);
    expect(swipe(world, 0, -CUT)).toContain("hydraCut");
    expect(swipe(world, 0, CUT)).toContain("hydraCut");
    expect(swipe(world, 1, CUT)).toContain("hydraCut");
    expect(swipe(world, 1, -CUT)).toContain("hydraCut");
  });

  it("says a thumb on the partner's neck, and cuts nothing", () => {
    const world = install(only("bite"));
    toHeads(world);
    const types = swipe(world, 1, CUT, 1);
    expect(types).toContain("hydraWrong");
    expect(types).not.toContain("hydraCut");
    expect(hydraLeft(hydra(world))).toBe(4);
  });

  it("turns a coil off its laps the way it unwinds, and keeps them through a lift", () => {
    const world = install(only("coil"));
    toHeads(world);
    const s = hydra(world);
    const first = turn(world, 0, -LAP - 1000);
    expect(first).toContain("hydraLap");
    expect(first).not.toContain("hydraUncoil");
    expect(s.unwoundMilli[0]).toBeGreaterThan(LAP);
    expect(turn(world, 0, -LAP - 1000)).toContain("hydraUncoil");
    expect(hydraGone(s, 0)).toBe(true);
    expect(turn(world, 1, -2 * LAP)).not.toContain("hydraUncoil");
    expect(s.unwoundMilli[1]).toBe(0);
    expect(turn(world, 1, 2 * LAP + 1000)).toContain("hydraUncoil");
  });

  it("shuts an open eye on a tap, and refuses a tap while it blinks", () => {
    const world = install(only("eye"));
    toHeads(world);
    const s = hydra(world);
    expect(hydraEyeOpen(s, 0)).toBe(true);
    expect(tap(world, 0)).toContain("hydraPoke");
    expect(hydraGone(s, 0)).toBe(true);
    expect(hydraEyeOpen(s, 0)).toBe(false);
    expect(tap(world, 0)).toContain("hydraMiss");
    runUntil(world, (w) => hydraEyeOpen(hydra(w), 0), CFG.hydraBlinkBeats + 1);
    expect(tap(world, 0)).toContain("hydraPoke");
    expect(tap(world, 1, 1)).toContain("hydraWrong");
  });

  it("blinks an eye left open, and opens it again", () => {
    const world = install(only("eye"));
    toHeads(world);
    const seen = runUntil(world, (w) => !hydraEyeOpen(hydra(w), 1), CFG.hydraStareBeats + 1);
    expect(seen.has("hydraBlink")).toBe(true);
    const again = runUntil(world, (w) => hydraEyeOpen(hydra(w), 1), CFG.hydraBlinkBeats + 1);
    expect(again.has("hydraOpen")).toBe(true);
  });

  it("quenches the open maw in its column and colour, and loses the wave on the other", () => {
    const world = install(only("maw"));
    toHeads(world);
    const s = hydra(world);
    expect(hydraVerdict(world, MID, "red")).toBe("armour");
    expect(hydraVerdict(world, MID - 2, "cyan")).toBe("wrong");
    hydraStruck(world, shot(MID - 2, "red"));
    expect(world.events.map((e) => e.type)).toContain("hydraQuench");
    expect(world.events.map((e) => e.type)).toContain("hydraMaw");
    expect(hydraLeft(s)).toBe(2);
    expect(hydraVerdict(world, MID + 1, "cyan")).toBe("target");
    hydraStruck(world, shot(MID + 1, "red"));
    expect(hydraLeft(s)).toBe(2);
    expect(world.failCause).toBe("wrongColour");
  });

  it("strikes the hull with a head when a level runs out", () => {
    const world = install(only("bite"));
    toHeads(world);
    swipe(world, 0, -CUT);
    const scars = world.scars.length;
    const seen = runUntil(world, (w) => hydra(w).phase === "struck", 40);
    expect(seen.has("hydraStrike")).toBe(true);
    expect(world.scars.length).toBe(scars + 1);
  });

  it("rears back between levels, and is beaten after the last head", () => {
    const world = install(only("eye", "maw"));
    toHeads(world);
    for (let n = 0; n < 4; n++) {
      for (const side of [0, 1] as const) {
        runUntil(world, (w) => hydraEyeOpen(hydra(w), side), 10);
        tap(world, side);
      }
    }
    expect(hydra(world).phase).toBe("rear");
    toHeads(world);
    hydraStruck(world, shot(MID - 2, "red"));
    hydraStruck(world, shot(MID + 1, "cyan"));
    hydraStruck(world, shot(MID, "red"));
    expect(hydra(world).phase).toBe("spent");
    const seen = runUntil(world, (w) => w.boss === null, CFG.hydraSpentBeats + 2);
    expect(seen.has("hydraOut")).toBe(true);
  });

  it("plays the same hydra to the same hash", () => {
    const run = () => {
      const world = install();
      toHeads(world);
      swipe(world, 0, -CUT);
      for (let t = 0; t < TPB * 3; t++) tick(world);
      return hashWorld(world);
    };
    expect(run()).toBe(run());
  });
});
