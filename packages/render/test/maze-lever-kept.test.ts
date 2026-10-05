import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { DEFAULT_CONFIG, type MazeState } from "@neon-spore/sim";
import { mazeStringUnder } from "../src/handles-cords.js";
import { computeLayout } from "../src/layout.js";
import { mazeStringCircle, mazeStringGrab, mazeStringHandle } from "../src/maze-string.js";
import type { Field } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";
import { mazeState } from "./maze-harness.js";

/**
 * THE MAZE's knob stays where it was let go (`leverMilli`; the owner,
 * 5 October 2026), so the press has to be answered there and not at the rest
 * it used to snap back to: a knob drawn in one place and pressed in another
 * is the one defect `layout.ts` warns about.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const l = computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, "p1");

function fieldWith(boss: MazeState): Field {
  return {
    creatures: [],
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: 6,
    waveBeat: 6,
    tick: 0,
    seat: 1,
    cfg: DEFAULT_CONFIG,
    boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

describe("THE MAZE's knob, let go away from its rest", () => {
  const m = mazeState({ phase: "read", leverMilli: 3000 });

  it("is drawn and pressed in the same place, away from the rest", () => {
    const knob = mazeStringHandle(l, CFG, m);
    const grab = mazeStringGrab(l, CFG, m);
    const rest = mazeStringCircle(l, CFG);
    expect(grab.x).toBeCloseTo(knob.x, 6);
    expect(grab.y).toBeCloseTo(knob.y, 6);
    expect(Math.hypot(knob.x - rest.x, knob.y - rest.y)).toBeGreaterThan(grab.r * 2);
  });

  it("takes a press on the knob and not one on the rest", () => {
    const knob = mazeStringHandle(l, CFG, m);
    const rest = mazeStringCircle(l, CFG);
    expect(mazeStringUnder(l, knob.x, knob.y, fieldWith(m))?.command).toMatchObject({
      kind: "drag",
      target: "mazeString",
      on: true,
    });
    expect(mazeStringUnder(l, rest.x, rest.y, fieldWith(m))).toBeNull();
  });
});
