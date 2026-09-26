import type { StrikeFrame } from "./boss-strike-look.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **THE LEDGER's own blow at the hull** (`boss-strike-look.ts`): the bill is
 * collected. Its cord is already rooted in the ship at the socket the blow
 * lands on (`ledger-shape.ts`), so nothing is thrown down the field. The
 * cord yanks, and the plate the socket is set in is wrenched up off the hull
 * toward the body, in the body's own dark metal, bares a red hole under it,
 * spits its rivets, and slams back down.
 */

/** The plate's half-width and thickness, in tiles. */
const HALF = 0.62;
const THICK = 0.2;
/** How far the plate is wrenched up at the top of the yank, in radians. */
const LIFT = 0.75;
const RIVETS = 4;

export function ledgerBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const yank = 1 - (1 - f.reach) ** 3;
  // Up, then slammed back down faster than it came.
  const angle = LIFT * yank * (1 - Math.min(1, f.after * 2.2));
  // It lifts on the side the cord pulls from, hinged on the far edge.
  const side = from.x >= to.x ? 1 : -1;
  // Set into the skin, not on it: half the plate below the surface line.
  const hinge = { x: to.x - side * HALF * tile, y: to.y + THICK * tile * 0.5 };
  // Seen only once it is off the hull: flat, it is just the plating.
  const shown = fade * Math.min(1, angle / (LIFT * 0.2));
  ctx.save();
  // The hole it leaves: the ship's inside, lit red.
  ctx.fillStyle = rgba(PALETTE.red, 0.85 * fade * Math.min(1, angle / (LIFT * 0.3)));
  ctx.beginPath();
  ctx.ellipse(to.x, hinge.y, HALF * tile * 0.9, tile * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  // The plate, turned up about its hinge.
  ctx.translate(hinge.x, hinge.y);
  ctx.rotate(-side * angle);
  const plate = new Path2D();
  const x0 = side > 0 ? 0 : -2 * HALF * tile;
  plate.roundRect(x0, -THICK * tile, 2 * HALF * tile, THICK * tile, tile * 0.05);
  ctx.fillStyle = rgba(PALETTE.sheenDeep, shown);
  ctx.fill(plate);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, shown);
  ctx.lineWidth = tile * 0.05;
  ctx.stroke(plate);
  // The socket's own ring, still in the plate.
  ctx.strokeStyle = rgba(PALETTE.hullRim, shown);
  ctx.beginPath();
  ctx.arc(side * HALF * tile, -THICK * tile * 0.5, tile * 0.08, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  // The rivets, spat toward the body and falling back.
  if (f.reach >= 1) {
    const t = Math.min(1, f.after * 1.6);
    ctx.fillStyle = rgba(PALETTE.sheenRim, 1 - t);
    for (let i = 0; i < RIVETS; i++) {
      const a = -Math.PI / 2 + side * (0.25 + 0.3 * i);
      const d = tile * (0.6 + 0.35 * i) * t;
      const x = to.x + Math.cos(a) * d;
      const y = to.y + Math.sin(a) * d + 1.8 * tile * t * t;
      ctx.beginPath();
      ctx.arc(x, y, tile * 0.07, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The slam: a ring along the plating once it is back down.
  const slam = (f.after - 0.45) / 0.55;
  if (slam > 0) {
    ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.9 * (1 - slam));
    ctx.lineWidth = tile * 0.08;
    ctx.beginPath();
    ctx.ellipse(
      to.x,
      to.y,
      tile * (0.7 + 1.3 * slam),
      tile * (0.14 + 0.24 * slam),
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }
  ctx.restore();
}
