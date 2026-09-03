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
    id: "test5",
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
    id: "test6",
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

/**
 * The seam that landed `main` red once, closed.
 *
 * The director renames a wave from its own screen, and four places pointed at
 * waves by string: ON THE BEAT became THE THROB, HOLD IT OPEN became THE LID,
 * and none of the four moved, so a save the owner made from a page that never
 * mentions `waves-demo.ts` broke the check. Waves carry an `id` now and the
 * demonstrations point at that, which only works if a save *writes the id
 * back* — a serializer that quietly dropped it would put the whole thing back
 * where it started on the first save anybody made.
 *
 * The rename happens here rather than through `saveWaves`, which writes the
 * repository's own act files: another test in this suite reads those, and a
 * test that renames a real wave for a few milliseconds is a test that fails
 * its neighbour at random.
 */
test("a save carries a wave's id through a rename of its name", async () => {
  const file = new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url);
  const source = await Bun.file(file).text();

  const first = WAVES_ACT_1[0];
  expect(first, "act 1 is empty").toBeDefined();
  if (!first) return;
  const renamed = { ...first, name: "SOMETHING ELSE ENTIRELY" };

  const result = serializeWaveArray(source, [renamed], "WAVES_ACT_1");
  expect(result).toContain('name: "SOMETHING ELSE ENTIRELY"');
  expect(result).toContain(`id: "${first.id}"`);
  expect(result).not.toContain(`name: "${first.name}"`);
});

test("every wave the real acts hold is written back with its id", async () => {
  // The round trip above proves it for the files as they stand; this says why
  // it matters, so a serializer that stopped emitting `id` fails with the
  // reason rather than as a byte diff.
  for (const act of ACTS) {
    const file = new URL(act.rel, import.meta.url);
    const source = await Bun.file(file).text();
    const written = serializeWaveArray(source, act.waves, act.exportName);
    for (const wave of act.waves) {
      expect(written, `${wave.name} was written without its id`).toContain(`id: "${wave.id}"`);
    }
  }
});
