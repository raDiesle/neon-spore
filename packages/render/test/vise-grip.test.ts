import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  ticksPerBeat,
  type ViseState,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { bossThumb } from "../src/guide-boss-hand.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { FINGERTIPS_MILLI, pinchGapMilli, pinching, pinchSays } from "../src/pinch.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { viseLobeCircle } from "../src/vise-grip.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real fingers on THE VISE**, and what the simulation cannot be asked:
 * whether each seat's pinch zone is where the picture draws that seat's lobe,
 * whether a finger alone says nothing, and whether the gap two fingers stand
 * apart, sent, is what shuts the lobe.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The case stood, the first step lit. */
function lit(): { world: World; s: ViseState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave stood no case");
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

function lobe(world: World, s: ViseState, role: ViewRole, seat: 1 | 2) {
  return viseLobeCircle(layout(role), CFG, s, seat, world.beat, BEAT_PHASE);
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("a finger on THE VISE", () => {
  it.each(ROLES)("takes each seat's press in its own zone, on %s", (role) => {
    const { world, s } = lit();
    expect(target(press(world, role, 1, lobe(world, s, role, 1)))).toBe("viseLobeLeft");
    expect(target(press(world, role, 2, lobe(world, s, role, 2)))).toBe("viseLobeRight");
  });

  it.each(ROLES)("takes a press off the shell, out at the zone's edge, on %s", (role) => {
    // Two fingertips never fit on a shell six millimetres wide.
    const { world, s } = lit();
    const l = layout(role);
    const at = lobe(world, s, role, 1);
    const wide = { x: l.gridLeft + l.tile * 0.2, y: at.y + l.tile };
    expect(target(press(world, role, 1, wide))).toBe("viseLobeLeft");
  });

  it.each(ROLES)("answers neither seat on the other's side, on %s", (role) => {
    const { world, s } = lit();
    for (const t of [
      target(press(world, role, 1, lobe(world, s, role, 2))),
      target(press(world, role, 2, lobe(world, s, role, 1))),
    ]) {
      expect(t).not.toBe("viseLobeLeft");
      expect(t).not.toBe("viseLobeRight");
    }
  });

  it("refuses a press rows away from the case", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = lobe(world, s, "p1", 1);
    expect(target(press(world, "p1", 1, { x: at.x, y: at.y + l.tile * 4 }))).not.toBe(
      "viseLobeLeft",
    );
  });

  it("holds on the press and says nothing on it, its wander or its lift", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = lobe(world, s, "p1", 1);
    const down = press(world, "p1", 1, at);
    expect(down?.command).toBeNull();
    const hold = down?.hold;
    if (!hold || !pinching(hold)) throw new Error("no pinch hold");
    expect(touchMove(l, hold, at.x + l.tile, at.y)).toBeNull();
    expect(touchUp(l, hold, at)).toBeNull();
  });

  it("shuts the lit lobe on a gap sent from two fingers pressed together", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = lobe(world, s, "p1", 1);
    const hold = press(world, "p1", 1, at)?.hold;
    if (!hold || !pinching(hold)) throw new Error("no pinch hold");
    const gap = pinchGapMilli(l, at, { x: at.x + l.tile * 1.8, y: at.y });
    step(world, [{ tick: world.tick, player: 1, command: pinchSays(hold, gap) }]);
    expect(s.gapMilli[0]).toBeLessThanOrEqual(CFG.viseShutMilli);
    step(world, [{ tick: world.tick, player: 1, command: pinchSays(hold, null) }]);
    expect(s.gapMilli[0]).toBe(CFG.viseOpenMilli);
  });

  it("offers nothing once the case has split", () => {
    const { world, s } = lit();
    const at = lobe(world, s, "p1", 1);
    s.phase = "split";
    expect(target(press(world, "p1", 1, at))).not.toBe("viseLobeLeft");
    expect(handleCircle(layout("test"), world, "viseLobeLeft", BEAT_PHASE)).toBeNull();
    expect(handleCircle(layout("test"), world, "viseLobeRight", BEAT_PHASE)).toBeNull();
  });

  it("stands a ghost thumb on a lobe while it is pinched, and none while it is open", () => {
    const { world, s } = lit();
    const l = layout("test");
    expect(bossThumb(l, world, 1, BEAT_PHASE)).toBeNull();
    s.gapMilli = [1200, CFG.viseOpenMilli];
    const thumb = bossThumb(l, world, 1, BEAT_PHASE);
    expect(thumb).toEqual(handleCircle(l, world, "viseLobeLeft", BEAT_PHASE));
    expect(bossThumb(l, world, 2, BEAT_PHASE)).toBeNull();
  });
});

describe("the gap between two fingertips", () => {
  const l = layout("p1");

  it("reads nought for two fingertips pressed together, and never below", () => {
    const a = { x: 100, y: 100 };
    expect(pinchGapMilli(l, a, { x: 100 + (l.tile * FINGERTIPS_MILLI) / 1000, y: 100 })).toBe(0);
    expect(pinchGapMilli(l, a, a)).toBe(0);
  });

  it("reads the space past a fingertip, in thousandths of a tile, whichever way apart", () => {
    const a = { x: 100, y: 100 };
    const b = { x: 100, y: 100 + l.tile * 4 };
    expect(pinchGapMilli(l, a, b)).toBe(4000 - FINGERTIPS_MILLI);
    expect(pinchGapMilli(l, b, a)).toBe(4000 - FINGERTIPS_MILLI);
  });
});
