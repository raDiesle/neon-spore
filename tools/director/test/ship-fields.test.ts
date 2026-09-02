import { describe, expect, test } from "bun:test";
import { BOSS_KINDS, DEFAULT_CONFIG } from "@neon-spore/sim";
import {
  BOSS_GROUP,
  FIELD_GROUP,
  GROUP_NOTE,
  GROUP_ORDER,
  SHIP_GROUPS,
  WAVE_ONLY_GROUPS,
} from "../src/ship-fields.js";

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

  // The split the SHIP-column brief asked for: WAVE_ONLY_GROUPS
  // is what stays beside the wave being edited, SHIP_GROUPS is what moved to
  // the SHIP tab of GAME MECHANICS (`▣`, folded off the topbar). Together
  // they must be every group there is, with none counted twice — that is the
  // "every field stays reachable" guarantee, checked at runtime rather than
  // only argued in a comment.
  test("WAVE_ONLY_GROUPS and SHIP_GROUPS partition GROUP_ORDER exactly", () => {
    const union = new Set([...WAVE_ONLY_GROUPS, ...SHIP_GROUPS]);
    expect([...union].sort()).toEqual([...GROUP_ORDER].sort());
    for (const group of SHIP_GROUPS) expect(WAVE_ONLY_GROUPS.has(group), group).toBe(false);
  });

  test("BOSS_GROUP has an entry for every boss kind, and each points at a wave-only group", () => {
    for (const kind of BOSS_KINDS) {
      expect(BOSS_GROUP[kind], kind).toBeDefined();
      expect(WAVE_ONLY_GROUPS.has(BOSS_GROUP[kind]), kind).toBe(true);
    }
  });

  test("THE GAUGE is wave-only — it only matters on the wave that carries it", () => {
    expect(WAVE_ONLY_GROUPS.has("THE GAUGE — a round with no field in it")).toBe(true);
  });
});
