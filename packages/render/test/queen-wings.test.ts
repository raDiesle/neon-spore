import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { crystalPath, QUEEN_SHELL } from "@neon-spore/content";
import { craneJoints, craneWrist } from "../src/queen-crane.js";
import { armour, QUEEN_LOOK } from "../src/queen-look.js";
import { queenShellParts, queenShellPath } from "../src/queen-shell.js";
import { installPixelGlobals } from "./pixel-harness.js";

/**
 * **THE BULB QUEEN's wings split out draw the same shell**
 * (`docs/spec/living-bosses.md`, the part map). Her contour as it was before
 * the split — `crystalPath` walked whole — is kept here as the *before*, and
 * the shell laid from `queenShellParts` is painted beside it with her own
 * look, whole and nearly gone, at rest and wobbling, and held equal within
 * 1 in 255.
 */

installPixelGlobals();
const SIZE = 260;
const RX = 100;
const RY = 52;

function before(t: number): Path2D {
  const s = QUEEN_SHELL;
  return new Path2D(crystalPath(0, 0, RX, RY, s.sides, s.depth, s.wobble, t, s.seed));
}

function paint(
  path: Path2D,
  look: typeof armour,
  t: number,
  healthShare: number,
): Uint8ClampedArray {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.translate(SIZE / 2, SIZE / 2);
  look({ ctx, path, rx: RX, ry: RY, t, time: t * 0.7, healthShare });
  return ctx.getImageData(0, 0, SIZE, SIZE).data;
}

const CASES = [
  { t: 0, healthShare: 1 },
  { t: 1.7, healthShare: 1 },
  { t: 4.2, healthShare: 0.5 },
  { t: 9.9, healthShare: 0.1 },
];

describe("THE BULB QUEEN's wings, split out", () => {
  for (const [name, look] of [
    ["her look", QUEEN_LOOK.shell],
    ["the old armour", armour],
  ] as const)
    for (const c of CASES)
      it(`draws the same shell in ${name} at ${c.t}, ${c.healthShare} of her left`, () => {
        const a = paint(before(c.t), look, c.t, c.healthShare);
        const b = paint(queenShellPath(queenShellParts(RX, RY, c.t)), look, c.t, c.healthShare);
        let worst = 0;
        for (let i = 0; i < a.length; i++)
          worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
        expect(worst).toBeLessThanOrEqual(1);
      });

  it("hangs each wing from a joint on its own side, inside its tips", () => {
    const parts = queenShellParts(RX, RY, 2.3);
    const all = [parts.right.points, parts.under, parts.left.points, parts.over].flat();
    expect(all.length).toBe(QUEEN_SHELL.sides);
    for (const w of [parts.right, parts.left]) {
      expect(Math.sign(w.joint.x)).toBe(w.side);
      const reach = Math.max(...w.points.map((p) => Math.abs(p.x)));
      expect(Math.abs(w.joint.x)).toBeLessThan(reach);
    }
  });

  it("gives each crane arm a shoulder, an elbow and the wrist its claw hangs from", () => {
    for (const side of [-1, 1] as const) {
      const j = craneJoints(40, 200, 100, side, 200 + side * 70, 150, 16, 0.4);
      expect(j.wrist).toEqual(craneWrist(200 + side * 70, 150, 16));
      expect(Math.sign(j.shoulder.x - 200)).toBe(side);
      expect(j.elbow.y).toBeLessThan(j.wrist.y);
    }
  });
});
