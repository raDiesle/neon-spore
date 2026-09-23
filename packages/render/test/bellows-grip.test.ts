import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  BELLOWS_SEAMS,
  type BellowsState,
  createWorld,
  DEFAULT_CONFIG,
  NO_HAND,
  startWave,
  type World,
} from "@neon-spore/sim";
import { bellowsHandleCircle, bellowsHandleStanding } from "../src/bellows-grip.js";
import { bellowsWord } from "../src/bellows-word.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE BELLOWS**, and the one thing about this boss a
 * simulation cannot be asked: whether the bar the picture hangs off the cap is
 * the bar `bellows-hand.ts` would take a stroke on.
 *
 * The load-bearing case is the one that looks like a bug. **A grab in the
 * other seat's beat is accepted**, because that grab is the jam and the jam is
 * the whole fight: a hit test that only opened while `bellowsTurn` named this
 * seat would make the pair's one fault unreachable and leave the lung a
 * machine that cannot be played wrong. What is refused is what the simulation
 * refuses — a jam, the vent and the opening still — so a press there falls
 * through as if no rail were drawn.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "p1"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function fighting(): { world: World; boss: BellowsState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("bellows");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "bellows") throw new Error("the bellows wave hung no lung");
  world.boss.phase = "pull";
  world.boss.phaseBeat = world.beat;
  world.boss.seams = BELLOWS_SEAMS;
  world.boss.handMilli = [NO_HAND, NO_HAND];
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

/** A press in the middle of one seat's resting bar, on that seat's own screen. */
function press(world: World, boss: BellowsState, player: 1 | 2): string | null {
  const l = layout(player === 1 ? "p1" : "p2");
  const at = bellowsHandleCircle(l, CFG, boss, player, world.beat, 0.4);
  return target(touchDown(l, at.x, at.y, field(world, player)));
}

describe("a thumb on THE BELLOWS", () => {
  it("answers each seat on its own bar", () => {
    const { world, boss } = fighting();
    expect(press(world, boss, 1)).toBe("bellowsPull");
    boss.phase = "push";
    expect(press(world, boss, 2)).toBe("bellowsPush");
  });

  it("shows neither seat the other's bar", () => {
    const { world, boss } = fighting();
    // Her bar's place, pressed on his screen: the drawing keeps it from him
    // (`showsBellowsPull`/`showsBellowsPush`), so the hit test must too.
    const l = layout("p1");
    const hers = bellowsHandleCircle(l, CFG, boss, 2, world.beat, 0.4);
    expect(target(touchDown(l, hers.x, hers.y, field(world, 1)))).toBeNull();
  });

  it("takes the wrong seat's grab, because that grab is the jam", () => {
    // His chamber is open and the lung is waiting on her. His bar still
    // answers: a stroke from it jams both handles and spends the exchange,
    // which is the fight's one fault and has to be reachable (§11.35).
    const { world, boss } = fighting();
    boss.phase = "push";
    expect(press(world, boss, 1)).toBe("bellowsPull");
  });

  it("offers nothing in the three phases that take no hand", () => {
    const { world, boss } = fighting();
    for (const phase of ["jam", "vent", "still"] as const) {
      boss.phase = phase;
      expect(press(world, boss, 1)).not.toBe("bellowsPull");
      expect(press(world, boss, 2)).not.toBe("bellowsPush");
    }
  });

  it("offers both bars on the last seam, which is the one beat the pair acts together", () => {
    const { world, boss } = fighting();
    boss.phase = "last";
    boss.seams = 1;
    expect(press(world, boss, 1)).toBe("bellowsPull");
    expect(press(world, boss, 2)).toBe("bellowsPush");
  });

  it("carries the bar with the chamber it hangs off", () => {
    // The rail hangs off the cap, so a chamber drawn out takes its handle
    // with it: a press is answered where the bar is drawn on *this* frame.
    const { world, boss } = fighting();
    const shut = bellowsHandleCircle(layout(), CFG, boss, 1, world.beat, 0.4);
    boss.phase = "push";
    const open = bellowsHandleCircle(layout(), CFG, boss, 1, world.beat, 0.4);
    expect(open.x).not.toBeCloseTo(shut.x, 1);
  });

  it("stands the bar below its rest by however far the thumb has carried it", () => {
    const { world, boss } = fighting();
    const rest = bellowsHandleCircle(layout(), CFG, boss, 1, world.beat, 0.4);
    boss.handMilli = [900, NO_HAND];
    const held = bellowsHandleStanding(layout(), CFG, boss, 1, world.beat, 0.4);
    expect(held.y).toBeGreaterThan(rest.y);
  });

  it("points a caption at a bar a hand can be on, and at no other", () => {
    const { world, boss } = fighting();
    expect(handleCircle(layout(), world, "bellowsPull", 0.4)).not.toBeNull();
    boss.phase = "vent";
    expect(handleCircle(layout(), world, "bellowsPull", 0.4)).toBeNull();
    expect(handleCircle(layout(), world, "bellowsPush", 0.4)).toBeNull();
  });
});

describe("the word on THE BELLOWS's bar", () => {
  it("asks the seat whose beat it is, and says nothing to the other", () => {
    const { boss } = fighting();
    expect(bellowsWord(CFG, boss, 1)?.word).toBe("PULL");
    expect(bellowsWord(CFG, boss, 2)).toBeNull();
    boss.phase = "push";
    expect(bellowsWord(CFG, boss, 2)?.word).toBe("PUSH");
    expect(bellowsWord(CFG, boss, 1)).toBeNull();
  });

  it("goes quiet once the bar is already past the notch", () => {
    // The stroke is an edge across `bellowsWorkMilli` and a second one needs
    // the hand lifted first, so a thumb holding at the bottom is being asked
    // for nothing it can do (`gripBrakes`' rule).
    const { boss } = fighting();
    boss.handMilli = [CFG.bellowsWorkMilli, NO_HAND];
    expect(bellowsWord(CFG, boss, 1)).toBeNull();
  });

  it("says nothing at all in a jam, a vent or the opening still", () => {
    const { boss } = fighting();
    for (const phase of ["jam", "vent", "still", "seam"] as const) {
      boss.phase = phase;
      expect(bellowsWord(CFG, boss, 1)).toBeNull();
      expect(bellowsWord(CFG, boss, 2)).toBeNull();
    }
  });

  it("turns both bars into the lift on the last seam", () => {
    const { boss } = fighting();
    boss.phase = "last";
    boss.seams = 1;
    expect(bellowsWord(CFG, boss, 1)?.word).toBe("HOLD");
    boss.handMilli = [400, 400];
    expect(bellowsWord(CFG, boss, 1)?.word).toBe("LIFT");
    expect(bellowsWord(CFG, boss, 2)?.word).toBe("LIFT");
  });
});
