import type { Ring, Vec3 } from "@neon-spore/content";
import { BEARING_TURN, type GimbalRing, OUTER } from "@neon-spore/sim";
import type { Part } from "./solid-rig.js";
import type { Skin } from "./solid-tube-draw.js";

/**
 * **THE GIMBAL, modelled** (`docs/spec/living-bosses.md` §1, the rollout's
 * four rig candidates): the sealed drum, its two rings and the
 * yoke as tubes and balls, so `drawRig` turns, orders, hazes and lights it
 * (`solid-rig.ts`). The field draws it only as a VERSUS candidate
 * (`gimbal-tilt.ts`); `bun run solid --gimbal` is its sheet.
 *
 * **The rings stand in the plane the pilot faces.** Seen at `FRONT` the model's
 * `z` is the screen's `x`, so a bearing is laid out as the shipped picture
 * lays it — nought at the top, clockwise — in `y` and `z` (`onRim`). The
 * navigator looks at the same wheel from behind, at `FRONT + π`, and her
 * clockwise is its counter-clockwise without anything mirrored by hand: the
 * one thing `gimbal-shape.ts` says a flat picture cannot get right at once.
 *
 * **A hoop is eight arcs, not one tube**, because the painter sorts parts and
 * not pixels: turned, the near half of a ring must cross the drum and the far
 * half pass behind it. The drum's seam is two arcs for the same reason.
 *
 * Every length is in tiles, as `gimbal-shape.ts` keeps them, times `tile`.
 */

/** Each ring's radius, the outer first, and the drum's — `gimbal-shape.ts`'s. */
const RING_R = [3.4, 2.3] as const;
const DRUM_R = 1.3;
/** The hoop's half-thickness, in tiles. */
export const HOOP = 0.13;
/** How far a latch-tooth stands out of its rim, and how wide it is in thousandths of a turn. */
const TOOTH = 0.3;
const TOOTH_MILLI = 40;
/** A pivot pin's radius, and the yoke's rod. */
const PIN = 0.21;
export const ROD = 0.11;
/** How far above the cradle's middle the yoke's shoulder sits: `ROW` and half a tile. */
const SHOULDER = 4.1;
/** The shoulder's half-width, and the stub under the bottom pin. */
const SHOULDER_HW = 0.7;
const STUB = 0.5;
/** Arcs to a hoop, and rings to an arc. */
const ARCS = 8;
const STEPS = 5;
/** Rings to each half of the seam: it runs round the drum's whole silhouette side-on, so it needs more. */
const SEAM_STEPS = 13;

export const STEEL: Skin = { base: "#3C3F49", lift: "#C7CBD6", sheen: "#FFFFFF" };
/** The drum's shell, darker than the rings so the hoops read in front of it. */
export const SHELL: Skin = { base: "#2A2C35", lift: "#9EA3B3", sheen: "#E8ECF5" };
/** The seam, lit from inside in the wisp it will vent. */
export const SEAM: Skin = { base: "#1B2B3A", lift: "#7FE8FF", sheen: "#E6FBFF" };

/** What the rig is drawn with: which ring, turned how far, and how many teeth are left. */
export interface GimbalRigPose {
  readonly ring: GimbalRing;
  /** Where the ring's first tooth stands, in thousandths of a turn from the top, clockwise. */
  readonly faceMilli: number;
  readonly left: number;
  readonly of: number;
}

/** The point `milli` round a rim of radius `r`, in the plane the pilot faces. */
export function onRim(r: number, milli: number, x = 0): Vec3 {
  const t = (milli / BEARING_TURN) * Math.PI * 2 - Math.PI / 2;
  return { x, y: r * Math.sin(t), z: r * Math.cos(t) };
}

/** A tube along the rim from `from` to `to` (thousandths), `steps` rings, radius `rr`, in tiles. */
function arc(r: number, from: number, to: number, rr: number, tile: number): Ring[] {
  const rings: Ring[] = [];
  for (let i = 0; i < STEPS; i++) {
    const p = onRim(r, from + ((to - from) * i) / (STEPS - 1));
    rings.push({ c: { x: p.x * tile, y: p.y * tile, z: p.z * tile }, r: rr * tile });
  }
  return rings;
}

