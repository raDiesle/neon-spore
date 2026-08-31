import type { Point } from "@neon-spore/content";
import { band, disc, ribbon, spine } from "./geometry.js";
import type { PartDef } from "./types.js";

/**
 * ALIEN — the parts that are not biology.
 *
 * The catalogue already has one non-grown vocabulary: `crystalRadiusMul`, the
 * meteor's faceting, drawn corner to corner because a corner is the whole
 * difference between a rock and a body. These are that claim made as *parts* —
 * a crystal growing out of a soft body, a node holding station off it, a
 * fragment that is no longer touching it at all.
 *
 * They are worth a category of their own because they carry the one thing the
 * blob vocabulary cannot: a straight edge. A body with two shards on it reads
 * as infected at a size where nothing subtler survives.
 *
 * Nothing here is drawn *as light*. A glow is `tools/director/src/glows/` and
 * stacks on top of any card; a part that only existed as a bloom would be a
 * second answer to a question that page already answers. What these do instead
 * is give the light something with a shape to come off — which is why the
 * energy parts are thin solids and not blurs.
 */

const ROOT = 0.08;

/** A faceted spike: corner to corner, deliberately unsmoothed. */
function shard(len: number, wide: number, lean: number, skew = 0.35): Point[] {
  const co = Math.cos(lean);
  const si = Math.sin(lean);
  const pts: Point[] = [
    { x: -ROOT, y: -wide },
    { x: len * skew, y: -wide * 0.55 },
    { x: len, y: 0 },
    { x: len * skew * 0.9, y: wide * 0.72 },
    { x: -ROOT, y: wide * 0.8 },
  ];
  return pts.map((p) => ({ x: p.x * co - p.y * si, y: p.x * si + p.y * co }));
}

