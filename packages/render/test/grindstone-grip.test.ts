import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GrindstoneState,
  grindstoneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { chordFinger, chordSays } from "../src/chord.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { rubFinger, rubSays } from "../src/rub.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE GRINDSTONE**, and what the simulation cannot be asked:
 * whether each flat and each jaw the picture draws is where that seat's press
 * is taken, whether the other seat's there falls through, whether a press,
 * wander and lift say nothing on their own — the counts are the host's — and
 * whether a real rub, said turn by turn, shaves the lit flat's grit.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);
type Part = "grindFlatLeft" | "grindFlatRight" | "grindJawLeft" | "grindJawRight";

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The wheel standing, the pilot's flat lit a beat ago. */
function lit(): { world: World; s: GrindstoneState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no wheel");
  s.phase = "lit";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.steps[0] = { ask: "left", color: "either", beats: 8 };
  s.gritMilli = [1000, 1000];
  s.rubs = [0, 0];
  s.padsDown = [0, 0];
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

describe("thumbs on THE GRINDSTONE", () => {
  it.each(ROLES)("takes each seat's thumb on its own flat and jaw, on %s", (role) => {
    const { world } = lit();
    for (const [seat, part] of [
      [1, "grindFlatLeft"],
      [1, "grindJawLeft"],
      [2, "grindFlatRight"],
      [2, "grindJawRight"],
    ] as const)
      expect(target(press(world, role, seat, at(world, role, part)))).toBe(part);
  });

  it.each(ROLES)("answers neither seat on the other's side, on %s", (role) => {
    // Both screens draw the whole wheel; only the geometry says whose side is whose.
    const { world } = lit();
    const wrong = [
      target(press(world, role, 1, at(world, role, "grindFlatRight"))),
      target(press(world, role, 1, at(world, role, "grindJawRight"))),
      target(press(world, role, 2, at(world, role, "grindFlatLeft"))),
      target(press(world, role, 2, at(world, role, "grindJawLeft"))),
    ];
    for (const t of wrong) expect(t === null || !t.startsWith("grind")).toBe(true);
  });

  it("takes a flat as a rub and a jaw as a chord, and neither says anything alone", () => {
    const { world } = lit();
    const l = layout("p1");
    const flat = at(world, "p1", "grindFlatLeft");
    const rub = press(world, "p1", 1, flat);
    const jaw = press(world, "p1", 1, at(world, "p1", "grindJawLeft"));
    expect(rub?.command).toBeNull();
    expect(jaw?.command).toBeNull();
    if (!rub?.hold || !rubFinger(rub.hold)) throw new Error("no rub hold");
    if (!jaw?.hold || !chordFinger(jaw.hold)) throw new Error("no chord hold");
    expect(touchMove(l, rub.hold, flat.x, flat.y + l.tile)).toBeNull();
    expect(touchUp(l, rub.hold, flat)).toBeNull();
  });

  it("shaves the lit flat's grit on a real rub, turn by turn", () => {
    const { world, s } = lit();
    const hold = press(world, "p1", 1, at(world, "p1", "grindFlatLeft"))?.hold;
    if (!hold || !rubFinger(hold)) throw new Error("no rub hold");
    for (const turns of [0, 1, 2, 3])
      step(world, [{ tick: world.tick, player: 1, command: rubSays(hold, turns, true) }]);
    expect(s.gritMilli[0]).toBe(1000 - 3 * CFG.grindstoneShaveMilli);
    step(world, [{ tick: world.tick, player: 1, command: rubSays(hold, 3, false) }]);
    expect(s.rubs[0]).toBe(0);
  });

  it("holds a jaw's pads down on a real chord", () => {
    const { world, s } = lit();
    const hold = press(world, "p1", 1, at(world, "p1", "grindJawLeft"))?.hold;
    if (!hold || !chordFinger(hold)) throw new Error("no chord hold");
    step(world, [
      { tick: world.tick, player: 1, command: chordSays(hold, 0, true) },
      { tick: world.tick, player: 1, command: chordSays(hold, 1, true) },
    ]);
    expect(s.padsDown[0]).toBe(0b11);
  });

  it("offers nothing once the wheel spins free", () => {
    const { world, s } = lit();
    const flat = at(world, "p1", "grindFlatLeft");
    s.phase = "free";
    expect(target(press(world, "p1", 1, flat))).not.toBe("grindFlatLeft");
    expect(handleCircle(layout("test"), world, "grindFlatLeft", BEAT_PHASE)).toBeNull();
    expect(handleCircle(layout("test"), world, "grindJawRight", BEAT_PHASE)).toBeNull();
  });
});
