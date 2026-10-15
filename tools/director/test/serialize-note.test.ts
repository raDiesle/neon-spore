import { expect, test } from "bun:test";
import { WAVES_ACT_1 } from "../../../packages/content/src/waves/act-1.js";
import { serializeWaveArray } from "../src/serialize.js";

/**
 * WAVE SETTINGS › NOTE is saved with the wave — the owner, 15 October 2026:
 * a note on what to check or fix, kept where DOCUMENTATION › WAVES reads it.
 */
test("a note is written under the name, quoted, and an absent one writes nothing", async () => {
  const file = new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url);
  const source = await Bun.file(file).text();
  const note = 'check the "gap" at beat 12';
  const waves = WAVES_ACT_1.map((w, i) => (i === 2 ? { ...w, note } : w));
  const out = serializeWaveArray(source, waves, "WAVES_ACT_1");
  expect(out).toContain('    note: "check the \\"gap\\" at beat 12",\n');
  expect(out.match(/ {4}note: /g)?.length).toBe(1);
  expect(serializeWaveArray(source, WAVES_ACT_1, "WAVES_ACT_1")).not.toContain("note:");
});
