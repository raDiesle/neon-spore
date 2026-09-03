import type { SimConfig } from "./config.js";

/**
 * **What the config implies.** Every number here is derived from the authored
 * fields next door and stored nowhere: the beat length, a window in ticks, the
 * hull's row, the middle column.
 *
 * They live apart from the fields for room rather than taste — `config.ts` was
 * at its line limit and the alternative was to keep shortening the reasons
 * beside each rule. `config.ts` re-exports all four, so every caller still
 * imports them from where it always did.
 *
 * A rule and not a literal, always. `hullRow(cfg) - 1` written out where it is
 * needed is a second copy of where the hull is, and it will drift; the
 * `COPIES` table in `purity.test.ts` is where that stops being a matter of
 * good intentions.
 */
/** Ticks per beat. Throws unless it is a whole number — see docs/architecture.md. */
export function ticksPerBeat(cfg: SimConfig): number {
  const exact = (cfg.tickHz * 60) / cfg.bpm;
  const rounded = Math.round(exact);
  if (Math.abs(exact - rounded) > 1e-9) {
    throw new Error(
      `tickHz ${cfg.tickHz} and bpm ${cfg.bpm} give ${exact} ticks per beat. ` +
        `It must be a whole number, otherwise the beat drifts and lockstep breaks.`,
    );
  }
  return rounded;
}

/**
 * A duration in milliseconds as a whole number of ticks.
 *
 * Every window is authored in milliseconds and lived in ticks, and that
 * conversion was written out nine times across three packages.
 *
 * `(ms * tickHz) / 1000` and not `(ms / 1000) * tickHz` — the same number for
 * every value the game ships, but the second divides first and rounds a float
 * that has lost the exact product, landing on the wrong side of a .5 boundary
 * for nine (tickHz, ms) pairs under five seconds.
 */
export function msToTicks(cfg: SimConfig, ms: number): number {
  return Math.round((ms * cfg.tickHz) / 1000);
}

/**
 * The row the hull occupies. A creature that arrives here has reached it, so a
 * creature entering at row 0 travels `rows - 1` beats — 8.75 s at the defaults,
 * which is the 4-second rule from docs/spec/latency.md with room to spare.
 */
export function hullRow(cfg: SimConfig): number {
  return cfg.rows - 1;
}

/**
 * The middle column: the cannon's home and the shield's, where THE FLEET
 * breaches, where THE GAUGE, SNAKE and PINBALL cost the hull, the gyre's rest
 * column and the vane's pivot. `Math.floor(cfg.cols / 2)` stood in nine
 * places, two of them already named — an even `cols` would have moved some of
 * them left and some right.
 */
export function midCol(cfg: SimConfig): number {
  return Math.floor(cfg.cols / 2);
}
