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
 * THE BATON's drops (`baton-drop.ts`), called rather than drawn again; a
 * lobe's own skin is `gorge-lobe-skin.ts`, and the intake's pucker and a
 * pierced lobe's flaps are `gorge-flesh-torn.ts`.
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

/**
 * The veins between the lobes, alive on a clock of their own: how far a vein's
 * lean sways, as a share of its lean; how much its strength rises and falls;
 * and how fast, in radians a second. Every other term on the sack is the beat's
 * breath, which the whole sack takes at once, so the skin read as a thing
 * pumped rather than a thing alive. Each vein is phased by its place, so a
 * pulse runs along the row instead of every vein lighting at once.
 */
const VEIN_SWAY = 0.25;
const VEIN_PULSE = 0.1;
const VEIN_RATE = 0.7;

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
 * each lobe stands, `intakeY` the line they hang from, and `time` wall-clock
 * seconds, for the veins' own clock.
 */
export function paintSack(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Sack,
  breath: number,
  time: number,
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
  for (let i = 0; i + 1 < lobes.length; i++) {
    const a = lobes[i] ?? 0;
    const mid = (a + (lobes[i + 1] ?? a)) / 2;
    const pulse = Math.sin(time * VEIN_RATE - i * 1.3);
    ctx.globalAlpha = 0.3 + 0.15 * breath + VEIN_PULSE * pulse;
    const lean = (i % 2 === 0 ? 1 : -1) * tile * 0.12 * (1 + VEIN_SWAY * pulse);
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
export function shine(
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
