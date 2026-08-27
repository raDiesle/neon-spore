import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { FIELD_GROUP, GROUP_NOTE, GROUP_ORDER } from "../src/ship-fields.js";

/**
 * The runtime half of the guard `ship-fields.ts` argues for. TypeScript
 * already refuses to compile `FIELD_GROUP` if `SimConfig` grows a field this
 * file does not sort somewhere — see the commit that added this file for how
 * that was proved (removing one line and reading the compiler's own error).
 * What a type cannot catch is a `GroupName` that is spelled two different ways
 * in `FIELD_GROUP` and `GROUP_NOTE`, or a field left over here after `SimConfig`
 * drops it — both are plain string equality, so they are a runtime test.
 */
describe("ship-fields", () => {
  test("FIELD_GROUP covers exactly the fields DEFAULT_CONFIG has, no more and no fewer", () => {
    const configKeys = new Set(Object.keys(DEFAULT_CONFIG));
    const groupKeys = new Set(Object.keys(FIELD_GROUP));
    expect([...groupKeys].sort()).toEqual([...configKeys].sort());
  });

  test("every group a field points at is in GROUP_ORDER", () => {
    const used = new Set(Object.values(FIELD_GROUP));
    for (const group of used) expect(GROUP_ORDER, group).toContain(group);
  });

  test("every group in GROUP_ORDER has a non-empty note", () => {
    for (const group of GROUP_ORDER) {
      expect(GROUP_NOTE[group]?.length ?? 0, group).toBeGreaterThan(0);
    }
  });

  test("GROUP_ORDER has no group twice", () => {
    expect(new Set(GROUP_ORDER).size).toBe(GROUP_ORDER.length);
  });
});