/** A straight tube from `a` to `b`, in tiles. */
function rod(a: Vec3, b: Vec3, rr: number, tile: number): Ring[] {
  return [0, 0.5, 1].map((u) => ({
    c: {
      x: (a.x + (b.x - a.x) * u) * tile,
      y: (a.y + (b.y - a.y) * u) * tile,
      z: (a.z + (b.z - a.z) * u) * tile,
    },
    r: rr * tile,
  }));
}

const scaled = (p: Vec3, tile: number): Vec3 => ({ x: p.x * tile, y: p.y * tile, z: p.z * tile });

/**
 * The drum: its shell, and the seam it splits along, near half and far. The
 * seam lies level, as the shipped picture draws it (`gimbal-drum.ts`), so it is
 * a line face-on and opens into an ellipse as the drum tips.
 */
export function gimbalDrum(tile: number): Part[] {
  const seam = (from: number, to: number): Part => {
    const rings: Ring[] = [];
    for (let i = 0; i < SEAM_STEPS; i++) {
      const a = from + ((to - from) * i) / (SEAM_STEPS - 1);
      const r = DRUM_R * 1.01;
      rings.push({
        c: { x: r * Math.cos(a) * tile, y: 0, z: r * Math.sin(a) * tile },
        r: 0.05 * tile,
      });
    }
    return { kind: "tube", rings, skin: SEAM };
  };
  return [
    gimbalShell(tile),
    // The near half faces the pilot (`x` negative at `FRONT`), the far half the navigator.
    seam(Math.PI / 2, (3 * Math.PI) / 2),
    seam(-Math.PI / 2, Math.PI / 2),
  ];
}

/** The drum's shell alone: a ball, the one part of the cradle that is not flat. */
export function gimbalShell(tile: number): Part {
  return { kind: "ball", c: { x: 0, y: 0, z: 0 }, r: DRUM_R * tile, skin: SHELL };
}

/** One ring: its hoop in arcs, its teeth standing out of it, and its two pins. */
export function gimbalRingParts(p: GimbalRigPose, tile: number): Part[] {
  const r = RING_R[p.ring] as number;
  const parts: Part[] = [];
  const step = BEARING_TURN / ARCS;
  for (let k = 0; k < ARCS; k++)
    parts.push({ kind: "tube", rings: arc(r, k * step, (k + 1) * step, HOOP, tile), skin: STEEL });
  const gone = Math.max(0, p.of - p.left);
  for (let i = gone; i < p.of; i++) {
    const at = p.faceMilli + (i * BEARING_TURN) / Math.max(1, p.of);
    const rings = arc(r + TOOTH / 2, at - TOOTH_MILLI / 2, at + TOOTH_MILLI / 2, TOOTH / 2, tile);
    parts.push({ kind: "tube", rings, skin: STEEL });
  }
  return [...parts, ...gimbalPins(p.ring, tile)];
}

/** A ring's two pivot pins: the outer ring is pinned at its top and bottom, the inner at its sides. */
export function gimbalPins(ring: GimbalRing, tile: number): Part[] {
  const r = RING_R[ring] as number;
  const half = ring === OUTER ? 0 : BEARING_TURN / 4;
  return [0, BEARING_TURN / 2].map((side) => ({
    kind: "ball",
    c: scaled(onRim(r, half + side), tile),
    r: PIN * tile,
    skin: STEEL,
  }));
}

/** The yoke's three rods end to end, in tiles: up to the shoulder, the shoulder, and the stub below. */
export function gimbalYokeRods(): readonly (readonly [Vec3, Vec3])[] {
  const top = RING_R[OUTER] as number;
  return [
    [
      { x: 0, y: -top, z: 0 },
      { x: 0, y: -SHOULDER, z: 0 },
    ],
    [
      { x: 0, y: -SHOULDER, z: -SHOULDER_HW },
      { x: 0, y: -SHOULDER, z: SHOULDER_HW },
    ],
    [
      { x: 0, y: top, z: 0 },
      { x: 0, y: top + STUB, z: 0 },
    ],
  ];
}

/** The yoke the cradle hangs from. */
export function gimbalYoke(tile: number): Part[] {
  return gimbalYokeRods().map(([a, b]) => ({
    kind: "tube",
    rings: rod(a, b, ROD, tile),
    skin: STEEL,
  }));
}

/** THE GIMBAL as a rig, about the cradle's middle, `tile` pixels to a tile. */
export function gimbalRig(p: GimbalRigPose, tile: number): Part[] {
  return [...gimbalYoke(tile), ...gimbalDrum(tile), ...gimbalRingParts(p, tile)];
}
