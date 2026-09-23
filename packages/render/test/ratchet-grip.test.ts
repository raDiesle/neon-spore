import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  NO_BOLT,
  NO_CATCH,
  type RatchetState,
  ratchetBoss,
  startWave,
  type World,
} from "@neon-spore/sim";
import { ratchetCues } from "../src/boss-cue-read-zb.js";
import { cueSeen } from "../src/boss-cue-shape.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { ratchetCatchCircle, ratchetPadCircle } from "../src/ratchet-grip.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE RATCHET**, and what the simulation cannot be
 * asked: whether the bar and the pad the picture draws are the ones
 * `ratchet-hand.ts` would take a hand on, whether each seat is answered on
 * its own half and on nothing of the other's, and which word each is shown.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** A lit window, both hands off, nothing loose. */
function working(): { world: World; s: RatchetState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("ratchet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the ratchet wave stood no rack");
  s.phase = "work";
  s.phaseBeat = world.beat;
  s.catchMilli = NO_CATCH;
  s.catchSpent = false;
  s.pawlDown = false;
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

describe("a thumb on THE RATCHET", () => {
  it("takes the navigator's press on the catch at the top of its rail", () => {
    const { world, s } = working();
    for (const role of ["p2", "test"] as const) {
      const bar = ratchetCatchCircle(layout(role), CFG, s);
      expect(target(grab(world, role, 2, bar))).toBe("ratchetCatch");
    }
  });

  it("takes the pilot's press on the pad", () => {
    const { world } = working();
    for (const role of ["p1", "test"] as const) {
      const pad = ratchetPadCircle(layout(role), CFG);
      const touch = grab(world, role, 1, pad);
      expect(target(touch)).toBe("ratchetPawl");
      expect(touch?.command).toMatchObject({ target: "ratchetPawl", on: true });
    }
  });

  it("carries the catch down as a depth, and lets go on the lift", () => {
    const { world, s } = working();
    const l = layout("p2");
    const bar = ratchetCatchCircle(l, CFG, s);
    const down = grab(world, "p2", 2, bar);
    if (down?.hold?.kind !== "drag") throw new Error("no drag hold");
    const moved = touchMove(l, down.hold, bar.x, bar.y + l.tile * 0.8);
    expect(moved?.command).toMatchObject({ target: "ratchetCatch", on: true, fromYMilli: 800 });
    const up = touchUp(l, down.hold, field(world, 2), { x: bar.x, y: bar.y });
    expect(up?.command).toMatchObject({ target: "ratchetCatch", on: false });
  });

  it("answers neither seat on the other's half", () => {
    // The drawing keeps the catch off his screen and the pawl off hers
    // (`showsRatchetCatch`, `showsRatchetPawl`), so the hit test must too.
    const { world, s } = working();
    const bar = ratchetCatchCircle(layout("p1"), CFG, s);
    expect(target(grab(world, "p1", 1, bar))).not.toBe("ratchetCatch");
    const pad = ratchetPadCircle(layout("p2"), CFG);
    expect(target(grab(world, "p2", 2, pad))).not.toBe("ratchetPawl");
  });

  it("offers nothing once the rack is open or jammed", () => {
    const { world, s } = working();
    for (const phase of ["open", "jam"] as const) {
      s.phase = phase;
      const bar = ratchetCatchCircle(layout("p2"), CFG, s);
      expect(target(grab(world, "p2", 2, bar))).not.toBe("ratchetCatch");
      const pad = ratchetPadCircle(layout("p1"), CFG);
      expect(target(grab(world, "p1", 1, pad))).not.toBe("ratchetPawl");
      expect(handleCircle(layout("test"), world, "ratchetCatch", 0.4)).toBeNull();
    }
  });

  it("swallows a press on the pad between windows rather than passing it on", () => {
    const { world, s } = working();
    s.phase = "climb";
    const pad = ratchetPadCircle(layout("p1"), CFG);
    expect(target(grab(world, "p1", 1, pad))).toBe("ratchetPawl");
  });

  it("points a caption at the bar where the thumb has carried it", () => {
    const { world, s } = working();
    const rest = handleCircle(layout("test"), world, "ratchetCatch", 0.4);
    s.catchMilli = CFG.ratchetReachMilli;
    const held = handleCircle(layout("test"), world, "ratchetCatch", 0.4);
    if (rest === null || held === null) throw new Error("no catch to point at");
    expect(held.y).toBeGreaterThan(rest.y);
    expect(handleCircle(layout("test"), world, "ratchetPawl", 0.4)).not.toBeNull();
  });
});

describe("the words on THE RATCHET", () => {
  const words = (world: World, s: RatchetState): string[] =>
    ratchetCues(layout("test"), world, s).map((c) => c.word);

  it("asks her to HOLD and him to wait ON SET, each on their own screen", () => {
    const { world, s } = working();
    const cues = ratchetCues(layout("test"), world, s);
    expect(cues.map((c) => c.word)).toEqual(["HOLD", "ON SET"]);
    const [hold, onSet] = cues;
    if (hold === undefined || onSet === undefined) throw new Error("no cues");
    expect(cueSeen(hold, "p2")).toBe(true);
    expect(cueSeen(hold, "p1")).toBe(false);
    expect(cueSeen(onSet, "p1")).toBe(true);
    expect(cueSeen(onSet, "p2")).toBe(false);
  });

  it("goes quiet on her catch once she holds, and says the same to him", () => {
    const { world, s } = working();
    s.catchMilli = CFG.ratchetGripMilli;
    expect(words(world, s)).toEqual(["ON SET"]);
  });

  it("says LIFT on a spent catch, and nothing to him while his thumb is down", () => {
    const { world, s } = working();
    s.catchMilli = CFG.ratchetReachMilli;
    s.catchSpent = true;
    s.pawlDown = true;
    expect(words(world, s)).toEqual(["LIFT"]);
  });

  it("puts FIRE over a loose bolt, to both seats, and nothing else once the rack is open", () => {
    const { world, s } = working();
    s.phase = "open";
    s.boltCol = 5;
    const cues = ratchetCues(layout("test"), world, s);
    expect(cues.map((c) => c.word)).toEqual(["FIRE"]);
    expect(cues[0]?.seat).toBeNull();
  });
});
