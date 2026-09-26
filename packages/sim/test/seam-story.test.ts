import { describe, expect, it } from "bun:test";
import type { SeamStep } from "../src/seam.js";
import { seamStruck } from "../src/seam-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  CFG,
  install,
  MID,
  runUntil,
  SCRIPT,
  seam,
  shield,
  shot,
  toLit,
} from "./seam-rig.js";

/**
 * THE SEAM's story steps (§26 rows 5–7 and 12–13): the ridge turned face
 * away, throwing its grit blind onto the shield, and a glow gathering up
 * through the shell that takes `seamGlowShots` shots of either colour to
 * quench — each under THE SLOW, and each run out a hull hit.
 */

const BLIND: SeamStep = { ask: "blind", color: "either", offset: 0, seals: false };
const GLOW: SeamStep = { ask: "glow", color: "either", offset: 0, seals: false };

describe("the turn", () => {
  it("lights under THE SLOW for its own beats", () => {
    const world = install([BLIND]);
    toLit(world);
    expect(slowing(world)).toBe(true);
    expect(world.events.some((e) => e.type === "seamLight" && e.ask === "blind")).toBe(true);
  });

  it("takes no shot, only the shield under the ridge", () => {
    const world = install([BLIND]);
    toLit(world);
    seamStruck(world, shot(MID, "red"));
    expect(seam(world).phase).toBe("lit");
    const seen = shield(world);
    expect(seen.has("seamBlock")).toBe(true);
    expect(seam(world).phase).toBe("rest");
    expect(slowing(world)).toBe(false);
  });

  it("left unshielded strikes the hull after seamBlindBeats", () => {
    const world = install([BLIND]);
    toLit(world);
    const lit = world.beat;
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.seamBlindBeats + 2);
    expect(seen.has("seamMiss")).toBe(true);
    expect(world.beat - lit).toBe(CFG.seamBlindBeats);
  });
});

describe("the glow", () => {
  it("takes either colour and gathers until seamGlowShots have landed", () => {
    const world = install([GLOW]);
    toLit(world);
    const lefts: number[] = [];
    for (let i = 0; i < CFG.seamGlowShots; i++) {
      expect(seam(world).phase).toBe("lit");
      seamStruck(world, shot(MID, i % 2 === 0 ? "red" : "cyan"));
      for (const e of world.events) if (e.type === "seamQuench") lefts.push(e.left);
      world.events.length = 0;
    }
    expect(lefts).toEqual(
      [...Array(CFG.seamGlowShots).keys()].map((i) => CFG.seamGlowShots - 1 - i),
    );
    expect(seam(world).phase).toBe("rest");
    expect(seam(world).sealed).toBe(0);
  });

  it("wants the middle column", () => {
    const world = install([GLOW]);
    toLit(world);
    seamStruck(world, shot(MID + 1, "red"));
    expect(seam(world).quenched).toBe(0);
  });

  it("half quenched still runs out against the hull, and the count starts over next time", () => {
    const world = install([GLOW, GLOW]);
    toLit(world);
    seamStruck(world, shot(MID, "red"));
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.seamGlowBeats + 2);
    expect(seen.has("seamMiss")).toBe(true);
    expect(seen.has("seamQuench")).toBe(false);
  });
});

describe("the shipped script", () => {
  it("is eleven steps with both story steps in it, and answered through it splits", () => {
    expect(SCRIPT.length).toBe(11);
    expect(SCRIPT.some((s) => s.ask === "blind")).toBe(true);
    expect(SCRIPT.some((s) => s.ask === "glow")).toBe(true);
    const world = install();
    for (let i = 0; i < SCRIPT.length; i++) {
      toLit(world);
      answer(world);
    }
    runUntil(world, (w) => seam(w).phase === "split");
    expect(seam(world).sealed).toBe(3);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});
