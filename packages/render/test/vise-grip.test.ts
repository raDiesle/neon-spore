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
import { type Field, type Hold, touchDown, touchMove, touchUp } from "../src/touch.js";
import { viseCarriedGap } from "../src/vise-carry.js";
import { viseLobeCircle } from "../src/vise-grip.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real fingers on THE VISE**, and what the simulation cannot be asked:
 * whether each seat's zone is where the picture draws that seat's lobe,
 * whether a press says nothing until the thumb moves, and whether one thumb
 * carried far enough sends the gap that shuts the lobe — never two fingers of
 * one seat, the owner's rule of 8 October 2026.
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

/** The hold a press on a lobe took, or a throw. */
function lobeHold(touch: ReturnType<typeof touchDown>): Extract<Hold, { kind: "drag" }> {
  const hold = touch?.hold;
  if (hold?.kind !== "drag" || hold.closes === undefined) throw new Error("no lobe hold");
  return hold;
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

  it("holds on the press and says nothing until the thumb moves", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = lobe(world, s, "p1", 1);
    const down = press(world, "p1", 1, at);
    expect(down?.command).toBeNull();
    const hold = lobeHold(down);
    expect(hold.closes).toBe(CFG.viseOpenMilli);
    const moved = touchMove(l, hold, at.x + l.tile, at.y)?.command;
    expect(moved).toMatchObject({ target: "viseLobeLeft", on: true });
    expect(moved?.kind === "drag" && moved.fromMilli).toBe(CFG.viseOpenMilli - 1000);
  });

  it.each(ROLES)(
    "shuts the lit lobe carried by one thumb, and lets it open on the lift, on %s",
    (role) => {
      const { world, s } = lit();
      const l = layout(role);
      const at = lobe(world, s, role, 1);
      const hold = lobeHold(press(world, role, 1, at));
      const far = { x: at.x + (l.tile * CFG.viseOpenMilli) / 1000, y: at.y };
      const carried = touchMove(l, hold, far.x, far.y)?.command;
      if (!carried) throw new Error("the carry said nothing");
      step(world, [{ tick: world.tick, player: 1, command: carried }]);
      expect(s.gapMilli[0]).toBeLessThanOrEqual(CFG.viseShutMilli);
      const lifted = touchUp(l, hold, far)?.command;
      if (!lifted) throw new Error("the lift said nothing");
      step(world, [{ tick: world.tick, player: 1, command: lifted }]);
      expect(s.gapMilli[0]).toBe(CFG.viseOpenMilli);
    },
  );

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

describe("the gap a carry leaves", () => {
  const l = layout("p1");
  const open = CFG.viseOpenMilli;

  it("is the open gap for a thumb that has not moved, and nought once it has come that far", () => {
    expect(viseCarriedGap(l, open, 0, 0)).toBe(open);
    expect(viseCarriedGap(l, open, (l.tile * open) / 1000, 0)).toBe(0);
    expect(viseCarriedGap(l, open, l.tile * 9, 0)).toBe(0);
  });

  it("reads the distance whichever way the thumb went", () => {
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      expect(viseCarriedGap(l, open, dx * l.tile * 2, dy * l.tile * 2)).toBe(open - 2000);
    }
  });
});
