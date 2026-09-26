import { describe, expect, it } from "bun:test";
import type { Vec3 } from "@neon-spore/content";
import { Effects } from "../src/effects.js";
import { VerletChains } from "../src/solid-verlet.js";

const O: Vec3 = { x: 0, y: 0, z: 0 };
const N = 6;
const LINK = 10;

function links(points: readonly Vec3[]): number[] {
  return points.slice(1).map((p, i) => {
    const a = points[i] as Vec3;
    return Math.hypot(p.x - a.x, p.y - a.y, p.z - a.z);
  });
}

/** Runs a chain for `seconds` at `fps` with its root at `root(t)`; the tip at the end. */
function run(fps: number, seconds: number, root: (t: number) => Vec3): Vec3 {
  const chains = new VerletChains();
  let pts = chains.follow("tail", root(0), N, LINK, 0);
  const frames = Math.round(seconds * fps);
  for (let f = 1; f <= frames; f++) pts = chains.follow("tail", root(f / fps), N, LINK, 1 / fps);
  return { ...(pts[N - 1] as Vec3) };
}

describe("a verlet chain", () => {
  it("is laid out along its rest direction, and then hangs below a still root", () => {
    const chains = new VerletChains();
    const first = chains.follow("tail", O, N, LINK, 0);
    expect(first[N - 1]).toEqual({ x: LINK * (N - 1), y: 0, z: 0 });
    let pts = first;
    for (let f = 0; f < 600; f++) pts = chains.follow("tail", O, N, LINK, 1 / 60);
    const tip = pts[N - 1] as Vec3;
    expect(tip.x).toBeCloseTo(0, 0);
    expect(tip.y).toBeCloseTo(LINK * (N - 1), 0);
    for (const d of links(pts)) expect(d).toBeCloseTo(LINK, 6);
  });

  it("keeps swinging after the root stops, where a delay would stop with it", () => {
    // Dragged left for half a second, then held still.
    const root = (t: number): Vec3 => ({ x: -200 * Math.min(t, 0.5), y: 0, z: 0 });
    const chains = new VerletChains();
    chains.follow("tail", root(0), N, LINK, 0, { rest: { x: 0, y: 1, z: 0 } });
    const tips: number[] = [];
    for (let f = 1; f <= 90; f++) {
      const pts = chains.follow("tail", root(f / 60), N, LINK, 1 / 60, {
        rest: { x: 0, y: 1, z: 0 },
      });
      if (f > 30) tips.push((pts[N - 1] as Vec3).x - root(f / 60).x);
    }
    // After the root has stopped the tip still travels: it crosses under the root.
    expect(Math.min(...tips)).toBeLessThan(0);
    expect(Math.max(...tips)).toBeGreaterThan(0);
  });

  it("swings the same at 30 frames a second as at 60", () => {
    const root = (t: number): Vec3 => ({ x: 60 * Math.sin(t * 3), y: 0, z: 0 });
    const a = run(30, 2, root);
    const b = run(60, 2, root);
    expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(0.5);
  });

  it("is re-seated, not whipped, when its root jumps a long way", () => {
    const chains = new VerletChains();
    chains.follow("tail", O, N, LINK, 0);
    for (let f = 0; f < 60; f++) chains.follow("tail", O, N, LINK, 1 / 60);
    const far: Vec3 = { x: 5000, y: -300, z: 0 };
    const pts = chains.follow("tail", far, N, LINK, 1 / 60);
    expect(pts[N - 1]).toEqual({ x: far.x + LINK * (N - 1), y: far.y, z: 0 });
  });

  it("holds still while the clock does", () => {
    const chains = new VerletChains();
    chains.follow("tail", O, N, LINK, 0);
    const before = chains.follow("tail", O, N, LINK, 1 / 60).map((p) => ({ ...p }));
    const after = chains.follow("tail", O, N, LINK, 0).map((p) => ({ ...p }));
    expect(after).toEqual(before);
  });

  it("is forgotten by Effects.reset()", () => {
    const used = new Effects();
    used.chains.follow("tail", O, N, LINK, 1 / 60);
    expect(used.chains.size).toBe(1);
    used.reset();
    expect(used).toEqual(new Effects());
  });
});
