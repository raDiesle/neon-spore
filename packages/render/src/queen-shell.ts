import { crystalRadiusMul, type Point, QUEEN_SHELL } from "@neon-spore/content";

/**
 * **THE BULB QUEEN's shell in pieces**: her two wings, each the run of the
 * crystal's vertices within an eighth-turn of her long axis, with the joint
 * it meets the shell at, and the back between them, under and over
 * (`docs/spec/living-bosses.md`, the part map).
 *
 * **Pieces of the one contour, not shapes of their own.** Her look fills,
 * clips to and strokes the contour once (`queen-look.ts`), so a wing filled
 * apart would draw a seam where it meets the back and light the two halves
 * of a scute on two ramps. `queenShellPath` lays the four runs round the
 * ring as one polygon — `crystalPath`'s vertices, in its order, from the
 * same first vertex — so a later lane can swing a wing by moving its run
 * about its joint before it is laid.
 */

export interface QueenWing {
  /** -1 for her left wing, 1 for her right. */
  side: -1 | 1;
  /** The middle of the chord across the wing's root, where it meets the back. */
  joint: Point;
  /** Its vertices, root to root, the way round the ring runs. */
  points: Point[];
}

export interface QueenShellParts {
  right: QueenWing;
  /** The back under her, from the right wing round to the left. */
  under: Point[];
  left: QueenWing;
  /** The back over her, from the left wing round to the right. */
  over: Point[];
}

/** The ring's vertex `i`, as `crystalPath` places it about the origin. */
function vertex(i: number, rx: number, ry: number, t: number): Point {
  const s = QUEEN_SHELL;
  const a = (i / s.sides) * Math.PI * 2;
  const m = crystalRadiusMul(a, s.sides, s.depth, s.wobble, t, s.seed);
  return { x: Math.cos(a) * rx * m, y: Math.sin(a) * ry * m };
}

function wing(side: -1 | 1, points: Point[]): QueenWing {
  const a = points[0] ?? { x: 0, y: 0 };
  const b = points[points.length - 1] ?? a;
  return { side, joint: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, points };
}

/** Her shell's four pieces, half-extents `rx`,`ry`, walked at the wobble clock `t`. */
export function queenShellParts(rx: number, ry: number, t: number): QueenShellParts {
  const n = QUEEN_SHELL.sides;
  const eighth = n / 8;
  const run = (from: number, to: number): Point[] => {
    const out: Point[] = [];
    for (let i = from; i <= to; i++) out.push(vertex(((i % n) + n) % n, rx, ry, t));
    return out;
  };
  const half = n / 2;
  return {
    right: wing(1, run(-eighth, eighth)),
    under: run(eighth + 1, half - eighth - 1),
    left: wing(-1, run(half - eighth, half + eighth)),
    over: run(half + eighth + 1, n - eighth - 1),
  };
}

/**
 * The four pieces laid as one closed polygon, written as `crystalPath` writes
 * one. **Begun at the vertex on her long axis**, halfway into the right
 * wing, where `crystalPath` begins: a stroke draws its closing join where the
 * ring starts, and a ring begun at the wing's root put that join on another
 * corner (`packages/render/test/queen-wings.test.ts`).
 */
export function queenShellPath(parts: QueenShellParts): Path2D {
  const laid = [...parts.right.points, ...parts.under, ...parts.left.points, ...parts.over];
  const start = Math.floor(parts.right.points.length / 2);
  const ring = [...laid.slice(start), ...laid.slice(0, start)];
  let d = "";
  ring.forEach((p, i) => {
    d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)} `;
  });
  return new Path2D(`${d}Z`);
}
