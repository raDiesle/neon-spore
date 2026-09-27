import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  capstanFace,
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { capstanRubStanding, capstanSteerStanding } from "../src/capstan-grip.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { rubFinger, rubSays } from "../src/rub.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE CAPSTAN**, and what the simulation cannot be asked:
 * whether either end of the drum the picture draws is where a press is
 * taken, on either seat's screen and with the cradle rocked over; whether
 * the press, its wander and its lift say nothing on their own — the host
 * counts the reversals (`rub.ts`); and whether a real rub from the seat
 * that is not steering wears the bared band. And **the pull**, which was the
 * phone's lean until 27 September 2026: a press on the drum's middle, carried
 * past the mark and held, rocks the cradle over, and a lift lets it drift
 * back.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);
const LEFT: CapstanStep = { ask: "left", color: "either", beats: 12 };

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The drum standing, the left band lit a beat ago and the pilot pulling it all the way round. */
function pulled(): { world: World; s: CapstanState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave stood no drum");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.wear = [0, 0];
  s.bared = false;
  s.pullMilli = [-CFG.capstanPullMilli, 0];
  s.rubs = [0, 0];
  s.rubbed = false;
  s.heldBeats = 0;
  s.steps[0] = LEFT;
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

function end(world: World, s: CapstanState, role: ViewRole) {
  return capstanRubStanding(layout(role), CFG, s, world.beat, BEAT_PHASE);
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("thumbs on THE CAPSTAN", () => {
  it.each(ROLES)("takes either seat's thumb on the bared end, rocked over, on %s", (role) => {
    const { world, s } = pulled();
    for (const seat of [1, 2] as const) {
      const touch = press(world, role, seat, end(world, s, role));
      expect(target(touch)).toBe("capstanRub");
      expect(touch?.player).toBe(seat);
    }
  });

  it("stands the bared end where the rocked cradle carries it", () => {
    const { world, s } = pulled();
    const over = end(world, s, "p1");
    s.pullMilli = [0, 0];
    const level = end(world, s, "p1");
    expect(Math.hypot(over.x - level.x, over.y - level.y)).toBeGreaterThan(1);
    expect(handleCircle(layout("p1"), world, "capstanRub", BEAT_PHASE)).toEqual(level);
  });

  it("takes the end not yet round too, and nothing off the drum", () => {
    const { world, s } = pulled();
    s.pullMilli = [CFG.capstanPullMilli, 0];
    const far = end(world, s, "p1");
    s.pullMilli = [-CFG.capstanPullMilli, 0];
    expect(target(press(world, "p1", 2, far))).toBe("capstanRub");
    const l = layout("p1");
    expect(target(press(world, "p1", 2, { x: l.width / 2, y: l.hullY }))).not.toBe("capstanRub");
  });

  it("offers nothing once the drum is spent", () => {
    const { world, s } = pulled();
    const at = end(world, s, "p1");
    s.phase = "open";
    expect(target(press(world, "p1", 2, at))).not.toBe("capstanRub");
    expect(handleCircle(layout("p1"), world, "capstanRub", BEAT_PHASE)).toBeNull();
  });

  it("takes hold as a rub and says nothing on the press, the wander or the lift", () => {
    const { world, s } = pulled();
    const l = layout("p2");
    const at = end(world, s, "p2");
    const down = press(world, "p2", 2, at);
    expect(down?.command).toBeNull();
    if (!down?.hold || !rubFinger(down.hold)) throw new Error("no rub hold");
    expect(touchMove(l, down.hold, at.x + l.tile * 0.3, at.y)).toBeNull();
    expect(touchUp(l, down.hold, at)).toBeNull();
  });

  it("wears the bared band on a real rub from the seat that does not steer", () => {
    const { world, s } = pulled();
    const hold = press(world, "p2", 2, end(world, s, "p2"))?.hold;
    if (!hold || !rubFinger(hold)) throw new Error("no rub hold");
    for (const turns of [1, 2, 3]) {
      step(world, [{ tick: world.tick, player: 2, command: rubSays(hold, turns, true) }]);
    }
    expect(s.wear[0]).toBe(3);
    const pilot = press(world, "p1", 1, end(world, s, "p1"))?.hold;
    if (!pilot || !rubFinger(pilot)) throw new Error("no rub hold");
    step(world, [{ tick: world.tick, player: 1, command: rubSays(pilot, 2, true) }]);
    expect(s.wear[0]).toBe(3);
  });
});

describe("the pull on THE CAPSTAN", () => {
  function middle(world: World, s: CapstanState, role: ViewRole) {
    return capstanSteerStanding(layout(role), CFG, s, world.beat, BEAT_PHASE);
  }

  it.each(ROLES)("takes either seat's thumb on the drum's middle, on %s", (role) => {
    const { world, s } = pulled();
    for (const seat of [1, 2] as const) {
      const touch = press(world, role, seat, middle(world, s, role));
      expect(target(touch)).toBe("capstanSteer");
      expect(touch?.command).toBeNull();
    }
    expect(handleCircle(layout(role), world, "capstanSteer", BEAT_PHASE)).toEqual(
      middle(world, s, role),
    );
  });

  it("leaves the ends to the rub", () => {
    const { world, s } = pulled();
    expect(target(press(world, "p1", 1, end(world, s, "p1")))).toBe("capstanRub");
  });

  it("rocks the cradle on a carry past the mark, keeps it over while held, and drifts on a lift", () => {
    const { world, s } = pulled();
    s.pullMilli = [0, 0];
    const l = layout("p1");
    const at = middle(world, s, "p1");
    const hold = press(world, "p1", 1, at)?.hold;
    if (hold?.kind !== "drag") throw new Error("no steer hold");
    const across = ((CFG.capstanPullMilli + 200) / 1000) * l.tile;
    const moved = touchMove(l, hold, at.x - across, at.y);
    if (moved?.command == null) throw new Error("the carry said nothing");
    step(world, [{ tick: world.tick, player: 1, command: moved.command }]);
    expect(world.events.map((e) => e.type)).toContain("capstanRock");
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(capstanFace(world, s)).toBe(0);
    const up = touchUp(l, hold, { x: at.x - across, y: at.y });
    if (up?.command == null) throw new Error("the lift said nothing");
    step(world, [{ tick: world.tick, player: 1, command: up.command }]);
    expect(world.events.map((e) => e.type)).toContain("capstanDrift");
  });
});
