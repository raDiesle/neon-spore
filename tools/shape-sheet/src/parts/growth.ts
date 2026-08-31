import type { Point } from "@neon-spore/content";
import { band, disc, ribbon, spine } from "./geometry.js";
import type { PartDef } from "./types.js";

/**
 * GROWTH — the parts that are *made of* the body rather than reaching out of it.
 *
 * The difference from REACH is not decoration, it is what the silhouette says.
 * A limb says the body acts on something outside itself. A growth says the
 * body is *doing something to itself* — swelling, budding, breaking into
 * pieces, going soft — which is the vocabulary the game's own creatures are
 * short of: everything in the bestiary today is a lobed blob that either sits
 * or falls, and nothing in it looks like it is becoming something else.
 *
 * Most of these are discs, which is deliberate. A round secondary form beside
 * a round body reads instantly at 26 px as *more of the same thing*, and that
 * is precisely the claim: a colony, not a creature with ornaments.
 */

/** Where a growth sits by default: just clear of the rim it came off. */
const OFF = 0.24;

/** How deep a growth roots into the rim it came off. */
const ROOTED = 0.08;

/** A stalk with a cap, used by both the fungal parts. */
function mushroom(
  x: number,
  y: number,
  h: number,
  cap: number,
  lean: number,
  t: number,
  ph: number,
): Point[][] {
  const sp = spine({ len: h, curl: lean, sway: 0.12, speed: 0.9, n: 8 }, t, ph).map((p) => ({
    x: x + p.x,
    y: y + p.y,
  }));
  const tip = sp[sp.length - 1] as Point;
  return [
    ribbon(sp, (u) => 0.05 * (1 - 0.3 * u) + 0.01),
    band(tip.x, tip.y, cap * 0.45, cap, Math.PI * 0.15, Math.PI * 0.85, 12).map((p) => ({
      x: p.x,
      y: p.y - cap * 0.1,
    })),
  ];
}

