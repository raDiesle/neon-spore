import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type PinballState,
  pinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { pinPlungerCircle, pinTableCircle } from "../src/pinball-grip.js";
import { pinTable } from "../src/pinball-table.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on PINBALL's table**, one per seat and one per shot
 * (`sim/pinball-hand.ts`, `docs/spec/interludes.md`).
 *
 * What this file asks is the half a simulation cannot: that a press on the
 * ring the picture draws is the press the round would accept, that each is
 * refused to the seat it does not belong to, and that neither is offered on a
 * shot that has no use for it.
 *
 * **The shot is set rather than played to**, which is what the round's own
 * frame test does the opposite of and for a reason that does not apply here:
 * a slack spring costs a launch in the top tenth of a bar that runs a cycle in
 * 2.1 s, and a test that got there by firing would be a test about the bar.
 * The phase is stepped into `play` rather than written, because that is the
 * gate the simulation itself puts every hand of this round behind
 * (`pinballRoundHeard`).
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "test"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function playing(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * TPB; i++) {
    if (round(world).phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never reached play");
}

function round(world: World): PinballState {
  const r = pinballRound(world);
  if (r === null) throw new Error("PINBALL's wave installed no round");
  return r;
}

/** The shot after a launch at the top of the bar: the bar is dead until wound. */
function slack(world: World): PinballState {
  const r = round(world);
  r.shot = "power";
  r.slack = true;
  return r;
}

/** And a ball in the air, which is the only shot her thumb reaches. */
function flight(world: World): PinballState {
  const r = round(world);
  r.shot = "flight";
  r.nudges = 0;
  r.tilted = false;
  return r;
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

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

const pressPlunger = (world: World, seat: 1 | 2): string | null => {
  const l = layout();
  const at = pinPlungerCircle(l, CFG);
  return target(touchDown(l, at.x, at.y, field(world, seat)));
};

const pressTable = (world: World, seat: 1 | 2): string | null => {
  const l = layout();
  const at = pinTableCircle(l, CFG);
  return target(touchDown(l, at.x, at.y, field(world, seat)));
};

describe("the pilot's plunger on a slack spring", () => {
  it("takes hold at the right-hand end of the bar's own band", () => {
    const world = playing();
    slack(world);
    expect(pressPlunger(world, 1)).toBe("pinPlunger");
  });

  it("is his, and nothing at all from the navigator", () => {
    // He is the seat that owns *where from*, and he is the one who wound it.
    const world = playing();
    slack(world);
    expect(pressPlunger(world, 2)).not.toBe("pinPlunger");
  });

  it("offers nothing on a spring that is not slack", () => {
    const world = playing();
    const r = slack(world);
    r.slack = false;
    expect(pressPlunger(world, 1)).toBeNull();
  });

  it("offers nothing while the needle is still sweeping", () => {
    // The wind is the price of the last shot and it is paid on the bar: in
    // `aim` there is no bar to be dead, and the spring is wound on the way in.
    const world = playing();
    const r = slack(world);
    r.shot = "aim";
    expect(pressPlunger(world, 1)).toBeNull();
  });
});

describe("the navigator's shove on a ball in the air", () => {
  it("takes hold at the left-hand end of the same band", () => {
    const world = playing();
    flight(world);
    expect(pressTable(world, 2)).toBe("pinTable");
  });

  it("is hers, and nothing at all from the pilot", () => {
    // His hand through a flight is the cannon, and a seat that could shove the
    // ball it is catching would be one phone playing the round.
    const world = playing();
    flight(world);
    expect(pressTable(world, 1)).not.toBe("pinTable");
  });

  it("is still there with her one nudge spent, because the next one tilts", () => {
    const world = playing();
    flight(world).nudges = CFG.pinballNudges;
    expect(pressTable(world, 2)).toBe("pinTable");
  });

  it("goes off the table for the rest of a flight it has tilted", () => {
    const world = playing();
    flight(world).tilted = true;
    expect(pressTable(world, 2)).toBeNull();
  });

  it("offers nothing while the ball is still in the muzzle", () => {
    const world = playing();
    round(world).shot = "power";
    expect(pressTable(world, 2)).toBeNull();
  });
});

describe("the two rings between them", () => {
  it("stand clear of one another, at opposite ends of one band", () => {
    // They are never offered on the same shot, so the distance is not about
    // overlap — it is so that a pair never learns *the handle is over on the
    // right* and reaches for the wrong end the first time both come up.
    const l = layout();
    const a = pinPlungerCircle(l, CFG);
    const b = pinTableCircle(l, CFG);
    expect(a.y).toBeCloseTo(b.y, 6);
    expect(a.x - b.x).toBeGreaterThan(a.r + b.r);
  });

  it("stand whole on the table, rim and all", () => {
    // The first frame taken of the plunger had it sliced down the middle by
    // the right edge of the phone: the table's walls are the screen's edges
    // here, and a disc centred on the end of the bar hangs half of itself off.
    const l = layout();
    const t = pinTable(l, CFG);
    for (const c of [pinPlungerCircle(l, CFG), pinTableCircle(l, CFG)]) {
      expect(c.x - c.r).toBeGreaterThanOrEqual(t.x);
      expect(c.x + c.r).toBeLessThanOrEqual(t.x + t.tile * t.cols);
    }
  });

  it("are both gone once the round is over", () => {
    for (const phase of ["verdict", "spent"] as const) {
      const world = playing();
      const r = slack(world);
      r.phase = phase;
      expect(pressPlunger(world, 1)).toBeNull();
      r.shot = "flight";
      expect(pressTable(world, 2)).toBeNull();
    }
  });
});