export const ALIENS: PartDef[] = [
  {
    id: "shard",
    label: "SHARD",
    category: "alien",
    hint: "one crystal out of a soft body; grows and retreats, never bends",
    build: (c) => [shard(0.7 * (1 + 0.09 * Math.sin(c.t * 0.9 + c.phase)), 0.16, 0.18)],
  },
  {
    id: "shard-cluster",
    label: "SHARD CLUSTER",
    category: "alien",
    hint: "three crystals at three angles; each extends on its own count",
    build: (c) =>
      [-0.55, 0.05, 0.6].map((lean, k) =>
        shard(
          (0.42 + k * 0.14) * (1 + 0.12 * Math.sin(c.t * (0.8 + k * 0.2) + c.phase + k)),
          0.11,
          lean,
        ),
      ),
  },
  {
    id: "prism",
    label: "PRISM",
    category: "alien",
    hint: "a flat geometric block laid against the rim; turns slowly, keeps its edges",
    build: (c) => {
      const a = 0.35 + 0.12 * Math.sin(c.t * 0.5 + c.phase);
      const co = Math.cos(a);
      const si = Math.sin(a);
      return [
        [
          { x: -0.05, y: -0.3 },
          { x: 0.42, y: -0.24 },
          { x: 0.5, y: 0.16 },
          { x: 0.06, y: 0.32 },
        ].map((p) => ({ x: p.x * co - p.y * si, y: p.x * si + p.y * co })),
      ];
    },
  },
  {
    id: "node",
    label: "NODE",
    category: "alien",
    hint: "a lit bead holding station off the rim; orbits without touching",
    build: (c) => {
      const a = c.t * 0.8 + c.phase;
      return [disc({ x: 0.44 + 0.07 * Math.cos(a), y: 0.16 * Math.sin(a), r: 0.11, n: 14 })];
    },
  },
  {
    id: "node-ring",
    label: "NODE RING",
    category: "alien",
    hint: "three beads on one orbit; the gap between them travels round the body",
    build: (c) =>
      [0, 1, 2].map((k) => {
        const a = c.t * 0.7 + c.phase + (k * Math.PI * 2) / 3;
        return disc({
          x: 0.34 + 0.2 * Math.cos(a),
          y: 0.34 * Math.sin(a),
          r: 0.075 + 0.015 * Math.cos(a),
          n: 12,
        });
      }),
  },
  {
    id: "vein",
    label: "VEIN",
    category: "alien",
    hint: "a bright line running *into* the body and forking; pulses along its length",
    under: true,
    build: (c) => {
      const loops: Point[][] = [];
      const pulse = 0.9 + 0.2 * Math.sin(c.t * 2.4 + c.phase);
      const trunk = spine({ len: -0.62, curl: 0.4, sway: 0.05, speed: 0.8, n: 8 }, c.t, c.phase);
      loops.push(ribbon(trunk, (u) => (0.045 - 0.03 * u) * pulse));
      const tip = trunk[trunk.length - 1] as Point;
      for (const turn of [-0.7, 0.75]) {
        const br = spine({ len: -0.3, curl: turn, sway: 0.04, n: 6 }, c.t, c.phase).map((p) => ({
          x: tip.x + p.x,
          y: tip.y + p.y,
        }));
        loops.push(ribbon(br, () => 0.028 * pulse));
      }
      return loops;
    },
  },
  {
    id: "arc",
    label: "ARC",
    category: "alien",
    hint: "a filament of energy standing clear of the body at both ends",
    build: (c) => {
      const open = 0.7 + 0.14 * Math.sin(c.t * 1.7 + c.phase);
      return [band(-0.5, 0, 0.86, 0.92, -open, open, 18)];
    },
  },
  {
    id: "plasma",
    label: "PLASMA",
    category: "alien",
    hint: "a wavering thread with a hot bead at the end; the thread never settles",
    build: (c) => {
      const sp = spine(
        { len: 1.15, curl: 0.2, sway: 0.75, waves: 2.6, speed: 3.4, n: 20 },
        c.t,
        c.phase,
      ).map((p) => ({ x: p.x - ROOT, y: p.y }));
      const tip = sp[sp.length - 1] as Point;
      return [
        ribbon(sp, (u) => 0.05 - 0.028 * u),
        disc({ x: tip.x, y: tip.y, r: 0.09 + 0.02 * Math.sin(c.t * 4 + c.phase), n: 12 }),
      ];
    },
  },
  {
    id: "fragment",
    label: "FRAGMENT",
    category: "alien",
    hint: "one chip of something, floating free; turns as it drifts",
    build: (c) => {
      const a = c.t * 0.4 + c.phase;
      const co = Math.cos(a);
      const si = Math.sin(a);
      const at = 0.42 + 0.06 * Math.sin(c.t * 0.6 + c.phase);
      return [
        [
          { x: -0.16, y: -0.1 },
          { x: 0.14, y: -0.16 },
          { x: 0.18, y: 0.12 },
          { x: -0.1, y: 0.16 },
        ].map((p) => ({ x: at + p.x * co - p.y * si, y: p.x * si + p.y * co })),
      ];
    },
  },
  {
    id: "debris",
    label: "DEBRIS",
    category: "alien",
    hint: "four chips spread out along the rim, each turning at its own rate",
    build: (c) =>
      [
        [0.3, -0.34, 0.075],
        [0.52, -0.05, 0.1],
        [0.36, 0.3, 0.085],
        [0.7, 0.24, 0.06],
      ].map(([x, y, r], k) => {
        const a = c.t * (0.3 + k * 0.17) + c.phase + k;
        const co = Math.cos(a);
        const si = Math.sin(a);
        return [
          { x: -1, y: -0.8 },
          { x: 1, y: -1 },
          { x: 0.9, y: 1 },
          { x: -0.9, y: 0.7 },
        ].map((p) => ({
          x: (x as number) + (p.x * co - p.y * si) * (r as number),
          y: (y as number) + (p.x * si + p.y * co) * (r as number),
        }));
      }),
  },
  {
    id: "ring-shard",
    label: "RING SHARD",
    category: "alien",
    hint: "a piece of a ring that is no longer round; slides along its own arc",
    build: (c) => {
      const slide = 0.3 * Math.sin(c.t * 0.5 + c.phase);
      return [band(-0.62, 0, 0.86, 1.02, -0.5 + slide, 0.5 + slide, 12)];
    },
  },
  {
    id: "lattice",
    label: "LATTICE",
    category: "alien",
    hint: "two bars crossing off the rim; asymmetric on purpose, reads as built",
    build: (c) => {
      const turn = 0.2 * Math.sin(c.t * 0.6 + c.phase);
      const bar = (len: number, wide: number, a: number): Point[] =>
        [
          { x: -0.1, y: -wide },
          { x: len, y: -wide },
          { x: len, y: wide },
          { x: -0.1, y: wide },
        ].map((p) => ({
          x: p.x * Math.cos(a) - p.y * Math.sin(a),
          y: p.x * Math.sin(a) + p.y * Math.cos(a),
        }));
      return [bar(0.72, 0.05, -0.35 + turn), bar(0.5, 0.045, 0.55 + turn)];
    },
  },
];
