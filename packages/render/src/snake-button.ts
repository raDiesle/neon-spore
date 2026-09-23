import type { ControlId } from "@neon-spore/content";
import { type SnakeState, snakeGrip, snakeResting, snakeRound, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawNose, drawSwing } from "./scout-button.js";
import type { SeatSkin } from "./seat-skin.js";
import { flick, gape } from "./snake-clock.js";
import { drawSnakeHead } from "./snake-head.js";

/**
 * SNAKE's four presses, as faces on the band's own lobes.
 *
 * The round used to draw a slab panel of its own, and the owner asked for its
 * buttons to look like the others (18 September 2026). So the four are `lobe`
 * controls in the sockets `band-control.ts` puts every control in, exactly as
 * THE SCOUT's and THE PULSE's are, and this file draws only what is *on* each
 * face. The socket, the gloss and the tissue around it are not its business.
 *
 * **Player 2's two carry the heading, live.** Each turn shows the way the
 * body is actually going — read off the round, never animated here — with an
 * arc round it saying which way the button swings it, which is THE SCOUT's
 * nose on THE SCOUT's own call. A turn already queued lights its button until
 * the body takes it, so the driver can see the press was heard before the
 * head moves.
 *
 * **Player 1's two carry the head itself.** FIRE is the head with a bolt of
 * venom standing off its snout, and the bolt fades while the trigger rests;
 * MAW is the same head with its jaws at the gape the mouth is actually at
 * (`snake-clock.ts`), lit amber for as long as it stands open — the button
 * *is* the mouth, the way THE SCOUT's MAW is the ship's intake. Both are drawn
 * by the head's own drawer, so the thing under the thumb and the thing on the
 * arena are the same picture at two sizes.
 *
 * **MAW goes dark once the jaws stick.** Past `snakeGorgeTiles` the press is
 * refused outright and the mouth is prised open on the body instead
 * (`sim/snake-controls.ts`). The head on the face still shows the gape, since
 * the mouth can still stand open, but the halo and the fill that say *press
 * me* are gone (`snakeMawLit`).
 */

export type SnakeLobe = "left" | "right" | "fire" | "maw";

/** Which of SNAKE's four this control is, if any. */
export function snakeLobeOf(id: ControlId): SnakeLobe | null {
  if (id === "snakeLeft") return "left";
  if (id === "snakeRight") return "right";
  if (id === "snakeFire") return "fire";
  if (id === "snakeMaw") return "maw";
  return null;
}

/** The head on a button, as an arena whose one tile is this share of the
 * radius: the head's drawer sizes everything off the tile. */
const HEAD_TILE = 1.15;

export function drawSnakeLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  which: SnakeLobe,
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const round = snakeRound(world);
  const live = round !== null && round.phase === "play";
  if (which === "left" || which === "right") {
    const dir = which === "left" ? -1 : 1;
    const on = live && round.turn === dir;
    const hex = PALETTE.hull;
    if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
    ctx.fillStyle = on ? hex : skin.dead[0];
    ctx.strokeStyle = hex;
    ctx.lineWidth = STROKE.outline;
    paintLobe(ctx, x, y, r, "both");
    const ink = on ? "#1B0630" : hex;
    // The grid's heading as the nose's sine and cosine: a column step is the
    // sine and a row step up is the cosine, which is what "straight up is
    // zero, clockwise is positive" comes to on a grid.
    drawNose(ctx, x, y, r, ink, round?.dirCol ?? 0, -(round?.dirRow ?? -1));
    drawSwing(ctx, x, y, r, ink, dir);
    return;
  }
  const open = which === "maw" && live ? gape(world.cfg, world.tick, round) : 0;
  const lit = open > 0 && snakeMawLit(world);
  const hex = which === "maw" ? PALETTE.pod : PALETTE.venom;
  if (lit) halo(ctx, x, y, r * 1.8, hex, 0.5);
  ctx.fillStyle = lit ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  const tile = r * HEAD_TILE;
  const arena = { x: 0, y: 0, tile, cols: 1, rows: 1 };
  // The head sits a shade low so the venom ahead of it, or the open jaws,
  // stand in the middle of the face.
  const headY = y + (which === "fire" ? r * 0.28 : r * 0.1);
  if (which === "fire")
    drawVenom(ctx, x, y, r, live && round !== null ? restLeft(world, round) : 1);
  drawSnakeHead(ctx, arena, { x, y: headY }, 0, -1, open, flick(world.tick));
}

/**
 * Whether the MAW face is lit: the round in play and its press still answered.
 * The mouth's own gape says whether it is open. This says only whether the
 * button under the thumb is the thing that opened it.
 */
export function snakeMawLit(world: World): boolean {
  const round = snakeRound(world);
  return round !== null && round.phase === "play" && snakeGrip(world.cfg, round) === "crawl";
}

/** How much of the trigger's rest is still to run, 0 ready to 1 just fired. */
function restLeft(world: World, round: SnakeState): number {
  if (!snakeResting(world, round)) return 0;
  const since = world.beat - round.shotBeat;
  return Math.max(0, Math.min(1, 1 - since / world.cfg.snakeFireRestBeats));
}

/**
 * The bolt ahead of the snout: two chevrons of venom pointing up and out of
 * the face, the further one fainter — PINBALL's muzzle in the snake's own
 * colour. They fade with the rest, so a trigger that will refuse the press
 * shows an empty snout, and come back as the rest runs out.
 */
function drawVenom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rest: number,
): void {
  const strength = 1 - rest;
  if (strength <= 0.02) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.venom;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let i = 0; i < 2; i++) {
    const cy = y - r * (0.22 + i * 0.26);
    const half = r * 0.3;
    const dip = r * 0.16;
    ctx.globalAlpha = (i === 0 ? 0.95 : 0.5) * strength;
    ctx.lineWidth = Math.max(1.2, r * (i === 0 ? 0.13 : 0.1));
    ctx.beginPath();
    ctx.moveTo(x - half, cy + dip);
    ctx.lineTo(x, cy);
    ctx.lineTo(x + half, cy + dip);
    ctx.stroke();
  }
  ctx.restore();
}
