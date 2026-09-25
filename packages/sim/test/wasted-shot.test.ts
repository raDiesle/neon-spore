import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { advanceBullets } from "../src/bullets.js";
import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { playDifficulty } from "../src/difficulty.js";
import type { SimEvent } from "../src/events.js";
import { SKY_BOSSES } from "../src/shot-out.js";
import { NOT_FAILED } from "../src/wave-fail.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * **On HARD a shot that meets nothing loses the wave** (`shot-out.ts`), and
 * nowhere else does: not on EASY or MEDIUM, not under a boss that hangs above
 * the field, not in the rest after a clear.
 */

function hard(): SimConfig {
  const cfg = { ...DEFAULT_CONFIG };
  playDifficulty(cfg, "hard");
  return cfg;
}

/** A bolt one row under the top, flown until it has gone, and what it said. */
function climbOut(world: World): SimEvent[] {
  world.bullets.push({
    id: 9,
    col: 3,
    row: 1,
    subMilli: 0,
    color: "red",
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  });
  const said: SimEvent[] = [];
  for (let t = 0; t < 40 && world.bullets.length > 0; t++) {
    advanceBullets(world);
    said.push(...world.events);
    world.events.length = 0;
  }
  return said;
}

function outOf(said: SimEvent[]): Extract<SimEvent, { type: "shotOut" }> {
  const e = said.find((x) => x.type === "shotOut");
  if (e?.type !== "shotOut") throw new Error("no shotOut");
  return e;
}

describe("a wasted shot on HARD", () => {
  it("loses the wave, and the shot says it was the one", () => {
    const world = createWorld(hard(), 1);
    const said = climbOut(world);
    expect(outOf(said).wasted).toBe(true);
    expect(world.failTick).toBe(world.tick);
    // The shot's own word first, then the wave's.
    const types = said.map((e) => e.type);
    expect(types.indexOf("shotOut")).toBeLessThan(types.indexOf("waveFailed"));
  });

  it("costs nothing on EASY or MEDIUM", () => {
    for (const level of ["easy", "medium"] as const) {
      const cfg = { ...DEFAULT_CONFIG };
      playDifficulty(cfg, level);
      const world = createWorld(cfg, 1);
      expect(outOf(climbOut(world)).wasted).toBe(false);
      expect(world.failTick).toBe(NOT_FAILED);
    }
  });

  it("costs nothing while a boss hangs above the field: the bolt went into it", () => {
    const world = createWorld(hard(), 1);
    startWave(world, 9, [], [], { kind: "candle" });
    const out = outOf(climbOut(world));
    expect(out.taken).toBe(true);
    expect(out.wasted).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("costs nothing in the rest after a clear", () => {
    const world = createWorld(hard(), 1);
    world.restBeat = world.beat + world.cfg.waveRestBeats;
    expect(outOf(climbOut(world)).wasted).toBe(false);
    expect(world.failTick).toBe(NOT_FAILED);
  });

  it("knows every boss `shotLeaves` hands a bolt to", () => {
    // A boss given a call there and not a place in the list would be a boss
    // whose every hit on HARD also lost the wave.
    const src = readFileSync(new URL("../src/shot-out.ts", import.meta.url), "utf8");
    const called = [...src.matchAll(/^\s+(\w+)Struck\(world/gm)].map((m) => m[1]);
    expect(called.length).toBe(SKY_BOSSES.size);
    for (const kind of called) expect(SKY_BOSSES.has(kind ?? "")).toBe(true);
  });
});
