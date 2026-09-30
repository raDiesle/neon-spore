import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  type GovernorState,
  governorTapper,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossCue } from "../src/boss-cue.js";
import {
  governorGripUnder,
  governorHubCircle,
  governorTapCircle,
  governorYokeCircle,
} from "../src/governor-grip.js";
import { governorStanding } from "../src/governor-pose.js";
import { headAt } from "../src/governor-shape.js";
import { handleCircle } from "../src/handles.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { type Field, type Hold, touchDown, touchUp } from "../src/touch.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";
import { FIRE, posed, stood } from "./governor-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE GOVERNOR's hands as controls (`governor-grip.ts`): the tap anywhere
 * on the dial's face, the tapper's only, and the braking seat's chord on the
 * works round it; and the two words the field says about them
 * (`boss-cue-read-zq.ts`). The rules are the simulation's
 * (`sim/test/governor*.test.ts`); this file proves the picture hands them a
 * thumb.
 */

beforeAll(installCanvasGlobals);

const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);
const TPB = ticksPerBeat(CFG);

/** THE GOVERNOR's wave, stepped to its first lit tap: player 1 taps, player 2 brakes. */
function toLit(): { world: World; s: GovernorState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("governor");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = world.boss;
  if (s === null || s.kind !== "governor")
    throw new Error("the governor's wave installed no governor");
  let guard = 0;
  while (governorTapper(s) === null && guard++ < 60 * TPB) step(world, []);
  return { world, s };
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
    cfg: CFG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** A point on the works beside the dial, clear of its face: over the spindle's head's foot. */
function onWorks(role: ViewRole, world: World, s: GovernorState) {
  const l = layout(role);
  const d = governorStanding(l, CFG, s, world.beat, 0.5);
  return { l, x: d.cx, y: headAt(l, d).y };
}

describe("the dial's face", () => {
  it("sends the tapper's tap as an edge, and lets go on the lift", () => {
    const { world, s } = toLit();
    expect(governorTapper(s)).toBe(1);
    const l = layout("p1");
    const d = governorStanding(l, CFG, s, world.beat, 0.5);
    const down = touchDown(l, d.cx, d.cy, fieldOf(world, 1));
    expect(down?.command).toEqual({ kind: "drag", target: "governorTap", on: true, fromMilli: 0 });
    const up = touchUp(l, down?.hold as Hold, { x: d.cx, y: d.cy });
    expect(up?.command).toMatchObject({ target: "governorTap", on: false });
  });

  it("does not answer the braking seat's thumb", () => {
    const { world, s } = toLit();
    const l = layout("p2");
    const d = governorStanding(l, CFG, s, world.beat, 0.5);
    expect(governorGripUnder(l, d.cx, d.cy, fieldOf(world, 2))).toBeNull();
  });

  it("stands on the lit mark for the director's hand", () => {
    const { world, s } = toLit();
    const l = layout("p1");
    expect(handleCircle(l, world, "governorTap", 0)).toEqual(
      governorTapCircle(l, CFG, s, world.beat, 0),
    );
  });
});

describe("the works", () => {
  it("take the braking seat's finger as a chord, its target the seat's", () => {
    const { world, s } = toLit();
    const { l, x, y } = onWorks("p2", world, s);
    const touch = governorGripUnder(l, x, y, fieldOf(world, 2));
    expect(touch?.command).toBeNull();
    expect(touch?.hold).toMatchObject({ kind: "drag", target: "governorChordRight", chord: true });
  });

  it("refuse the tapper's finger while its tap is lit", () => {
    const { world, s } = toLit();
    const { l, x, y } = onWorks("p1", world, s);
    expect(governorGripUnder(l, x, y, fieldOf(world, 1))).toBeNull();
    expect(handleCircle(l, world, "governorChordLeft", 0)).toBeNull();
    expect(handleCircle(l, world, "governorChordRight", 0)).toEqual(
      governorYokeCircle(l, CFG, s, world.beat, 0),
    );
  });
});

describe("the words", () => {
  it("say HOLD on the drum to the braking seat and TAP on the mark to the tapper", () => {
    const { world } = toLit();
    const p1 = layout("p1");
    const p2 = layout("p2");
    expect(bossCue(p1, world, 0, () => p1.hullY)?.word).toBe("TAP");
    expect(bossCue(p2, world, 0, () => p2.hullY)?.word).toBe("HOLD");
  });

  it("say FIRE at the hull while the hub is lit, and ring the hub", () => {
    const world = stood();
    const s = posed(world, FIRE, 0, (g) => {
      g.hubLit = true;
    });
    for (const role of ["p1", "p2"] as const) {
      const l = layout(role);
      const said = bossCue(l, world, 0, () => l.hullY);
      expect(said).toMatchObject({ word: "FIRE", seat: null, y: l.hullY });
      // The owner, 29 September 2026, every boss: a shot cue carries a clear
      // aim target (`cue-helper.ts`). The word stays at the hull, where the
      // cannon goes; the crosshair rides the thing it is fired at.
      const want = governorHubCircle(l, CFG, s, world.beat, 0);
      expect(said?.aim?.x).toBeCloseTo(want.x, 5);
      expect(said?.aim?.y).toBeCloseTo(want.y, 5);
      expect(said?.aim?.r).toBeCloseTo(want.r, 5);
      expect(said?.aim?.y).toBeLessThan(l.hullY);
    }
  });
});
