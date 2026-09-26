import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type MantleState,
  mantleBoss,
  NO_SPARK,
  startWave,
  type World,
} from "@neon-spore/sim";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { mantleCoreCircle, mantleKnobCircle, mantleSide } from "../src/mantle-grip.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Two real thumbs on THE MANTLE**, and what the simulation cannot be asked:
 * whether the knobs the picture hangs are the ones `mantle-hand.ts` would
 * take a pull on, whether each seat is answered on its own knob and on
 * nothing of the other's though both screens show both, and whether the
 * bared core takes a tap from either seat.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The handles lit, both thumbs off, movement one. */
function pulling(): { world: World; s: MantleState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("mantle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const s = mantleBoss(world);
  if (s === null) throw new Error("the mantle wave hung no shell");
  s.phase = "pull";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.depthMilli = [0, 0];
  s.sparkCol = NO_SPARK;
  return { world, s };
}

/** Every pair gone, the core bared and waiting on `next`. */
function beating(next: 0 | 1 = 0): { world: World; s: MantleState } {
  const { world, s } = pulling();
  s.phase = "heartbeat";
  s.cursor = s.thresholds.length;
  s.heartbeatNext = next;
  s.heartbeatDone = 0;
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

function knob(world: World, s: MantleState, role: ViewRole, seat: 1 | 2) {
  return mantleKnobCircle(layout(role), CFG, s, mantleSide(seat), world.beat, 0.4);
}

function grab(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE MANTLE", () => {
  it.each(ROLES)("takes each seat's press on its own knob, on %s", (role) => {
    const { world, s } = pulling();
    expect(target(grab(world, role, 1, knob(world, s, role, 1)))).toBe("mantleLeft");
    expect(target(grab(world, role, 2, knob(world, s, role, 2)))).toBe("mantleRight");
  });

  it("carries the knob down as a depth, and lets go on the lift", () => {
    const { world, s } = pulling();
    const l = layout("p1");
    const at = knob(world, s, "p1", 1);
    const down = grab(world, "p1", 1, at);
    expect(down?.command).toMatchObject({ target: "mantleLeft", on: true, fromYMilli: 0 });
    if (down?.hold?.kind !== "drag") throw new Error("no drag hold");
    const moved = touchMove(l, down.hold, at.x, at.y + l.tile * 0.8);
    expect(moved?.command).toMatchObject({ target: "mantleLeft", on: true, fromYMilli: 800 });
    const up = touchUp(l, down.hold, { x: at.x, y: at.y });
    expect(up?.command).toMatchObject({ target: "mantleLeft", on: false });
  });

  it.each(ROLES)("answers neither seat on the other's knob, on %s", (role) => {
    // Both screens draw both handles; only the geometry says whose is whose.
    const { world, s } = pulling();
    expect(target(grab(world, role, 1, knob(world, s, role, 2)))).not.toBe("mantleRight");
    expect(target(grab(world, role, 1, knob(world, s, role, 2)))).not.toBe("mantleLeft");
    expect(target(grab(world, role, 2, knob(world, s, role, 1)))).not.toBe("mantleLeft");
    expect(target(grab(world, role, 2, knob(world, s, role, 1)))).not.toBe("mantleRight");
  });

  it("holds a thumb laid on a dark knob before the handles light", () => {
    const { world, s } = pulling();
    s.phase = "still";
    s.phaseBeat = world.beat - CFG.mantleStillBeats;
    expect(target(grab(world, "p2", 2, knob(world, s, "p2", 2)))).toBe("mantleRight");
  });

  it("offers no knob once the shell has split, nor once the core is dark", () => {
    for (const phase of ["heartbeat", "dark"] as const) {
      const { world, s } = beating();
      s.phase = phase;
      expect(target(grab(world, "p1", 1, knob(world, s, "p1", 1)))).not.toBe("mantleLeft");
      expect(handleCircle(layout("test"), world, "mantleLeft", 0.4)).toBeNull();
      expect(handleCircle(layout("test"), world, "mantleRight", 0.4)).toBeNull();
    }
  });

  it.each(ROLES)("takes a tap on the bared core from either seat, on %s", (role) => {
    // The seat the core is not waiting on is refused by the simulation, not
    // passed on to the cannon behind the ring.
    const { world } = beating(0);
    const ring = mantleCoreCircle(layout(role), CFG);
    for (const seat of [1, 2] as const) {
      const touch = grab(world, role, seat, ring);
      expect(target(touch)).toBe("mantleCore");
      expect(touch?.player).toBe(seat);
    }
  });

  it("offers no core to tap while the shell is shut or the core is out", () => {
    const shut = pulling();
    const ring = mantleCoreCircle(layout("p1"), CFG);
    expect(target(grab(shut.world, "p1", 1, ring))).not.toBe("mantleCore");
    expect(handleCircle(layout("p1"), shut.world, "mantleCore", 0.4)).toBeNull();
    const out = beating();
    out.s.phase = "dark";
    expect(target(grab(out.world, "p1", 1, ring))).not.toBe("mantleCore");
  });

  it("stands the knob where the thumb has carried it, and the ghost thumb on it", () => {
    const { world, s } = pulling();
    const l = layout("test");
    expect(bossThumb(l, world, 1, 0.4)).toBeNull();
    const rest = handleCircle(l, world, "mantleLeft", 0.4);
    s.depthMilli = [900, 0];
    const held = handleCircle(l, world, "mantleLeft", 0.4);
    if (rest === null || held === null) throw new Error("no knob to point at");
    expect(held.y).toBeGreaterThan(rest.y);
    expect(bossThumb(l, world, 1, 0.4)).toEqual(held);
    expect(bossThumb(l, world, 2, 0.4)).toBeNull();
  });
});
