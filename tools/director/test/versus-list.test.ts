import { describe, expect, test } from "bun:test";
import { VARIANTS } from "../../versus/candidates/index.js";
import { slots } from "../../versus/variant.js";
import { JUDGED_ELSEWHERE, listedSlots } from "../src/versus-page.js";

/**
 * The VERSUS list leaves off a slot judged somewhere else (`JUDGED_ELSEWHERE`)
 * — and only that slot: its candidates stay open and stay where it is judged.
 */
describe("the VERSUS list", () => {
  test("shows every open slot but the ones judged elsewhere", () => {
    const listed = listedSlots().map((s) => s.slot);
    for (const s of slots(VARIANTS))
      expect([s.slot, listed.includes(s.slot)]).toEqual([
        s.slot,
        !Object.hasOwn(JUDGED_ELSEWHERE, s.slot),
      ]);
  });
});
