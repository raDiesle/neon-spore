import type { Point } from "@neon-spore/content";
import { band, ribbon, spine } from "./geometry.js";
import type { PartCtx, PartDef } from "./types.js";

/**
 * DRIFT — what hangs under a swimming bell.
 *
 * The other four categories are about a body's *edge*. This one is about the
 * relationship between two things moving at different times, which is why it
 * is a category rather than more entries in REACH: every part here reads the
 * host's contraction and none of them reads it *now*. The bell squeezes, and a
 * beat later the tentacle knows.
 *
 * That lag is the whole animal. A jellyfish drawn with its bell and its
 * tentacles on one clock is the standard way of getting a jellyfish wrong — it
 * reads as a decorated umbrella opening and shutting, because everything
 * agrees, and nothing alive agrees with itself that exactly. `swim.ts` argues
 * why the contraction had to live in the contour instead of in a pose for any
 * of this to be sayable at all.
 *
 * The parts still work on a host that does not swim: `pulse()` is zero
 * forever, and what is left is a flap, a skirt and a very long tentacle. They
 * are simply not doing the thing they were drawn for.
 */

/** Sunk slightly into the body, like everything else that roots. */
const ROOT = 0.08;

/**
 * A centre line whose bend is the host's contraction, read later the further
 * down it you look.
 *
 * `rest` is how much it curls when nothing has happened, and the wave
 * straightens it: a tentacle under tension is a straight tentacle. The delay
 * grows with `u`, so what runs down the length is the *same* contraction
 * arriving at successive depths rather than a wave animated to look like one.
 */
function lagSpine(
  c: PartCtx,
  o: { len: number; rest: number; span: number; sway: number; speed?: number; n?: number },
): Point[] {
  const n = o.n ?? 22;
  const step = o.len / (n - 1);
  const pts: Point[] = [{ x: -ROOT, y: 0 }];
  let x = -ROOT;
  let y = 0;
  for (let i = 1; i < n; i++) {
    const u = i / (n - 1);
    const wave = c.pulse(0.1 + u * o.span);
    const th =
      o.rest * u * (1 - 0.8 * wave) +
      o.sway * u * Math.sin(u * Math.PI + c.t * (o.speed ?? 1.1) + c.phase);
    x += Math.cos(th) * step;
    y += Math.sin(th) * step;
    pts.push({ x, y });
  }
  return pts;
}

const hair = (root: number, tip: number) => (u: number) => root * (1 - u * (1 - tip));

