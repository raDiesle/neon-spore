import { type SimConfig, type SurgeState, surgeHoldsCharge } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { paintSac } from "./surge-flesh.js";
import { type Point, surgeBulbPath } from "./surge-shape.js";

/**
 * **THE SURGE's body**, and the eversion that turns it out — split from
 * `surge-draw.ts` on 8 October 2026 so the eversion could be a record a
 * candidate patches (`surge:evert` in VERSUS) without that file passing its
 * line ceiling.
 */

/** Everything the body is drawn from but the world: where, how big, and how lit. */
export interface SurgeBody {
  c: Point;
  rx: number;
  ry: number;
  time: number;
  pressure: number;
  sealing: boolean;
  /** Past the half of the eversion: the inside is what faces out. */
  inside: boolean;
  /** Whether this screen is shown the pressure (`showsSurgePressure`). */
  warms: boolean;
  tile: number;
  hurt: number;
}

/** What the eversion is drawn from: the bulb unfolded, how far it has
 * turned, and the body to draw at any height and either side out. */
export interface EvertDraw {
  readonly ctx: CanvasRenderingContext2D;
  readonly c: Point;
  readonly rx: number;
  /** The half-height the bulb stands at unfolded. */
  readonly ry: number;
  /** 0 whole to 1 inside out (`surgeEvert01`). */
  readonly evert: number;
  readonly time: number;
  readonly tile: number;
  readonly body: (ry: number, inside: boolean) => void;
}

/** The thinnest the fold ever flattens the body, so it is never a line. */
const FLAT = 0.08;

/** The half-height the fold leaves: full, flat at the half, full again inside out. */
export function surgeFoldedRy(tile: number, ry: number, evert: number): number {
  return Math.max(tile * FLAT, ry * Math.abs(Math.cos(evert * Math.PI)));
}

/**
 * **The eversion, as a record.** What ships folds the outline through its
 * equator — flat at the half and drawn pale past it; the design asked for the
 * bulb turned inside out through its seam, rib by rib (bosses-choreographed.md
 * §9, step 14), and a candidate offers that.
 */
export interface EvertLook {
  draw(d: EvertDraw): void;
}

export const EVERT_LOOK: EvertLook = {
  draw: (d) => d.body(surgeFoldedRy(d.tile, d.ry, d.evert), Math.cos(d.evert * Math.PI) < 0),
};

/**
 * The body: a sac of the hull's violet (`surge-flesh.ts`), its lower wall lit
 * from inside and warmed toward its rim as the pressure comes
 * on where the pressure is shown, dim and shut while it re-seals, and pale
 * — the inside out — past the half of the eversion. From `surgeHoldNotches`
 * open it keeps its charge with no thumb on it, and a faint glow inside
 * says so on both screens: that it *holds* is a rule, not a number.
 */
export function drawSurgeBody(
  ctx: CanvasRenderingContext2D,
  cfg: SimConfig,
  s: SurgeState,
  b: SurgeBody,
): void {
  const { c, rx, ry, time, pressure, sealing, inside, warms, tile, hurt } = b;
  const path = surgeBulbPath(c, rx, ry, time);
  const warm = warms ? pressure * 0.4 : 0;
  const hex = sealing
    ? PALETTE.dim
    : inside
      ? PALETTE.hullRim
      : mixHex(PALETTE.hull, PALETTE.hullRim, warm);
  const rim = sealing ? PALETTE.rock : inside ? PALETTE.hull : PALETTE.hullRim;
  const glow = sealing ? 0 : warms ? pressure : 0;
  paintSac(
    ctx,
    path,
    { c, rx, ry, tile },
    hex,
    rim,
    inside ? 0.8 : 0.6,
    glow,
    sealing ? 0.5 : 1,
    time,
  );
  drawHurt(ctx, path, hurt);
  if (surgeHoldsCharge(s, cfg) && !sealing) {
    ctx.save();
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.12 + 0.05 * Math.sin(time * 2));
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, rx * 0.55, ry * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
