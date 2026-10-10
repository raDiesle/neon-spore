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
import { pinPlungerCircle } from "../src/pinball-grip.js";
import { pinTable } from "../src/pinball-table.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A real thumb on PINBALL's table**: the pilot's plunger
 * (`sim/pinball-hand.ts`, `docs/spec/interludes.md`).
 *
 * What this file asks is the half a simulation cannot: that a press on the
 * ring the picture draws is the press the round would accept, that it is
 * refused to the seat it does not belong to, and that it is not offered on a
 * shot that has no use for it. And that the shove's ring is gone from the
 * table: since 10 October 2026 the nudge is ◀ and ▶ on the band.
 *
 * **The shot is set rather than played to**, which is what the round's own
 * frame test does the opposite of and for a reason that does not apply here:
 * a slack spring costs a launch in the top tenth of a bar that runs a cycle in
 * 4.2 s, and a test that got there by firing would be a test about the bar.
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

/** Where the shove's ring stood: the plunger mirrored to the band's left end. */
const pressTable = (world: World, seat: 1 | 2): string | null => {
  const l = layout();
  const t = pinTable(l, CFG);
  const at = pinPlungerCircle(l, CFG);
  const x = t.x + (t.x + t.tile * t.cols - at.x);
  return target(touchDown(l, x, at.y, field(world, seat)));
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

describe("the table in a flight", () => {
  it("takes no hold where the shove's ring stood, from either seat", () => {
    // The owner, 10 October 2026: the nudge is a press on both panels, there
    // all the time (`pinball-button.ts`), so the field has nothing to take.
    const world = playing();
    flight(world);
    expect(pressTable(world, 1)).toBeNull();
    expect(pressTable(world, 2)).toBeNull();
  });
});

describe("the plunger's ring", () => {
  it("stands whole on the table, rim and all", () => {
    // The first frame taken of the plunger had it sliced down the middle by
    // the right edge of the phone: the table's walls are the screen's edges
    // here, and a disc centred on the end of the bar hangs half of itself off.
    const l = layout();
    const t = pinTable(l, CFG);
    const c = pinPlungerCircle(l, CFG);
    expect(c.x - c.r).toBeGreaterThanOrEqual(t.x);
    expect(c.x + c.r).toBeLessThanOrEqual(t.x + t.tile * t.cols);
  });

  it("is gone once the round is over", () => {
    for (const phase of ["verdict", "spent"] as const) {
      const world = playing();
      const r = slack(world);
      r.phase = phase;
      expect(pressPlunger(world, 1)).toBeNull();
    }
  });
});
