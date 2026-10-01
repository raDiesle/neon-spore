import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue, controlSet } from "@neon-spore/content";
import {
  createWorld,
  DEFAULT_CONFIG,
  startWave,
  type UndertowLobe,
  undertowBoss,
  type World,
} from "@neon-spore/sim";
import { computeLayout, tileCX } from "../src/layout.js";
import type { Field } from "../src/touch.js";
import { undertowTapUnder } from "../src/undertow-tap.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT, waveWith } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE UNDERTOW's one handle as a control (`undertow-tap.ts`): a thumb on a
 * tall lobe, from either seat, is the tap that puts it back; a thumb on a
 * standing one or on a plate still bowing is nothing, because those are the
 * colour's to answer. The rule is the simulation's (`sim/test/undertow.test.ts`);
 * this file proves the picture hands it a thumb where the lobe is drawn.
 */

const l = computeLayout(VIEWPORT, CFG, "p1");

function withLobe(over: Partial<UndertowLobe>): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("undertow");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  const u = undertowBoss(world);
  if (u === null) throw new Error("the undertow wave installed no floor");
  // Begun a beat ago, so a tall one has finished growing.
  u.lobes.push({ col: 2, stage: "tall", stageBeat: world.beat - 1, answer: "maw", ...over });
  return world;
}

function fieldOf(world: World, seat: 1 | 2): Field {
  return {
    creatures: world.creatures,
    cannonCol: 4,
    shieldCol: 4,
    beatPhase: 0.5,
    skinY: null,
    beat: world.beat,
    waveBeat: world.waveBeat,
    tick: world.tick,
    seat,
    cfg: DEFAULT_CONFIG,
    boss: world.boss,
    controls: controlSet("default"),
    faults: [],
    well: false,
  };
}

/** A point on the lobe's side, a tile above the skin. */
const onLobe = { x: tileCX(l, 2), y: l.hullY - l.tile };

describe("the undertow's tap", () => {
  it("is a press on a tall lobe, from either seat, naming its column", () => {
    for (const seat of [1, 2] as const) {
      const t = undertowTapUnder(l, onLobe.x, onLobe.y, fieldOf(withLobe({}), seat));
      expect(t?.player).toBe(seat);
      expect(t?.command).toMatchObject({ kind: "drag", target: "undertowTap", on: true, id: 2 });
      expect(t?.hold).toBeNull();
    }
  });

  it("is nothing on a standing lobe or a plate still bowing", () => {
    for (const stage of ["standing", "bowing"] as const) {
      const field = fieldOf(withLobe({ stage }), 1);
      expect(undertowTapUnder(l, onLobe.x, onLobe.y, field)).toBeNull();
    }
  });

  it("is nothing two columns away, or high above the lobe's crown", () => {
    const field = fieldOf(withLobe({}), 2);
    expect(undertowTapUnder(l, tileCX(l, 4), onLobe.y, field)).toBeNull();
    expect(undertowTapUnder(l, onLobe.x, l.hullY - 8 * l.tile, field)).toBeNull();
  });
});
