import { BALLOON } from "./balloon-shape.js";
import { openSmoothPath, type Point } from "./shapes.js";

/**
 * **What is alive inside THE BALLOON**, and hanging under it: veins, a ring of
 * lit beads, and the threads it drags up the field behind itself.
 *
 * The owner asked for this body to read as more alien, and the three pieces
 * are not invented here — they are named parts the shape sheet already
 * carries, written into this creature's own coordinates: VEIN ("a bright line
 * running *into* the body and forking; pulses along its length"), NODE-RING
 * ("three beads on one orbit; the gap between them travels round the body")
 * and TRAIL ("five threads from one point, all dragging, none of them in
 * step"). `tools/shape-sheet/src/parts/` is where each of those is authored
 * against a blob; a balloon is not a blob — its two half-widths move
 * independently under two hands — so the recipes cannot be run against it and
 * the forms are spelled out here instead, in the same box `balloon-shape.ts`
 * draws the skin in.
 *
 * **Its own file rather than more of `balloon-shape.ts`.** That file is what a
 * balloon *is* — one closed contour and a knot — and this is what is stuck to
 * it. The seam is `lid-shape.ts`' and the reason is the one every split here
 * gives: a reader changing how far a thread drags has no business scrolling
 * past the outline the hands stretch.
 *
 * Everything is centred on the origin, in the same units the skin is, and
 * every figure is a share of the body's own half-height — so a balloon that
 * swells, splits or is pulled carries its own parts with it and nothing here
 * needs telling what size it is.
 */
export const BALLOON_PARTS = {
  /** VEIN, three times. Odd, so one runs up the middle and the field reads as
   * a body rather than as a pattern. */
  veins: 3,
  /** How far below the centre a vein is rooted, and how far it climbs — both
   * shares of the half-height. It starts near the knot, which is where a thing
   * this shape would be filled from. */
  veinRoot: 0.74,
  veinRise: 1.28,
  /** Where up the rise the trunk stops and the two branches open, and how far
   * off its heading each one turns, in half-turns. */
  veinFork: 0.54,
  veinBranch: 0.16,
  /** How much of the body's own radius a vein is allowed to reach. A vein is
   * *under* the skin — the one part in `tools/shape-sheet/src/parts/` that
   * says `under: true` — so a point past this is pulled back in rather than
   * drawn as a spine sticking out of a balloon. */
  veinHold: 0.82,
  /** NODE-RING: three beads, the orbit they hold as a share of the body's own
   * half-width and half-height, and how big one is. Just clear of the rim —
   * they orbit without touching, and they must not reach the handles. */
  nodes: 3,
  nodeOrbit: 1.09,
  nodeR: 0.115,
  /** TRAIL: five threads off the knot, how far the longest drags as a share of
   * the half-height, and how far one wanders sideways doing it. */
  threads: 5,
  threadLen: 1.15,
  threadWave: 0.17,
} as const;

/**
 * A point pulled back inside the skin, if it had left it.
 *
 * The body is an ellipse with a different half-width each side, so "inside" is
 * the point's own distance in those units — and a vein that reached past it is
 * scaled back along the line from the centre rather than clipped, which keeps
 * the line smooth where a clip would put a corner on it.
 */
function held(x: number, y: number, rxLeft: number, rxRight: number, ry: number): Point {
  const rx = x >= 0 ? rxRight : rxLeft;
  const d = Math.hypot(x / Math.max(1e-6, rx), y / Math.max(1e-6, ry));
  const keep = BALLOON_PARTS.veinHold;
  if (d <= keep) return { x, y };
  const k = keep / d;
  return { x: x * k, y: y * k };
}

/** Where the knot's point is — the one place the threads hang from, and the
 * same figure `balloonKnot` builds the tie down to. */
function knotTip(ry: number): number {
  return ry * (0.92 + BALLOON.knotDeep);
}

/**
 * The veins, as one path with a subpath per line: three trunks rooted low in
 * the body, each forking once near the top.
 *
 * One path rather than nine, and that is a frame-cost decision rather than a
 * tidiness one: `strokeGlow` draws whatever it is handed four times over, so
 * nine polylines would be thirty-six strokes for one body and a wave puts six
 * of these up at once.
 *
 * The lateral wander is scaled by how far up the trunk it is, so every vein is
 * still rooted where it was drawn last frame — a line that squirmed at both
 * ends would read as a fault rather than as something pulsing.
 */
