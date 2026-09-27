import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type HalterState,
  type HalterStep,
  halterBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { chordFinger } from "../src/chord.js";
import { Chords } from "../src/chord-pads.js";
import { halterGripStanding } from "../src/halter-grip.js";
import { handleCircle } from "../src/handle-place.js";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { type Field, touchDown, touchMove, touchUp } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Real thumbs on THE HALTER**, and what the simulation cannot be asked:
 * whether each grip the picture draws is where a press is taken, on either
 * seat's screen; whether the press, its wander and its lift say nothing on
 * their own — the host says each grip down and up (`chord-pads.ts`); whether
 * two grips go out as two drags and a lift as one; and whether a real chord,
 * with the resting seat sending nothing at all, cracks the segment.
 */

const CFG = DEFAULT_CONFIG;
const STANDARD: ControlSet = controlSet("default");
const ROLES: ViewRole[] = ["p1", "p2", "test"];
const BEAT_PHASE = 0.4;
const TPB = ticksPerBeat(CFG);
const LEFT: HalterStep = { ask: "left", color: "either", beats: 12 };
const FIRE: HalterStep = { ask: "fire", color: "cyan", beats: 3 };
const TARGETS = ["halterChordLeft", "halterChordRight"] as const;

const layout = (role: ViewRole): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

/** The seam in, `lit` under the cursor a beat ago, nobody resting and no grip down. */
function lit(ask: HalterStep | null = LEFT): { world: World; s: HalterState } {
  const world = createWorld(CFG, 5);
  const index = waveWith("halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  const s = halterBoss(world);
  if (s === null) throw new Error("the halter wave stood no seam");
  s.phase = ask === null ? "pause" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  s.grips = [0, 0];
  s.heldBeats = 0;
  if (ask !== null) s.steps[0] = ask;
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

function grip(world: World, s: HalterState, role: ViewRole, side: 0 | 1) {
  const at = halterGripStanding(layout(role), CFG, s, side, world.beat, BEAT_PHASE);
  if (at === null) throw new Error("no grip drawn");
  return at;
}

function press(world: World, role: ViewRole, seat: 1 | 2, at: { x: number; y: number }) {
  return touchDown(layout(role), at.x, at.y, field(world, seat));
}

function target(touch: ReturnType<typeof touchDown>): string | null {
  return touch?.hold?.kind === "drag" ? touch.hold.target : null;
}

describe("thumbs on THE HALTER", () => {
  it.each(ROLES)("takes either seat's thumb on each lit grip, on %s", (role) => {
    const { world, s } = lit();
    for (const seat of [1, 2] as const) {
      for (const side of [0, 1] as const) {
        const touch = press(world, role, seat, grip(world, s, role, side));
        expect(target(touch)).toBe(TARGETS[side]);
        expect(touch?.player).toBe(seat);
      }
    }
  });

  it("takes hold as a chord finger and says nothing on the press, the wander or the lift", () => {
    const { world, s } = lit();
    const l = layout("p1");
    const at = grip(world, s, "p1", 0);
    const down = press(world, "p1", 1, at);
    expect(down?.command).toBeNull();
    const hold = down?.hold;
    if (!hold || !chordFinger(hold)) throw new Error("no chord hold");
    expect(touchMove(l, hold, at.x + l.tile * 0.2, at.y)).toBeNull();
    expect(touchUp(l, hold, at)).toBeNull();
  });

  it("offers no grip on a shot or between steps", () => {
    for (const ask of [FIRE, null]) {
      const { world, s } = lit(ask);
      const drawn = lit().s;
      const at = grip(world, drawn, "p1", 0);
      expect(target(press(world, "p1", 1, at))).not.toBe("halterChordLeft");
      expect(halterGripStanding(layout("p1"), CFG, s, 0, world.beat, BEAT_PHASE)).toBeNull();
      expect(handleCircle(layout("test"), world, "halterChordLeft", BEAT_PHASE)).toBeNull();
    }
  });

  it("sends two grips as two drags and a lift as one", () => {
    const { world, s } = lit();
    const chords = new Chords();
    const said: Command[] = [];
    const hold = (side: 0 | 1) => {
      const h = press(world, "p1", 1, grip(world, s, "p1", side))?.hold;
      if (!h || !chordFinger(h)) throw new Error("no chord hold");
      return h;
    };
    for (const [id, side] of [
      [7, 0],
      [8, 1],
    ] as const) {
      const c = chords.down(id, [hold(side)]);
      if (c) said.push(c.command);
    }
    expect(said).toHaveLength(2);
    expect(said.map((c) => (c.kind === "drag" ? [c.target, c.on] : null))).toEqual([
      ["halterChordLeft", true],
      ["halterChordRight", true],
    ]);
    expect(chords.up(8)?.command).toMatchObject({
      kind: "drag",
      target: "halterChordRight",
      on: false,
    });
  });

  it("keeps the pilot's and the navigator's thumbs on one grip apart at the desk", () => {
    const { world, s } = lit();
    const chords = new Chords();
    const at = grip(world, s, "test", 0);
    const h1 = press(world, "test", 1, at)?.hold;
    const h2 = press(world, "test", 2, at)?.hold;
    if (!h1 || !h2 || !chordFinger(h1) || !chordFinger(h2)) throw new Error("no chord hold");
    // Each is its own body's first pad, so both say pad nought down.
    expect(chords.down(1, [h1])).toMatchObject({ player: 1, command: { id: 0, on: true } });
    expect(chords.down(2, [h2])).toMatchObject({ player: 2, command: { id: 0, on: true } });
    expect(chords.up(1)?.player).toBe(1);
  });

  it("cracks the lit segment on a real chord with the resting seat sending nothing", () => {
    const { world, s } = lit();
    const chords = new Chords();
    const said = ([0, 1] as const).flatMap((side) => {
      const h = press(world, "p1", 1, grip(world, s, "p1", side))?.hold;
      if (!h || !chordFinger(h)) throw new Error("no chord hold");
      const c = chords.down(10 + side, [h]);
      return c ? [c] : [];
    });
    step(
      world,
      said.map((c) => ({ tick: world.tick, player: c.player, command: c.command })),
    );
    expect(s.grips[0]).toBe(3);
    const startled = () => world.events.some((e) => e.type === "halterStartle");
    for (let i = 0; i < TPB * (LEFT.beats + 2) && s.cracks[0] === 0; i++) {
      step(world, []);
      expect(startled()).toBe(false);
    }
    expect(s.cracks[0]).toBe(1);
  });
});