export const GROWTHS: PartDef[] = [
  {
    id: "spore",
    label: "SPORE",
    category: "growth",
    hint: "one loose grain off the body; drifts outward and could detach entirely",
    build: (c) => {
      const drift = OFF + 0.09 * (0.5 + 0.5 * Math.sin(c.t * 0.7 + c.phase));
      return [disc({ x: drift, y: 0, r: 0.13, wobble: 0.09 }, c.t, c.phase)];
    },
  },
  {
    id: "spore-cluster",
    label: "SPORE CLUSTER",
    category: "growth",
    hint: "five grains at five sizes, each on its own drift — a shed, not a pattern",
    build: (c) => {
      const seeds = [
        [0.2, -0.24, 0.1],
        [0.38, -0.02, 0.13],
        [0.26, 0.22, 0.09],
        [0.56, 0.16, 0.07],
        [0.5, -0.2, 0.06],
      ] as const;
      return seeds.map(([x, y, r], k) => {
        const d = 1 + 0.16 * Math.sin(c.t * (0.6 + k * 0.13) + c.phase + k);
        return disc({ x: x * d, y, r, wobble: 0.12 }, c.t, c.phase + k * 1.7);
      });
    },
  },
  {
    id: "bud",
    label: "BUD",
    category: "growth",
    hint: "half a body pushing out of the rim; swells and subsides",
    build: (c) => {
      const swell = 1 + 0.14 * Math.sin(c.t * 1.1 + c.phase);
      return [disc({ x: 0.1, y: 0, r: 0.26 * swell, squash: 0.9, wobble: 0.05 }, c.t, c.phase)];
    },
  },
  {
    id: "bubble",
    label: "BUBBLE",
    category: "growth",
    hint: "a thin-walled swelling on a short neck; inflates on a slow count",
    build: (c) => {
      const g = 0.5 + 0.5 * Math.sin(c.t * 0.8 + c.phase);
      const r = 0.12 + 0.16 * g;
      const sp = [
        { x: -0.06, y: 0 },
        { x: 0.14, y: 0 },
      ];
      return [ribbon(sp, () => 0.05), disc({ x: 0.16 + r, y: 0, r, wobble: 0.03 }, c.t, c.phase)];
    },
  },
  {
    id: "vesicle",
    label: "VESICLE",
    category: "growth",
    hint: "a sac with something visible inside it; the core drifts within the wall",
    build: (c) => {
      const wander = 0.05 * Math.sin(c.t * 0.9 + c.phase);
      return [
        disc({ x: 0.18, y: 0, r: 0.3, wobble: 0.05 }, c.t, c.phase),
        disc({ x: 0.18 + wander, y: wander * 1.4, r: 0.11, wobble: 0.1 }, c.t, c.phase * 2),
      ];
    },
  },
  {
    id: "cells",
    label: "CELLS",
    category: "growth",
    hint: "four chambers packed against the rim; each breathes on its own count",
    build: (c) => {
      const at = [
        [0.16, -0.2],
        [0.16, 0.2],
        [0.44, -0.11],
        [0.44, 0.18],
      ] as const;
      return at.map(([x, y], k) =>
        disc(
          { x, y, r: 0.17 * (1 + 0.09 * Math.sin(c.t * 1.2 + c.phase + k * 1.6)), wobble: 0.07 },
          c.t,
          c.phase + k,
        ),
      );
    },
  },
  {
    id: "fungal",
    label: "FUNGAL",
    category: "growth",
    hint: "one cap on a stalk; the stalk leans and the cap rides it",
    build: (c) => mushroom(-0.05, 0, 0.55, 0.3, 0.25, c.t, c.phase),
  },
  {
    id: "micro-caps",
    label: "MICRO CAPS",
    category: "growth",
    hint: "three little caps at three heights — a patch rather than a feature",
    build: (c) => [
      ...mushroom(-0.05, -0.18, 0.3, 0.16, 0.5, c.t, c.phase),
      ...mushroom(-0.05, 0.04, 0.42, 0.2, 0.15, c.t, c.phase + 1.4),
      ...mushroom(-0.05, 0.24, 0.24, 0.14, -0.3, c.t, c.phase + 2.6),
    ],
  },
  {
    id: "coral",
    label: "CORAL",
    category: "growth",
    hint: "a trunk that forks twice; grows by extending, never by swaying",
    build: (c) => {
      const loops: Point[][] = [];
      const grow = 0.9 + 0.1 * Math.sin(c.t * 0.5 + c.phase);
      const branch = (x: number, y: number, dir: number, len: number, w: number, depth: number) => {
        const sp = spine(
          { len: len * grow, curl: 0, sway: 0.06, speed: 0.5, n: 6 },
          c.t,
          c.phase,
        ).map((p) => ({
          x: x + p.x * Math.cos(dir) - p.y * Math.sin(dir),
          y: y + p.x * Math.sin(dir) + p.y * Math.cos(dir),
        }));
        loops.push(ribbon(sp, () => w));
        const tip = sp[sp.length - 1] as Point;
        if (depth === 0) return;
        branch(tip.x, tip.y, dir - 0.6, len * 0.7, w * 0.7, depth - 1);
        branch(tip.x, tip.y, dir + 0.55, len * 0.62, w * 0.7, depth - 1);
      };
      branch(-ROOTED, 0, 0, 0.42, 0.07, 1);
      return loops;
    },
  },
  {
    id: "fold",
    label: "FOLD",
    category: "growth",
    hint: "a membrane laid over the rim in a crescent; slides along the body",
    build: (c) => {
      const slide = 0.12 * Math.sin(c.t * 0.7 + c.phase);
      return [band(-0.9, slide, 0.94, 1.12, -0.72, 0.72, 16).map((p) => ({ x: p.x, y: p.y }))];
    },
  },
  {
    id: "soft-lobe",
    label: "SOFT LOBE",
    category: "growth",
    hint: "a whole extra lobe leaning off one side; the cheapest way to break symmetry",
    build: (c) => {
      const lean = 0.1 * Math.sin(c.t * 0.6 + c.phase);
      return [
        disc(
          { x: 0.14, y: 0.22 + lean, r: 0.42, squash: 0.72, turn: 0.5, wobble: 0.06 },
          c.t,
          c.phase,
        ),
      ];
    },
  },
  {
    id: "frill",
    label: "FRILL",
    category: "growth",
    hint: "a wavy skirt run along the rim; the wave travels rather than the skirt moving",
    build: (c) => {
      const sp: Point[] = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18;
        const y = (u - 0.5) * 1.5;
        sp.push({ x: -0.04 + 0.11 * Math.sin(u * Math.PI * 3 + c.t * 1.6 + c.phase), y });
      }
      return [ribbon(sp, (u) => 0.05 + 0.05 * Math.sin(Math.PI * u))];
    },
  },
];
