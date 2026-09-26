import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SlingState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { slingDrawUnder } from "../src/sling-grip.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE SLING's two cords as a control (`sling-grip.ts`): that a thumb is heard
 * anywhere on the seat's own panel while the lit step asks its draw, never
 * only on the rest handle's own circle, and that the lift carries the swipe's
 * side on `fromMilli`. The rule is the simulation's
 * (`sim/test/sling.test.ts`); this file proves the picture hands it a thumb.
 */

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);

/** THE SLING's wave, stepped to a lit step — cursor 0 asks the left arm. */
function toLeft(): { world: World; b: SlingState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("sling");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const b = world.boss;
  if (b === null || b.kind !== "sling") throw new Error("the sling's wave installed no sling");
  let guard = 0;
  while (b.phase !== "lit" && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  return { world, b };
}

/** Stepped on past the left arm's two draws, to the third step: the right arm asked. */
function toRight(): { world: World; b: SlingState } {
  const { world, b } = toLeft();
  for (let i = 0; i < 2; i++) {
    const aim = b.steps[b.cursor]!.aim;
    step(world, [
      {
        tick: world.tick,
        player: 1,
        command: { kind: "drag", target: "slingDrawLeft", on: true, fromMilli: 0 },
      },
    ]);
    for (let t = 0; t < b.steps[b.cursor]!.beats * ticksPerBeat(CFG); t++) step(world, []);
    step(world, [
      {
        tick: world.tick,
        player: 1,
        command: {
          kind: "drag",
          target: "slingDrawLeft",
          on: false,
          fromMilli: aim === "left" ? -1000 : 1000,
        },
      },
    ]);
    let guard = 0;
    while (b.phase !== "lit" && guard++ < 60 * ticksPerBeat(CFG)) step(world, []);
  }
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
  it("is player 1's, anywhere on the field, while the left arm is asked", () => {
    const { world } = toLeft();
    const l = layout("p1");
    const { x, y } = onField(l);
    const touch = slingDrawUnder(l, x, y, fieldOf(world, 1));
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "slingDrawLeft",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "slingDrawLeft", player: 1 });
  });

  it("is nobody's for the seat not asked", () => {
    const { world } = toLeft();
    const l = layout("p2");
    const { x, y } = onField(l);
    expect(slingDrawUnder(l, x, y, fieldOf(world, 2))).toBeNull();
  });

  it("is player 2's while the right arm is asked, and not player 1's", () => {
    const { world } = toRight();
    expect(world.boss?.kind === "sling" && world.boss.steps[world.boss.cursor]?.ask).toBe("right");
    const l2 = layout("p2");
    const { x, y } = onField(l2);
    expect(slingDrawUnder(l2, x, y, fieldOf(world, 2))?.command).toMatchObject({
      target: "slingDrawRight",
      on: true,
    });
    expect(slingDrawUnder(layout("p1"), x, y, fieldOf(world, 1))).toBeNull();
  });

  it("is nobody's with no sling boss on the field", () => {
    const { world } = toLeft();
    const l = layout("p1");
    const { x, y } = onField(l);
    expect(slingDrawUnder(l, x, y, { ...fieldOf(world, 1), boss: null })).toBeNull();
  });

  it("is reached through touchDown, over the field", () => {
    const { world } = toLeft();
    const l = layout("p1");
    const { x, y } = onField(l);
    expect(touchDown(l, x, y, fieldOf(world, 1))?.command).toMatchObject({
      target: "slingDrawLeft",
    });
  });
});

describe("the swipe's lift", () => {
  it("sends one command carrying the swipe's sign", () => {
    const { world } = toLeft();
    const l = layout("p1");
    const field = fieldOf(world, 1);
    const { x, y } = onField(l);
    const down = () => touchDown(l, x, y, field)?.hold as Hold;

    const left = touchUp(l, down(), { x: x - l.tile, y });
    const leftCommand = left?.command as { fromMilli: number } | undefined;
    expect(left?.command).toMatchObject({ target: "slingDrawLeft", on: false });
    expect(leftCommand?.fromMilli).toBeLessThan(0);

    const right = touchUp(l, down(), { x: x + l.tile, y });
    const rightCommand = right?.command as { fromMilli: number } | undefined;
    expect(right?.command).toMatchObject({ target: "slingDrawLeft", on: false });
    expect(rightCommand?.fromMilli).toBeGreaterThan(0);
  });
});
