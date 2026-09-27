import { describe, expect, test } from "bun:test";
import { DEG, idleDrift } from "../src/idle-drift.js";
import {
  FALLOFF,
  GLANCE,
  glance,
  PART_ROWS,
  type PartAngles,
  type PartRow,
  partDrift,
  partOwn,
  partSeed,
} from "../src/idle-drift-parts.js";
import { correlation, FPS, maxAbs, maxSpeed, sample } from "./drift-stats.js";

/**
 * The part drift (`docs/spec/living-bosses.md` §1, "Every part moves on its
 * own"): each row in its range, no part faster than 20° a second on its own
 * or 30° with everything it hangs on, children late, parts out of step with
 * one another, the eyes together, and `life` 0 the parent exactly.
 */

const BOSS = 42;
const ANGLES = ["turn", "tilt", "rotate"] as const;

/** The body as the parts hang on it: the head's turn on top of the body's yaw for a head, the body's for the rest. */
const body = (t: number): PartAngles => {
  const d = idleDrift(t, BOSS);
  return { turn: d.yaw, tilt: d.pitch, rotate: d.roll };
};
const headRoot = (t: number): PartAngles => {
  const d = idleDrift(t, BOSS);
  return { turn: d.yaw + d.headYaw, tilt: d.pitch, rotate: d.roll };
};

/** A part hung on `parent`, as a function of time the next child can hang on. */
const on =
  (part: PartRow, index: number, parent: (t: number) => PartAngles, link = 0, links = 1) =>
  (t: number) =>
    partDrift(t, partSeed(BOSS, index), part, parent, 1, { link, links });

const head = on("head", 0, headRoot);
const jaw = on("jaw", 1, head);
const arm = on("arm", 2, body);
const hand = on("hand", 3, arm);
const finger = on("finger", 4, hand);
const wing = on("wing", 5, body);
const lobe = on("lobe", 6, body);
const neck0 = on("neck", 7, body, 0, 2);
const neck1 = on("neck", 8, neck0, 1, 2);
const tail0 = on("tail", 10, body, 0, 3);
const tail1 = on("tail", 11, tail0, 1, 3);
const tail2 = on("tail", 12, tail1, 2, 3);
const horn0 = on("horn", 13, head, 0, 2);
const horn1 = on("horn", 14, horn0, 1, 2);

/** Every part of the test boss, with what it hangs on and where it sits in its chain. */
const PARTS: readonly {
  part: PartRow;
  at: (t: number) => PartAngles;
  parent: (t: number) => PartAngles;
  link: number;
  links: number;
}[] = [
  { part: "head", at: head, parent: headRoot, link: 0, links: 1 },
  { part: "jaw", at: jaw, parent: head, link: 0, links: 1 },
  { part: "arm", at: arm, parent: body, link: 0, links: 1 },
  { part: "hand", at: hand, parent: arm, link: 0, links: 1 },
  { part: "finger", at: finger, parent: hand, link: 0, links: 1 },
  { part: "wing", at: wing, parent: body, link: 0, links: 1 },
  { part: "lobe", at: lobe, parent: body, link: 0, links: 1 },
  { part: "neck", at: neck1, parent: neck0, link: 1, links: 2 },
  { part: "tail", at: tail0, parent: body, link: 0, links: 3 },
  { part: "tail", at: tail2, parent: tail1, link: 2, links: 3 },
  { part: "horn", at: horn1, parent: horn0, link: 1, links: 2 },
];

/** A part's own motion about its joint: what it does beyond following its parent late. */
const ownOf = (p: (typeof PARTS)[number], k: (typeof ANGLES)[number]) =>
  sample((t) => p.at(t)[k] - FALLOFF * p.parent(t - PART_ROWS[p.part].lag)[k]);

