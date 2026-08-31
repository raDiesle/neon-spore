import type { Point } from "@neon-spore/content";
import { band, disc, ribbon, type SpineOpts, spine } from "./geometry.js";
import type { Part, PartDef } from "./types.js";

/**
 * REACH — the parts that leave the body.
 *
 * Everything here is a spine with a width function on it, which is on purpose:
 * a tentacle, a hair, a root and a barb differ by four numbers and not by four
 * drawings, and a library that spelled each of them out separately would drift
 * the moment one of them was retuned. What varies is length, taper, how much
 * it curls before it moves at all, and how much of the curl is the sway.
 *
 * They are the parts that change a silhouette most and read at the smallest
 * size, because a limb crossing the rim breaks the outline where nothing else
 * does — `docs/spec/graphics.md`'s 20–26 px is about a body, and a body with
 * three lashes on it is nameable well under that.
 */

/** Sunk slightly into the body, so nothing hovers a hair off its own rim. */
const ROOT = 0.09;

function limb(o: SpineOpts, half: (u: number) => number): Part {
  return (c) => {
    const sp = spine(o, c.t, c.phase).map((p) => ({ x: p.x - ROOT, y: p.y }));
    return [ribbon(sp, half)];
  };
}

/** Thick at the root, coming to a soft point: the ordinary tentacle taper. */
const taper =
  (root: number, tip = 0.15) =>
  (u: number) =>
    root * (1 - u * (1 - tip));

/** A width that swells before it tapers — a neck and then a club. */
const clubbed = (neck: number, head: number) => (u: number) =>
  neck + head * Math.max(0, Math.sin(Math.PI * u ** 1.6)) ** 2;

