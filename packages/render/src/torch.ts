import { crystalPath, METEOR } from "@neon-spore/content";
import { type Creature, colSpan, spanOf } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { type Layout, tileCY } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { TORCH_LOOK } from "./torch-look.js";

/**
 * How far a **full-width** torch's radius reaches, in tiles.
 *
 * The kind's own width and not a body's, which is the whole of what this is
 * for: it answers for the fixtures — the queen's sockets, the shape sheet, the
 * director's cards — where there is no creature to ask and a torch is the
 * two-tile thing the name has always meant. A torch actually standing in the
 * field is asked `rockRadius(l, spanOf(c))` instead, because its width is
 * authored now (`RockSize`) and a one-tile torch is a thing a wave may write.
 */
export function torchRadius(l: Layout): number {
  return rockRadius(l, colSpan("torch"));
}

/**
 * A rock's own radius, torch or plain tier alike — the one place both
 * `drawMeteor` (creatures.ts) and every impact/crater visual read it from, so
 * a crater is never sized by a copy of the number its own rock draws at.
 *
 * It takes the **span** rather than the kind, and that is the whole of what a
 * rock's size means on screen: a one-tile rock reaches 0.4 of a tile, a
 * two-tile one reaches 0.8 and fills the 2x2 square. The torch used to be the
 * only wide rock and had a number of its own here; it is now simply the rock
 * whose span is two, and the plain tiers reach the same width whenever a wave
 * authors them that way (`RockSize`, sim/kinds.ts).
 */
export function rockRadius(l: Layout, span = 1): number {
  return rockTileRadius(l.tile, span);
}

/**
 * The same rule, asked with a **tile width** rather than a whole layout —
 * for `DeflectFx`, which is handed one number and no layout at all. It is the
 * one place the arithmetic lives: a bounced rock sized by a second copy of
 * `0.4` is how a two-tile rock came to shrink to one the moment the shield
 * turned it, which is exactly the defect this seam repairs.
 */
export function rockTileRadius(tile: number, span = 1): number {
  return tile * 0.4 * span;
}

/**
 * The rock's own facing, from its screen x alone — deterministic and
 * shared between `rock-impact.ts`'s embedded rock and `scars.ts`'s dent in
 * the hull it left, so the two are drawn at the exact same orientation and
 * the dent reads as a hole this exact rock made, not a generic one.
 */
export function torchRotation(x: number): number {
  return (x * 0.37) % (Math.PI * 2);
}

/**
 * The tail: an ember streak from the top of the field down to wherever the
 * torch is now, so a fall fast enough to otherwise read as a blink still
 * reads as a fall. `alpha` scales the whole thing down, for the effect that
 * keeps the tail alive a moment after the torch itself is gone
 * (`rock-impact.ts`) instead of it vanishing the instant the creature does.
 * `from` is where the streak starts when it is not the top of the field: the
 * dome a rock out of THE COIL was thrown from (`coil-flight.ts`), on whatever
 * line that makes.
 */
