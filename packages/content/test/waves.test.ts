import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { buildPods, buildQueue, WAVES } from "../src/index.js";

const beatSeconds = 60 / DEFAULT_CONFIG.bpm;
const secondsToHull = DEFAULT_CONFIG.rows * beatSeconds;

describe("wave content", () => {
  it("gives every creature at least 4 seconds from entry to impact", () => {
    // The hard constraint from docs/spec/latency.md: a full spoken exchange
    // takes 2.1-3.6 s. Anything that needs an announcement needs 4 s, ideally 5-6.
    expect(secondsToHull).toBeGreaterThanOrEqual(4);
  });

  it("passes the one-sentence test", () => {
    for (const wave of WAVES) {
      expect(wave.sentence, `${wave.name} has no one-sentence description`).toMatch(/\S/);
      expect(
        wave.sentence.split(".").length,
        `${wave.name}: more than one sentence`,
      ).toBeLessThanOrEqual(2);
    }
  });

  it("authors every column against the 7-column field", () => {
    for (const wave of WAVES) {
      for (const e of wave.entries) {
        expect(e.col, `${wave.name} column out of range`).toBeGreaterThanOrEqual(0);
        expect(e.col, `${wave.name} column out of range`).toBeLessThanOrEqual(6);
      }
    }
  });

  it("authors every pod against the 7-column field, above the hull", () => {
    for (const wave of WAVES) {
      for (const p of wave.pods ?? []) {
        expect(p.col, `${wave.name} pod column out of range`).toBeGreaterThanOrEqual(0);
        expect(p.col, `${wave.name} pod column out of range`).toBeLessThanOrEqual(6);
        // A pod on the hull row would be swallowed or lost on the beat it
        // appeared, before anyone could shoot it loose.
        expect(p.row, `${wave.name} pod row out of range`).toBeGreaterThanOrEqual(0);
        expect(p.row, `${wave.name} pod row on or below the hull`).toBeLessThan(
          DEFAULT_CONFIG.rows - 1,
        );
      }
    }
  });

  it("builds the same pods every time, inside the field", () => {
    for (let i = 0; i < WAVES.length + 6; i++) {
      expect(buildPods(i, 11)).toEqual(buildPods(i, 11));
      for (const cols of [7, 11, 15]) {
        for (const p of buildPods(i, cols)) {
          expect(p.col).toBeGreaterThanOrEqual(0);
          expect(p.col).toBeLessThan(cols);
        }
      }
    }
  });

  it("builds the same queue every time", () => {
    for (let i = 0; i < WAVES.length + 5; i++) {
      expect(buildQueue(i, 11)).toEqual(buildQueue(i, 11));
    }
  });

  it("keeps remapped columns inside the field", () => {
    for (const cols of [7, 9, 11, 15]) {
      for (let i = 0; i < WAVES.length; i++) {
        for (const q of buildQueue(i, cols)) {
          expect(q.col).toBeGreaterThanOrEqual(0);
          expect(q.col).toBeLessThan(cols);
        }
      }
    }
  });
});