export const DRIFTS: PartDef[] = [
  {
    id: "lappet",
    label: "LAPPET",
    category: "drift",
    hint: "a blunt flap of the bell's own margin; tucks under as the bell squeezes",
    build: (c) => {
      const sq = c.pulse(0.04);
      const sp = spine(
        { len: 0.44 * (1 - 0.28 * sq), curl: 0.3 + 1.5 * sq, sway: 0.12, speed: 0.8, n: 10 },
        c.t,
        c.phase,
      ).map((p) => ({ x: p.x - ROOT, y: p.y }));
      return [ribbon(sp, (u) => 0.22 * (1 - 0.5 * u) + 0.03)];
    },
  },
  {
    id: "veil",
    label: "VEIL",
    category: "drift",
    hint: "a thin skirt inside the rim; fills out on the glide and flattens on the squeeze",
    build: (c) => {
      const sq = c.pulse(0.12);
      const reach = 0.56 * (1 - 0.22 * sq);
      const wide = 0.3 * (1 + 0.3 * (1 - sq));
      const hem: Point[] = [];
      for (let i = 0; i <= 14; i++) {
        const u = i / 14;
        hem.push({
          x: reach + 0.07 * Math.sin(u * Math.PI * 3 + c.t * 1.9 + c.phase),
          y: (u - 0.5) * 2 * wide,
        });
      }
      return [[...hem, { x: -0.05, y: 0.2 }, { x: -0.05, y: -0.2 }]];
    },
  },
  {
    id: "oral-arm",
    label: "ORAL ARM",
    category: "drift",
    hint: "a long ruffled ribbon under the bell; the frill is width, not an edge",
    build: (c) => {
      const sp = lagSpine(c, { len: 1.05, rest: 0.75, span: 0.7, sway: 0.3, speed: 1.0, n: 18 });
      return [
        ribbon(
          sp,
          (u) => 0.15 * (1 - 0.55 * u) * (1 + 0.4 * Math.sin(u * 11 + c.t * 2.1 + c.phase)) + 0.025,
        ),
      ];
    },
  },
  {
    id: "streamer",
    label: "STREAMER",
    category: "drift",
    hint: "a very long fine tentacle; the contraction runs down it and it goes taut",
    build: (c) => [
      ribbon(lagSpine(c, { len: 1.85, rest: 1.15, span: 1.05, sway: 0.22 }), hair(0.05, 0.35)),
    ],
  },
  {
    id: "fringe",
    label: "FRINGE",
    category: "drift",
    hint: "seven threads off the margin, straightening together on the squeeze",
    // Seven across 1.5 units of rim, not eleven across 0.6. The first draft
    // packed them tight enough that the gaps closed at the size a card draws
    // one, and a fringe whose gaps have closed is not a fringe — it is a
    // filled patch on the margin, which is what it drew. Whatever a fringe is
    // for, it is carried by the gaps.
    build: (c) => {
      const loops: Point[][] = [];
      for (let k = 0; k < 7; k++) {
        const f = (k / 6 - 0.5) * 2;
        const sp = lagSpine(
          { ...c, phase: c.phase + k * 0.8 },
          {
            len: 0.52 + 0.16 * (1 - Math.abs(f)),
            rest: 0.75 + f * 0.7,
            span: 0.4,
            sway: 0.22,
            n: 10,
          },
        ).map((p) => ({ x: p.x, y: p.y + f * 0.75 }));
        loops.push(ribbon(sp, hair(0.032, 0.4)));
      }
      return loops;
    },
  },
  {
    id: "comb-row",
    label: "COMB ROW",
    category: "drift",
    hint: "seven paddles in a line, beating one after the next rather than together",
    build: (c) =>
      [0, 1, 2, 3, 4, 5, 6].map((k) => {
        // Metachronal: the stroke passes down the row, which is the one thing
        // that separates a comb row from a fringe of the same size.
        const beat = Math.sin(c.t * 4.2 - k * 0.75 + c.phase);
        const lean = beat * 0.5;
        const sp = [
          { x: -ROOT, y: 0 },
          { x: 0.26 * Math.cos(lean), y: 0.26 * Math.sin(lean) },
        ];
        return ribbon(sp, (u) => 0.05 + 0.05 * Math.sin(Math.PI * u)).map((p) => ({
          x: p.x,
          y: p.y + (k / 6 - 0.5) * 1.25,
        }));
      }),
  },
  {
    id: "rings",
    label: "RINGS",
    category: "drift",
    hint: "four horseshoes seen through the bell; the one part that is interior",
    under: true,
    build: (c) => {
      const swell = 1 + 0.07 * c.pulse(0.3);
      return [
        [-0.3, -0.26],
        [-0.3, 0.26],
        [-0.68, -0.26],
        [-0.68, 0.26],
      ].map(([x, y]) => band(x as number, y as number, 0.15 * swell, 0.25 * swell, -2.1, 1.2, 12));
    },
  },
  {
    id: "trail",
    label: "TRAIL",
    category: "drift",
    hint: "five threads from one point, all dragging, none of them in step",
    build: (c) => {
      const loops: Point[][] = [];
      for (let k = 0; k < 5; k++) {
        const f = (k / 4 - 0.5) * 2;
        const sp = lagSpine(
          { ...c, phase: c.phase + k * 1.3 },
          { len: 1.2 + k * 0.16, rest: 0.6 + f * 0.75, span: 0.8 + k * 0.12, sway: 0.26, n: 18 },
        ).map((p) => ({ x: p.x, y: p.y + f * 0.05 }));
        loops.push(ribbon(sp, hair(0.04, 0.4)));
      }
      return loops;
    },
  },
];
