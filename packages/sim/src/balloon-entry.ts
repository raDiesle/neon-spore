import type { SimConfig } from "./config.js";
import { midCol } from "./config-derived.js";
import type { CrossDir } from "./cross.js";
import { shieldRow } from "./hull-guard.js";
import { nextInt, type Rng } from "./rng.js";
import { clampSpanCol } from "./span.js";

/**
 * **WHERE A BALLOON COMES IN**, which the owner rewrote on 14 September 2026.
 *
 * It used to appear out of nothing one row above the ship and swell there. That
 * made the arrival a place the pair already knew: the navigator never had to
 * look for it and the pilot never had to be told. Now it comes in **at a wall**,
 * one or two rows above the shield, and **glides to somewhere around the
 * middle** before it starts to climb — three answers, three functions, all of
 * them called by `spawnArrivals` rather than spelled out there
 * (`purity.test.ts`'s `COPIES`).
 *
 * **The glide is a beat of real travel and not a flourish.** `creatureLane`
 * carries the body from `fromCol` to `col` across the beat it arrives on, so
 * for that beat it is genuinely out over the field between the wall and its
 * landing column — a bolt fired up the column it is *going* to misses it,
 * because it is not there yet. That is the right answer and worth knowing: a
 * pair that fires at a balloon as it comes in is firing at where it will be.
 *
 * Its own file because `balloon.ts` is at its 250-line ceiling and because this
 * is a seam that was already there in spirit: next door is what a balloon
 * *does* once it is on the field, and this is only how it got there.
 */

/**
 * **The row a balloon comes in on: one or two above the shield**, drawn from
 * the `Rng`.
 *
 * `shieldRow` and not `hullRow - 1` written out, for `purity.test.ts`'s
 * `COPIES` reason: where the dome stands is a rule with one owner.
 */
export function balloonEntryRow(cfg: SimConfig, rng: Rng): number {
  const up = 1 + nextInt(rng, Math.max(1, Math.round(cfg.balloonEntryRowsUp)));
  return Math.max(0, shieldRow(cfg) - up);
}

/**
 * **Which wall it comes in at**, and it is the authored column that says so
 * rather than the `Rng`.
 *
 * That is a departure from the owner's wording and it has a reason his wording
 * could not have known: the radar announces a sideways arrival `radarLead`
 * beats before the body exists (`render/radar-blip.ts`), and a side drawn from
 * the `Rng` at spawn is a side nothing can say early. A wave that paints a
 * balloon in the left half brings it in at the left wall, which is also the
 * reading an author would expect from the cell they clicked.
 */
export function balloonEntrySide(cfg: SimConfig, col: number): CrossDir {
  return col * 2 < cfg.cols ? 1 : -1;
}

/**
 * **The column it glides to**: somewhere around the middle, inside a band the
 * config names, drawn from the `Rng`.
 */
export function balloonEntryCol(cfg: SimConfig, rng: Rng, span: number): number {
  const band = Math.max(1, Math.round(cfg.balloonEntryBandCols));
  const from = Math.max(0, midCol(cfg) - Math.floor(band / 2));
  return clampSpanCol(from + nextInt(rng, band), cfg.cols, span);
}
