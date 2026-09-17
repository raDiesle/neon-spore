import type { SimEvent } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { PALETTE } from "./palette.js";
import type { ViewRole } from "./view-role.js";
import { showsCandleMuzzle } from "./view-role-clocks.js";

/**
 * **THE CANDLE's after-image**: which columns of a dark field were lit, by
 * what, and how long ago (`candle-dark.ts`).
 *
 * The design calls it a *decaying frame buffer* — every flash holding its lit
 * frame for three beats (`docs/spec/bosses-choreographed.md` §14). It is not
 * one, on purpose. render/ keeps no offscreen copy of the field: the frame
 * tests draw on a stub context that has no pixels to copy, and a picture
 * frozen at the flash would lie a row per beat, because the bodies it caught
 * keep falling in the dark. What is kept instead is **a light per column** —
 * when it was last lit, for how long it is held, and the colour of the flash
 * that lit it — and the field pass draws the live world through that light.
 * A column just lit is the field as it is; a column lit two beats ago is the
 * field, dim, through the tint of the shot that lit it; and the after-image
 * decays through red or cyan because the light does.
 *
 * Fed two ways. `ingest` takes the events that are a flash — a shot's muzzle
 * and a breach — and the pass itself refreshes the two lights that *stand*,
 * the guard window and the beam, off the world every frame. The seat split is
 * settled here for the events: **a flash is drawn only on the screen of the
 * seat whose control made it**, so a muzzle flash lights the navigator's
 * screen and not the pilot's (`showsCandleMuzzle`, `view-role.ts`).
 *
 * Bounded by the field's width — one entry per column, a column relit
 * replacing its own — so it costs nothing on the waves that never read it,
 * and cleared in `Effects.reset()` like every transient
 * (`restart.test.ts`).
 */

interface Lit {
  /** `view.time` the light last reached the column. */
  at: number;
  /** Seconds it stays fully lit from `at` before the decay starts. */
  hold: number;
  /** `#rrggbb` the after-image decays through: the flash's own colour. */
  tint: string;
}

/** Columns a muzzle flash reaches either side of the one it fired in. */
const MUZZLE_SPAN = 1;
/** Columns a breach lights either side of its own: the design's *a scar is a
 * light source*, and a breach's own light showing the field for two beats. */
const BREACH_SPAN = 2;
const BREACH_BEATS = 2;

export class AfterImage {
  private readonly cols = new Map<number, Lit>();
  /**
   * The last `view.time` the field was drawn dark, `-1` when it has not been.
   * The wave-end light is timed off it: the sim nulls the boss and the black
   * lifts over one beat from here (`candle-dark.ts`).
   */
  darkAt = -1;

  /**
   * Light `col` from `time`, held `hold` seconds, in `tint`. A column already
   * lit for longer keeps its light: a beam refreshed every frame does not
   * shorten the muzzle flash that just crossed its column.
   */
  lit(col: number, time: number, hold: number, tint: string): void {
    const e = this.cols.get(col);
    if (e && e.at + e.hold > time + hold) return;
    this.cols.set(col, { at: time, hold, tint });
  }

  /** How lit `col` is at `time`, 0..1, with `decay` seconds from the end of
   * its hold down to nothing. Forgets a column once it is out. */
  light(col: number, time: number, decay: number): number {
    const e = this.cols.get(col);
    if (!e) return 0;
    const past = time - e.at - e.hold;
    if (past <= 0) return 1;
    if (past >= decay) {
      this.cols.delete(col);
      return 0;
    }
    return 1 - smoothstep(past / decay);
  }

  tint(col: number): string {
    return this.cols.get(col)?.tint ?? PALETTE.background;
  }

  ingest(events: readonly SimEvent[], role: ViewRole, time: number, beatSeconds: number): void {
    for (const e of events) {
      if (e.type === "fire" && !e.lance && showsCandleMuzzle(role)) {
        const tint = e.color === "red" ? PALETTE.red : PALETTE.cyan;
        for (let c = e.col - MUZZLE_SPAN; c <= e.col + MUZZLE_SPAN; c++) {
          this.lit(c, time, beatSeconds, tint);
        }
      } else if (e.type === "breach") {
        for (let c = e.col - BREACH_SPAN; c <= e.col + BREACH_SPAN; c++) {
          this.lit(c, time, BREACH_BEATS * beatSeconds, PALETTE.ember);
        }
      }
    }
  }

  clear(): void {
    this.cols.clear();
    this.darkAt = -1;
  }
}
