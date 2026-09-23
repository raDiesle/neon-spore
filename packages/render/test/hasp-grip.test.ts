import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  HASP_COUNT,
  type HaspState,
  haspBoss,
  NO_BEARING,
  NO_BOLT,
  NO_BURN,
  NO_LATCH,
  startWave,
  type World,
} from "@neon-spore/sim";
import { haspCues } from "../src/boss-cue-read-z.js";
import { cueSeen } from "../src/boss-cue-shape.js";
import { handleCircle } from "../src/handle-place.js";
import { haspLatchCircle, haspWheelCircle } from "../src/hasp-grip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE HASP**, and what the simulation cannot be asked:
 * whether the bar and the wheel the picture draws are the ones `hasp-hand.ts`
 * would take a hand on, and whether each seat is answered on its own half and
 * on nothing of the other's (§20).
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** A latch lit on the first clasp, both hands off, nothing loose. */
function working(): { world: World; s: HaspState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("hasp");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = haspBoss(world);
  if (s === null) throw new Error("the hasp wave hung no door");
  s.phase = "work";
  s.phaseBeat = world.beat;
  s.hasps = HASP_COUNT;
  s.latchMilli = NO_LATCH;
  s.gripBeat = world.beat;
  s.burnBeat = NO_BURN;
  s.handMilli = NO_BEARING;
  s.seized = false;
  s.boltCol = NO_BOLT;
  return { world, s };
}

function field(world: World, seat: 1 | 2): Field {
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
    boss: world.boss,
    controls: STANDARD,
    faults: [],
    well: false,
  };
}

function grab(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE HASP", () => {
  it("takes the pilot's press on the latch, on his screen and the test seat's", () => {
    const { world, s } = working();
    for (const role of ["p1", "test"] as const) {
      const bar = haspLatchCircle(layout(role), CFG, s);
      expect(target(grab(world, role, 1, bar))).toBe("haspLatch");
    }
  });

  it("takes the navigator's press anywhere on the working wheel, turned about its hub", () => {
    const { world, s } = working();
    const wheel = haspWheelCircle(layout("p2"), CFG, s);
    const touch = grab(world, "p2", 2, { x: wheel.x + wheel.r * 0.8, y: wheel.y });
    expect(target(touch)).toBe("haspWheel");
    const hold = touch?.hold;
    if (hold?.kind !== "drag") throw new Error("no drag hold");
    expect(hold.turns).toBe(true);
    expect(hold.originX).toBeCloseTo(wheel.x, 3);
    expect(hold.originY).toBeCloseTo(wheel.y, 3);
    expect(touch?.command).toMatchObject({ target: "haspWheel", fromMilli: NO_BEARING });
  });

  it("answers neither seat on the other's half", () => {
    // The drawing keeps the latch off her screen and the wheel off his
    // (`showsHaspLatch`, `showsHaspWheel`), so the hit test must too.
    const { world, s } = working();
    const bar = haspLatchCircle(layout("p2"), CFG, s);
    expect(target(grab(world, "p2", 2, bar))).not.toBe("haspLatch");
    const wheel = haspWheelCircle(layout("p1"), CFG, s);
    expect(target(grab(world, "p1", 1, wheel))).not.toBe("haspWheel");
  });

  it("refuses the latch while it burns, and the rim goes on taking her hand", () => {
    const { world, s } = working();
    s.burnBeat = world.beat;
    const bar = haspLatchCircle(layout("p1"), CFG, s);
    expect(target(grab(world, "p1", 1, bar))).not.toBe("haspLatch");
    const wheel = haspWheelCircle(layout("p2"), CFG, s);
    expect(target(grab(world, "p2", 2, wheel))).toBe("haspWheel");
  });

  it("offers nothing while no clasp is lit", () => {
    const { world, s } = working();
    for (const phase of ["still", "swing"] as const) {
      s.phase = phase;
      const bar = haspLatchCircle(layout("p1"), CFG, s);
      expect(target(grab(world, "p1", 1, bar))).not.toBe("haspLatch");
      const wheel = haspWheelCircle(layout("p2"), CFG, s);
      expect(target(grab(world, "p2", 2, wheel))).not.toBe("haspWheel");
    }
  });

  it("points a caption at the bar where the thumb has carried it", () => {
    const { world, s } = working();
    const rest = handleCircle(layout("test"), world, "haspLatch", 0.4);
    s.latchMilli = CFG.haspReachMilli;
    const held = handleCircle(layout("test"), world, "haspLatch", 0.4);
    if (rest === null || held === null) throw new Error("no latch to point at");
    // The rail is exactly the reach long, so a full carry is one tile down.
    expect(held.y - rest.y).toBeCloseTo(layout("test").tile, 3);
    expect(handleCircle(layout("test"), world, "haspWheel", 0.4)).not.toBeNull();
    s.phase = "still";
    expect(handleCircle(layout("test"), world, "haspLatch", 0.4)).toBeNull();
    expect(handleCircle(layout("test"), world, "haspWheel", 0.4)).toBeNull();
  });
});

describe("the words on THE HASP", () => {
  const words = (world: World, s: HaspState): string[] =>
    haspCues(layout("test"), world, s).map((c) => c.word);

  it("asks him to HOLD while the latch is up, and says nothing to her yet", () => {
    const { world, s } = working();
    expect(words(world, s)).toEqual(["HOLD"]);
    const [hold] = haspCues(layout("test"), world, s);
    if (hold === undefined) throw new Error("no cue");
    expect(cueSeen(hold, "p1")).toBe(true);
    expect(cueSeen(hold, "p2")).toBe(false);
  });

  it("goes over to her TURN once he has it, and asks him for nothing", () => {
    const { world, s } = working();
    s.latchMilli = CFG.haspGripMilli;
    expect(words(world, s)).toEqual(["TURN"]);
    const [turn] = haspCues(layout("test"), world, s);
    if (turn === undefined) throw new Error("no cue");
    expect(cueSeen(turn, "p2")).toBe(true);
    expect(cueSeen(turn, "p1")).toBe(false);
  });

  it("says nothing while the latch burns", () => {
    const { world, s } = working();
    s.burnBeat = world.beat;
    expect(words(world, s)).toEqual([]);
  });

  it("puts FIRE over a loose bolt, to both seats", () => {
    const { world, s } = working();
    s.phase = "swing";
    s.boltCol = 5;
    const cues = haspCues(layout("test"), world, s);
    expect(cues.map((c) => c.word)).toEqual(["FIRE"]);
    expect(cues[0]?.seat).toBeNull();
  });
});
