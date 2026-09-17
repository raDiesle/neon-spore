import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OrreryState,
  orreryDir,
  orreryGapSlot,
  orreryOrbit,
  startWave,
  type World,
} from "@neon-spore/sim";
import { computeLayout, fieldX, type Layout } from "../src/layout.js";
import {
  ORRERY_FLATTEN,
  orreryAt,
  orreryCorePoint,
  orreryOrbitPath,
  orreryOrganR,
  orreryPoint,
  orreryRx,
  orreryRy,
} from "../src/orrery-shape.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

/**
 * **THE ORRERY's geometry**, which is the one part of its picture that has a
 * right answer rather than a nice one.
 *
 * The rules say a shot passes through slot 0 and nowhere else, so if the
 * drawing puts slot 0 anywhere but the bottom of the ring over the core's own
 * column, then the pair are reading a picture that disagrees with the boss —
 * and a fight whose whole content is *which slot is the gap on* cannot survive
 * that. Everything here is that one claim and its consequences.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

const RINGS = [0, 1, 2];

function rings(): { b: OrreryState; world: World } {
  const world = createWorld(CFG, 3);
  const index = waveWith("orrery");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  if (world.boss?.kind !== "orrery") throw new Error("the orrery wave installed no orrery");
  return { b: world.boss, world };
}

const layout = (flip = false): Layout => ({ ...computeLayout(VIEWPORT, CFG, "test"), flip });

describe("THE ORRERY's orbits", () => {
  it("puts slot 0 at the bottom of the ring, in the core's own column", () => {
    const l = layout();
    const core = orreryCorePoint(l, CFG);
    for (const ring of RINGS) {
      const at = orreryPoint(l, CFG, ring, 0);
      expect(at.x).toBeCloseTo(core.x, 6);
      // Down the screen is a larger y: the gap is between the core and the
      // hull, which is the only place a shot could meet it.
      expect(at.y).toBeGreaterThan(core.y);
    }
  });

  it("puts the slot opposite it at the top, the same distance the other way", () => {
    const l = layout();
    const core = orreryCorePoint(l, CFG);
    for (const ring of RINGS) {
      const orbit = orreryOrbit(CFG, ring);
      const top = orreryPoint(l, CFG, ring, orbit / 2);
      const bottom = orreryPoint(l, CFG, ring, 0);
      expect(top.x).toBeCloseTo(core.x, 6);
      expect(core.y - top.y).toBeCloseTo(bottom.y - core.y, 6);
    }
  });

  it("nests the three rings, and flattens every one of them the same way", () => {
    expect(orreryRx(CFG, 0)).toBeGreaterThan(orreryRx(CFG, 1));
    expect(orreryRx(CFG, 1)).toBeGreaterThan(orreryRx(CFG, 2));
    expect(orreryRx(CFG, 2)).toBeGreaterThan(0);
    for (const ring of RINGS) {
      expect(orreryRy(CFG, ring)).toBeCloseTo(orreryRx(CFG, ring) * ORRERY_FLATTEN, 6);
      // The tilt is a squash, not a rotation: every ring is wider than it is
      // tall, which is what lets three of them be told apart by height alone.
      expect(orreryRy(CFG, ring)).toBeLessThan(orreryRx(CFG, ring));
    }
  });

  it("sends a quarter turn out to one side, and the seat that is turned sees it on the other", () => {
    const plain = layout();
    const turned = layout(true);
    const orbit = orreryOrbit(CFG, 0);
    const out = orreryPoint(plain, CFG, 0, orbit / 4);
    const mirrored = orreryPoint(turned, CFG, 0, orbit / 4);
    expect(out.x).toBeGreaterThan(orreryCorePoint(plain, CFG).x);
    expect(mirrored.x).toBeLessThan(orreryCorePoint(turned, CFG).x);
    // The fold is about the field's middle and the core stands in it, so the
    // two sides are the same distance out — which is the whole of why the
    // pilot's "three out to the right" is the navigator's three to the left.
    expect(mirrored.x).toBeCloseTo(2 * fieldX(plain, (CFG.cols - 1) / 2) - out.x, 6);
    // And the height is untouched: a fold is not a tilt.
    expect(mirrored.y).toBeCloseTo(out.y, 6);
  });

  it("draws an orbit as a path a canvas will take", () => {
    const l = layout();
    expect(orreryOrbitPath(l, CFG, 0)).toBeInstanceOf(Path2D);
    expect(orreryOrganR(l)).toBeGreaterThan(0);
    expect(orreryOrganR(l)).toBeLessThan(l.tile / 2);
  });
});

describe("THE ORRERY's step", () => {
  it("starts the beat on the slot it left and finishes on the slot it is arriving at", () => {
    const { b } = rings();
    for (const ring of RINGS) {
      const beat = b.anchorBeat + 5;
      const slot = orreryGapSlot(CFG, b, ring, beat);
      // On the beat itself the ring has not moved yet: it is standing one
      // organ back, whichever way this ring goes round (`orreryDir`).
      expect(orreryAt(CFG, b, ring, beat, 0)).toBeCloseTo(slot - orreryDir(ring), 6);
      // And well before the beat is out it has arrived and is sitting there,
      // which is what makes a cadence a rhythm rather than a speed.
      expect(orreryAt(CFG, b, ring, beat, 0.6)).toBe(slot);
      expect(orreryAt(CFG, b, ring, beat, 0.99)).toBe(slot);
    }
  });

  it("only ever moves one organ over a beat, and never past the one it wants", () => {
    const { b } = rings();
    for (const ring of RINGS) {
      const beat = b.anchorBeat + 3;
      const slot = orreryGapSlot(CFG, b, ring, beat);
      let last = orreryAt(CFG, b, ring, beat, 0);
      for (let i = 1; i <= 20; i++) {
        const now = orreryAt(CFG, b, ring, beat, i / 20);
        // Monotonic in this ring's own direction, and inside the organ it
        // started in and the one it is going to — a picture that overshot
        // would show a gap standing where no shot could pass.
        expect((now - last) * orreryDir(ring)).toBeGreaterThanOrEqual(0);
        expect(Math.abs(now - slot)).toBeLessThanOrEqual(1);
        last = now;
      }
      expect(last).toBe(slot);
    }
  });
});
