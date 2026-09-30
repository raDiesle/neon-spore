import { describe, expect, it } from "bun:test";
import { createWorld, gaugeHolds, gaugeRound, gaugeSeated, startWave, step } from "../src/index.js";
import { CFG, cmd, open, round, run, TPB, WAVE } from "./gauge-rig.js";

/**
 * THE GAUGE as a boss wave.
 *
 * It used to be an *interlude*: a round reached from a table of gaps, behind a
 * `cfg.interludes` switch, that could never end a run. All three are gone, and
 * most of this file is about what replaced them — a wave carries it the way a
 * wave carries the queen, the field is gone while it stands, and running out
 * of time breaks the hull like anything else that gets through.
 *
 * The round itself is one needle and two marks, and the only interesting thing
 * about it is that neither seat can play it alone — which is two of the tests
 * below and not a matter of taste.
 */

describe("reaching the round", () => {
  it("is a wave's own boss, and needs nothing switched on", () => {
    const world = open();
    expect(world.boss?.kind).toBe("gauge");
    expect(gaugeHolds(world)).toBe(true);
    expect(world.wave).toBe(WAVE);
  });

  it("is not there on a wave that does not carry it", () => {
    const world = createWorld(CFG, 1);
    startWave(world, WAVE, []);
    expect(gaugeHolds(world)).toBe(false);
    expect(gaugeRound(world)).toBeNull();
  });

  it("draws a band the needle is not already sitting in", () => {
    for (let seed = 0; seed < 12; seed++) {
      const world = open(seed);
      expect(gaugeSeated(world, round(world))).toBe(false);
    }
  });
});

describe("while the round is up", () => {
  it("the field is gone: nothing spawns, falls or reaches the hull", () => {
    const world = createWorld(CFG, 3);
    // A queue on a gauge wave is a thing no author would write, and that is
    // the point of handing one over: `step` returns before it reaches the beat
    // that would read it, so nothing arrives however long the round runs.
    startWave(world, WAVE, [{ beat: 0, col: 2, kind: "meteor", color: null }], [], {
      kind: "gauge",
    });
    run(world, TPB * 20);
    expect(world.creatures.length).toBe(0);
    expect(world.spawned).toBe(0);
    expect(world.waveBeat).toBe(0);
    expect(world.retries).toBe(0);
  });

  it("the beat is not: the metronome runs through it", () => {
    const world = open();
    const before = world.beat;
    const events = run(world, TPB * 6);
    expect(world.beat).toBe(before + 6);
    expect(events.filter((e) => e.type === "beat").length).toBe(6);
  });

  it("holds the round for its lead-in before anything can be turned", () => {
    const world = open();
    const needle = round(world).needleMilli;
    run(world, TPB * 2, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    expect(round(world).phase).toBe("lead");
    expect(round(world).needleMilli).toBe(needle);
  });
});

describe("the two halves", () => {
  it("the reading player cannot turn", () => {
    const world = open();
    run(world, TPB * 10, (w) => [cmd(w, 2, { kind: "valve", on: true, dir: 1 })]);
    expect(round(world).phase).toBe("play");
    expect(round(world).valve).toBe(0);
    expect(round(world).needleMilli).toBe(500);
  });

  it("the turning player cannot call", () => {
    const world = open();
    run(world, TPB * 30, (w) => {
      const gauge = gaugeRound(w);
      if (gauge === null || gauge.phase !== "play") return [];
      const want = gauge.needleMilli < gauge.markMilli ? 1 : -1;
      const out = [cmd(w, 1, { kind: "valve", on: true, dir: want })];
      if (gaugeSeated(w, gauge)) out.push(cmd(w, 1, { kind: "call", color: gauge.woundColor }));
      return out;
    });
    expect(round(world).marks).toBe(0);
    expect(round(world).misses).toBe(0);
  });

  it("costs a call the same rest whether it landed or not", () => {
    const world = open();
    run(world, TPB * 5);
    const gauge = round(world);
    expect(gauge.phase).toBe("play");
    // Two calls on the same beat, both wide of a band the pilot never moved
    // towards: the second is not heard at all, so it is not even a miss.
    step(world, [
      cmd(world, 2, { kind: "call", color: gauge.woundColor }),
      cmd(world, 2, { kind: "call", color: gauge.woundColor }),
    ]);
    // Judged where the bolt lands, so the miss is counted a flight later.
    run(world, CFG.gaugeShotTicks);
    expect(gauge.misses).toBe(1);
    step(world, [cmd(world, 2, { kind: "call", color: gauge.woundColor })]);
    run(world, CFG.gaugeShotTicks);
    expect(gauge.misses).toBe(1);
  });
});
