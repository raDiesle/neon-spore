import { describe, expect, it, setDefaultTimeout } from "bun:test";
import { INSTAR_SCRIPT } from "@neon-spore/content";
import { INSTAR_BODY } from "../src/instar-body-look.js";
import { instarHeadAt, type Point } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { BEATEN, ENTER, POSES, placed } from "../src/instar-poses.js";
import { profileLines } from "../src/instar-profile.js";
import type { Figure } from "../src/instar-shape.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE INSTAR's body with weight keeps its nests on its back**
 * (`instar-body-look.ts`, `docs/spec/living-bosses.md` §2). The dragon's
 * deep chest and haunches seat the spine deeper under each nest; this holds
 * every pose the script names, the entrance and the beaten sag, with each nest
 * stood where its marks put it, at times across the breath and the swim — the
 * nest within `ON` head radii of the back's edge, or on the head itself. And
 * the tail thins root to tip.
 */

const L = computeLayout(VIEWPORT, CFG, "test");
const ON = 0.3;
const TIMES = [0, 0.7, 1.9, 3.3];

/** Every figure the profile is drawn for: side-on at all (`instar-draw.ts`). */
const figures = (
  [
    ...Object.entries(POSES),
    ["enter", ENTER],
    ["beaten", BEATEN],
    ...INSTAR_SCRIPT.map((s, i): [string, Figure] => [
      `step ${i} ${s.pose}`,
      placed(s.pose, s.marks),
    ]),
  ] as [string, Figure][]
).filter(([, f]) => f.side > 0.01);

function lookOf(f: Figure, time: number): Look {
  const { head, r } = instarHeadAt(L, f);
  return {
    f,
    head,
    r,
    time,
    fade: 1,
    hurt: 0,
    threat: 0,
    fire: 0,
    harden: 0,
    shoveUp: 0,
    shoveDown: 0,
  };
}

/** How far `p` is from the polyline `line`. */
function off(p: Point, line: readonly Point[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1] as Point;
    const b = line[i] as Point;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(
      0,
      Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)),
    );
    best = Math.min(best, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return best;
}

/** The worst nest's distance from the back, in head radii, over every figure and time. */
function worst(): { at: string; by: number } {
  let most = { at: "", by: 0 };
  for (const [name, f] of figures)
    for (const time of TIMES) {
      const look = lookOf(f, time);
      const { top, near, far } = profileLines(L, look);
      for (const nest of [near, far]) {
        // The beaten sag carries the near nest forward onto the shoulder, where the head is the back.
        const onHead = Math.hypot(nest.x - look.head.x, nest.y - look.head.y) <= look.r;
        const by = onHead ? 0 : off(nest, top) / look.r;
        if (by > most.by) most = { at: `${name} at ${time}s`, by };
      }
    }
  return most;
}

describe("THE INSTAR's body", () => {
  it("keeps both nests on its back", () => {
    const { at, by } = worst();
    expect(by, at).toBeLessThanOrEqual(ON);
  });

  it("thins its tail monotonically, from the rear's own width to the blade", () => {
    let was = Number.POSITIVE_INFINITY;
    for (let i = 0; i <= 40; i++) {
      const w = INSTAR_BODY.tail(i / 40);
      expect(w, `u ${i / 40}`).toBeLessThan(was);
      was = w;
    }
    // The root as wide as the rear it goes on from, so the two read as one body.
    expect(Math.abs(INSTAR_BODY.tail(0) - INSTAR_BODY.girth(1))).toBeLessThan(0.05);
    // A fine blade at the end, finer since the dragon's line of 2 October 2026.
    expect(INSTAR_BODY.tail(1)).toBeCloseTo(0.05);
  });
});
