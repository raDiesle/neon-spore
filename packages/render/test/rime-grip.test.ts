import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type RimeState,
  rimeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { rubFinger, rubSays } from "../src/rub.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE RIME**, and what the simulation cannot be asked:
 * whether each half of the lens the picture draws is where that seat's rub
 * is taken, whether the other seat's half falls through, whether a press,
 * wander and lift say nothing on their own — the counts are the host's — and
 * whether a real rub, said turn by turn, shaves the lit half's frost.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);
type Part = "rimeHalfLeft" | "rimeHalfRight";

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The lens hung, both halves asked for a beat ago. */
function lit(): { world: World; s: RimeState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave hung no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.cursor = 0;
  s.steps[0] = { ask: "both", color: "either", beats: 8 };
  s.rimeMilli = [1000, 1000];
  s.rubs = [0, 0];
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

function at(world: World, role: ViewRole, part: Part) {
  const c = handleCircle(layout(role), world, part, BEAT_PHASE);
  if (!c) throw new Error(`no ${part} standing`);
  return c;
}

function press(world: World, role: ViewRole, seat: 1 | 2, p: { x: number; y: number }) {
  return touchDown(layout(role), p.x, p.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("thumbs on THE RIME", () => {
  it.each(ROLES)("takes each seat's thumb on its own half, on %s", (role) => {
    const { world } = lit();
    expect(target(press(world, role, 1, at(world, role, "rimeHalfLeft")))).toBe("rimeHalfLeft");
    expect(target(press(world, role, 2, at(world, role, "rimeHalfRight")))).toBe("rimeHalfRight");
  });

  it.each(ROLES)("answers neither seat on the other's half, on %s", (role) => {
    // Both screens draw the whole lens; only the geometry says whose half is whose.
    const { world } = lit();
    const wrong = [
      target(press(world, role, 1, at(world, role, "rimeHalfRight"))),
      target(press(world, role, 2, at(world, role, "rimeHalfLeft"))),
    ];
    for (const t of wrong) expect(t === null || !t.startsWith("rime")).toBe(true);
  });

  it("takes a half as a rub that says nothing alone", () => {
    const { world } = lit();
    const l = layout("p1");
    const half = at(world, "p1", "rimeHalfLeft");
    const rub = press(world, "p1", 1, half);
    expect(rub?.command).toBeNull();
    if (!rub?.hold || !rubFinger(rub.hold)) throw new Error("no rub hold");
    expect(touchMove(l, rub.hold, half.x, half.y + l.tile)).toBeNull();
    expect(touchUp(l, rub.hold, half)).toBeNull();
  });

  it("shaves each lit half's frost on a real rub, turn by turn", () => {
    const { world, s } = lit();
    for (const [seat, part, side] of [
      [1, "rimeHalfLeft", 0],
      [2, "rimeHalfRight", 1],
    ] as const) {
      const role = seat === 1 ? "p1" : "p2";
      const hold = press(world, role, seat, at(world, role, part))?.hold;
      if (!hold || !rubFinger(hold)) throw new Error("no rub hold");
      for (const turns of [0, 1, 2, 3])
        step(world, [{ tick: world.tick, player: seat, command: rubSays(hold, turns, true) }]);
      expect(s.rimeMilli[side]).toBe(1000 - 3 * CFG.rimeShaveMilli);
      step(world, [{ tick: world.tick, player: seat, command: rubSays(hold, 3, false) }]);
      expect(s.rubs[side]).toBe(0);
    }
  });

  it("offers nothing once the lens shatters", () => {
    const { world, s } = lit();
    const half = at(world, "p1", "rimeHalfLeft");
    s.phase = "shattered";
    expect(target(press(world, "p1", 1, half))).not.toBe("rimeHalfLeft");
    expect(handleCircle(layout("test"), world, "rimeHalfLeft", BEAT_PHASE)).toBeNull();
    expect(handleCircle(layout("test"), world, "rimeHalfRight", BEAT_PHASE)).toBeNull();
  });
});
