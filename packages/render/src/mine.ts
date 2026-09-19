import { type Creature, mineFuseLeft, mineSeenBy, type World } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { drawLivingBody } from "./creature-body-living.js";
import { flatRadius } from "./creature-place.js";
import { type Layout, seatOf } from "./layout.js";
import { PALETTE } from "./palette.js";
import { shipTopFoot } from "./ship-top-chrome.js";
import { fuseRow } from "./ship-top-rows.js";

/**
 * THE MINE, drawn: the body on one seat, the **count** on both.
 *
 * `showsWisp` next door is `role !== "p1"` and is a fact about the kind — a
 * wisp is the navigator's on every wave it is ever on. This gate cannot be,
 * because which seat is drawn a mine is the *arrival's* (`SpawnEntry.sees`),
 * so it is asked of the body rather than of the layout alone. Everything else
 * about the split is the wisp's, to the letter: the seat that is not drawn it
 * gets nothing that could be read as a place — not a dimmed body, not a ring,
 * not a lane — because the whole creature is that the square has to cross the
 * room in words.
 *
 * **The count is the one thing both seats get.** It has to be: the seat with
 * the finger is the seat the fuse is running against, and a deadline only the
 * other player can see is a deadline the pair cannot spend. So the seeing seat
 * gets it *on* the body, where it is also a pointer at the square, and the
 * blind seat gets it standing in a row along the top of the field, laid out by
 * index and never by column — `drawMineFuses` says why that matters more here
 * than anywhere else in the game.
 */

/** How many pips the ring is drawn with. It is the body's own fuse at full,
 * read off the configuration rather than fixed, so a director that turns
 * `mineFuseBeats` down is drawing the dial it turned. */
function fuseOf(world: World, c: Creature): { left: number; full: number } {
  return { left: mineFuseLeft(world.cfg, c), full: Math.max(1, world.cfg.mineFuseBeats) };
}

/**
 * Whether **this screen** is drawn this particular body. The rig sees every
 * one of them, for `showsWisp`'s reason: it is both halves at once on one
 * screen, and a rig that hid half the picture would be no rig.
 */
export function showsMine(l: Layout, c: Creature): boolean {
  if (l.role === "test") return true;
  return mineSeenBy(c) === seatOf(l.role);
}

/** Every mine on the field. Exported so the body pass and the flat pass ask
 * the same question once (`wisps`' reason). */
export function mines(world: World): Creature[] {
  return world.creatures.filter((c) => c.kind === "mine");
}

/**
 * The body, and the fuse round it.
 *
 * The body itself is the ordinary living draw — a mine is a blob with four
 * arms on it (`content/silhouettes-mine.ts`) and nothing about the contour is
 * special. What is drawn here rather than by the table is the **gate**, and
 * the ring, which is the only count in the game that is attached to a body
 * because it is the only one whose deadline belongs to somebody else.
 */
export function drawMineBody(b: Body): void {
  if (!showsMine(b.l, b.c)) return;
  drawLivingBody(b);
  const r = flatRadius(b.l, b.world.cfg, b.c, b.beatPhase);
  drawFuseRing(b.ctx, b.x, b.y, r * 1.7, fuseOf(b.world, b.c), b.c.color, b.time);
}

/**
 * The blind seat's count: one ring per mine this screen is **not** drawn,
 * standing in a row along the top of the field.
 *
 * **It is laid out by index and never by anything about the body.** Not the
 * column, not the row, not the order the bodies are standing in left to right
 * — every one of those is a share of the square, and a share of the square is
 * the whole thing this seat is not allowed to have. Two mines produce two
 * rings side by side in the middle of the strip, and which ring is which body
 * is a question the picture deliberately cannot answer: what the seat needs is
 * *how long*, and it needs it about each of them.
 *
 * The rings are sorted by what is left on them rather than by id, for the same
 * reason. An id is dealt out in arrival order and arrival order is a fact
 * about the field; the count is the only thing this seat may read, so it is
 * also the only thing that decides where a ring stands.
 *
 * **Which row they stand on is `ship-top-rows.ts`'s and not this file's.** It
 * was this file's, measured off the top of the field, and on a short screen
 * that put the whole ring on the siren's dial — `fuseRow` carries the defect
 * and the arithmetic. The row is the one thing here that is not about the
 * mine: everything the ship writes at the top of the screen is in one stack,
 * and this is the bottom of it.
 */
export function drawMineFuses(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  /** The foot of a plate over the top of the screen, when a rehearsal has one
   * up (`ViewState.clearTop`) — the chrome above these rings drops under it,
   * so they drop with it. */
  clearTop?: number,
): void {
  const blind = mines(world).filter((c) => !showsMine(l, c));
  if (blind.length === 0) return;
  const fuses = blind
    .map((c) => ({ ...fuseOf(world, c), color: c.color }))
    .sort((a, b) => a.left - b.left);
  const r = l.tile * 0.42;
  const gap = r * 2.6;
  const y = fuseRow(l, r, r + pipRadius(r), shipTopFoot(l, world, clearTop));
  const x0 = l.gridLeft + l.gridWidth / 2 - (gap * (fuses.length - 1)) / 2;
  for (const [i, f] of fuses.entries()) {
    drawFuseRing(ctx, x0 + gap * i, y, r, f, f.color, 0);
  }
}

/** How big one pip on a ring of radius `r` is. Named because the row the ring
 * stands on is worked out from how far it reaches, which is one of these past
 * the radius. */
function pipRadius(r: number): number {
  return Math.max(1, r * 0.17);
}

/**
 * A ring of pips: one per beat the fuse holds at full, lit for the beats left
 * and dark for the beats spent, with the next one to go breathing.
 *
 * Beats and not a bar, for the reason the number is in beats at all
 * (`SimConfig.mineFuseBeats`): the pair already has the count in the ear and
 * on the HUD, so a ring of six is a thing one of them can point at and say
 * *three*, where a shortening arc is a thing they would both have to estimate
 * separately and then argue about.
 */
function drawFuseRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fuse: { left: number; full: number },
  color: Creature["color"],
  time: number,
): void {
  const hex = color === "red" ? PALETTE.red : color === "cyan" ? PALETTE.cyan : PALETTE.wisp;
  const dim = PALETTE.sparkDim;
  const pip = pipRadius(r);
  // The breathing is on the pip about to go and on nothing else: a ring where
  // everything moved would be an alarm, and an alarm says *hurry* where this
  // has to say *how many*.
  const beat = 0.5 + 0.5 * Math.sin(time * 6);
  for (let i = 0; i < fuse.full; i++) {
    // Clockwise from the top, so a ring read at a glance counts the way a
    // clock does and the last pip to go is the one at twelve.
    const a = -Math.PI / 2 + (i / fuse.full) * Math.PI * 2;
    const lit = i < fuse.left;
    const next = i === fuse.left - 1;
    ctx.globalAlpha = lit ? (next ? 0.55 + 0.45 * beat : 1) : 0.35;
    ctx.fillStyle = lit ? hex : dim;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, pip, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
