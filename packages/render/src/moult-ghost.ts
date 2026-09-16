import { moultBeatsToTurn, moultNextIsPod, spanOf } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { mixHex } from "./hex.js";
import type { Layout } from "./layout.js";
import { moultOutline } from "./moult-shape.js";
import { PALETTE } from "./palette.js";
import { rockRadius } from "./rock-size.js";

/**
 * **What it turns into next, and when** — the navigator's half of THE MOULT,
 * and the whole reason the pair have to talk on this creature.
 *
 * Every control this body answers to is the pilot's: the column the cannon is
 * parked in, the trigger that arms the dome, the mouth. So the seat that can
 * act cannot see what is coming, and the seat that can see it cannot act —
 * which makes the only winning move a sentence, said early enough to be acted
 * on. *Pod in two — open.*
 *
 * Two things are drawn and they answer the two halves of that sentence. The
 * **ghost** is the coming form's own contour, hollow, standing beside the
 * body: it says *what*. The **pips** under it count the beats until the turn:
 * they say *when*. Neither is on player 1's screen in any form — not dimmed,
 * not hinted — for the wisp's reason and the mine's: a half-share of a fact is
 * a fact that stops being worth saying out loud.
 *
 * It is a ghost rather than a second body on purpose. No fill, no glow, no
 * halo — a line and nothing else, at the size of a thing that is not here yet.
 * The one mistake this picture could make is reading as a *second arrival*
 * beside the first, and everything that would make it look like a body is
 * exactly what is left out of it.
 */

/** Whether this screen is shown the coming form. The rig sees it for
 * `showsWisp`'s reason: it is both halves at once on one screen. */
export function showsMoultNext(l: Layout): boolean {
  return l.role !== "p1";
}

/** How big the ghost is against the body it stands beside. Well under half: a
 * thing that has not happened is not competing with the thing that has. */
const GHOST_SHARE = 0.4;

/** How faint. A line that is read when looked for and not otherwise. */
const GHOST_ALPHA = 0.55;

export function drawMoultNext(b: Body): void {
  if (!showsMoultNext(b.l)) return;
  const { ctx, l, c, x, y, time, world } = b;
  const next = moultNextIsPod(world.cfg, world.waveBeat) ? 1 : 0;
  const body = rockRadius(l, spanOf(c));
  const r = body * GHOST_SHARE;
  // Up and to the right of the body, clear of it. Up, because the field runs
  // downward and anything below a falling body reads as where it is going.
  const gx = x + body * 1.25;
  const gy = y - body * 0.95;

  ctx.save();
  ctx.translate(gx, gy);
  ctx.scale(r, r);
  ctx.globalAlpha = GHOST_ALPHA;
  ctx.strokeStyle = mixHex(PALETTE.rock, PALETTE.pod, next);
  ctx.lineWidth = Math.max(1, r * 0.14) / r;
  ctx.stroke(moultOutline(next, time));
  ctx.restore();

  drawPips(b, gx, gy + r * 1.7, r, moultBeatsToTurn(world.cfg, world.waveBeat));
}

/**
 * The count, as pips rather than a numeral: one dot per beat still to run,
 * the last one going out on the beat it turns.
 *
 * Dots because this number is **said out loud and not read out**. A numeral is
 * a thing a seat looks at and reports; a short row of dots is a thing a seat
 * has already counted by the time it has seen it, which is what the navigator
 * needs at a glance while the rest of the field is still theirs to watch. The
 * mine's fuse ring is the same argument and the same picture bent round a
 * body, and the beat strip's own count is the third.
 */
function drawPips(b: Body, cx: number, cy: number, r: number, left: number): void {
  const { ctx } = b;
  const n = Math.max(0, left);
  if (n === 0) return;
  const gap = r * 0.52;
  const start = cx - (gap * (n - 1)) / 2;
  ctx.save();
  ctx.globalAlpha = GHOST_ALPHA;
  ctx.fillStyle = PALETTE.dim;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(start + i * gap, cy, Math.max(1, r * 0.13), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