export const LIMBS: PartDef[] = [
  {
    id: "stub",
    label: "STUB",
    category: "reach",
    hint: "a short thick tentacle; sways as one piece, never whips",
    build: limb({ len: 0.5, curl: 0.5, sway: 0.28, speed: 1.2, n: 10 }, taper(0.13, 0.4)),
  },
  {
    id: "lash",
    label: "LASH",
    category: "reach",
    hint: "long and thin, the whole length trailing behind the tip",
    build: limb({ len: 1.5, curl: 0.9, sway: 0.7, waves: 1.4, speed: 1.8, n: 20 }, taper(0.09)),
  },
  {
    id: "arm",
    label: "ARM",
    category: "reach",
    hint: "heavy, slow, barely bending — mass rather than reach",
    build: limb({ len: 0.95, curl: 0.35, sway: 0.16, speed: 0.8, n: 14 }, taper(0.2, 0.45)),
  },
  {
    id: "fork",
    label: "FORK",
    category: "reach",
    hint: "one limb that becomes two; the branches sway against each other",
    build: (c) => {
      const stem = spine({ len: 0.55, curl: 0.2, sway: 0.2, speed: 1.3, n: 9 }, c.t, c.phase).map(
        (p) => ({ x: p.x - ROOT, y: p.y }),
      );
      const tip = stem[stem.length - 1] as Point;
      const loops = [ribbon(stem, taper(0.11, 0.7))];
      for (const [k, turn] of [
        [0, -0.55],
        [1, 0.6],
      ] as const) {
        const br = spine(
          { len: 0.7, curl: turn + 0.3, sway: 0.35, speed: 1.6, n: 12 },
          c.t,
          c.phase + k * 2.1,
        );
        loops.push(
          ribbon(
            br.map((p) => ({ x: tip.x + p.x, y: tip.y + p.y })),
            taper(0.075),
          ),
        );
      }
      return loops;
    },
  },
  {
    id: "filament",
    label: "FILAMENT",
    category: "reach",
    hint: "hair-thin and nearly straight; only moves at the far half",
    build: limb(
      { len: 1.25, curl: 0.15, sway: 0.5, waves: 2.2, speed: 2.4, n: 18 },
      taper(0.035, 0.6),
    ),
  },
  {
    id: "tendril",
    label: "TENDRIL",
    category: "reach",
    hint: "curls right round on itself; the curl tightens and loosens",
    build: (c) =>
      limb(
        { len: 1.15, curl: 3.4 + 0.5 * Math.sin(c.t * 0.9 + c.phase), sway: 0.1, n: 20 },
        taper(0.07, 0.25),
      )(c),
  },
  {
    id: "barb",
    label: "BARB",
    category: "reach",
    hint: "straight out, then a hook at the end — the one limb with a direction",
    build: limb({ len: 0.7, curl: 1.9, sway: 0.12, speed: 1.0, n: 14 }, taper(0.12, 0.05)),
  },
  {
    id: "crook",
    label: "CROOK",
    category: "reach",
    hint: "a thick tendril bent back on itself, like something holding on",
    build: limb({ len: 1.0, curl: 2.4, sway: 0.22, speed: 0.9, n: 16 }, clubbed(0.05, 0.11)),
  },
  {
    id: "rootlet",
    label: "ROOTLET",
    category: "reach",
    hint: "three short roots off one trunk; spreads rather than reaches",
    build: (c) => {
      const loops: Point[][] = [];
      for (let k = 0; k < 3; k++) {
        const sp = spine(
          { len: 0.42 + k * 0.12, curl: (k - 1) * 0.85, sway: 0.1, speed: 0.7, n: 10 },
          c.t,
          c.phase + k,
        ).map((p) => ({ x: p.x - ROOT, y: p.y }));
        loops.push(ribbon(sp, taper(0.075, 0.2)));
      }
      return loops;
    },
  },
  {
    id: "soft-spike",
    label: "SOFT SPIKE",
    category: "reach",
    hint: "a cone with a rounded tip; a spine that has never cut anything",
    build: limb(
      { len: 0.46, curl: 0.12, sway: 0.1, speed: 1.1, n: 8 },
      (u) => 0.2 * (1 - u) ** 0.8 + 0.03,
    ),
  },
  {
    id: "antenna",
    label: "ANTENNA",
    category: "reach",
    hint: "a thin stalk with a bead on the end; the bead pulses on the beat",
    build: (c) => {
      const sp = spine({ len: 1.05, curl: 0.3, sway: 0.34, speed: 1.4, n: 14 }, c.t, c.phase).map(
        (p) => ({ x: p.x - ROOT, y: p.y }),
      );
      const tip = sp[sp.length - 1] as Point;
      const pulse = 1 + 0.18 * Math.sin(c.t * 2.2 + c.phase);
      return [ribbon(sp, () => 0.035), disc({ x: tip.x, y: tip.y, r: 0.12 * pulse, wobble: 0.06 })];
    },
  },
  {
    id: "flagellum",
    label: "FLAGELLUM",
    category: "reach",
    hint: "a wave train running the whole length, width barely changing",
    build: limb({ len: 1.6, curl: 0, sway: 0.62, waves: 3.4, speed: 3.0, n: 26 }, () => 0.04),
  },
  {
    id: "cilia",
    label: "CILIA",
    category: "reach",
    hint: "a fan of nine tiny hairs; they beat in sequence, not together",
    build: (c) => {
      const loops: Point[][] = [];
      for (let k = 0; k < 9; k++) {
        const f = (k / 8 - 0.5) * 2;
        const sp = spine(
          { len: 0.3 + 0.1 * (1 - Math.abs(f)), curl: f * 1.1, sway: 0.4, speed: 3.2, n: 7 },
          c.t,
          c.phase + k * 0.7,
        ).map((p) => ({ x: p.x - ROOT, y: p.y + f * 0.16 }));
        loops.push(ribbon(sp, () => 0.026));
      }
      return loops;
    },
  },
  {
    id: "droop",
    label: "DROOP",
    category: "reach",
    hint: "a dangling strand; hangs off the rim with a weight at the bottom",
    build: (c) => {
      const sp = spine({ len: 1.2, curl: 1.5, sway: 0.16, speed: 0.6, n: 16 }, c.t, c.phase).map(
        (p) => ({ x: p.x - ROOT, y: p.y }),
      );
      const tip = sp[sp.length - 1] as Point;
      return [
        ribbon(sp, taper(0.05, 0.5)),
        disc({ x: tip.x, y: tip.y, r: 0.1, squash: 1.3, wobble: 0.1 }, c.t, c.phase),
      ];
    },
  },
  {
    id: "sweep",
    label: "SWEEP",
    category: "reach",
    hint: "a wide flat limb, more paddle than tentacle; turns as it sways",
    build: (c) => {
      const sp = spine({ len: 0.85, curl: 0.6, sway: 0.3, speed: 1.1, n: 12 }, c.t, c.phase).map(
        (p) => ({ x: p.x - ROOT, y: p.y }),
      );
      return [ribbon(sp, (u) => 0.05 + 0.16 * Math.sin(Math.PI * u ** 1.3))];
    },
  },
  {
    id: "gill",
    label: "GILL",
    category: "reach",
    hint: "an arc standing off the body, joined at both ends; breathes open",
    build: (c) => {
      const open = 0.55 + 0.12 * Math.sin(c.t * 1.3 + c.phase);
      return [band(-0.35, 0, 0.55, 0.72, -open, open, 14)];
    },
  },
];
