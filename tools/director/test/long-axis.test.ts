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
 * nine converted in `drafts/tower-defence.ts` moved the first two and left
 * that one alone, which is the useful thing this test says about them: a rim
 * of repeated features does not change which way round a body is, and the one
 * that is wide — THE CANOPY — is wide because it is a barrier over the hull
 * rather than a body at all.
 *
 * The five in `drafts/armoured.ts` say it a fourth time and from the one angle
 * that could have broken it, because two of them change shape rather than
 * merely breathe. THE SLATER is an elongated chain for most of its cycle and a
 * disc for the rest, and THE CASE splits in two; a body whose extent is the
 * union of two different shapes could easily have come out tall. Not one of
 * the five did. `extentOf` takes that union over six moments, so a body long
 * in one state and round in another is measured by its long state — closing is
 * not a thing that turns a body, it only makes it rounder than it was, and the
 * round count is where that lands.
 *
 * The fourteen grown out of `src/parts/` say the same thing from the other
 * side, and it is worth reading before adding more of them: only two are tall,
 * and both are tall because their *base* is — LANTERN at 28 by 34 and SPINDLE
 * at 22 by 40. Not one of the other twelve was turned by what it is wearing,
 * however far it reaches. Parts change what a body looks like; they do not
 * change which way round it is, so a recipe that wants a tall body has to say
 * so in `rx` and `ry` rather than by hanging something off the top of it.
 *
 * The eight that swim say it a third time and more sharply. Every one of them
 * hangs something under itself and six carry streamers between one and two
 * body-lengths long — and exactly one comes out tall, COMB, which is tall in
 * the base and would have been tall carrying nothing. The reason is that a
 * trail is *spread* as well as long: fanned across two and a half radians from
 * the underside, the outermost threads reach sideways about as far as the
 * innermost reach down. THIMBLE is the one to watch here — it was tall until
 * its fringe was widened to stop the threads merging, and a body that changes
 * which way round it is when a part is retuned is a body no motion should be
 * written along. So "it has long tentacles" predicts nothing about a long
 * axis, and a motion written along one will run across a jellyfish rather than
 * down it.
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
  it("splits ninety-nine bodies into wide, round and tall", () => {
    const count = (a: "x" | "y" | null) => axes.filter((e) => e.long === a).length;
    expect(axes.length).toBe(99);
    expect(count("x")).toBe(38);
    expect(count(null)).toBe(50);
    expect(count("y")).toBe(11);
  });

  it("names the eleven tall ones", () => {
    expect(
      axes
        .filter((e) => e.long === "y")
        .map((e) => e.name)
        .sort(),
    ).toEqual([
      "COMB",
      "HUSK 1",
      "HUSK 2",
      "LANTERN",
      "POD",
      "RIBBON",
      "SPINDLE",
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
