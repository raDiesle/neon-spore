import { describe, expect, test } from "bun:test";
import { undertowBoss } from "@neon-spore/sim";
import { bossTitle } from "../src/boss-states.js";
import { BOSS_GROUP } from "../src/helpers-bosses.js";
import { groupRows } from "../src/helpers-def.js";
import { helperPose } from "../src/helpers-page.js";
import { UNDERTOW_BOWING } from "../src/helpers-poses-bosses.js";

/**
 * ONE BOSS'S OWN on CONTROLS › HELPERS (`helpers-bosses.ts`): a row a boss,
 * and the frame under each row is that boss's.
 */
describe("ONE BOSS'S OWN", () => {
  test("every row is framed on the boss it is named for", () => {
    for (const h of groupRows(BOSS_GROUP)) {
      const kind = helperPose(h).build().boss?.kind;
      expect(kind, h.name).toBeDefined();
      if (kind === undefined) continue;
      expect(h.name.startsWith(`${bossTitle(kind)}'S `), h.name).toBe(true);
    }
  });

  test("the undertow's frame holds a plate still bowing", () => {
    const u = undertowBoss(UNDERTOW_BOWING.build());
    expect(u?.lobes.some((l) => l.stage === "bowing")).toBe(true);
  });
});
