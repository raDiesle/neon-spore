import { type Creature, type SimConfig, wispTileAt } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type WispJump, wispApexTiles } from "./wisp.js";

const TAU = Math.PI * 2;

/**
 * Where a wisp is going, drawn on the one screen that may know: the dotted arc
 * and the square at the end of it.
 *
 * **The mark is never absent and never wrong.** `wispNext` is rolled the
 * moment the body lands (`sim/wisp.ts`), so the square of the *next* jump is
 * on the screen from the instant the last one ends — a whole dwell to read
 * two characters, say them, be heard, and have a cannon put on the tile before
 * anything arrives on it. It used to appear only while the thing was in the
 * air, which gave the navigator one beat, and one beat is the length of the
 * sentence rather than the length of an exchange.
 *
 * The leg it draws is the same sentence read from two ends. Mid-jump the body
 * is already assigned to its landing tile, so the leg runs from where it left
 * to where it is; standing on a tile, the leg runs from where it stands to
 * where it has not gone yet. Nothing else differs between the two.
 *
 * Its own file rather than more of `wisp-ground.ts` because the subjects had
 * come apart: that one is what the *body* leaves on the field — the pool of
 * light under it, the shock when it lands — and this is what the navigator is
 * told about a tile nothing is standing on. Behind `showsWisp` either way, and
 * `drawCreatures` asks that gate once for both.
 */

/** How high the arc's own drawn curve rises, as a share of what the body
 * rises. Slightly under, so the dotted line reads as the *floor* of the flight
 * and the body is seen to travel over it rather than along it. */
const ARC_LIFT = 0.92;

/**
 * The arc and the square, for one wisp.
 *
 * Draws nothing at all on the arrival and only on the arrival: a wisp has no
 * `wispNext` until it has taken one beat, and a mark drawn to a tile nobody
 * has rolled would be a mark naming column zero.
 */
export function drawAim(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  j: WispJump,
  beatPhase: number,
): void {
  const leg = jumpLeg(l, cfg, c, j);
  if (!leg) return;
  drawArc(ctx, l, leg.from, leg.to, j.flight, beatPhase, wispApexTiles(c));
  drawTarget(ctx, l, leg.to, j.flight, j.flying);
}

/**
 * The two tiles the arc runs between this frame, or null when there is nothing
 * to draw one to.
 *
 * Null is the arrival and only the arrival: a wisp has no `wispNext` until it
 * has taken one beat, and a mark drawn to a tile nobody has rolled would be a
 * mark naming column zero. Every other frame of this creature's life has a leg.
 */
function jumpLeg(
  l: Layout,
  cfg: SimConfig,
  c: Creature,
  j: WispJump,
): { from: { x: number; y: number }; to: { x: number; y: number } } | null {
  const at = (col: number, row: number): { x: number; y: number } => ({
    x: tileCX(l, col),
    y: tileCY(l, row),
  });
  if (j.flying) {
    return { from: at(c.fromCol ?? c.col, c.fromRow), to: at(c.col, c.row) };
  }
  if (c.wispNext === undefined) return null;
  const next = wispTileAt(cfg, c.wispNext);
  return { from: at(c.col, c.row), to: at(next.col, next.row) };
}

/**
 * The arc it is going to fly, from the tile it left to the tile it is going
 * to, dashed and drifting the way a dart's legs drift.
 *
 * **It is the answer to the question the jump asks and the reason the jump is
 * worth having.** A body that blinked out and back in gave player 2 one tile
 * to read, at the instant it arrived. A body that visibly crosses gives them a
 * whole beat of *knowing where it is going before it gets there* — long enough
 * to say a letter and a number while it is still in the air, so the cannon can
 * already be on the tile when it lands. That is not a courtesy: the simulation
 * has the body on the landing tile from the top of the beat (`sim/wisp.ts`),
 * so a shot at the named tile connects mid-flight. The line is drawing what is
 * already true.
 *
 * Quadratic and not the sine the body flies, and they are not meant to match
 * exactly: the curve is a hint under the movement, and a dotted line lying
 * exactly along a body's path is a line the body hides.
 */
