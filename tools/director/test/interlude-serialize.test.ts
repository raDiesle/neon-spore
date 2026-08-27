import { expect, test } from "bun:test";
import { GAPS } from "@neon-spore/content";
import { serializeGaps } from "../src/interlude-serialize.js";

test("round trip against the real file", async () => {
  const file = new URL("../../../packages/content/src/interludes.ts", import.meta.url);
  const source = await Bun.file(file).text();
  expect(serializeGaps(source, GAPS)).toBe(source);
});

test("serializes gaps sorted by wave, whatever order they were given in", () => {
  const source2 =
    'import type { InterludeEntry } from "@neon-spore/sim";\n\n' +
    'export const GAPS: Record<number, InterludeEntry> = {\n  10: { kind: "gauge" },\n};\n';
  const result = serializeGaps(source2, { 14: { kind: "gauge" }, 3: { kind: "gauge" } });
  expect(result).toBe(
    'import type { InterludeEntry } from "@neon-spore/sim";\n\n' +
      "export const GAPS: Record<number, InterludeEntry> = {\n" +
      '  3: { kind: "gauge" },\n' +
      '  14: { kind: "gauge" },\n' +
      "};\n",
  );
});

test("an empty table still closes", () => {
  const source =
    'export const GAPS: Record<number, InterludeEntry> = {\n  10: { kind: "gauge" },\n};\n';
  const result = serializeGaps(source, {});
  expect(result).toBe("export const GAPS: Record<number, InterludeEntry> = {\n\n};\n");
});
