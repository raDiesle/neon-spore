import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, type ControlSet, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  step,
  type TasterState,
  tasterBoss,
  tasterPhase,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout, type Layout, type ViewRole } from "../src/layout.js";
import { tasterBladeCircle, tasterGapCircle, tasterLockCircle } from "../src/taster-grip.js";
import { type Field, touchDown } from "../src/touch.js";
import { FRAME_TIMEOUT_MS, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **Three real thumbs on THE TASTER's fan**, one per movement
 * (`sim/taster-hand.ts`, `docs/spec/bosses.md` §11.25).
 *
 * What this file asks is the half a simulation cannot: that a press on the
 * ring the picture draws is the press the fight would accept, that each is
 * refused to the seat it does not belong to, and that no ring stands in a
 * movement that has no use for it. `sim/test/taster-hand.ts` already holds
 * what each gesture then *does*.
 *
 * **The movement is set rather than played to**, `taster-frame.test.ts`'s
 * arrangement and for its reason: `shorn` is what `tasterPhase` reads, and
 * getting there by shooting would make every case here a test about the
 * cannon. What is not set is the gate — each ring is asked through
 * `touchDown`, so what answers is the hit test the game runs.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const STANDARD: ControlSet = controlSet("default");

const layout = (role: ViewRole = "test"): Layout =>
  computeLayout({ width: 420, height: 900, dpr: 2 }, CFG, role);

function standing(): World {
  const world = createWorld(CFG, 7);
  const index = waveWith("taster");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB; i++) step(world, []);
  return world;
}

function fan(world: World): TasterState {
  const t = tasterBoss(world);
  if (t === null) throw new Error("the taster wave grew no fan");
  return t;
}

/** Strike `n` blades off, from the left, which is what `tasterPhase` counts. */
function shear(t: TasterState, n: number): void {
  for (let i = 0; i < n; i++) {
    const k = t.blades[i];
    if (k === undefined) continue;
    k.shorn = true;
    k.edge = null;
    k.layers = 0;
  }
  t.shorn = n;
}

/** The second movement, with one blade out of the crest and undecided. */
function fanning(world: World): { t: TasterState; col: number } {
  const t = fan(world);
  shear(t, CFG.tasterFanShorn);
  const i = t.blades.length - 1;
  const k = t.blades[i];
  if (k === undefined) throw new Error("no blade to grow");
  k.shorn = false;
  k.growBeat = world.beat;
  k.setBeat = -1;
  expect(tasterPhase(t, CFG)).toBe("fanning");
  return { t, col: t.col + i };
}

/** The third, with the gaps her thumb is offered. */
function hurrying(world: World): { t: TasterState; col: number } {
  const t = fan(world);
  shear(t, CFG.tasterHurryShorn);
  expect(tasterPhase(t, CFG)).toBe("hurrying");
  return { t, col: t.col };
}