export function balloonVeinPath(
  rxLeft: number,
  rxRight: number,
  ry: number,
  t: number,
  seed: number,
): string {
  const P = BALLOON_PARTS;
  let d = "";
  for (let i = 0; i < P.veins; i++) {
    // -0.5 .. 0.5 across the body, so the middle vein is at nought and the
    // outer two lean towards the side they are on.
    const bias = P.veins < 2 ? 0 : i / (P.veins - 1) - 0.5;
    const rx = bias >= 0 ? rxRight : rxLeft;
    const phase = t * 0.7 + seed * 1.3 + i * 2.1;
    const trunk: Point[] = [];
    const steps = 6;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      trunk.push(
        held(
          // Splayed, so three lines out of one knot read as a system of
          // capillaries rather than as three strings hung inside a balloon.
          bias * rx * (0.2 + 0.95 * u) + Math.sin(phase + u * 3.4) * rx * 0.14 * u,
          ry * P.veinRoot - ry * P.veinRise * P.veinFork * u,
          rxLeft,
          rxRight,
          ry,
        ),
      );
    }
    d += `${openSmoothPath(trunk)} `;
    // The fork: two short branches off the point the trunk has reached, opened
    // either side of the heading it arrived on. Taken from the last two points
    // rather than from the bias, so a branch always continues its own trunk —
    // and every point of one is held inside the skin, because a vein that left
    // the body would read as a spine rather than as something under it.
    const tip = trunk[steps] as Point;
    const before = trunk[steps - 1] as Point;
    const heading = Math.atan2(tip.y - before.y, tip.x - before.x);
    const len = ry * P.veinRise * (1 - P.veinFork);
    for (const turn of [-1, 1] as const) {
      const a = heading + turn * P.veinBranch * Math.PI;
      d += `${openSmoothPath(
        // From the tip itself: a branch that started part of the way along it
        // drew as a dash floating free of the vein it belongs to.
        [0, 0.4, 0.75, 1].map((u) =>
          held(tip.x + Math.cos(a) * len * u, tip.y + Math.sin(a) * len * u, rxLeft, rxRight, ry),
        ),
      )} `;
    }
  }
  return d.trim();
}

/** One bead of the ring: where it is standing and how lit it is this instant,
 * 0..1. The gap between the three travels round the body because the whole
 * ring turns; each one brightens on its own count, which is what stops three
 * identical beads reading as one machine. */
export interface BalloonNode {
  x: number;
  y: number;
  r: number;
  lit: number;
}

/** The ring of beads, in body coordinates. An ellipse rather than a circle,
 * and it is the body's *own* two half-widths — so a bead on the side a hand is
 * stretching swings out with the skin instead of sinking into it. */
export function balloonNodes(
  rxLeft: number,
  rxRight: number,
  ry: number,
  t: number,
  seed: number,
): BalloonNode[] {
  const P = BALLOON_PARTS;
  const out: BalloonNode[] = [];
  for (let i = 0; i < P.nodes; i++) {
    const a = t * 0.35 + seed * 0.8 + (i * Math.PI * 2) / P.nodes;
    const side = Math.sin(a);
    out.push({
      x: (side >= 0 ? rxRight : rxLeft) * P.nodeOrbit * side,
      y: -ry * P.nodeOrbit * Math.cos(a),
      r: ry * P.nodeR,
      lit: 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 2.3 + seed)),
    });
  }
  return out;
}

/**
 * The threads, as one path with a subpath each: five of them off the knot,
 * hanging *below* the body because this is the one creature in the game that
 * climbs — what trails behind a thing going up is under it.
 *
 * Five lengths and five phases, none of them in step. They are derived from
 * the index rather than drawn from anything: two balloons on one field must
 * differ by their `seed`, and two devices drawing the same balloon must not
 * differ at all.
 */
export function balloonThreadPath(ry: number, t: number, seed: number): string {
  const P = BALLOON_PARTS;
  const top = knotTip(ry);
  let d = "";
  for (let i = 0; i < P.threads; i++) {
    const spread = P.threads < 2 ? 0 : i / (P.threads - 1) - 0.5;
    const phase = t * 1.1 + seed * 0.9 + i * 1.7;
    const len = ry * P.threadLen * (0.62 + 0.38 * (((i * 5) % 7) / 6));
    const pts: Point[] = [];
    const steps = 8;
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      pts.push({
        x: spread * ry * 0.44 + Math.sin(phase + u * 4.2) * ry * P.threadWave * u,
        y: top + len * u,
      });
    }
    d += `${openSmoothPath(pts)} `;
  }
  return d.trim();
}
