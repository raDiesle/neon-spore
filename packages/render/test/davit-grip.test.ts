import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type DavitState,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { davitLooseUnder } from "../src/davit-grip.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE DAVIT's one shared hook as a control (`davit-grip.ts`): that a thumb is
 * heard anywhere on the asked seat's own panel while the lit step wants that
 * seat's loose, never only on the rest handle's own circle, and that the
 * lift carries the swipe's side on `fromMilli`. The rule is the simulation's
 * (`sim/test/davit.test.ts`); this file proves the picture hands it a thumb.
 */

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** THE DAVIT's wave, stepped to its first lit step — the left swing, which asks seat 2 (the navigator) to draw. */
function toLit(): { world: World; b: DavitState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("davit");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "davit") throw new Error("the davit's wave installed no davit");
  let guard = 0;
  while (b.phase !== "lit" && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** A point on the field, away from the rest handle — the whole panel is the seat's hit test now. */
function onField(l: ReturnType<typeof layout>): { x: number; y: number } {
  return { x: l.width * 0.2, y: l.bandTop * 0.3 };
}

describe("a thumb on the panel", () => {
  it("is player 2's, anywhere on the field, while the left swing asks the navigator's loose", () => {
    const { world, b } = toLit();
    expect(b.steps[b.cursor]?.ask).toBe("left");
    const l = layout("p2");
    const { x, y } = onField(l);
    const touch = davitLooseUnder(l, x, y, fieldOf(world, 2));
    expect(touch?.player).toBe(2);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "davitLooseRight",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "davitLooseRight", player: 2 });
  });

  it("is nobody's for the seat not asked to loose", () => {
    const { world } = toLit();
    const l = layout("p1");
    const { x, y } = onField(l);
    expect(davitLooseUnder(l, x, y, fieldOf(world, 1))).toBeNull();
  });

  it("is nobody's with no davit boss on the field", () => {
    const { world } = toLit();
    const l = layout("p2");
    const { x, y } = onField(l);
    expect(davitLooseUnder(l, x, y, { ...fieldOf(world, 2), boss: null })).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const { world } = toLit();
    const l = layout("p2");
    const { x, y } = onField(l);
    expect(touchDown(l, x, y, fieldOf(world, 2))?.command).toMatchObject({
      target: "davitLooseRight",
    });
  });
});

describe("the swipe's lift", () => {
  it("sends one command carrying the swipe's sign", () => {
    const { world } = toLit();
    const l = layout("p2");
    const field = fieldOf(world, 2);
    const { x, y } = onField(l);
    const down = () => touchDown(l, x, y, field)?.hold as Hold;

    const left = touchUp(l, down(), { x: x - l.tile, y });
    const leftCommand = left?.command as { fromMilli: number } | undefined;
    expect(left?.command).toMatchObject({ target: "davitLooseRight", on: false });
    expect(leftCommand?.fromMilli).toBeLessThan(0);

    const right = touchUp(l, down(), { x: x + l.tile, y });
    const rightCommand = right?.command as { fromMilli: number } | undefined;
    expect(right?.command).toMatchObject({ target: "davitLooseRight", on: false });
    expect(rightCommand?.fromMilli).toBeGreaterThan(0);
  });
});
