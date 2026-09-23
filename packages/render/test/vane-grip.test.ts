import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type VaneState,
  vanePhase,
  vaneReachMilli,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { vaneArmCircle, vaneHousingCircle } from "../src/vane-grip.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE VANE.**
 *
 * Both rules shipped on 18 September 2026 with nothing on either screen to
 * take hold of, and they are not one handle among many: from VEER the housing
 * stops splitting on the cycle's clock, so these two gestures are the only way
 * two thirds of this fight can be finished at all (`sim/vane-hand.ts`).
 *
 * What this file asks is the half a simulation cannot. **The arm's ring is the
 * one on the field that moves**, so the load-bearing case is that it is
 * answered where the arm is *drawn* — the same `vaneTipPoint` the spar is hung
 * off — and not at a rest position the arm never has. The rest is the gates
 * said in touches rather than in commands: a seat that owns neither, a phase
 * that offers neither, a pin already standing, a haul already spent.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function fighting(): { world: World; boss: VaneState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "vane") throw new Error("the vane's wave installed no vane");
  return { world, boss: world.boss };
}

/** The pins that put the bearing in each phase, read off the cycle rather than
 * written down here: a table that drifted from `VANE_PHASES` would test the
 * wrong fight. */
function pinsFor(name: string): number {
  for (let pins = 0; pins <= 12; pins++) if (vanePhase(pins).name === name) return pins;
  throw new Error(`no pin count leaves the bearing in ${name}`);
}

function field(world: World, seat: 1 | 2, boss = world.boss): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: 0.4,
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

/** The arm where the picture has it this instant, which is the only place the
 * press may be answered (`vane-grip.ts`). */
function arm(l: Layout, f: Field, b: VaneState): { x: number; y: number } {
  return vaneArmCircle(l, CFG, b, f.beat, f.waveBeat, f.beatPhase);
}

describe("the pilot's thumb on THE VANE's arm", () => {
  it("takes hold of the arm under VEER, where the arm is drawn", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.pins = pinsFor("VEER");
    const f = field(world, 1);
    const at = arm(l, f, boss);
    const touch = touchDown(l, at.x, at.y, f);
    expect(target(touch)).toBe("vaneArm");
    expect(touch?.player).toBe(1);
    expect(touch?.command).toEqual({
      kind: "drag",
      target: "vaneArm",
      on: true,
      fromMilli: 0,
      fromYMilli: 0,
    });
  });

  it("is answered where the arm has swept to and not where it started", () => {
    // The whole reason `Field` carries `waveBeat`: the tip's column comes off
    // the wave's own cycle, so a hit test that had worked it out from anything
    // else would answer the arm in a column it left two beats ago.
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.pins = pinsFor("VEER");
    // Two beats inside a *sweep*, read off the cycle rather than guessed: the
    // arm is held still for three beats at each end, and a pair of beats taken
    // from a hold would prove nothing about a tip that moves.
    let sweeping = 1;
    while (vaneReachMilli(sweeping) === vaneReachMilli(sweeping + 1)) sweeping += 1;
    const early: Field = { ...field(world, 1), waveBeat: sweeping };
    const later: Field = { ...early, waveBeat: sweeping + 1 };
    const moved = arm(l, later, boss);
    expect(moved.x).not.toBeCloseTo(arm(l, early, boss).x, 1);
    expect(target(touchDown(l, moved.x, moved.y, later))).toBe("vaneArm");
    // And the place it *was* is no longer a handle at all.
    expect(target(touchDown(l, arm(l, early, boss).x, moved.y, later))).not.toBe("vaneArm");
  });

  it("is nothing under SWING, where the cycle still opens the housing itself", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.pins = pinsFor("SWING");
    const f = field(world, 1);
    const at = arm(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("vaneArm");
  });

  it("refuses a second thumb on an arm already pinned", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.pins = pinsFor("VEER");
    boss.pinBeat = world.beat;
    boss.pinCol = 2;
    const f = field(world, 1);
    const at = arm(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("vaneArm");
  });

  it("is the pilot's alone", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    boss.pins = pinsFor("VEER");
    const f = field(world, 2);
    const at = arm(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("vaneArm");
  });
});

describe("the navigator's haul on THE VANE's housing", () => {
  function seized(): { world: World; boss: VaneState } {
    const { world, boss } = fighting();
    boss.pins = pinsFor("SEIZE");
    boss.pinBeat = world.beat;
    boss.pinCol = 2;
    boss.hauled = false;
    return { world, boss };
  }

  it("takes hold of the housing under SEIZE, with a pin standing", () => {
    const l = layout("p2");
    const { world } = seized();
    const at = vaneHousingCircle(l, CFG);
    const touch = touchDown(l, at.x, at.y, field(world, 2));
    expect(target(touch)).toBe("vaneHousing");
    expect(touch?.player).toBe(2);
  });

  it("is nothing while the arm is still sweeping", () => {
    const l = layout("p2");
    const { world, boss } = seized();
    boss.pinBeat = -1;
    const at = vaneHousingCircle(l, CFG);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("vaneHousing");
  });

  it("is nothing once this pin's opening has been hauled", () => {
    const l = layout("p2");
    const { world, boss } = seized();
    boss.hauled = true;
    const at = vaneHousingCircle(l, CFG);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("vaneHousing");
  });

  it("is nothing under VEER, where the bearing has not jammed yet", () => {
    const l = layout("p2");
    const { world, boss } = seized();
    boss.pins = pinsFor("VEER");
    const at = vaneHousingCircle(l, CFG);
    expect(target(touchDown(l, at.x, at.y, field(world, 2)))).not.toBe("vaneHousing");
  });

  it("is the navigator's alone", () => {
    const l = layout("p1");
    const { world } = seized();
    const at = vaneHousingCircle(l, CFG);
    expect(target(touchDown(l, at.x, at.y, field(world, 1)))).not.toBe("vaneHousing");
  });

  it("clears the hub, so the ring never sits on the pins being counted", () => {
    const l = layout("p2");
    const { world } = seized();
    const at = vaneHousingCircle(l, CFG);
    const above = { ...field(world, 2) };
    expect(target(touchDown(l, at.x, at.y - at.r * 2.2, above))).not.toBe("vaneHousing");
  });
});

describe("neither is offered where there is no vane", () => {
  it("falls through on a wave with another boss in it", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.pins = pinsFor("VEER");
    const f = field(world, 1, null);
    const at = arm(l, field(world, 1), boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("vaneArm");
    const h = vaneHousingCircle(l, CFG);
    expect(target(touchDown(l, h.x, h.y, field(world, 2, null)))).not.toBe("vaneHousing");
  });
});
