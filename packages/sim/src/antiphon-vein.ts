import { type AntiphonState, antiphonOrganCol } from "./antiphon.js";
import { midCol, type SimConfig } from "./config.js";

/**
 * **The veins**: where each candidate hangs on the rail's row, and the line
 * from it down to the organ's place that the chooser carries it along.
 *
 * Its own file because the hand and the picture both read it, and a vein
 * the hand measured one way and the screen drew another would be a thumb on
 * the drawing that the simulation said was off the line.
 *
 * A vein is **a straight segment in whole tiles**, from the candidate's
 * column on `antiphonRailRow` to the middle column `antiphonVeinRows` below:
 * the middle candidate's goes straight down, the others slant in. A thumb
 * carries a candidate by its displacement from where it grabbed, in
 * thousandths of a tile, and that displacement is read **along** the vein —
 * the share of its length, in thousandths — while it stays within
 * `antiphonVeinSlackMilli` of the line. Off the line the carry stays where it
 * was, so the drawing may bow the vein a little and a thumb that follows the
 * drawing is still on it. All of it is integer arithmetic: the squares stay
 * far under 2^53 at any field the game ships.
 */

/** The column rail slot `i` of `n` hangs over: spread `antiphonRailGap` apart about the middle. */
export function antiphonSlotCol(cfg: SimConfig, n: number, i: number): number {
  return midCol(cfg) + Math.floor(((2 * i - (n - 1)) * cfg.antiphonRailGap) / 2);
}

/** The vein from candidate `i` to the organ, in whole tiles: across, then down. */
export function antiphonVein(
  cfg: SimConfig,
  s: AntiphonState,
  i: number,
): { dx: number; dy: number } | null {
  const c = s.rail[i];
  if (c === undefined) return null;
  return { dx: antiphonOrganCol(cfg) - c.col, dy: cfg.antiphonVeinRows };
}

/**
 * How far down vein `i` a thumb displaced by (`fromMilli`, `fromYMilli`)
 * from its grab has carried the candidate, in thousandths of the vein,
 * clamped to it — or `null` when the thumb has wandered further than
 * `antiphonVeinSlackMilli` off the line.
 */
export function antiphonAlongVein(
  cfg: SimConfig,
  s: AntiphonState,
  i: number,
  fromMilli: number,
  fromYMilli: number,
): number | null {
  const v = antiphonVein(cfg, s, i);
  if (v === null) return null;
  const vx = v.dx * 1000;
  const vy = v.dy * 1000;
  const len2 = vx * vx + vy * vy;
  if (len2 === 0) return null;
  const cross = fromMilli * vy - fromYMilli * vx;
  const slack = cfg.antiphonVeinSlackMilli;
  if (cross * cross > slack * slack * len2) return null;
  const dot = fromMilli * vx + fromYMilli * vy;
  const along = Math.floor((dot * 1000) / len2);
  return Math.max(0, Math.min(1000, along));
}

/** The displacement from a grab that carries candidate `i` `milli` of the way down its vein — the hand's and the film's way back. */
export function antiphonVeinMilli(
  cfg: SimConfig,
  s: AntiphonState,
  i: number,
  milli: number,
): { fromMilli: number; fromYMilli: number } {
  const v = antiphonVein(cfg, s, i);
  if (v === null) return { fromMilli: 0, fromYMilli: 0 };
  return { fromMilli: v.dx * milli, fromYMilli: v.dy * milli };
}
