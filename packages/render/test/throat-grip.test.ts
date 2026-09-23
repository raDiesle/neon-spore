import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type ThroatState,
  throatCinchable,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { throatRingCircle, throatTubeCircle } from "../src/throat-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

// The cap, applied per file because bun applies it to the file it is in
// (`canvas-stub.ts`).
setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE THROAT.**
 *
 * Both rules shipped with nothing on either screen to take hold of, and the
 * field's own cue has been printing `CINCH` and `HOLD` over bare tube ever
 * since (`boss-cue-read-k.ts`). What this file asks is the half a simulation
 * cannot: that a press on the ring the picture draws is the press
 * `throat-hand.ts` would accept, and that each seat can reach its own handle
 * and neither can reach the other's.
 *
 * The load-bearing cases are the two the gullet **grows**: there is no ring to
 * pinch on a whole tube and no tube to haul outside `open`, so a thumb that
 * lands on either of those places early must fall straight through to whatever
 * is behind it.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function fighting(): { world: World; boss: ThroatState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("throat");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "throat") throw new Error("the throat's wave installed no throat");
  return { world, boss: world.boss };
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

/** A gullet with one muscle choked and the debt paid — the least this fight
 * can hand her, read back off the rule rather than asserted here. */
function choked(boss: ThroatState): ThroatState {
  boss.phase = "slide";
  boss.slack = 1;
  boss.breath = 0;
  boss.cinchBeat = -1;
  if (!throatCinchable(boss)) throw new Error("a choked gullet offers no ring");
  return boss;
}

function ring(l: Layout, f: Field, b: ThroatState): { x: number; y: number } {
  const at = throatRingCircle(l, CFG, b, f.beat, f.beatPhase);
  if (at === null) throw new Error("the gullet has no lowest ring");
  return at;
}

function tube(l: Layout, f: Field, b: ThroatState): { x: number; y: number } {
  return throatTubeCircle(l, CFG, b, f.beat, f.beatPhase);
}

describe("the navigator's thumb on a slack ring", () => {
  it("takes hold of the lowest ring, where the ring is drawn", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).toBe("throatRing");
  });

  it("is the navigator's and nothing at all from the pilot", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 1);
    const at = ring(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });

  it("offers nothing on a whole gullet: there is no slack ring to pinch", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    boss.slack = 0;
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });

  it("refuses a second thumb while one is already on it", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    boss.cinchBeat = world.beat;
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });

  it("refuses while the last cinch is still being paid for", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    boss.breath = 1;
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });

  it("refuses while the tube is everting, when every rule is off", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    boss.phase = "everts";
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });
});

describe("the pilot's carry on the tube", () => {
  it("takes hold under the mouth once the gullet is open", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.phase = "open";
    const f = field(world, 1);
    const at = tube(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).toBe("throatTube");
  });

  it("is the pilot's and nothing at all from the navigator", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    boss.phase = "open";
    const f = field(world, 2);
    const at = tube(l, f, boss);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatTube");
  });

  it("offers nothing in the phases where the mouth still travels", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.phase = "open";
    const f = field(world, 1);
    const at = tube(l, f, boss);
    for (const phase of ["still", "slide", "quick", "everts"] as const) {
      boss.phase = phase;
      expect(target(touchDown(l, at.x, at.y, f)), phase).not.toBe("throatTube");
    }
  });

  it("refuses a second carry while one is still to land", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.phase = "open";
    const f = field(world, 1);
    const at = tube(l, f, boss);
    boss.haulStep = 1;
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatTube");
  });

  it("hangs clear of the mouth, so a body standing in it is never covered", () => {
    const l = layout("p1");
    const { world, boss } = fighting();
    boss.phase = "open";
    const f = field(world, 1);
    const at = throatTubeCircle(l, CFG, boss, f.beat, f.beatPhase);
    const lowest = ring(l, f, boss);
    // Below the lip, and below the lowest muscle the navigator pinches: the
    // two handles of this fight are never within reach of one thumb.
    expect(at.y).toBeGreaterThan(lowest.y + at.r * 2);
  });
});

describe("a miss", () => {
  it("falls through to whatever is behind the handle", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const f = field(world, 2);
    const at = ring(l, f, boss);
    expect(target(touchDown(l, at.x + l.tile * 3, at.y, f))).not.toBe("throatRing");
  });

  it("says nothing at all on a field with no throat in it", () => {
    const l = layout("p2");
    const { world, boss } = fighting();
    choked(boss);
    const at = ring(l, field(world, 2), boss);
    const f = field(world, 2, null);
    expect(target(touchDown(l, at.x, at.y, f))).not.toBe("throatRing");
  });
});