export function drawTorchTail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  alpha = 1,
  from?: { x: number; y: number },
): void {
  const x0 = from ? from.x : x;
  const y0 = from ? from.y : tileCY(l, 0);
  const len = Math.hypot(x - x0, y - y0);
  if (len < 1e-3) return;
  // Across the streak, a unit to the left of the way it is going.
  const nx = -(y - y0) / len;
  const ny = (x - x0) / len;
  const tailGrad = ctx.createLinearGradient(x0, y0, x, y);
  tailGrad.addColorStop(0, "rgba(255,122,47,0)");
  tailGrad.addColorStop(0.75, `rgba(255,122,47,${0.1 * alpha})`);
  tailGrad.addColorStop(1, `rgba(255,122,47,${0.3 * alpha})`);
  ctx.save();
  ctx.fillStyle = tailGrad;
  ctx.beginPath();
  ctx.moveTo(x0 + nx * r * 0.12, y0 + ny * r * 0.12);
  ctx.lineTo(x0 - nx * r * 0.12, y0 - ny * r * 0.12);
  ctx.lineTo(x - nx * r * 0.9, y - ny * r * 0.9);
  ctx.lineTo(x + nx * r * 0.9, y + ny * r * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * The rock itself: the ember ring, then the same crystal shape and stone-grey
 * fill as a plain meteor. Assumes `ctx` is already translated to the rock's
 * centre and rotated. Shared with `rock-impact.ts`'s fall-replay for every
 * rock kind, and the torch's own embed-and-drift on top of that, so a
 * bounced or embedded rock is unmistakably the same thing that fell.
 *
 * `ember` is the ring, and it belongs to the torch alone — it is the flame
 * this rock is named for. A plain meteor has none anywhere else it is drawn
 * (`drawMeteor`, meteor.ts), so leaving it on here made a grey rock grow an
 * orange outline in the last moment of its fall, which is exactly what the
 * owner saw. It defaults on because the queen's sockets and the director's
 * holders draw torches, and a torch is what this function is for.
 */
export function drawTorchRock(
  ctx: CanvasRenderingContext2D,
  r: number,
  time: number,
  ember = true,
): void {
  const stone = (): void => drawStone(ctx, r, time);
  // The flame decides where the stone goes, because a flame with a far side
  // needs half of itself under an opaque rock (`torch-look.ts`). A rock with no
  // flame is drawn by itself, exactly as it was when the ring was an `if`.
  if (ember) TORCH_LOOK.flame({ ctx, r, time, stone });
  else stone();
}

/** The stone: the crystal contour, the stone-grey fill and the rock outline —
 * every rock in the game, torch or plain tier. Split off `drawTorchRock` so a
 * candidate flame can put it down in an order of its own choosing; not one
 * value in it moved. */
function drawStone(ctx: CanvasRenderingContext2D, r: number, time: number): void {
  const d = crystalPath(
    0,
    0,
    r,
    r,
    METEOR.sides,
    METEOR.depth,
    METEOR.wobble,
    time * 0.15,
    METEOR.seed,
  );
  const path = new Path2D(d);

  const rg = ctx.createLinearGradient(-r, -r, r, r);
  rg.addColorStop(0, "#9DA3B0");
  rg.addColorStop(0.55, "#6B707E");
  rg.addColorStop(1, PALETTE.rockDark);
  ctx.fillStyle = rg;
  ctx.fill(path);
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke(path);
}

/**
 * The torch: a rock, not a different material — the same crystal shape and
 * the same stone-grey fill as a plain meteor (`METEOR`, `drawMeteor` in
 * `creatures.ts`), so the pair reads it as the rock family at a glance, plus a
 * faint second ring in the tail's old colour — the one trace it keeps of the
 * flame it used to carry. Craters from shots place the same way a meteor's do.
 *
 * **It is drawn at the width the body is carrying, not at the kind's.** A
 * torch was two tiles and nothing else, and a wave may now author a one-tile
 * one — the coil's dome leaves exactly that when it comes off (`sim/coil.ts`),
 * and the director offers the width on any torch an author places. Everything
 * about the picture is unchanged at either width: same shape, same tail, same
 * facing, same ring. What is different is what the pair can put a plate over,
 * which is why the width has to come off `spanOf` here rather than off the
 * name — a one-tile torch drawn two wide is a rock hanging over a lane the
 * shield does not have to cover.
 *
 * It is also the fastest thing in the field (`fallTilesPerBeat` in
 * sim/types.ts), which on its own would read as a blink rather than a fall —
 * so it drags a tail the length of however far it has already dropped, from
 * the top of the field down to where it is now. The whole point is
 * legibility at speed: even a glance that lands mid-fall reads the streak as
 * "this came from up there," not just "something is here."
 *
 * What it does *not* do is turn. A rock spinning on its way down reads as
 * tumbling through the frame rather than dropping straight at one column,
 * and the pair calls columns. It holds one facing the whole way — the facing
 * `torchRotation` derives from its column, which is the same one the
 * embedded rock and its crater use, so nothing snaps round at the moment it
 * lands.
 */
export function drawTorch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
  /** Where its streak starts when it was thrown rather than fell: the dome
   * a rock out of THE COIL left (`coil-flight.ts`). */
  tailFrom?: { x: number; y: number },
): void {
  const r = rockRadius(l, spanOf(c));
  // No travel this beat, no trail: the beat a torch breaks off the queen it
  // stands still in the socket it grew in (`spit`, sim/boss.ts), and a streak
  // running off the top of the field behind it would read as a fall that has
  // not started yet.
  if (tailFrom) drawTorchTail(ctx, l, x, y, r, 1, tailFrom);
  else if (c.row !== c.fromRow) drawTorchTail(ctx, l, x, y, r);

  drawTorchStone(ctx, l, c, x, y, time);
}

/**
 * The torch without its tail: the burning stone, its craters and its glow.
 * What THE COIL is drawn as *inside* the dome (`creature-body.ts`) — the
 * owner's ask, *when it has a shield it is already looking like a torch
 * inside* — so that what comes out of a dome is seen to be the thing that
 * was in it. A coil crosses the field and has no fall for a tail to be about.
 */
export function drawTorchStone(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  time: number,
): void {
  const r = rockRadius(l, spanOf(c));
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(torchRotation(x));

  drawTorchRock(ctx, r, time);

  for (let k = 0; k < c.holes; k++) {
    const a = ((k * 2.399) % (Math.PI * 2)) + (c.id % 5) * 0.4;
    const dist = 0.3 + ((k * 7 + c.id) % 10) / 28;
    const hx = Math.cos(a) * r * dist;
    const hy = Math.sin(a) * r * dist;
    ctx.fillStyle = "#17181D";
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(199,203,214,.5)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();

  halo(ctx, x, y, r * 1.6, PALETTE.rock, 0.1);
  halo(ctx, x, y, r * 2, PALETTE.ember, 0.08);
}
