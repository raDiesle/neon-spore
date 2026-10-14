import type { BastionState } from "./bastion.js";
import type { SimConfig } from "./config.js";
import { type CurvePoint, curveAt } from "./curve.js";

/**
 * **The track a plate is pulled along** — the owner, 14 October 2026: *increase
 * the distance required for pull. It can also be curves.* A plate is carried
 * from where its knob rests, and the track is how: `straight` out along its
 * way, as every plate was pulled before, or one of three curves that set off
 * out and bend round the moon.
 *
 * - `sweep`: out, then round the moon towards the ship, an eighth of a turn.
 * - `snake`: the same way round, swinging out and in and out again.
 * - `climb`: out, then round the moon away from the ship.
 *
 * **A curve is the moon's own frame**: each table is `[out, round]`
 * thousandths of a tile from the knob, `out` along the plate's way and
 * `round` round the moon towards the ship, so the same curve fits any plate
 * of a side and the right side's is the left's mirrored. A curve is only as
 * long as the field has room for round the plate it is put on, so its length
 * is its shape, not a tuning: which plates each fits is
 * `render/test/bastion-track-fit.test.ts`'s.
 *
 * The tables are equal pieces (`curve.ts`), written out so no device rounds a
 * sine its own way; `bastionTrackLen` is their length, written out beside them.
 */

export const BASTION_TRACKS = ["straight", "sweep", "snake", "climb"] as const;
export type BastionTrack = (typeof BASTION_TRACKS)[number];

/** Plates on each side of the moon: a figure of the silhouette, `OCULUS_LEAVES`' reason. */
export const BASTION_PLATES_A_SIDE = 4;

/**
 * Which way each of a side's plates tears off, top to bottom, in thousandths
 * of a tile along x and y (y down): the left side's, and the right's mirrored.
 * Spread from 35 to 145 degrees off straight up, written out so no device
 * rounds a sine its own way.
 */
export const BASTION_PLATE_WAYS: readonly (readonly [number, number])[] = [
  [-574, -819],
  [-951, -309],
  [-951, 309],
  [-574, 819],
];

interface Bend {
  /** The curve's length, thousandths of a tile: the pull that tears its plate. */
  milli: number;
  pts: readonly (readonly [number, number])[];
}

const BENDS: Record<Exclude<BastionTrack, "straight">, Bend> = {
  sweep: {
    milli: 3534,
    pts: [
      [0, 0],
      [177, 3],
      [340, 68],
      [475, 182],
      [580, 324],
      [653, 485],
      [692, 657],
      [695, 833],
      [662, 1007],
      [611, 1176],
      [551, 1343],
      [484, 1506],
      [409, 1667],
      [327, 1823],
      [237, 1975],
      [141, 2124],
      [37, 2267],
      [-73, 2405],
      [-189, 2538],
      [-312, 2665],
      [-441, 2787],
    ],
  },
  snake: {
    milli: 6120,
    pts: [
      [0, 0],
      [171, 0],
      [336, 42],
      [484, 128],
      [626, 223],
      [774, 309],
      [923, 392],
      [1072, 476],
      [1218, 566],
      [1355, 667],
      [1468, 795],
      [1473, 959],
      [1353, 1078],
      [1196, 1145],
      [1031, 1187],
      [862, 1214],
      [692, 1232],
      [521, 1243],
      [350, 1252],
      [180, 1263],
      [11, 1287],
      [-116, 1385],
      [-63, 1545],
      [33, 1687],
      [136, 1824],
      [239, 1960],
      [340, 2098],
      [436, 2239],
      [524, 2386],
      [596, 2541],
      [637, 2706],
      [584, 2862],
      [425, 2912],
      [255, 2894],
      [90, 2848],
      [-70, 2789],
      [-228, 2722],
    ],
  },
  climb: {
    milli: 2446,
    pts: [
      [0, 0],
      [153, 0],
      [303, -29],
      [442, -92],
      [566, -181],
      [667, -296],
      [735, -433],
      [753, -584],
      [727, -734],
      [694, -884],
      [655, -1032],
      [610, -1178],
      [559, -1322],
      [502, -1464],
      [440, -1604],
      [371, -1741],
      [298, -1875],
    ],
  },
};

/** Which way plate `i` tears off, thousandths of a tile along x and y. */
export function bastionPlateWay(i: number): readonly [number, number] {
  const way = BASTION_PLATE_WAYS[i % BASTION_PLATES_A_SIDE] ?? [0, -1000];
  return i < BASTION_PLATES_A_SIDE ? way : [-way[0], way[1]];
}

/** The track plate `i` of the shell at the cursor is pulled along: its side's slot, straight if the step names none. */
export function bastionTrackOf(s: BastionState, i: number): BastionTrack {
  return s.steps[s.cursor]?.tracks?.[i % BASTION_PLATES_A_SIDE] ?? "straight";
}

/** How far a plate on `track` is pulled before it tears, thousandths of a tile. */
export function bastionTrackLen(cfg: SimConfig, track: BastionTrack): number {
  return track === "straight" ? cfg.bastionPullMilli : BENDS[track].milli;
}

/** Plate `i`'s track on `track`, thousandths of a tile from where its knob rests, x across and y down. */
export function bastionTrackPoints(cfg: SimConfig, track: BastionTrack, i: number): CurvePoint[] {
  const [ox, oy] = BASTION_PLATE_WAYS[i % BASTION_PLATES_A_SIDE] ?? [0, -1000];
  const flip = i < BASTION_PLATES_A_SIDE ? 1 : -1;
  const table =
    track === "straight" ? [[0, 0] as const, [cfg.bastionPullMilli, 0] as const] : BENDS[track].pts;
  // The left side's way out and its way round towards the ship, the right's mirrored.
  // `+ 0`: a mirrored nought is -0, and a hash or a test has no use for one.
  return table.map(([out, round]) => ({
    x: Math.trunc((flip * (out * ox + round * oy)) / 1000) + 0,
    y: Math.trunc((out * oy - round * ox) / 1000) + 0,
  }));
}

/** Where plate `i` stands `milli` along its track from its knob's rest, thousandths of a tile. */
export function bastionTrackAt(
  cfg: SimConfig,
  track: BastionTrack,
  i: number,
  milli: number,
): CurvePoint {
  return curveAt(bastionTrackPoints(cfg, track, i), bastionTrackLen(cfg, track), milli);
}
