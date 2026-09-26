import { describe, expect, it } from "bun:test";
import { type Anchor, type Hinge, hang, poseOf, turn, type Vec3, view } from "../src/index.js";

/**
 * A PART ON A HINGE: an anchor with no turn is a shift, each turn goes the
 * way its comment says, and a child hanging off a parent lands where the
 * same part authored flat in the rig would — the whole promise of the chain.
 */

const near = (a: Vec3, b: Vec3) => {
  expect(a.x).toBeCloseTo(b.x, 9);
  expect(a.y).toBeCloseTo(b.y, 9);
  expect(a.z).toBeCloseTo(b.z, 9);
};

describe("an anchor", () => {
  it("with no turn only carries the part to its hinge", () => {
    near(hang(poseOf({ at: { x: 10, y: -4, z: 2 } }), { x: 1, y: 2, z: 3 }), {
      x: 11,
      y: -2,
      z: 5,
    });
  });

  it("pitches the side plane: +x toward +y, a jaw dropping", () => {
    near(hang(poseOf({ at: { x: 0, y: 0, z: 0 }, pitch: Math.PI / 2 }), { x: 1, y: 0, z: 0 }), {
      x: 0,
      y: 1,
      z: 0,
    });
  });

  it("rolls about the body's length: a wing on the near flank lifts", () => {
    const wingTip = hang(poseOf({ at: { x: 0, y: 0, z: 0 }, roll: Math.PI / 2 }), {
      x: 0,
      y: 0,
      z: 1,
    });
    near(wingTip, { x: 0, y: -1, z: 0 });
  });

  it("yaws in the view's own sense", () => {
    const p = { x: -3, y: 1, z: 2 };
    const a = 0.7;
    near(hang(poseOf({ at: { x: 0, y: 0, z: 0 }, yaw: a }), p), turn(p, view(a)));
  });

  it("hangs a child off its parent where the same part authored flat lands", () => {
    const skull: Anchor = { at: { x: -120, y: -10, z: 0 }, yaw: 0.4, pitch: -0.2 };
    const jaw: Anchor = { at: { x: -30, y: 12, z: 0 }, pitch: 0.5, parent: skull };
    const tip = { x: -40, y: 6, z: 3 };
    // By hand: the jaw's own turn, to its hinge, then the skull's turn, to its hinge.
    const inSkull = hang(poseOf({ at: jaw.at, pitch: 0.5 }), tip);
    const flat = hang(poseOf({ at: skull.at, yaw: 0.4, pitch: -0.2 }), inSkull);
    near(hang(poseOf(jaw), tip), flat);
  });

  it("is posed once per call when a cache is passed", () => {
    const skull: Anchor = { at: { x: 1, y: 2, z: 3 }, yaw: 0.3 };
    const cache = new Map<Anchor, Hinge>();
    const a = poseOf({ at: { x: 0, y: 1, z: 0 }, parent: skull }, cache);
    const b = poseOf({ at: { x: 0, y: -1, z: 0 }, parent: skull }, cache);
    expect(cache.size).toBe(3);
    expect(a.m).toEqual(b.m);
  });
});
