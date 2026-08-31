import type { Point } from "@neon-spore/content";
import { band, disc, ribbon, spine } from "./geometry.js";
import type { PartDef } from "./types.js";

/**
 * RIM — the parts that only bend the outline.
 *
 * Nothing here leaves the body or sits beside it: a bump, a fin, a tear are
 * all the *same* contour going somewhere else for a while. They are the parts
 * that survive furthest down, because at 20 px a spore beside a body is one
 * more speck and a notch cut into it is still a notch.
 *
 * They are also the ones with the least to say on their own, which is why the
 * sheet draws each of them against a stub of rim rather than in isolation. A
 * FIN drawn alone is a triangle.
 *
 * The category exists as a warning as much as a shelf: `studded.ts` already
 * grows knobs, spines and hairs *out of the radius function*, which is the
 * right way to wear a feature all the way round a body — one rule, no seams,
 * and it costs nothing per feature. Reach for these when a body wants two or
 * three of something **somewhere in particular**, and for `studded` when it
 * wants forty of them everywhere.
 */

/**
 * A tooth, a fin, a spine: corners and no smoothing.
 *
 * Five points rather than the three a triangle needs, and the shoulders are
 * the reason: a straight-sided tooth reads as a cursor arrow, while sides that
 * pull in slightly before the tip read as something grown hard. The tip itself
 * stays a corner — that is the whole difference between this and `soft-spike`.
 */
function wedge(len: number, wide: number, lean: number, back = 0.12): Point[] {
  const co = Math.cos(lean);
  const si = Math.sin(lean);
  const at = (d: number, off: number): Point => ({ x: d * co - off * si, y: d * si + off * co });
  return [
    { x: -back, y: -wide },
    at(len * 0.45, -wide * 0.42),
    at(len, 0),
    at(len * 0.45, wide * 0.42),
    { x: -back, y: wide },
  ];
}

export const RIMS: PartDef[] = [
  {
    id: "bump",
    label: "BUMP",
    category: "rim",
    hint: "the rim swelling out and going back; the softest possible silhouette change",
    build: (c) => [
      disc(
        { x: 0.02, y: 0, r: 0.3 * (1 + 0.08 * Math.sin(c.t * 1.1 + c.phase)), wobble: 0.04 },
        c.t,
        c.phase,
      ),
    ],
  },
  {
    id: "welt",
    label: "WELT",
    category: "rim",
    hint: "a lopsided swelling that leans along the rim as it breathes",
    build: (c) => {
      const lean = 0.35 + 0.12 * Math.sin(c.t * 0.8 + c.phase);
      return [
        disc({ x: 0.1, y: 0.14, r: 0.34, squash: 0.62, turn: lean, wobble: 0.06 }, c.t, c.phase),
      ];
    },
  },
  {
    id: "spike",
    label: "SPIKE",
    category: "rim",
    hint: "sharp, straight, does not move — the one part that reads as a threat",
    build: () => [wedge(0.62, 0.09, 0)],
  },
  {
    id: "fin",
    label: "FIN",
    category: "rim",
    hint: "a blade standing off the rim; leans back and forth on a slow count",
    build: (c) => [wedge(0.55, 0.22, -0.5 + 0.18 * Math.sin(c.t * 0.9 + c.phase), 0.24)],
  },
  {
    id: "flap",
    label: "FLAP",
    category: "rim",
    hint: "a soft ear; hinges at the root, the tip travelling furthest",
    build: (c) => {
      const sp = spine({ len: 0.6, curl: 0.5, sway: 0.45, speed: 1.1, n: 10 }, c.t, c.phase).map(
        (p) => ({ x: p.x - 0.1, y: p.y }),
      );
      return [ribbon(sp, (u) => 0.04 + 0.22 * Math.sin(Math.PI * u ** 0.8))];
    },
  },
  {
    id: "hooklet",
    label: "HOOKLET",
    category: "rim",
    hint: "a small barb turned along the body; a rim of them says which way it travels",
    build: (c) => {
      const sp = spine({ len: 0.5, curl: 2.1, sway: 0.1, speed: 1.4, n: 10 }, c.t, c.phase).map(
        (p) => ({ x: p.x - 0.05, y: p.y }),
      );
      return [ribbon(sp, (u) => 0.1 * (1 - 0.8 * u) + 0.015)];
    },
  },
  {
    id: "ridge",
    label: "RIDGE",
    category: "rim",
    hint: "a long low keel run along the rim; raises and lowers rather than sways",
    build: (c) => {
      const h = 0.16 + 0.05 * Math.sin(c.t * 0.7 + c.phase);
      const sp: Point[] = [];
      for (let i = 0; i <= 12; i++) {
        const u = i / 12;
        sp.push({ x: -0.06 + h * Math.sin(Math.PI * u), y: (u - 0.5) * 1.3 });
      }
      return [ribbon(sp, () => 0.06)];
    },
  },
  {
    id: "web-fin",
    label: "WEB FIN",
    category: "rim",
    hint: "two struts with a membrane between them; the membrane fills and slackens",
    build: (c) => {
      const slack = 0.12 + 0.07 * Math.sin(c.t * 1.2 + c.phase);
      const strut = (y: number, len: number): Point[] =>
        ribbon(
          [
            { x: -0.08, y },
            { x: len, y: y * 1.5 },
          ],
          () => 0.035,
        );
      const web: Point[] = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        web.push({ x: 0.62 - slack * Math.sin(Math.PI * u), y: -0.42 + u * 0.84 });
      }
      web.push({ x: -0.06, y: 0.28 }, { x: -0.06, y: -0.28 });
      return [strut(-0.28, 0.66), strut(0.28, 0.58), web];
    },
  },
  {
    id: "wart",
    label: "WART",
    category: "rim",
    hint: "an irregular protrusion with no symmetry at all; turns very slowly",
    build: (c) => [
      disc(
        { x: 0.16, y: 0, r: 0.28, wobble: 0.3, turn: c.t * 0.15 + c.phase, n: 11 },
        c.t * 0.5,
        c.phase,
      ),
    ],
  },
  {
    id: "tear",
    label: "TEAR",
    category: "rim",
    hint: "a piece of the rim lifted away from the body; the gap opens and closes",
    build: (c) => {
      const lift = 0.1 + 0.08 * Math.sin(c.t * 0.9 + c.phase);
      const sp: Point[] = [];
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        sp.push({ x: lift + 0.16 * Math.sin(Math.PI * u), y: (u - 0.5) * 1.1 });
      }
      return [ribbon(sp, (u) => 0.03 + 0.05 * Math.sin(Math.PI * u))];
    },
  },
  {
    id: "serration",
    label: "SERRATION",
    category: "rim",
    hint: "five teeth in a run; a stretch of rim that has gone hard",
    build: (c) =>
      [0, 1, 2, 3, 4].map((k) => {
        const y = (k / 4 - 0.5) * 1.1;
        const len = 0.2 + 0.06 * Math.sin(c.t * 1.3 + c.phase + k * 0.9);
        return wedge(len, 0.075, 0, 0.06).map((p) => ({ x: p.x, y: p.y + y }));
      }),
  },
  {
    id: "plate",
    label: "PLATE",
    category: "rim",
    hint: "a shell plate lifted clear of the rim; the gap under it opens and shuts",
    build: (c) => {
      const lift = 0.06 + 0.07 * Math.sin(c.t * 0.85 + c.phase);
      return [band(-0.78 + lift, 0, 0.84, 1.0, -0.62, 0.62, 14)];
    },
  },
];