function drawArc(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  from: { x: number; y: number },
  to: { x: number; y: number },
  flight: number,
  beatPhase: number,
  apexTiles: number,
): void {
  const dash = l.tile * 0.16;
  ctx.save();
  ctx.strokeStyle = PALETTE.wispRim;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.2, l.tile * 0.045);
  // Brightest as it leaves and fading as it arrives: what the line is for is
  // over once the pair has read the tile off it.
  ctx.globalAlpha = 0.55 * (1 - flight * 0.55);
  ctx.setLineDash([dash * 0.3, dash]);
  // Drifting toward the landing tile at the beat's pace, for `drawLegs`'
  // reason: a still dotted line reads as a wall, and the one thing this line
  // has to say is *this way*.
  ctx.lineDashOffset = -beatPhase * dash * 4;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  // How much the drawn curve bows, in tiles: the full apex once the jump
  // crosses a couple of columns, and nothing at all when it goes straight up
  // its own column. A quadratic whose two ends share an x degenerates — it
  // becomes a line drawn twice, running off the top of the field and back —
  // which is a picture of nothing. The body still arcs; on an in-column jump
  // the guide is simply the straight run to the tile, which is the honest
  // drawing of a hop that does not go anywhere sideways.
  const across = Math.min(1, Math.abs(to.x - from.x) / (l.tile * 2));
  // The control point of a quadratic sits at twice the height the curve
  // reaches, hence the doubling. The whole curve is drawn from the first frame
  // of the flight and does not grow with the body: it is the *path*, and a
  // path that arrived a piece at a time would be a trail — which says where it
  // has been, when the only thing worth saying is where it is going.
  ctx.quadraticCurveTo(
    (from.x + to.x) / 2,
    (from.y + to.y) / 2 - l.tile * apexTiles * ARC_LIFT * 2 * across,
    to.x,
    to.y,
  );
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.restore();
}

/**
 * The tile it is going to land on, marked while it is in the air.
 *
 * **A square and not a body, which is where this parts company with the
 * dart.** `dart-path.ts` draws its preview as the body itself, hollow, because
 * "a dart is going to be here" is what that pair says out loud and a
 * dart-shaped hole says it. What *this* pair says out loud is two characters
 * off a lettered grid, and the thing those two characters name is a square.
 * So the mark is the square: the same tile the lattice under it has already
 * drawn, brought up bright, with a ring at its centre for the body to come
 * down into. A blob-shaped hole would be a picture of the creature where a
 * picture of the *tile* is what has to be read.
 *
 * It grows brighter as the body falls toward it, which is the only urgency
 * this creature has: the call is worth less the later it is made.
 */
function drawTarget(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  to: { x: number; y: number },
  flight: number,
  flying: boolean,
): void {
  // How close the thing is to standing here: 0 the moment it is rolled, 1 the
  // moment it arrives. It brightens across the flight and nothing else — the
  // dwell is deliberately flat, because a mark that faded up over five beats
  // would be least readable exactly when the pair has most time to use it.
  const near = flying ? 0.35 + 0.65 * flight : 0.35;
  const half = l.tile * 0.46;
  const dash = l.tile * 0.2;
  ctx.save();
  ctx.strokeStyle = PALETTE.wispRim;
  ctx.lineWidth = Math.max(1.4, l.tile * 0.05);
  ctx.globalAlpha = 0.3 + 0.55 * near;
  ctx.setLineDash([dash * 0.5, dash * 0.4]);
  ctx.strokeRect(to.x - half, to.y - half, half * 2, half * 2);
  ctx.setLineDash([]);

  // The ring it comes down into, closing as it falls — the one part of this
  // mark that moves, so an eye that has already read the letter still knows
  // how long is left.
  ctx.strokeStyle = PALETTE.wisp;
  ctx.globalAlpha = 0.45 + 0.45 * near;
  ctx.beginPath();
  ctx.ellipse(to.x, to.y, half * (0.66 - 0.3 * near), half * (0.24 - 0.1 * near), 0, 0, TAU);
  ctx.stroke();
  ctx.restore();

  halo(ctx, to.x, to.y, l.tile * 0.8, PALETTE.wisp, 0.1 + 0.2 * near);
}
