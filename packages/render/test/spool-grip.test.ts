import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_BRAKE,
  SPOOL_RIBS,
  type SpoolState,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import { spoolCues } from "../src/boss-cue-read-za.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { spoolKnobCircle, spoolKnobStanding } from "../src/spool-grip.js";
import { type Field, touchDown, touchMove } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A real thumb on THE SPOOL's brake**, and the one thing about this boss a
 * simulation cannot be asked: whether the knob the picture hangs on the rail
 * is the knob `spool-hand.ts` takes a depth from — and whether it stays under
 * the thumb that carries it.
 *
 * The second half is the load-bearing case. A drag reports its depth in
 * thousandths of a tile, so a rail whose knob travelled any other distance
 * over the reach would draw the brake running ahead of the thumb holding it.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const PHASE = 0.4;

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The spool mid-movement, past its swing-in, with no hand on the brake. */
function paying(): { world: World; s: SpoolState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("spool");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "spool") throw new Error("the spool wave hung no spool");
  world.beat += 8;
  const s = world.boss;
  s.phase = "pay";
  s.phaseBeat = world.beat - 4;
  s.ribs = SPOOL_RIBS;
  s.brakeMilli = NO_BRAKE;
  return { world, s };
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: PHASE,
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

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

/** A press in the middle of the resting knob, on `role`'s screen, from `seat`. */
function press(world: World, s: SpoolState, role: ViewRole, seat: 1 | 2): string | null {
  const l = layout(role);
  const at = spoolKnobCircle(l, CFG, s, world.beat, PHASE);
  return target(touchDown(l, at.x, at.y, field(world, seat)));
}

describe("a thumb on THE SPOOL's brake", () => {
  it("takes the pilot's press on the knob", () => {
    const { world, s } = paying();
    expect(press(world, s, "p1", 1)).toBe("spoolBrake");
    expect(press(world, s, "test", 1)).toBe("spoolBrake");
  });

  it("shows the navigator no knob to press", () => {
    // The knob's place, pressed on her screen: the drawing keeps the brake
    // from her (`showsSpoolBrake`), so the hit test must too.
    const { world, s } = paying();
    expect(press(world, s, "p2", 2)).toBeNull();
  });

  it("takes a hand in every phase the rail is drawn in, and none once the casing is slack", () => {
    const { world, s } = paying();
    for (const phase of ["taut", "pay", "slip", "ease"] as const) {
      s.phase = phase;
      expect(press(world, s, "p1", 1)).toBe("spoolBrake");
    }
    s.phase = "slack";
    expect(press(world, s, "p1", 1)).toBeNull();
  });

  it("keeps the knob under the thumb that carries it down the rail", () => {
    const { world, s } = paying();
    const l = layout();
    const rest = spoolKnobCircle(l, CFG, s, world.beat, PHASE);
    const grab = touchDown(l, rest.x, rest.y, field(world, 1));
    if (!grab?.hold) throw new Error("the knob took no hold");
    const down = l.tile * 0.6;
    const moved = touchMove(l, grab.hold, rest.x, rest.y + down);
    if (!moved?.command) throw new Error("the carry reported nothing");
    step(world, [{ tick: world.tick, player: 1, command: moved.command }]);
    const held = spoolKnobStanding(l, CFG, s, world.beat, PHASE);
    expect(s.brakeMilli).toBe(600);
    expect(held.y - rest.y).toBeCloseTo(down, 0);
  });

  it("points a caption at the knob where the thumb has it, and at nothing once slack", () => {
    const { world, s } = paying();
    const rest = handleCircle(layout(), world, "spoolBrake", PHASE);
    expect(rest).not.toBeNull();
    s.brakeMilli = 500;
    expect(handleCircle(layout(), world, "spoolBrake", PHASE)?.y).toBeGreaterThan(rest?.y ?? 0);
    s.phase = "slack";
    expect(handleCircle(layout(), world, "spoolBrake", PHASE)).toBeNull();
  });
});

describe("the word on THE SPOOL's knob", () => {
  const words = (world: World, s: SpoolState): string[] =>
    spoolCues(layout("test"), world, s, PHASE).map((c) => c.word);

  it("asks the pilot to HOLD while the line runs and nobody has the brake", () => {
    const { world, s } = paying();
    const [hold] = spoolCues(layout("test"), world, s, PHASE);
    expect(hold?.word).toBe("HOLD");
    expect(hold?.kind).toBe("CARRY");
    expect(hold?.seat).toBe(1);
  });

  it("goes quiet the moment he has hold of it, since how deep is hers to say", () => {
    const { world, s } = paying();
    s.brakeMilli = 0;
    expect(words(world, s)).toEqual([]);
  });

  it("says nothing while no line is running", () => {
    const { world, s } = paying();
    for (const phase of ["taut", "slip", "ease", "slack"] as const) {
      s.phase = phase;
      expect(words(world, s)).toEqual([]);
    }
  });

  it("stands on his screen and never on hers", () => {
    const { world } = paying();
    const skin = (l: Layout) => () => l.hullY;
    const his = layout("p1");
    const hers = layout("p2");
    expect(bossCue(his, world, PHASE, skin(his))?.word).toBe("HOLD");
    expect(bossCue(hers, world, PHASE, skin(hers))).toBeNull();
  });
});
