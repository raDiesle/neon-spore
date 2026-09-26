import { describe, expect, it } from "bun:test";
import { NO_SPARK } from "../src/mantle.js";
import { slowing } from "../src/slow.js";
import { valveOnMark } from "../src/valve.js";
import { valveStruck } from "../src/valve-shot.js";
import { valveFreezeBeats, valvePullBeats } from "../src/valve-step.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import {
  answerMovement,
  CFG,
  freeze,
  install,
  MID,
  pull,
  runUntil,
  shot,
  toTurn,
  turn,
  turnOnto,
  valve,
} from "./valve-rig.js";

/**
 * THE VALVE past its first pin: the spark the first pin leaks, the shorter
 * windows, the third movement's full lap, and the face falling open.
 */

describe("the spark", () => {
  it("leaks down the middle as the first pin comes out, and is shot out in either colour", () => {
    for (const color of ["red", "cyan"] as const) {
      const world = install();
      answerMovement(world);
      expect(valve(world).sparkCol).toBe(MID);
      valveStruck(world, shot(MID, color));
      expect(valve(world).sparkCol).toBe(NO_SPARK);
      expect(world.events.some((e) => e.type === "valveSparkOut")).toBe(true);
    }
  });

  it("left alone reaches the hull, and that is the wave", () => {
    const world = install();
    answerMovement(world);
    expect(world.failTick).toBe(NOT_FAILED);
    const seen = runUntil(world, (w) => w.failTick !== NOT_FAILED, CFG.valveSparkBeats + 2);
    expect(seen.has("valveSparkHit")).toBe(true);
  });

  it("is not leaked by the second pin", () => {
    const world = install();
    answerMovement(world);
    valveStruck(world, shot(MID, "red"));
    answerMovement(world);
    expect(valve(world).pins).toBe(1);
    expect(valve(world).sparkCol).toBe(NO_SPARK);
  });
});

describe("the later movements", () => {
  it("give shorter freeze and pull windows", () => {
    const world = install();
    expect(valveFreezeBeats(world, valve(world))).toBe(CFG.valveFreezeBeats);
    expect(valvePullBeats(world, valve(world))).toBe(CFG.valvePullBeats);
    answerMovement(world);
    expect(valveFreezeBeats(world, valve(world))).toBe(CFG.valveFreezeFastBeats);
    expect(valvePullBeats(world, valve(world))).toBe(CFG.valvePullFastBeats);
  });

  it("move the mark each time", () => {
    const world = install();
    answerMovement(world);
    valveStruck(world, shot(MID, "red"));
    runUntil(world, (w) => valve(w).phase === "turn");
    expect(valveOnMark(valve(world), CFG)).toBe(false);
    turnOnto(world);
    expect(valve(world).phase).toBe("hold");
  });
});

describe("the third movement", () => {
  function third() {
    const world = install();
    answerMovement(world);
    valveStruck(world, shot(MID, "red"));
    answerMovement(world);
    runUntil(world, (w) => valve(w).phase === "turn");
    expect(valve(world).movement).toBe(3);
    return world;
  }

  it("does not count the mark until the wheel has gone a full lap", () => {
    const world = third();
    const s = valve(world);
    const ahead = (((850 - s.wheelMilli) % 1000) + 1000) % 1000;
    turn(world, ahead);
    expect(valve(world).phase).toBe("turn");
    turn(world, 1000);
    expect(valve(world).phase).toBe("hold");
  });

  it("does not count a hand worked back and forth", () => {
    const world = third();
    for (let i = 0; i < 6; i++) {
      turn(world, 300);
      turn(world, -300);
    }
    expect(Math.abs(valve(world).travelMilli)).toBeLessThan(CFG.valveLapMilli);
    expect(valve(world).phase).toBe("turn");
  });

  it("counts the lap the other way round too", () => {
    const world = third();
    const s = valve(world);
    const back = (((s.wheelMilli - 850) % 1000) + 1000) % 1000;
    turn(world, -(1000 + back));
    expect(valve(world).phase).toBe("hold");
  });
});

describe("the last pin", () => {
  it("opens the face, and the drum goes", () => {
    const world = install();
    answerMovement(world);
    valveStruck(world, shot(MID, "cyan"));
    answerMovement(world);
    runUntil(world, (w) => valve(w).phase === "turn");
    turnOnto(world);
    freeze(world);
    expect(slowing(world)).toBe(true);
    pull(world);
    expect(valve(world).pins).toBe(0);
    const seen = runUntil(
      world,
      (w) => w.boss === null,
      CFG.valveListBeats + CFG.valveOpenBeats + 2,
    );
    expect(seen.has("valveOpen")).toBe(true);
    expect(seen.has("valveOut")).toBe(true);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("is reached from a fresh start in order, each pin a movement", () => {
    const world = install();
    toTurn(world);
    expect(valve(world).movement).toBe(1);
    answerMovement(world);
    expect(valve(world).movement).toBe(2);
  });
});
