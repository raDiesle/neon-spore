import { describe, expect, test } from "bun:test";
import { KILL_LINE } from "../src/brush-kill.js";
import { BRUSHES, FAULT_BRUSHES } from "../src/brushes.js";

/**
 * The hover card's line is what the pair does to kill the body, said very
 * briefly — the owner's ask, 18 October 2026. These are what fail when a
 * creature is added and the card is not told, or a line grows back into a
 * paragraph.
 */
describe("KILL_LINE", () => {
  const faults = new Set<string>(FAULT_BRUSHES);
  const owed = BRUSHES.filter((b) => b.brush !== "erase" && !faults.has(b.brush));

  test("every brush with a body has one", () => {
    for (const { brush } of owed) expect(KILL_LINE[brush], brush).toBeDefined();
  });

  test("is short, and one breath at a time", () => {
    for (const { brush } of owed) {
      const line = KILL_LINE[brush] ?? "";
      expect(line.length, `${brush}: "${line}"`).toBeLessThanOrEqual(60);
      expect(/[;—–]/.test(line), `${brush}: "${line}"`).toBe(false);
      expect(line.endsWith("."), `${brush}: "${line}"`).toBe(true);
    }
  });

  test("names no brush the palette does not carry", () => {
    const known = new Set<string>(BRUSHES.map((b) => b.brush));
    for (const brush of Object.keys(KILL_LINE)) expect(known.has(brush), brush).toBe(true);
  });
});