describe("partDrift", () => {
  test("every part row stays in its range", () => {
    for (const p of PARTS) {
      const row = PART_ROWS[p.part];
      const tip = p.links > 1 ? p.link / (p.links - 1) : 0;
      const turn = row.turn[0] + (row.turn[1] - row.turn[0]) * tip;
      expect(maxAbs(ownOf(p, "turn")) / DEG).toBeLessThanOrEqual(turn + 1e-9);
      expect(maxAbs(ownOf(p, "rotate")) / DEG).toBeLessThanOrEqual(row.rotate[0] + 1e-9);
      const tilt = ownOf(p, "tilt").map((x) => x / DEG - (row.tiltBias ?? 0));
      expect(maxAbs(tilt)).toBeLessThanOrEqual(row.tilt[0] + 1e-9);
    }
    // The jaw opens from shut and never past it.
    const open = ownOf(PARTS[1] as (typeof PARTS)[number], "tilt");
    expect(Math.min(...open)).toBeGreaterThanOrEqual(0);
  });

  test("no part is faster than 20° a second on its own, or 30° with its parents", () => {
    for (const p of PARTS) {
      for (const k of ANGLES) {
        expect(maxSpeed(ownOf(p, k))).toBeLessThanOrEqual(20);
        expect(maxSpeed(sample((t) => p.at(t)[k]))).toBeLessThanOrEqual(30);
      }
    }
  });

  test("a child lags its parent", () => {
    for (const [child, parent, lag] of [
      [hand, arm, PART_ROWS.hand.lag],
      [tail2, tail1, PART_ROWS.tail.lag],
    ] as const) {
      const c = sample((t) => child(t).turn);
      const behind = sample((t) => parent(t - lag).turn);
      const ahead = sample((t) => parent(t + lag).turn);
      expect(correlation(c, behind)).toBeGreaterThan(correlation(c, ahead));
    }
  });

  test("parts are out of step: under 0.3 apart, under 0.5 for the two of a pair", () => {
    const own = (part: PartRow, index: number) =>
      sample((t) => partOwn(t, partSeed(BOSS, index), part).turn);
    expect(Math.abs(correlation(own("head", 0), own("arm", 2)))).toBeLessThan(0.3);
    expect(Math.abs(correlation(own("wing", 5), own("tail", 10)))).toBeLessThan(0.3);
    expect(Math.abs(correlation(own("hand", 3), own("horn", 13)))).toBeLessThan(0.3);
    // Left and right: the same row, the next index.
    expect(Math.abs(correlation(own("hand", 3), own("hand", 20)))).toBeLessThan(0.5);
    expect(Math.abs(correlation(own("wing", 5), own("wing", 21)))).toBeLessThan(0.5);
  });

  test("life 0 gives exactly the parent's angles", () => {
    for (const t of [0, 3.3, 250.1]) {
      expect(partDrift(t, partSeed(BOSS, 3), "hand", arm, 1, { life: 0 })).toEqual(arm(t));
    }
  });

  test("the same time and seed give the same angles", () => {
    expect(finger(123.4)).toEqual(finger(123.4));
  });
});

describe("glance", () => {
  test("the two eyes move together, within reach, ahead of the head", () => {
    // Both eyes ask with the boss's seed, so they cannot part.
    for (const t of [0, 9.9, 311]) expect(glance(t, BOSS)).toEqual(glance(t, BOSS));
    const at = sample((t) => glance(t, BOSS).x);
    const len = sample((t) => Math.hypot(glance(t, BOSS).x, glance(t, BOSS).y));
    expect(Math.max(...len)).toBeLessThanOrEqual(GLANCE.reach + 1e-9);
    const yaw = (d: number) => sample((t) => idleDrift(t + d, BOSS).headYaw);
    expect(correlation(at, yaw(GLANCE.lead))).toBeGreaterThan(correlation(at, yaw(-GLANCE.lead)));
  });

  test("it holds: most frames the pupils are still", () => {
    const x = sample((t) => glance(t, BOSS).x);
    let still = 0;
    for (let i = 1; i < x.length; i++) if (x[i] === x[i - 1]) still++;
    expect(still / x.length).toBeGreaterThan(0.5);
    expect(FPS).toBe(60);
  });
});
