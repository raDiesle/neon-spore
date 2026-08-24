import { expect, test } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { serializeWaves } from "../src/serialize.js";

test("round trip against the real file", async () => {
  const file = new URL("../../../packages/content/src/waves.ts", import.meta.url);
  const source = await Bun.file(file).text();
  expect(serializeWaves(source, WAVES)).toBe(source);
});

test("serializes wave with pods correctly", async () => {
  const file = new URL("../../../packages/content/src/waves.ts", import.meta.url);
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

  const result = serializeWaves(source, [wave]);

  expect(result).toContain('name: "TEST"');
  expect(result).toContain("entries: [");
  expect(result).toContain('{ beat: 0, col: 1, color: "red" },');
  expect(result).toContain('{ beat: 2, col: 3, color: "cyan" },');
  expect(result).toContain("pods: [{ beat: 0, col: 2, row: 3 }]");

  const waveWithoutPods = { ...wave, pods: undefined };
  const resultWithoutPods = serializeWaves(source, [waveWithoutPods]);
  expect(resultWithoutPods).not.toContain("pods:");
});
