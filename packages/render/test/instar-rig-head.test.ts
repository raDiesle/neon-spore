import { describe, expect, it } from "bun:test";
import {
  FRONT,
  facet,
  hang,
  hangRings,
  poseOf,
  type Ring,
  SIDE,
  see,
  seeTube,
  tubeFrames,
  view,
} from "@neon-spore/content";
import { frontEyeAt, frontLipsAt } from "../src/instar-head.js";
import {
  eyePin,
  headParts,
  jawAnchor,
  onSkull,
  SKULL,
  upperAnchor,
} from "../src/instar-rig-head.js";
import type { TubePart } from "../src/solid-rig.js";

/**
 * THE INSTAR's rig head meets the shipped face-on head where the owner's
 * thumbs already are — the eyes and the two lips, within 2 px on a 390-wide
 * field — and turned to the side it is a dragon's head in profile: one eye
 * showing, a muzzle no longer than the skull is deep, the horns swept back.
 */

/** A head radius on a 390-wide field: the poses' 200 thousandths. */
const R = 78;
const TOL = 2;
const POSES = [0, 0.5, 1].flatMap((up) =>
  [0, 0.5, 1].map((down) => ({ jawUp: up, jawDown: down })),
);
const ORIGIN = { x: 0, y: 0 };

const tubes = (f: { jawUp: number; jawDown: number }) =>
  headParts(f, R).filter((p): p is TubePart => p.kind === "tube");
/** The tubes in `headParts`' order: four horns, the muzzle, two fangs, two mandibles, two fangs. */
const HORNS = [0, 1, 2, 3];
const MUZZLE = 4;
const MANDIBLES = [7, 8];

/** The highest (`top`) or lowest point, face-on at the middle, of the discs a tube's rings project to. */
function atMiddle(rings: readonly Ring[], edge: "top" | "bottom"): number | undefined {
  const seen = seeTube(rings, tubeFrames(rings), view(FRONT));
  let best: number | undefined;
  for (let i = 0; i < seen.length - 1; i++)
    for (let k = 0; k <= 20; k++) {
      const u = k / 20;
      const a = seen[i];
      const b = seen[i + 1];
      if (!a || !b) continue;
      const x = a.c.x + (b.c.x - a.c.x) * u;
      const r = a.r + (b.r - a.r) * u;
      if (Math.abs(x) >= r) continue;
      const h = Math.sqrt(r * r - x * x);
      const y = a.c.y + (b.c.y - a.c.y) * u;
      const v = edge === "top" ? y - h : y + h;
      if (best === undefined || (edge === "top" ? v < best : v > best)) best = v;
    }
  return best;
}

describe("THE INSTAR's rig head face-on", () => {
  it("puts each eye where the shipped head draws it", () => {
    for (const f of POSES)
      for (const s of [-1, 1] as const) {
        const e = eyePin(s);
        const at = onSkull(e.lon, e.lat);
        const c = hang(poseOf(upperAnchor(f, R)), { x: at.x * R, y: at.y * R, z: at.z * R });
        const seen = see(c, view(FRONT));
        const want = frontEyeAt(f, ORIGIN, R, s);
        expect(Math.abs(seen.x - want.x)).toBeLessThanOrEqual(TOL);
        expect(Math.abs(seen.y - want.y)).toBeLessThanOrEqual(TOL);
      }
  });

  it("puts the upper lip under the muzzle and the lower on the jaw's top", () => {
    for (const f of POSES) {
      const lips = frontLipsAt(f, ORIGIN, R);
      const upper = poseOf(upperAnchor(f, R));
      const jaw = poseOf(jawAnchor(f, R));
      const muzzle = tubes(f)[MUZZLE];
      const mandibles = MANDIBLES.flatMap((i) => tubes(f)[i] ?? []);
      expect(muzzle).toBeDefined();
      expect(mandibles.length).toBe(2);
      const under = atMiddle(hangRings(upper, muzzle?.rings ?? []), "bottom");
      const tops = mandibles.map((m) => atMiddle(hangRings(jaw, m.rings), "top") ?? Infinity);
      expect(Math.abs((under ?? Infinity) - lips.up.y)).toBeLessThanOrEqual(TOL);
      expect(Math.abs(Math.min(...tops) - lips.down.y)).toBeLessThanOrEqual(TOL);
    }
  });
});

describe("THE INSTAR's rig head side-on", () => {
  it("shows one eye, whole, and has turned the other round the back", () => {
    const near = ([-1, 1] as const).map((s) => facet(eyePin(s).pin, SIDE - FRONT));
    expect(near.filter((fc) => fc.near).length).toBe(1);
    expect(Math.max(...near.map((fc) => (fc.near ? fc.sx : 0)))).toBeGreaterThan(0.5);
  });

  it("has a blunt muzzle, no longer than the skull is deep", () => {
    const muzzle = tubes({ jawUp: 0, jawDown: 0 })[MUZZLE];
    const rings = muzzle?.rings ?? [];
    const back = rings[0] as Ring;
    const front = rings[rings.length - 1] as Ring;
    expect(back.c.x - front.c.x).toBeLessThanOrEqual(2 * SKULL.r * R);
    expect(front.r / back.r).toBeGreaterThan(0.6);
  });

  it("sweeps every horn back and up from its root", () => {
    const horns = HORNS.flatMap((i) => tubes({ jawUp: 0, jawDown: 0 })[i] ?? []);
    expect(horns.length).toBe(4);
    for (const h of horns) {
      const base = (h.rings[0] as Ring).c;
      const tip = (h.rings[h.rings.length - 1] as Ring).c;
      expect(tip.x).toBeGreaterThan(base.x);
      expect(tip.y).toBeLessThan(base.y);
    }
  });
});
