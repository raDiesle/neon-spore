import { describe, expect, test } from "bun:test";
import { fleetAfloat } from "@neon-spore/sim";
import { poseNamed } from "../src/poses.js";
import { FIELD_HAND_POSES } from "../src/poses-bosses-hands-field.js";

/**
 * THE FLEET's three states on the STATES sheet are earned by a hand, not
 * set (`packages/hands/src/boss-hand-fleet.ts`): the sights walked onto a hull, the plume held
 * and the hull raked, the wreck pulled under. `boss-states.test.ts` proves
 * the names; this proves the hand gets there, because a pose whose budget
 * runs out throws and a sheet with one blank card is a sheet nobody trusts.
 */
describe("THE FLEET's poses reach their states", () => {
  test("FLOOD: a hull holed, the plume up", () => {
    const w = poseNamed("THE FLEET · FLOOD").build();
    expect(w.boss?.kind).toBe("fleet");
    if (w.boss?.kind !== "fleet") return;
    expect(w.boss.phase).toBe("flood");
    expect(w.boss.holed).toBeGreaterThanOrEqual(0);
  });

  test("WRECK: a hull raked end to end, afloat until pulled", () => {
    const w = poseNamed("THE FLEET · WRECK").build();
    expect(w.boss?.kind).toBe("fleet");
    if (w.boss?.kind !== "fleet") return;
    expect(w.boss.phase).toBe("wreck");
    expect(fleetAfloat(w.boss)).toBe(w.boss.ships.length);
  });

  test("HUNT after a sinking: one ship under, the search on again", () => {
    // Two cards share the name — the opening, in `poses-bosses-first.ts`,
    // and this one — so it is taken off its own list rather than by name.
    const pose = FIELD_HAND_POSES.find((p) => p.boss?.kind === "fleet" && p.boss.state === "hunt");
    expect(pose).toBeDefined();
    const w = pose!.build();
    expect(w.boss?.kind).toBe("fleet");
    if (w.boss?.kind !== "fleet") return;
    expect(w.boss.phase).toBe("hunt");
    expect(fleetAfloat(w.boss)).toBe(w.boss.ships.length - 1);
  });
});
