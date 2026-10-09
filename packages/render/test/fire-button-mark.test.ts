import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld } from "@neon-spore/sim";
import type { BossCue } from "../src/boss-cue-shape.js";
import { markedFireButtons } from "../src/fire-button-mark.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **The fire button a shot's mark asks for is ringed with the same mark** —
 * the owner, 9 October 2026 (`fire-button-mark.ts`): the one of the colour
 * this screen is shown the shot wants, both where it is not, and none while
 * no mark stands on a target.
 */

const layout = (role: ViewRole) => computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);
const SET = controlSet("default");

function fire(extra: Partial<BossCue> = {}): BossCue {
  return {
    seat: 2,
    kind: "PRESS",
    word: "FIRE",
    x: 200,
    y: 300,
    halfW: 40,
    halfH: 25,
    seed: 1,
    ...extra,
  };
}

function shots(role: ViewRole, cue: BossCue): string[] {
  return markedFireButtons(layout(role), createWorld(CFG, 3), cue, SET).map((b) => b.shot);
}

describe("the fire button's mark", () => {
  it("rings both fire buttons where this screen is not shown the colour", () => {
    expect(shots("p2", fire()).sort()).toEqual(["cyan", "red"]);
  });

  it("rings only the colour this screen is shown, or the colour the mark is drawn in", () => {
    expect(shots("p2", fire({ shows: "cyan" }))).toEqual(["cyan"]);
    expect(shots("p2", fire({ tint: "red" }))).toEqual(["red"]);
  });

  it("rings nothing while no mark stands on a target, and nothing on a screen with no fire button", () => {
    const l = layout("p2");
    expect(shots("p2", fire({ y: l.hullY }))).toEqual([]);
    expect(shots("p2", { ...fire(), word: "SHIELD" })).toEqual([]);
    expect(shots("p1", fire())).toEqual([]);
  });
});
