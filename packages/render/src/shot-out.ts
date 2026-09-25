import { beatSeconds, type SimConfig, type SimEvent } from "@neon-spore/sim";
import { drawShot, SHOT_LOOK } from "./bullets.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **A bolt flying on past the top row to the top of the screen.**
 *
 * The grid ends at row 0 and the simulation is done with a shot there
 * (`sim/shot-out.ts`), but the picture does not end there: on a phone upright
 * the field is as wide as the screen and shorter than it, so between the top
 * row and the top of the stage there are several tiles of sky. A bolt that
 * vanished at row 0 went out *in the middle of the screen*, and the owner, 25
 * September 2026: *let it fly to the very top and disappear when screen ends.*
 *
 * So the bolt is carried on from exactly where the simulation left it, at the
 * speed it climbed, drawn by the same `drawShot` the field's bolts are, until
 * its tail has cleared the top of the stage — which is clipped, so that is
 * where it is cut. A bolt out of the top while a boss hangs above the field
 * (`taken`) is not carried: it went into that boss, which draws what it did.
 * Neither is one on THE WELL, whose field is a disc with no top to fly out of,
 * nor a wasted one on HARD, which comes back down (`ricochet.ts`).
 *
 * Kept in `Effects` and cleared on restart, because it outlives the frame.
 */

interface Flight {
  col: number;
  /** Rows, fractional and negative: above the centre of row 0. */
  row: number;
  /** Rows a second, off the beat: the bolt does not speed up leaving. */
  speed: number;
  hex: string;
}

export class ShotOutFx {
  private flights: Flight[] = [];

  ingest(events: readonly SimEvent[], cfg: SimConfig, well: boolean): void {
    if (well) return;
    const speed = cfg.bulletTilesPerBeat / beatSeconds(cfg);
    for (const e of events) {
      if (e.type !== "shotOut" || e.taken || e.wasted) continue;
      this.flights.push({
        col: e.col + e.driftMilli / 1000,
        row: e.atMilli / 1000,
        speed,
        hex: e.color === "red" ? PALETTE.red : PALETTE.cyan,
      });
    }
  }

  update(dt: number, l: Layout): void {
    if (this.flights.length === 0) return;
    for (const f of this.flights) f.row -= f.speed * dt;
    // Gone when the foot of the longest tail the look can draw — one tile
    // behind the head — and the halo round it are both above the stage.
    const reach = 1 + SHOT_LOOK.haloMul;
    this.flights = this.flights.filter((f) => tileCY(l, f.row + reach) > 0);
  }

  draw(ctx: CanvasRenderingContext2D, l: Layout): void {
    for (const f of this.flights) {
      // The sawtooth tail carries on across the seam: `frac` is how far the
      // bolt has come from the last tile centre it passed, as on the field.
      const frac = Math.ceil(f.row) - f.row;
      drawShot(ctx, l, SHOT_LOOK, f.col, f.row, frac, 0, f.hex);
    }
  }

  clear(): void {
    this.flights = [];
  }
}
