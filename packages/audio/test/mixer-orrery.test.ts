import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type OrreryState,
  startWave,
  type World,
} from "@neon-spore/sim";
import { Mixer } from "../src/mixer.js";
import type { PlayOptions } from "../src/plan.js";
import type { SoundDef } from "../src/types.js";

/**
 * THE ORRERY is heard off its state rather than off events (`mixer-boss.ts`,
 * `soundOrrery`), so what is tested is the remembered frame: each of its
 * three clocks moving sounds once, standing still sounds nothing, and the
 * frame the mixer first sees replays none of it. The boss's fields are set by
 * hand here, as the queen's `openBeat` is in `mixer.test.ts`: what this file
 * is about is which id the mixer reached for, not how a ring comes off.
 */
function recorder(): {
  mixer: Mixer;
  played: { id: string; pitch?: number; pan?: number }[];
  ids: () => string[];
} {
  const mixer = new Mixer();
  const played: { id: string; pitch?: number; pan?: number }[] = [];
  mixer.engine.play = (def: SoundDef, o: PlayOptions = {}) => {
    played.push({ id: def.id, pitch: o.pitch, pan: o.pan });
  };
  return { mixer, played, ids: () => played.map((p) => p.id) };
}

/** A world with THE ORRERY installed, and its rings still whole. */
function orrery(): { w: World; b: OrreryState } {
  const w = createWorld(DEFAULT_CONFIG, 11, []);
  startWave(w, 0, [], [], { kind: "orrery" });
  const b = w.boss;
  if (b?.kind !== "orrery") throw new Error("the wave did not install THE ORRERY");
  return { w, b };
}

describe("THE ORRERY, heard off its clocks", () => {
  it("sounds a ring coming off once, a step higher for each ring gone", () => {
    const { mixer, played } = recorder();
    const { w, b } = orrery();
    mixer.frame(w, []);
    played.length = 0;

    b.broken = 1;
    b.brokeBeat = 8;
    w.tick++;
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(played.map((p) => p.id)).toEqual(["boss.orreryBreak"]);
    expect(played[0]?.pitch).toBeCloseTo(1);

    b.broken = 2;
    b.brokeBeat = 20;
    w.tick++;
    mixer.frame(w, []);
    expect(played.map((p) => p.pitch)).toEqual([1, 1.15]);
  });

  it("sounds the core spitting once per spit, on the core's column", () => {
    const { mixer, played, ids } = recorder();
    const { w, b } = orrery();
    mixer.frame(w, []);
    played.length = 0;

    b.phase = "spitting";
    b.spatBeat = 12;
    w.tick++;
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.orrerySpit"]);
    expect(played[0]?.pan).toBe(0);

    b.spatBeat = 16;
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.orrerySpit", "boss.orrerySpit"]);
  });

  it("sounds the core going out on the edge into that phase, and no other phase", () => {
    const { mixer, played, ids } = recorder();
    const { w, b } = orrery();
    mixer.frame(w, []);
    played.length = 0;

    b.phase = "naked";
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual([]);

    b.phase = "out";
    b.phaseBeat = 30;
    w.tick++;
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual(["boss.orreryOut"]);
  });

  it("never says what the shaft is doing", () => {
    const { mixer, ids } = recorder();
    const { w } = orrery();
    mixer.frame(w, []);
    for (let beat = 1; beat < 40; beat++) {
      w.beat = beat;
      w.tick++;
      mixer.frame(w, []);
    }
    expect(ids()).toEqual([]);
  });

  it("replays nothing from a frame it is only now seeing", () => {
    const { mixer, ids } = recorder();
    const { w, b } = orrery();
    b.broken = 2;
    b.brokeBeat = 20;
    b.spatBeat = 16;
    b.phase = "out";
    w.tick = 400;
    mixer.frame(w, []);
    w.tick++;
    mixer.frame(w, []);
    expect(ids()).toEqual([]);
  });
});
