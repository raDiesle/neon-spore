import { describe, expect, it } from "bun:test";
import {
  FRONT,
  facing,
  farFirst,
  keyLit,
  type Ring,
  ringLight,
  SIDE,
  see,
  seeTube,
  THREE_QUARTER,
  tubeFrames,
  turn,
  view,
} from "../src/index.js";

/**
 * A BOSS SEEN FROM ANY SIDE: the claims the drawing rests on, each one the
 * way a turn would look wrong if it broke — the head swinging away instead of
 * toward, the light turning with the body, a near part painted under a far
 * one, a ridge sliding round a tube that does not twist.
 */

const HEAD = { x: -100, y: 0, z: 0 };
const close = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThan(1e-9);

describe("a rig turns", () => {
  it("leaves the side view as authored", () => {
    const p = turn({ x: 3, y: 4, z: 5 }, view(SIDE));
    close(p.x, 3);
    close(p.y, 4);
    close(p.z, 5);
  });

  it("brings the head toward the player at FRONT", () => {
    const p = turn(HEAD, view(FRONT));
    expect(p.z).toBeGreaterThan(99);
    close(p.x, 0);
  });

  it("puts the head half way round at the three-quarter", () => {
    const p = turn(HEAD, view(THREE_QUARTER));
    close(p.x, p.z * -1);
    expect(p.z).toBeGreaterThan(0);
  });

  it("tips the back toward the viewer when looked down on", () => {
    const back = { x: 0, y: -1, z: 0 };
    expect(facing(back, view(SIDE, 0.4))).toBe(true);
    expect(facing(back, view(SIDE, -0.4))).toBe(false);
  });

  it("swells what is near and shrinks what is far through a lens", () => {
    const w = view(FRONT, 0, 600);
    expect(see(HEAD, w).s).toBeGreaterThan(1);
    expect(see({ x: 100, y: 0, z: 0 }, w).s).toBeLessThan(1);
  });
});

describe("the light does not turn", () => {
  it("is brightest on a normal pointing at the key", () => {
    const toward = keyLit(-0.5, -0.5, Math.SQRT1_2);
    const away = keyLit(0.5, 0.5, Math.SQRT1_2);
    expect(toward).toBeGreaterThan(away);
  });

  it("lights the same side of a tube's section whichever way the tube faces", () => {
    const rings: Ring[] = [0, 1, 2].map((i) => ({ c: { x: i * 50, y: 0, z: 0 }, r: 20 }));
    const frames = tubeFrames(rings);
    for (const yaw of [SIDE, 0.6, THREE_QUARTER]) {
      const seen = seeTube(rings, frames, view(yaw));
      const ring = seen[1] as (typeof seen)[number];
      const [right, left] = ringLight(ring, [-0.9, 0.9]) as [number, number];
      // The key is above; whichever edge is the upper one on the screen is lit.
      const upperLit = ring.left.y < ring.right.y ? left : right;
      const lowerLit = ring.left.y < ring.right.y ? right : left;
      expect(upperLit).toBeGreaterThan(lowerLit);
    }
  });
});

describe("the painter", () => {
  it("draws far first and keeps authored order at one depth", () => {
    const order = farFirst(["near", "far", "tie-a", "tie-b"], (s) =>
      s === "near" ? 5 : s === "far" ? -5 : 0,
    );
    expect(order).toEqual(["far", "tie-a", "tie-b", "near"]);
  });
});

describe("a tube's frame", () => {
  it("does not twist along a bent spine", () => {
    const rings: Ring[] = [];
    for (let i = 0; i <= 20; i++) {
      const a = (i / 20) * Math.PI * 0.8;
      rings.push({ c: { x: Math.sin(a) * 100, y: 0, z: -Math.cos(a) * 100 }, r: 10 });
    }
    const frames = tubeFrames(rings);
    // The spine bends in the x-z plane, so the top stays the top the whole way.
    for (const f of frames) close(f.n.y, -1);
  });

  it("keeps an outline when the tube points straight at the eye", () => {
    const rings: Ring[] = [0, 1, 2].map((i) => ({ c: { x: i * 40, y: 0, z: 0 }, r: 15 }));
    const seen = seeTube(rings, tubeFrames(rings), view(FRONT));
    for (const s of seen) {
      expect(Number.isFinite(s.left.x) && Number.isFinite(s.left.y)).toBe(true);
      close(Math.hypot(s.left.x - s.c.x, s.left.y - s.c.y), 15);
    }
  });
});
