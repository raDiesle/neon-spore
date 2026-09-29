import { describe, expect, test } from "bun:test";
import { parseLastWave } from "../src/last-wave.js";

/** What JUMP TO WAVE will scroll to, read off whatever the device stored. */
describe("parseLastWave", () => {
  test("a stored index inside the list is that wave", () => {
    expect(parseLastWave("0", 10)).toBe(0);
    expect(parseLastWave("9", 10)).toBe(9);
  });

  test("nothing stored is nowhere", () => {
    expect(parseLastWave(null, 10)).toBeNull();
  });

  test("a wave the list no longer has is nowhere", () => {
    expect(parseLastWave("10", 10)).toBeNull();
  });

  test("anything that is not a whole number is a hand-edit, not a wave", () => {
    for (const raw of ["", "-1", "2.5", "three", " 3", "1e2"]) {
      expect(parseLastWave(raw, 200)).toBeNull();
    }
  });
});
