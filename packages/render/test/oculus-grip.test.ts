import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type OculusState,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { oculusHalfCircle } from "../src/oculus-grip.js";
import { oculusCentre, oculusRadius } from "../src/oculus-shape.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE OCULUS**, and what the simulation cannot be asked:
 * whether each half of the lens the picture draws is where that seat's hold
 * is taken, whether the other seat's thumb there falls through, and whether
 * two real presses, sent on and held, are what shuts the pair.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The lens stood, the first pair lit a beat ago. */
function lit(): { world: World; s: OculusState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave stood no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
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

function half(world: World, s: OculusState, role: ViewRole, seat: 1 | 2) {
  return oculusHalfCircle(layout(role), CFG, s, seat, world.beat, BEAT_PHASE);
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a thumb on THE OCULUS", () => {
  it.each(ROLES)("takes each seat's press on its own half of the lens, on %s", (role) => {
    const { world, s } = lit();
    expect(target(press(world, role, 1, half(world, s, role, 1)))).toBe("oculusLeafLeft");
    expect(target(press(world, role, 2, half(world, s, role, 2)))).toBe("oculusLeafRight");
  });

  it.each(ROLES)("takes the press anywhere on the half, rim and top included, on %s", (role) => {
    const { world } = lit();
    const l = layout(role);
    const at = oculusCentre(l, CFG);
    const r = oculusRadius(l).rim * 0.95;
    const top = { x: at.x - r * 0.3, y: at.y - r * 0.9 };
    const rim = { x: at.x + r, y: at.y };
    expect(target(press(world, role, 1, top))).toBe("oculusLeafLeft");
    expect(target(press(world, role, 2, rim))).toBe("oculusLeafRight");
  });

  it.each(ROLES)("answers neither seat on the other's half, on %s", (role) => {
    // Both screens draw the whole lens; only the geometry says whose half is whose.
    const { world, s } = lit();
    const wrong1 = target(press(world, role, 1, half(world, s, role, 2)));
    const wrong2 = target(press(world, role, 2, half(world, s, role, 1)));
    for (const t of [wrong1, wrong2]) {
      expect(t).not.toBe("oculusLeafLeft");
      expect(t).not.toBe("oculusLeafRight");
    }
  });

  it("holds down on the press, sends nothing new on a wander, and lets go on the lift", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = half(world, s, "p1", 1);
    const down = press(world, "p1", 1, at);
    expect(down?.command).toMatchObject({ target: "oculusLeafLeft", on: true });
    if (down?.hold?.kind !== "drag") throw new Error("no drag hold");
    const moved = touchMove(l, down.hold, at.x + l.tile, at.y);
    expect(moved?.command ?? { on: true }).toMatchObject({ on: true });
    const up = touchUp(l, down.hold, at);
    expect(up?.command).toMatchObject({ target: "oculusLeafLeft", on: false });
  });

  it("shuts the lit pair on two real presses held for the step's beats", () => {
    const { world, s } = lit();
    const left = press(world, "p1", 1, half(world, s, "p1", 1));
    const right = press(world, "p2", 2, half(world, s, "p2", 2));
    if (left?.command == null || right?.command == null) throw new Error("a press fell through");
    step(world, [
      { tick: world.tick, player: 1, command: left.command },
      { tick: world.tick, player: 2, command: right.command },
    ]);
    expect(s.held).toEqual([true, true]);
    const beats = s.steps[0]?.beats ?? 4;
    for (let i = 0; i < TPB * (beats + 2) && s.leavesShut === 0; i++) step(world, []);
    expect(s.leavesShut).toBe(2);
  });

  it("offers nothing once the lens has shattered", () => {
    const { world, s } = lit();
    const at = half(world, s, "p1", 1);
    s.phase = "shatter";
    expect(target(press(world, "p1", 1, at))).not.toBe("oculusLeafLeft");
    expect(handleCircle(layout("test"), world, "oculusLeafLeft", BEAT_PHASE)).toBeNull();
    expect(handleCircle(layout("test"), world, "oculusLeafRight", BEAT_PHASE)).toBeNull();
  });

  it("stands a ghost thumb on each half while its leaf is held, and none while it is not", () => {
    const { world, s } = lit();
    const l = layout("test");
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toBeNull();
    s.held = [true, false];
    const thumb = bossThumb(l, world, 1, BEAT_PHASE);
    expect(thumb).toEqual(handleCircle(l, world, "oculusLeafLeft", BEAT_PHASE));
    expect(thumb?.x ?? 0).toBeLessThan(oculusCentre(l, CFG).x);
    expect(bossThumb(l, world, 2, BEAT_PHASE)).toBeNull();
  });
});
