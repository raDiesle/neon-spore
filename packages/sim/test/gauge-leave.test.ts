import { describe, expect, it } from "bun:test";
import {
  createWorld,
  failHolds,
  gaugeHolds,
  gaugeRound,
  hashWorld,
  roundSpent,
  startWave,
  step,
} from "../src/index.js";
import { CFG, cmd, open, round, run, runToEnd, TPB, talking, WAVE } from "./gauge-rig.js";

/**
 * THE GAUGE left: passed by talking, failed by silence, abandoned by a restart
 * — and the fingerprint over all of it. The round reached and played is
 * `gauge.test.ts`; both run the one pair in `gauge-rig.ts`.
 */

describe("leaving the round", () => {
  it("is passed by talking, and the wave then clears like any other", () => {
    const world = open();
    const { result } = runToEnd(world, TPB * 200, talking);
    expect(result.marks).toBe(CFG.gaugeLevels * CFG.gaugeLevelMarks);
    expect(result.passed).toBe(true);
    expect(world.retries).toBe(0);
    expect(world.scars.length).toBe(0);
    // The round is spent rather than gone: it holds its own picture, and ends
    // its wave from there rather than through an empty field (`wave-end.ts`).
    expect(roundSpent(world)).toBe(true);
    expect(world.boss?.kind).toBe("gauge");
    const after = run(world, TPB * (CFG.waveRestBeats + 4));
    expect(after.some((e) => e.type === "needWave" && e.wave === WAVE + 1)).toBe(true);
  });

  it("is failed by saying nothing, and that breaks the hull", () => {
    const world = open();
    const { result, events } = runToEnd(world, TPB * (CFG.gaugeLevelBeats + 20));
    expect(result.passed).toBe(false);
    expect(result.marks).toBe(0);
    // Time is still what a *call* costs; the round costs the hull — which is
    // the wave, since 12 September 2026: the breach is on the ship, the field
    // holds, and once a seat says RETRY the same wave is asked for again
    // rather than the next one credited (`wave-fail.ts`).
    expect(events.filter((e) => e.type === "breach")).toHaveLength(1);
    expect(world.scars.length).toBe(1);
    expect(failHolds(world)).toBe(true);
    expect(events.some((e) => e.type === "needWave")).toBe(false);
    step(world, [{ tick: world.tick, player: 1, command: { kind: "retry" } }]);
    expect(world.events.some((e) => e.type === "needWave" && e.wave === WAVE && e.retry)).toBe(
      true,
    );
    expect(world.over).toBe(false);
  });

  it("cannot end the run: a hit is the round again, never the sheet", () => {
    const world = open();
    runToEnd(world, TPB * (CFG.gaugeLevelBeats + 20));
    expect(failHolds(world)).toBe(true);
    expect(world.over).toBe(false);
  });

  it("is left by a restart, from inside the round", () => {
    const world = open();
    run(world, TPB * 8);
    const events = run(world, 1, (w) => [cmd(w, 1, { kind: "restart" })]);
    expect(world.boss).toBeNull();
    expect(gaugeHolds(world)).toBe(false);
    expect(events.some((e) => e.type === "needWave" && e.wave === 0)).toBe(true);
  });
});

describe("the fingerprint", () => {
  it("covers the round, so two devices cannot disagree about it silently", () => {
    const plain = createWorld(CFG, 9);
    startWave(plain, WAVE, []);
    const gauge = open(9);
    expect(hashWorld(gauge)).not.toBe(hashWorld(plain));

    const moved = open(9);
    run(moved, TPB * 8, (w) => [cmd(w, 1, { kind: "valve", on: true, dir: 1 })]);
    const still = open(9);
    run(still, TPB * 8);
    expect(round(moved).needleMilli).not.toBe(round(still).needleMilli);
    expect(hashWorld(moved)).not.toBe(hashWorld(still));
  });

  it("is the same on two runs of the same round, marks and all", () => {
    const a = open(21);
    const b = open(21);
    let seen = 0;
    for (let tick = 0; tick < TPB * 60; tick++) {
      step(a, talking(a));
      step(b, talking(b));
      seen = Math.max(seen, gaugeRound(a)?.marks ?? seen);
      if (tick % TPB === 0) expect(hashWorld(a)).toBe(hashWorld(b));
    }
    // Assert what the round did before asserting that two of them agree — a
    // pinned constant would pass on a round that never started
    // (`docs/decisions.md` #19).
    expect(seen).toBe(CFG.gaugeLevels * CFG.gaugeLevelMarks);
    expect(hashWorld(a)).toBe(hashWorld(b));
  });
});