/** And the last, the interlock standing shut. */
function closed(world: World): TasterState {
  const t = fan(world);
  shear(t, t.blades.length - CFG.tasterClosedBlades);
  expect(tasterPhase(t, CFG)).toBe("closed");
  return t;
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

function hold(world: World, seat: 1 | 2, at: { x: number; y: number }) {
  const touch = touchDown(layout(), at.x, at.y, field(world, seat));
  return touch?.hold?.kind === "drag" ? touch.hold : null;
}

function target(world: World, seat: 1 | 2, at: { x: number; y: number }): string | null {
  return hold(world, seat, at)?.target ?? null;
}

describe("the pilot's pin on a blade that has not decided", () => {
  it("takes hold at the root of that blade, in its own column", () => {
    const world = standing();
    const { col } = fanning(world);
    expect(target(world, 1, tasterBladeCircle(layout(), CFG, col))).toBe("tasterBlade");
  });

  it("reports the column, which is what the hand on the other end takes", () => {
    // Not the index into the fan: `tasterHandsHeard` puts the `id` through
    // `tasterBladeAt`, and a press that named an index would pin its neighbour.
    const world = standing();
    const { col } = fanning(world);
    expect(hold(world, 1, tasterBladeCircle(layout(), CFG, col))?.id).toBe(col);
  });

  it("is his, and nothing at all from the navigator", () => {
    const world = standing();
    const { col } = fanning(world);
    expect(target(world, 2, tasterBladeCircle(layout(), CFG, col))).not.toBe("tasterBlade");
  });

  it("offers nothing on a blade that has already decided", () => {
    const world = standing();
    const { t, col } = fanning(world);
    const k = t.blades[t.blades.length - 1];
    if (k !== undefined) k.setBeat = world.beat;
    expect(target(world, 1, tasterBladeCircle(layout(), CFG, col))).toBeNull();
  });

  it("offers nothing on a column the crest has not opened yet", () => {
    // `opening` is one blade at a time and the whole rule: a pin placed there
    // would be a bet made before the fan had said where it was going.
    const world = standing();
    const { t, col } = fanning(world);
    shear(t, 0);
    expect(tasterPhase(t, CFG)).toBe("opening");
    expect(target(world, 1, tasterBladeCircle(layout(), CFG, col))).toBeNull();
  });
});

describe("the navigator's wipe across a gap", () => {
  it("takes hold over the notch a blade was struck off in", () => {
    const world = standing();
    const { col } = hurrying(world);
    expect(target(world, 2, tasterGapCircle(layout(), CFG, col))).toBe("tasterGap");
  });

  it("is hers, and nothing at all from the pilot", () => {
    // It is the one cut in this fight that spends no colour, and his hands
    // are the ledger's: a seat that could make it would be one phone cutting.
    const world = standing();
    const { col } = hurrying(world);
    expect(target(world, 1, tasterGapCircle(layout(), CFG, col))).not.toBe("tasterGap");
  });

  it("offers nothing on a column a blade still stands in", () => {
    const world = standing();
    const { t } = hurrying(world);
    expect(
      target(world, 2, tasterGapCircle(layout(), CFG, t.col + t.blades.length - 1)),
    ).toBeNull();
  });

  it("goes off a crest that is already cut through for good", () => {
    const world = standing();
    const { t, col } = hurrying(world);
    t.liftBeat = world.beat;
    expect(target(world, 2, tasterGapCircle(layout(), CFG, col))).toBeNull();
  });

  it("is not offered while the fan is only fanning", () => {
    const world = standing();
    const { t } = fanning(world);
    expect(target(world, 2, tasterGapCircle(layout(), CFG, t.col))).toBeNull();
  });
});

describe("the pilot's pry on the interlock", () => {
  it("takes hold in the middle of the crest, where the last blades cross", () => {
    const world = standing();
    const t = closed(world);
    expect(target(world, 1, tasterLockCircle(layout(), CFG, t))).toBe("tasterLock");
  });

  it("is his, and nothing at all from the navigator", () => {
    // Hers is the beam that has to land inside the window his carry opens.
    const world = standing();
    const t = closed(world);
    expect(target(world, 2, tasterLockCircle(layout(), CFG, t))).not.toBe("tasterLock");
  });

  it("goes away for the beats it stands open, because he may let go", () => {
    const world = standing();
    const t = closed(world);
    t.pryBeat = world.beat;
    expect(target(world, 1, tasterLockCircle(layout(), CFG, t))).toBeNull();
  });

  it("comes back when the window has run out and the interlock has shut", () => {
    const world = standing();
    const t = closed(world);
    t.pryBeat = world.beat - CFG.tasterPryBeats;
    expect(target(world, 1, tasterLockCircle(layout(), CFG, t))).toBe("tasterLock");
  });
});

describe("the three rings between them", () => {
  it("are never two at once: one movement, one hand", () => {
    // Swept over every column of the fan, from both seats, so what is asked is
    // that a movement offers **its** hand and no other anywhere on the crest —
    // not that one point answers once. The pin's ring and the pry's stand in
    // the same place when the middle blade is the one growing, which is why
    // this counts the names offered rather than the presses answered.
    const lay = layout();
    const cases = [
      { build: fanning, offered: "tasterBlade" },
      { build: hurrying, offered: "tasterGap" },
      { build: (w: World) => ({ t: closed(w), col: 0 }), offered: "tasterLock" },
    ] as const;
    for (const { build, offered } of cases) {
      const world = standing();
      const { t } = build(world);
      const seen = new Set<string>();
      for (let i = 0; i < t.blades.length; i++) {
        for (const seat of [1, 2] as const) {
          for (const at of [
            tasterBladeCircle(lay, CFG, t.col + i),
            tasterGapCircle(lay, CFG, t.col + i),
            tasterLockCircle(lay, CFG, t),
          ]) {
            const hit = target(world, seat, at);
            if (hit !== null) seen.add(hit);
          }
        }
      }
      expect([...seen]).toEqual([offered]);
    }
  });

  it("all go the beat the fan starts going out", () => {
    // `tasterHandsHeard` drops every command past `outBeat`, so a ring left
    // standing there would be a handle answering nothing.
    for (const build of [fanning, hurrying] as const) {
      const world = standing();
      const { t, col } = build(world);
      t.outBeat = world.beat;
      expect(target(world, 1, tasterBladeCircle(layout(), CFG, col))).toBeNull();
      expect(target(world, 2, tasterGapCircle(layout(), CFG, col))).toBeNull();
    }
    const world = standing();
    const t = closed(world);
    t.outBeat = world.beat;
    expect(target(world, 1, tasterLockCircle(layout(), CFG, t))).toBeNull();
  });

  it("stand clear of row 0, where the creatures fall", () => {
    // The fan reaches into the HUD at its tips and the field starts a tile
    // below its root, so the one band left is the crest itself and the air
    // over it. A ring past either edge would be a handle on somebody else's
    // picture (`docs/looks.md`).
    const lay = layout();
    const world = standing();
    const t = fan(world);
    for (const c of [
      tasterBladeCircle(lay, CFG, t.col),
      tasterGapCircle(lay, CFG, t.col),
      tasterLockCircle(lay, CFG, t),
    ]) {
      expect(c.y + c.r).toBeLessThan(lay.gridTop + lay.tile);
      expect(c.y - c.r).toBeGreaterThan(0);
    }
  });
});
