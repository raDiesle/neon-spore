import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type TrivetState,
  ticksPerBeat,
  trivetBoss,
  type World,
} from "@neon-spore/sim";
import { chordFinger, chordSays } from "../src/chord.js";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { trivetFootStanding } from "../src/trivet-grip.js";
import { trivetCentre } from "../src/trivet-shape.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real fingers on THE TRIVET**, and what the simulation cannot be asked:
 * whether each foot the picture draws is where that seat's chord is taken,
 * whether the other seat's fingers there fall through, whether a finger's
 * press, wander and lift all say nothing on their own — the count is the
 * host's — and whether a real chord, said pad by pad, plants the foot.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The stand in, the front foot's first step lit a beat ago. */
function lit(): { world: World; s: TrivetState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("trivet");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = trivetBoss(world);
  if (s === null) throw new Error("the trivet wave stood no stand");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.padsDown = [0, 0];
  s.heldBeats = 0;
  return { world, s };
}

function field(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: world.cannonCol,
    shieldCol: world.shieldCol,
    beatPhase: BEAT_PHASE,
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

function foot(world: World, s: TrivetState, role: ViewRole, seat: 1 | 2) {
  return trivetFootStanding(layout(role), world, s, seat, BEAT_PHASE);
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("fingers on THE TRIVET", () => {
  it.each(ROLES)("takes each seat's finger on its own foot, on %s", (role) => {
    const { world, s } = lit();
    expect(target(press(world, role, 1, foot(world, s, role, 1)))).toBe("trivetPadFront");
    expect(target(press(world, role, 2, foot(world, s, role, 2)))).toBe("trivetPadRear");
  });

  it.each(ROLES)("takes a finger anywhere on its side of the hub, on %s", (role) => {
    const { world } = lit();
    const l = layout(role);
    const at = trivetCentre(l, CFG);
    const left = { x: at.x - l.tile * 2.5, y: at.y };
    const right = { x: at.x + l.tile * 2.5, y: at.y };
    expect(target(press(world, role, 1, left))).toBe("trivetPadFront");
    expect(target(press(world, role, 2, right))).toBe("trivetPadRear");
  });

  it.each(ROLES)("answers neither seat on the other's foot, on %s", (role) => {
    // Both screens draw the whole stand; only the geometry says whose foot is whose.
    const { world, s } = lit();
    const wrong1 = target(press(world, role, 1, foot(world, s, role, 2)));
    const wrong2 = target(press(world, role, 2, foot(world, s, role, 1)));
    for (const t of [wrong1, wrong2]) {
      expect(t).not.toBe("trivetPadFront");
      expect(t).not.toBe("trivetPadRear");
    }
  });

  it("takes hold as a chord finger and says nothing on the press, the wander or the lift", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = foot(world, s, "p1", 1);
    const down = press(world, "p1", 1, at);
    expect(down?.command).toBeNull();
    const hold = down?.hold;
    if (!hold || !chordFinger(hold)) throw new Error("no chord hold");
    expect(touchMove(l, hold, at.x + l.tile, at.y)).toBeNull();
    expect(touchUp(l, hold, at)).toBeNull();
  });

  it("plants the lit front foot on a real chord of two held for the step's beats", () => {
    const { world, s } = lit();
    const hold = press(world, "p1", 1, foot(world, s, "p1", 1))?.hold;
    if (!hold || !chordFinger(hold)) throw new Error("no chord hold");
    step(world, [
      { tick: world.tick, player: 1, command: chordSays(hold, 0, true) },
      { tick: world.tick, player: 1, command: chordSays(hold, 1, true) },
    ]);
    expect(s.padsDown[0]).toBe(0b11);
    const beats = s.steps[0]?.beats ?? 5;
    for (let i = 0; i < TPB * (beats + 2) && s.feet[0] === 0; i++) step(world, []);
    expect(s.feet[0]).toBe(1);
  });

  it("offers nothing once the stand has collapsed", () => {
    const { world, s } = lit();
    const at = foot(world, s, "p1", 1);
    s.phase = "collapse";
    expect(target(press(world, "p1", 1, at))).not.toBe("trivetPadFront");
    expect(handleCircle(layout("test"), world, "trivetPadFront", BEAT_PHASE)).toBeNull();
    expect(handleCircle(layout("test"), world, "trivetPadRear", BEAT_PHASE)).toBeNull();
  });

  it("stands a ghost thumb on a foot while any of its pads is down, and none while none is", () => {
    const { world, s } = lit();
    const l = layout("test");
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toBeNull();
    s.padsDown = [0b01, 0];
    const thumb = bossThumb(l, world, 1, BEAT_PHASE);
    expect(thumb).toEqual(handleCircle(l, world, "trivetPadFront", BEAT_PHASE));
    expect(thumb?.x ?? 0).toBeLessThan(trivetCentre(l, CFG).x);
    expect(bossThumb(l, world, 2, BEAT_PHASE)).toBeNull();
  });
});
