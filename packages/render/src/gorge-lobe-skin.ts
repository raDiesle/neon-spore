import { shine } from "./gorge-flesh.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **One lobe of THE GORGE's skin**: the wash over an empty one, the light
 * across its top, its colour lit in the floor where the beads sit, and the rim
 * caught from behind. Split off `gorge-flesh.ts` when the lobe's idling light
 * took that file to its limit; the sack it hangs from stays there.
 */

/** How far across a lobe its light slides as the sack turns, in lobe radii. */
const LIGHT_SLIDE = 0.18;

/** The lobe's light idling on its own between turns, in lobe radii and
 * radians a second. The skin wobbles on `time * 0.5` (`gorge-lobe.ts`) and the
 * sack's turn only moves the light when the sack itself turns, so without this
 * a lobe breathes under a highlight painted on (`docs/style-guide.md`'s "Depth
 * on a body that already ships"). On its own rate, and phased by the lobe's
 * seed so the row does not wobble in step. */
const LOBE_LIT_WOBBLE = 0.06;
const LOBE_LIT_WOBBLE_RATE = 0.31;

/** One lobe's standing, for `paintLobeSkin`. */
export interface LobeSkin {
  x: number;
  cy: number;
  rx: number;
  ry: number;
  tile: number;
  /** The colour lit in its floor: the beads', the fire's, or the skin's own. */
  floor: string;
  floorAlpha: number;
  /** A full lobe's rim, lit up the whole wall; `null` while it is not full. */
  wall: string | null;
  wallAlpha: number;
  /** A full lobe is transparent: no wash of skin over the beads. */
  full: boolean;
  /** The sack's turn, -1..1: the light slides across the lobe as it goes. */
  turn: number;
  /** Wall-clock seconds and the lobe's own seed, for the light's idle. */
  time: number;
  seed: number;
}

export function paintLobeSkin(ctx: CanvasRenderingContext2D, body: Path2D, k: LobeSkin): void {
  const { x, cy, rx, ry, tile } = k;
  ctx.save();
  if (!k.full) {
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = PALETTE.hull;
    ctx.fill(body);
    ctx.globalAlpha = 1;
  }
  ctx.clip(body);
  const drift = LOBE_LIT_WOBBLE * Math.sin(k.time * LOBE_LIT_WOBBLE_RATE + k.seed * 1.7);
  const slide = LIGHT_SLIDE * k.turn - drift;
  const lx = x - rx * (0.35 - slide);
  const shade = ctx.createRadialGradient(lx, cy - ry * (0.45 + drift * 0.8), 0, x, cy, ry * 1.2);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, k.full ? 0.12 : 0.22));
  shade.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.7, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, k.full ? 0.2 : 0.45));
  ctx.fillStyle = shade;
  ctx.fill(body);
  ctx.lineJoin = "round";
  if (k.wall !== null) {
    ctx.lineWidth = tile * 0.16;
    ctx.strokeStyle = k.wall;
    ctx.globalAlpha = k.wallAlpha;
    ctx.stroke(body);
  }
  // The floor, where the beads sit: their colour pooled in it and lit, soft,
  // in the wall's lower half. A narrow stroke was drawn first and read as a
  // cup drawn round the beads.
  const fy = cy + ry;
  const pool = ctx.createRadialGradient(x, fy, 0, x, fy, ry * 1.1);
  pool.addColorStop(0, rgba(k.floor, 0.55 * k.floorAlpha));
  pool.addColorStop(1, rgba(k.floor, 0));
  ctx.fillStyle = pool;
  ctx.fill(body);
  ctx.beginPath();
  ctx.rect(x - rx * 2, cy + ry * 0.1, rx * 4, ry * 2);
  ctx.clip();
  ctx.lineWidth = tile * 0.18;
  ctx.strokeStyle = k.floor;
  ctx.globalAlpha = 0.5 * k.floorAlpha;
  ctx.stroke(body);
  ctx.restore();
  shine(ctx, x - rx * (0.38 - slide), cy - ry * 0.48, rx * 0.26, ry * 0.1, 0.35);
}

/**
 * The lobe's rim: the light from behind the sack caught on the edge turned
 * away from the key, and nowhere else — a line all the way round would be the
 * outline this skin replaced. It slides with the sack's turn, as the lit
 * shoulder does, the other way.
 */
export function paintLobeRim(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  rx: number,
  tile: number,
  turn: number,
  alpha: number,
): void {
  if (alpha <= 0) return;
  const edge = x + rx * LIGHT_SLIDE * turn;
  const rim = ctx.createLinearGradient(edge - rx * 0.1, 0, edge + rx, 0);
  rim.addColorStop(0, rgba(PALETTE.sheenRim, 0));
  rim.addColorStop(1, rgba(PALETTE.sheenRim, 0.5 * alpha));
  ctx.save();
  ctx.clip(body);
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rim;
  ctx.lineWidth = tile * 0.08;
  ctx.lineJoin = "round";
  ctx.stroke(body);
  ctx.restore();
}
