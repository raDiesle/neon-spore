import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE GORGE is made of**: a sack of wet membrane, thin enough to see
 * through, veined, lit along its top and gone to the deep underneath, with a
 * lobe of the same skin over every column and a puckered mouth under each.
 * It is no longer a grey fill with a glowing line drawn round it, which is the
 * one picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `gorge-draw.ts` and `gorge-lobe.ts`, which decide *what* the sack
 * says — how far it has sunk, which lobe is full, which is the mouth — so they
 * stay about the fight and this one about the material. The beads are
 * THE BATON's drops (`baton-flesh.ts`), called rather than drawn again; the
 * intake's pucker and a pierced lobe's flaps are `gorge-flesh-torn.ts`.
 *
 * **The line round a lobe was carrying its colour, and still does, from
 * inside.** A lobe with beads in it has their colour lit in its floor, where
 * they sit. A full lobe has its rim lit up the wall, and the mouth has the
 * fire's. An empty lobe is only skin. The colours go in plain and the
 * strength in the alpha, so the tests find each of them on the op log.
 *
 * **Every width is off the tile**, never off a lobe's radius: a full lobe
 * swells and the sack breathes, and a width that followed them would be a
 * new width on every frame.
 */

/** How far across a lobe its light slides as the sack turns, in lobe radii. */
const LIGHT_SLIDE = 0.18;

/** Where the sack hangs: `gorge-draw.ts`' `gorgeSackBox`, and the tile. */
export interface Sack {
  x: number;
  y: number;
  rx: number;
  ry: number;
  tile: number;
}

/**
 * The sack's skin, with a vein down between every two lobes. `lobes` is where
 * each lobe stands, and `intakeY` the line they hang from.
 */
export function paintSack(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Sack,
  breath: number,
  lobes: number[],
  intakeY: number,
): void {
  const { tile } = s;
  ctx.save();
  ctx.globalAlpha = 0.14 + 0.05 * breath;
  ctx.fillStyle = PALETTE.dim;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const under = ctx.createLinearGradient(0, s.y - s.ry, 0, s.y + s.ry);
  under.addColorStop(0.45, rgba(PALETTE.sheenDeep, 0));
  under.addColorStop(1, rgba(PALETTE.sheenDeep, 0.4));
  ctx.fillStyle = under;
  ctx.fill(body);
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = Math.max(1, tile * 0.025);
  ctx.globalAlpha = 0.3 + 0.15 * breath;
  for (let i = 0; i + 1 < lobes.length; i++) {
    const a = lobes[i] ?? 0;
    const mid = (a + (lobes[i + 1] ?? a)) / 2;
    const lean = (i % 2 === 0 ? 1 : -1) * tile * 0.12;
    ctx.beginPath();
    ctx.moveTo(mid - lean, s.y - s.ry * 0.85);
    ctx.quadraticCurveTo(mid + lean, s.y - s.ry * 0.2, mid, intakeY - tile * 0.15);
    ctx.stroke();
  }
  // Its thickness where it turns away over the top, lit from inside.
  topWall(ctx, body, s, PALETTE.dim, 0.4 + 0.2 * breath);
  ctx.restore();
  shine(ctx, s.x - s.rx * 0.6, s.y - s.ry * 0.62, s.rx * 0.13, s.ry * 0.1, 0.25);
}

/** The skin alone once the beam has ended it, going out over `fade`. */
export function paintSackGone(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Sack,
  fade: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.1 * fade;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  topWall(ctx, body, s, PALETTE.rock, 0.2 + 0.4 * fade);
  ctx.restore();
}

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
  const lx = x - rx * (0.35 - LIGHT_SLIDE * k.turn);
  const shade = ctx.createRadialGradient(lx, cy - ry * 0.45, 0, x, cy, ry * 1.2);
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
  shine(ctx, x - rx * (0.38 - LIGHT_SLIDE * k.turn), cy - ry * 0.48, rx * 0.26, ry * 0.1, 0.35);
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

/** The sack's upper wall lit from inside: the body stroked wide over its top half. */
function topWall(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Sack,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(s.x - s.rx * 2, s.y - s.ry * 2, s.rx * 4, s.ry * 1.6);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = s.tile * 0.12;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}

/** The wet film: a soft bloom and a hard point at its upper-left end. */
function shine(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  a: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
  ctx.beginPath();
  ctx.arc(x - rx * 0.4, y - ry * 0.2, Math.max(0.8, ry * 0.45), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
