import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type KeelState,
  keelBoss,
  keelSeat,
  NO_JOINT,
  NO_ROCK,
  startWave,
  step,
  type World,
} from "@neon-spore/sim";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { keelJointCircle } from "../src/keel-grip.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE KEEL**, and what the simulation cannot be asked:
 * whether the ring the picture draws round the lit joint is where a tap is
 * taken, whether either seat's tap there is kept off the cannon behind it,
 * and whether the right seat's tap, sent on, is the one that locks.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The spine hung and resting, a joint lit on segment `seg` if it is given. */
function hung(seg: number = NO_JOINT): { world: World; s: KeelState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("keel");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = keelBoss(world);
  if (s === null) throw new Error("the keel wave hung no spine");
  s.phase = seg === NO_JOINT ? "rest" : "joint";
  s.phaseBeat = world.beat;
  s.movement = 1;
  s.joint = seg;
  s.locked = s.locked.map(() => false);
  s.rockCol = NO_ROCK;
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

function ring(world: World, s: KeelState, role: ViewRole) {
  const c = keelJointCircle(layout(role), CFG, s, world.beat, BEAT_PHASE);
  if (c === null) throw new Error("no ring round a lit joint");
  return c;
}

function tap(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE KEEL", () => {
  it.each(ROLES)("takes either seat's tap inside the lit joint's ring, on %s", (role) => {
    // The seat the joint is not over is refused by the simulation, not passed
    // on to the cannon behind the ring.
    for (const seg of [0, 2, 5]) {
      const { world, s } = hung(seg);
      for (const seat of [1, 2] as const) {
        const touch = tap(world, role, seat, ring(world, s, role));
        expect(target(touch)).toBe("keelJoint");
        expect(touch?.player).toBe(seat);
      }
    }
  });

  it("locks the joint on the right seat's tap, and on the wrong one's does nothing", () => {
    for (const seg of [0, 5]) {
      const { world, s } = hung(seg);
      const wants = keelSeat(s, CFG.cols);
      if (wants === null) throw new Error("an end joint is always one seat's");
      const other = wants === 1 ? 2 : 1;
      const wrong = tap(world, "test", other, ring(world, s, "test"));
      if (wrong?.command == null) throw new Error("the wrong seat's tap fell through");
      step(world, [{ tick: world.tick, player: other, command: wrong.command }]);
      expect(s.locked[seg]).toBe(false);
      const right = tap(world, "test", wants, ring(world, s, "test"));
      if (right?.command == null) throw new Error("the right seat's tap fell through");
      step(world, [{ tick: world.tick, player: wants, command: right.command }]);
      expect(s.locked[seg]).toBe(true);
    }
  });

  it.each(ROLES)("rings each joint over its own half of the field, on %s", (role) => {
    const left = hung(0);
    const right = hung(5);
    const a = ring(left.world, left.s, role);
    const b = ring(right.world, right.s, role);
    expect(a.x).not.toBe(b.x);
    const l = layout(role);
    for (const c of [a, b]) {
      expect(c.x - c.r).toBeGreaterThanOrEqual(l.gridLeft);
      expect(c.x + c.r).toBeLessThanOrEqual(l.gridLeft + l.gridWidth);
    }
  });

  it("offers no ring between joints, in the socket or once the spine is straight", () => {
    const lit = hung(2);
    const at = ring(lit.world, lit.s, "p1");
    for (const phase of ["rest", "socket", "rigid", "straight"] as const) {
      const { world, s } = hung(2);
      s.phase = phase;
      expect(target(tap(world, "p1", 1, at))).not.toBe("keelJoint");
      expect(handleCircle(layout("p1"), world, "keelJoint", BEAT_PHASE)).toBeNull();
    }
  });

  it("stands the handle on the ring the drawing puts there, and no ghost thumb on it", () => {
    // The tap is momentary: nothing is held down, so there is nothing to show held.
    const { world, s } = hung(3);
    const l = layout("test");
    expect(handleCircle(l, world, "keelJoint", BEAT_PHASE)).toEqual(ring(world, s, "test"));
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toBeNull();
    expect(bossThumb(l, world, 2, BEAT_PHASE)).toBeNull();
  });
});
