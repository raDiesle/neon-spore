import { expect, test } from "bun:test";
import { WAVES_ACT_1 } from "../../../packages/content/src/waves/act-1.js";
import { WAVES_ACT_2 } from "../../../packages/content/src/waves/act-2.js";
import { WAVES_ACT_3 } from "../../../packages/content/src/waves/act-3.js";
import { serializeWaveArray } from "../src/serialize.js";

const ACTS = [
  {
    exportName: "WAVES_ACT_1",
    waves: WAVES_ACT_1,
    rel: "../../../packages/content/src/waves/act-1.ts",
  },
  {
    exportName: "WAVES_ACT_2",
    waves: WAVES_ACT_2,
    rel: "../../../packages/content/src/waves/act-2.ts",
  },
  {
    exportName: "WAVES_ACT_3",
    waves: WAVES_ACT_3,
    rel: "../../../packages/content/src/waves/act-3.ts",
  },
];

test("round trip against the real files", async () => {
  for (const act of ACTS) {
    const file = new URL(act.rel, import.meta.url);
    const source = await Bun.file(file).text();
    expect(serializeWaveArray(source, act.waves, act.exportName)).toBe(source);
  }
});

test("serializes wave with pods correctly", async () => {
  const file = new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url);
  const source = await Bun.file(file).text();

  const wave = {
    name: "TEST",
    sentence: "Test wave.",
    hint: "Test hint.",
    entries: [
      { beat: 0, col: 1, color: "red" as const },
      { beat: 2, col: 3, color: "cyan" as const },
    ],
    pods: [{ beat: 0, col: 2, row: 3 }],
  };

  const result = serializeWaveArray(source, [wave], "WAVES_ACT_1");

  expect(result).toContain('name: "TEST"');
  expect(result).toContain("entries: [");
  expect(result).toContain('{ beat: 0, col: 1, color: "red" },');
  expect(result).toContain('{ beat: 2, col: 3, color: "cyan" },');
  expect(result).toContain("pods: [{ beat: 0, col: 2, row: 3 }]");

  const waveWithoutPods = { ...wave, pods: undefined };
  const resultWithoutPods = serializeWaveArray(source, [waveWithoutPods], "WAVES_ACT_1");
  expect(resultWithoutPods).not.toContain("pods:");
});

/**
 * The two per-arrival fields the editor can now write. Both are optional, and
 * both used to be dropped on the way out — a lure read in with a `wears` came
 * back out without one, which is the serializer quietly re-authoring a wave
 * nobody edited.
 */
test("writes a rock's size and a lure's worn body, and only when they are there", async () => {
  const file = new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url);
  const source = await Bun.file(file).text();

  const wave = {
    name: "TEST",
    sentence: "Test wave.",
    entries: [
      { beat: 0, col: 1, kind: "meteorFast" as const, color: null, size: 2 as const },
      { beat: 1, col: 2, kind: "meteor" as const, color: null },
      { beat: 2, col: 3, kind: "lure" as const, color: "cyan" as const, wears: "bulb" as const },
    ],
  };

  const result = serializeWaveArray(source, [wave], "WAVES_ACT_1");
  expect(result).toContain('{ beat: 0, col: 1, kind: "meteorFast", color: null, size: 2 },');
  expect(result).toContain('{ beat: 1, col: 2, kind: "meteor", color: null },');
  expect(result).toContain('{ beat: 2, col: 3, kind: "lure", color: "cyan", wears: "bulb" },');
});
