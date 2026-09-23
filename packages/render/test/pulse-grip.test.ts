import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PulseState,
  pulseHeart,
  startWave,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { pulseGripBox, pulseMeterBar } from "../src/pulse-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A real thumb on THE PULSE's bar.**
 *
 * The rule is `sim/test/pulse-hand.test.ts`'s and it shipped a long way ahead
 * of any way to send it: the wave's guide promised the pair a thumb on the
 * meter and there was nothing on the meter to take hold of. So what this file
 * asks is the half a simulation cannot — that the box is answered where the
 * bar is drawn, that it answers **both seats at the same place**, that it is
 * offered only in the two states the rule listens in, and that a thumb beside
 * it falls through.
 *
 * It also holds the one thing the box's size is for: a meter is two per cent
 * of the screen tall, and a control nobody can hit twice running is not a
 * control. The box is grown to a handle's height, so the test asks a point a
 * handle's radius off the bar's own line.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function playing(): { world: World; boss: PulseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("pulse");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "pulse") throw new Error("the pulse wave hung no round");
  return { world, boss: world.boss };
}

function field(world: World, seat: 1 | 2, boss = world.boss): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: CFG,
    boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

/** The middle of the bar, which is the middle of the box round it. */
function middle(l: Layout): { x: number; y: number } {
  const bar = pulseMeterBar(l);
  return { x: bar.x + bar.w / 2, y: bar.y + bar.h / 2 };
}

describe("a thumb on THE PULSE's bar", () => {
  it.each([1, 2] as const)("takes hold of the meter for seat %i, where it is drawn", (seat) => {
    const l = layout(seat === 1 ? "p1" : "p2");
    const { world, boss } = playing();
    boss.meter = CFG.pulseFlutterMilli - 1;
    const p = middle(l);
    const touch = touchDown(l, p.x, p.y, field(world, seat));
    expect(target(touch)).toBe("pulseMeter");
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "pulseMeter",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
    expect(touch?.player).toBe(seat);
  });

  it("is a handle's height and not a meter's", () => {
    const l = layout("p1");
    const { world, boss } = playing();
    boss.meter = CFG.pulseFlutterMilli - 1;
    const bar = pulseMeterBar(l);
    const box = pulseGripBox(l, CFG);
    // A thumb that landed a little above the bar's own line: inside the box,
    // outside the two per cent of screen the vessel is drawn in.
    const y = bar.y - (bar.y - box.y) / 2;
    expect(y).toBeLessThan(bar.y);
    expect(target(touchDown(l, bar.x + bar.w / 2, y, field(world, 1)))).toBe("pulseMeter");
  });

  it("answers at either end as well as the middle", () => {
    const l = layout("p1");
    const { world, boss } = playing();
    boss.meter = CFG.pulseArrestMilli - 1;
    const bar = pulseMeterBar(l);
    const y = bar.y + bar.h / 2;
    // The fill is a reading: a box that shrank with the level would be a
    // control that got smaller as the pair got into trouble.
    expect(target(touchDown(l, bar.x + bar.w * 0.02, y, field(world, 1)))).toBe("pulseMeter");
    expect(target(touchDown(l, bar.x + bar.w * 0.98, y, field(world, 1)))).toBe("pulseMeter");
  });

  it("is not offered on a steady bar, which is the rule's own gate", () => {
    const l = layout("p1");
    const { world, boss } = playing();
    boss.meter = CFG.pulseMeterMaxMilli;
    expect(pulseHeart(CFG, boss)).toBe("steady");
    const p = middle(l);
    expect(target(touchDown(l, p.x, p.y, field(world, 1)))).not.toBe("pulseMeter");
  });

  it("is not offered once the stage is called", () => {
    const l = layout("p1");
    const { world, boss } = playing();
    boss.meter = 0;
    boss.phase = "verdict";
    const p = middle(l);
    expect(target(touchDown(l, p.x, p.y, field(world, 1)))).not.toBe("pulseMeter");
  });

  it("falls through below the box", () => {
    const l = layout("p1");
    const { world, boss } = playing();
    boss.meter = CFG.pulseFlutterMilli - 1;
    const box = pulseGripBox(l, CFG);
    const x = box.x + box.w / 2;
    expect(target(touchDown(l, x, box.y + box.h + l.tile, field(world, 1)))).not.toBe("pulseMeter");
    expect(target(touchDown(l, box.x - l.tile, box.y + box.h / 2, field(world, 1)))).not.toBe(
      "pulseMeter",
    );
  });

  it("is nothing on a wave without the round", () => {
    const l = layout("p1");
    const { world } = playing();
    const p = middle(l);
    expect(target(touchDown(l, p.x, p.y, field(world, 1, null)))).not.toBe("pulseMeter");
  });
});
