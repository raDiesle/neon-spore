import { describe, expect, it } from "bun:test";
import { hashWorld } from "../src/hash.js";
import { type SeamStep, seamWantsShield, seamWantsShot } from "../src/seam.js";
import { seamStruck } from "../src/seam-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { CFG, install, MID, runUntil, seam, shield, shot, toLit } from "./seam-rig.js";

/**
 * THE SEAM's two steps answered by sending nothing (§26 rows 10 and 16): a
 * false point flickering colourless at the crack's midpoint, where a bolt is
 * a hull hit, and the crack dark after the last seal, where a bolt holds the
 * ridge shut one beat longer. Each passes when its beats run out untouched.
 */

const DECOY: SeamStep = { ask: "decoy", color: "either", offset: 0, seals: false };
const DARK: SeamStep = { ask: "dark", color: "either", offset: 0, seals: false };

describe("the false point", () => {
  it("lights under THE SLOW and asks for neither the cannon nor the shield", () => {
    const world = install([DECOY]);
    toLit(world);
    expect(slowing(world)).toBe(true);
    expect(world.events.some((e) => e.type === "seamLight" && e.ask === "decoy")).toBe(true);
    expect(seamWantsShot(seam(world))).toBe(false);
    expect(seamWantsShield(seam(world))).toBe(false);
  });

  it("left alone, fades after seamDecoyBeats and the ridge rests", () => {
    const world = install([DECOY]);
    toLit(world);
    const lit = world.beat;
    const seen = runUntil(world, (w) => seam(w).phase !== "lit", CFG.seamDecoyBeats + 1);
    expect(seen.has("seamFade")).toBe(true);
    expect(world.beat - lit).toBe(CFG.seamDecoyBeats);
    expect(seam(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it.each(["red", "cyan"] as const)("fired at in %s, is a hull hit", (color) => {
    const world = install([DECOY]);
    toLit(world);
    expect(seamStruck(world, shot(MID, color))).toBe(true);
    expect(world.events.some((e) => e.type === "seamBaited")).toBe(true);
    expect(world.failTick).not.toBe(NOT_FAILED);
  });

  it("meets nothing off the ridge's column, and a shield is not an answer", () => {
    const world = install([DECOY]);
    toLit(world);
    expect(seamStruck(world, shot(MID + 1, "red"))).toBe(false);
    expect(shield(world).has("seamBlock")).toBe(false);
    expect(seam(world).phase).toBe("lit");
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the dark", () => {
  it("lies dark without THE SLOW, gives in silence, and the ridge splits", () => {
    const world = install([DARK]);
    toLit(world);
    expect(slowing(world)).toBe(false);
    expect(seamWantsShot(seam(world))).toBe(false);
    const lit = world.beat;
    const seen = runUntil(world, (w) => seam(w).phase !== "lit", CFG.seamDarkBeats + 1);
    expect(world.beat - lit).toBe(CFG.seamDarkBeats);
    expect(seen.has("seamFade")).toBe(false);
    expect(runUntil(world, (w) => seam(w).phase === "split").has("seamSplit")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("fired into, reseals and holds one beat longer — once", () => {
    const world = install([DARK]);
    toLit(world);
    const lit = world.beat;
    const before = hashWorld(world);
    expect(seamStruck(world, shot(MID, "red"))).toBe(true);
    expect(world.events.some((e) => e.type === "seamReseal")).toBe(true);
    expect(seam(world).held).toBe(true);
    expect(hashWorld(world)).not.toBe(before);
    world.events.length = 0;
    expect(seamStruck(world, shot(MID, "cyan"))).toBe(true);
    expect(world.events.some((e) => e.type === "seamReseal")).toBe(false);
    runUntil(world, (w) => seam(w).phase !== "lit", CFG.seamDarkBeats + 2);
    expect(world.beat - lit).toBe(CFG.seamDarkBeats + 1);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
