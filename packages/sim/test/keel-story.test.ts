import { describe, expect, it } from "bun:test";
import { keelEndSeg } from "../src/keel.js";
import { keelStruck } from "../src/keel-shot.js";
import { slowing } from "../src/slow.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answer,
  CFG,
  chord,
  install,
  keel,
  MID,
  runUntil,
  shot,
  tap,
  tick,
  toFlip,
  toMarrow,
  toRock,
  toTempo,
} from "./keel-rig.js";

/**
 * THE KEEL's story between the rigid spine and the end (`sim/keel-story.ts`):
 * the flip both thumbs hold together, the marrow a bolt of each colour
 * seals, the breath and the cooldown the pair keep their hands off. What
 * these pin is what a phone cannot show: one thumb is not the chord, a chord
 * let go starts again, a flip run out strikes the hull, an unsealed marrow
 * burns a segment loose, a touch on the held breath loosens one more, and a
 * tap on the cooling spine only delays it.
 */

const lift = (t: number, player: 1 | 2) => ({
  tick: t,
  player,
  command: { kind: "drag", target: "keelJoint", on: false, fromMilli: 0 } as const,
});

describe("the flip", () => {
  it("follows the last lock of movement two, under THE SLOW", () => {
    const world = install();
    toFlip(world);
    expect(slowing(world)).toBe(true);
    expect(keelEndSeg(keel(world), 1)).toBe(0);
    expect(keelEndSeg(keel(world), 2)).toBe(CFG.keelSegments - 1);
  });

  it("is arrested by both thumbs held together, and lights the marrow", () => {
    const world = install();
    toFlip(world);
    tick(world, chord(world.tick));
    const seen = runUntil(world, (w) => keel(w).phase === "marrow", CFG.keelFlipBeats);
    expect(seen.has("keelArrest")).toBe(true);
    expect(seen.has("keelMarrow")).toBe(true);
  });

  it("is not arrested by one thumb, and run out strikes the hull and bows again", () => {
    const world = install();
    toFlip(world);
    tick(world, [tap(world.tick, 1), lift(world.tick, 2)]);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.keelFlipBeats + 2);
    expect(seen.has("keelSnap")).toBe(true);
    expect(seen.has("keelArrest")).toBe(false);
    expect(keel(world).phase).toBe("flip");
  });

  it("starts the count again when a thumb lets go", () => {
    const world = install();
    toFlip(world);
    tick(world, chord(world.tick));
    const s = keel(world);
    runUntil(world, () => s.chordBeats === 1, 2);
    tick(world, [lift(world.tick, 2)]);
    runUntil(world, () => s.chordBeats === 0, 2);
    expect(s.phase).toBe("flip");
  });
});

describe("the marrow", () => {
  it("is sealed by one bolt of each colour up the middle, and only there", () => {
    const world = install();
    toMarrow(world);
    keelStruck(world, shot(MID - 1, "red"));
    expect(keel(world).marrow).toEqual([false, false]);
    keelStruck(world, shot(MID, "red"));
    keelStruck(world, shot(MID, "red"));
    expect(keel(world).phase).toBe("marrow");
    keelStruck(world, shot(MID, "cyan"));
    expect(keel(world).phase).toBe("breath");
    expect(keel(world).locked.every(Boolean)).toBe(true);
  });

  it("left unsealed burns the left-middle segment loose, and the breath follows", () => {
    const world = install();
    toMarrow(world);
    const seen = runUntil(world, (w) => keel(w).phase === "breath", CFG.keelMarrowBeats + 2);
    expect(seen.has("keelBurn")).toBe(true);
    expect(seen.has("keelBreath")).toBe(true);
    expect(keel(world).locked[CFG.keelSegments / 2 - 1]).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });
});

describe("the breath", () => {
  const breathing = () => {
    const world = install();
    toMarrow(world);
    keelStruck(world, shot(MID, "red"));
    keelStruck(world, shot(MID, "cyan"));
    return world;
  };
  // The rightmost locked segment the wave's order [4, 3, 0] does not re-light.
  const TAIL = CFG.keelSegments - 1;

  it("holds keelBreathBeats under THE SLOW, and held untouched opens the tempo run whole", () => {
    const world = breathing();
    expect(slowing(world)).toBe(true);
    expect(world.slowHolds).toBe(true);
    const start = world.beat;
    const seen = runUntil(world, (w) => keel(w).movement === 3, CFG.keelBreathBeats + 1);
    expect(world.beat - start).toBe(CFG.keelBreathBeats);
    expect(seen.has("keelHeld")).toBe(true);
    expect(seen.has("keelStir")).toBe(false);
    expect(keel(world).phase).toBe("rest");
    expect(keel(world).locked.every(Boolean)).toBe(true);
  });

  it("stirred by a touch loosens one segment the run will not re-light, once, and the run still opens", () => {
    const world = breathing();
    expect(tick(world, [tap(world.tick, 2)])).toContain("keelStir");
    expect(keel(world).stirred).toBe(true);
    expect(tick(world, [tap(world.tick, 1)])).not.toContain("keelStir");
    expect(keel(world).locked.filter((l) => !l)).toHaveLength(1);
    expect(keel(world).locked[TAIL]).toBe(false);
    const seen = runUntil(world, (w) => keel(w).movement === 3, CFG.keelBreathBeats + 1);
    expect(seen.has("keelHeld")).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("counts a press, not a thumb still down from the flip", () => {
    const world = breathing();
    expect(keel(world).held).toEqual([true, true]);
    runUntil(world, (w) => keel(w).movement === 3, CFG.keelBreathBeats + 1);
    expect(keel(world).stirred).toBe(false);
  });

  it("costs the stir one extra joint in the tempo run, after the wave's own order", () => {
    const world = breathing();
    tick(world, [tap(world.tick, 1)]);
    runUntil(world, (w) => keel(w).movement === 3, CFG.keelBreathBeats + 1);
    const lit: number[] = [];
    for (let i = 0; i < 4; i++) {
      runUntil(world, (w) => keel(w).phase === "joint");
      lit.push(keel(world).joint);
      answer(world);
    }
    expect(lit).toEqual([...keel(world).reprise, TAIL]);
    runUntil(world, (w) => keel(w).phase === "rigid");
  });

  it("is on the way whichever way the marrow went", () => {
    const world = install();
    toTempo(world);
    expect(keel(world).movement).toBe(3);
  });
});

describe("the cooldown", () => {
  const cooling = () => {
    const world = install("red");
    toRock(world);
    keelStruck(world, shot(keel(world).rockCol, "red"));
    runUntil(world, (w) => keel(w).phase === "cool", 2);
    return world;
  };

  it("banks hands-off, and a tap flares it and holds it a beat longer", () => {
    const still = cooling();
    const quiet = runUntil(still, (w) => keel(w).phase === "straight", CFG.keelCoolBeats + 1);
    expect(quiet.has("keelFlare")).toBe(false);
    const tapped = cooling();
    const start = tapped.beat;
    expect(tick(tapped, [tap(tapped.tick, 1)])).toContain("keelFlare");
    runUntil(tapped, (w) => keel(w).phase === "straight", CFG.keelCoolBeats + 2);
    expect(tapped.beat - start).toBeGreaterThan(CFG.keelCoolBeats - 1);
  });

  it("flares at most keelCoolFlares times", () => {
    const world = cooling();
    for (let i = 0; i < CFG.keelCoolFlares + 2; i++) tick(world, [tap(world.tick, 2)]);
    expect(keel(world).flares).toBe(CFG.keelCoolFlares);
  });
});
