import { describe, expect, it } from "bun:test";
import { CATALOGUE, MOTIONS } from "@neon-spore/shape-sheet";
import { extentOf, longAxisOf, poseAtSecond } from "../src/shapes-motion.js";

/**
 * Which way round each catalogue body is, and what that does to a motion
 * written along it.
 *
 * The numbers below are the argument PERISTALSIS's own header makes and are
 * held here so that they are a fact rather than a claim: a body added to the
 * catalogue moves one of the three counts, and a threshold nudged moves all of
 * them. What matters is the third — the eight tall bodies, where a swell
 * written along x used to travel across the body instead of along it. The
 * three converted in `drafts/tower-defence.ts` moved the first two and left
 * that one alone, which is the useful thing this test says about them: a rim
 * of repeated features does not change which way round a body is.
 */

/** By name out of the registry, which is the only list of what exists. */
function motion(name: string) {
  const m = MOTIONS.find((x) => x.name === name);
  if (!m) throw new Error(`no motion named ${name}`);
  return m;
}
const PERISTALSIS = motion("PERISTALSIS");
const SWELL = motion("SWELL");

const axes = CATALOGUE.map((e) => ({
  name: e.subject.name,
  long: longAxisOf(extentOf(e.subject)),
}));

describe("the catalogue's long axes", () => {
  it("splits sixty-four bodies into wide, round and tall", () => {
    const count = (a: "x" | "y" | null) => axes.filter((e) => e.long === a).length;
    expect(axes.length).toBe(64);
    expect(count("x")).toBe(26);
    expect(count(null)).toBe(30);
    expect(count("y")).toBe(8);
  });

  it("names the eight tall ones", () => {
    expect(
      axes
        .filter((e) => e.long === "y")
        .map((e) => e.name)
        .sort(),
    ).toEqual([
      "HUSK 1",
      "HUSK 2",
      "POD",
      "RIBBON",
      "TENDRIL",
      "THE CLAW",
      "THE NEEDLE",
      "THE SPLICE",
    ]);
  });
});

describe("a swell written along the body", () => {
  /**
   * PERISTALSIS moves the centroid along the body and widens it across. On a
   * wide body that is `dx` and `sy`, as written; on a tall one the whole
   * gesture turns, so the travel is `dy` and the widening `sx`.
   */
  const SAMPLES = Array.from({ length: 64 }, (_, i) => i * 0.05);

  it("travels along x on a wide body and along y on a tall one", () => {
    const wide = SAMPLES.map((t) => poseAtSecond(PERISTALSIS, t, "x"));
    const tall = SAMPLES.map((t) => poseAtSecond(PERISTALSIS, t, "y"));
    const span = (ps: { dx: number; dy: number }[], k: "dx" | "dy") =>
      Math.max(...ps.map((p) => Math.abs(p[k])));
    expect(span(wide, "dx")).toBeGreaterThan(0.05);
    expect(span(wide, "dy")).toBe(0);
    expect(span(tall, "dy")).toBeGreaterThan(0.05);
    expect(span(tall, "dx")).toBe(0);
  });

  it("widens across the body either way round", () => {
    const wide = SAMPLES.map((t) => poseAtSecond(PERISTALSIS, t, "x"));
    const tall = SAMPLES.map((t) => poseAtSecond(PERISTALSIS, t, "y"));
    // Length held at exactly 1 on the axis the bulge runs along, both ways.
    expect(Math.max(...wide.map((p) => Math.abs(p.sx - 1)))).toBe(0);
    expect(Math.max(...tall.map((p) => Math.abs(p.sy - 1)))).toBe(0);
    expect(Math.max(...wide.map((p) => p.sy))).toBeGreaterThan(1);
    expect(Math.max(...tall.map((p) => p.sx))).toBeGreaterThan(1);
  });

  it("leaves a round body as the motion was written", () => {
    for (const t of SAMPLES) {
      expect(poseAtSecond(PERISTALSIS, t, null)).toEqual(poseAtSecond(PERISTALSIS, t, "x"));
    }
  });

  it("does not turn a motion that never claimed an axis", () => {
    for (const t of SAMPLES) {
      expect(poseAtSecond(SWELL, t, "y")).toEqual(poseAtSecond(SWELL, t, "x"));
    }
  });
});
