import { blobPath } from "@neon-spore/content";
import { type TellState, tellCurrent, tellShivers, tellWindow } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { headerLift } from "./round-header.js";
import { drawRing, ringNode } from "./tell-ring.js";
import { showsTellColor, showsTellHand } from "./view-role.js";

/**
 * THE TELL's body: a blob at the top of the field with the ring on its skin,
 * and the two halves of the tell that only one seat each may see.
 *
 * **A blob and not a slab.** Every round before this drew slabs and glyphs,
 * because a round is machinery and the field is alive
 * (`docs/spec/interludes.md`). This one is a *boss with a body*, standing
 * where a boss always stands, on a screen the owner asked to look like the
 * field — so it is a closed contour with lobes like everything else the pair
 * shoots at, and the machinery in it is the ring drawn on its skin.
 *
 * **Three lobes, and they are the ring's own nodes.** `blobPath`'s lobe count
 * is three here rather than a number chosen by eye: the body has as many
 * swellings as the game has throws, and each swelling is where its throw is
 * drawn (`ringNode`). A body with four lobes would be promising a fourth
 * throw, which the arithmetic in `tell-rules.ts` says cannot exist.
 */

/** Where the name sits, as a share of the play height; everything under it hangs off that. */
export const TELL_TITLE_Y = 0.07;

/**
 * How far the whole picture has dropped under a rehearsal's plate. The name,
 * the ladder, the body, the exchange and the count are one column and move
 * together (`round-header.ts`); on the game's own screen this is 0.
 */
export function tellLift(l: Layout, view: ViewState): number {
  return headerLift(view, l.playHeight * TELL_TITLE_Y);
}

/** Where the body stands and how big it is. Read by the scene as well. */
export function tellBody(l: Layout, lift = 0): { cx: number; cy: number; r: number } {
  return {
    cx: l.width / 2,
    cy: l.playHeight * 0.3 + lift,
    r: Math.min(l.width * 0.3, l.playHeight * 0.22),
  };
}

/** How far through this rung's window we are, 0..1, or 0 outside a tell. */
function tellProgress(view: ViewState, boss: TellState): number {
  if (boss.phase !== "tell") return 0;
  const beats = tellWindow(tellCurrent(boss), boss.shorten);
  const since = view.world.beat - boss.phaseBeat + view.beatPhase;
  return Math.max(0, Math.min(1, since / Math.max(1, beats)));
}

/**
 * Whether the body is shivering: the beat a feinting boss changes its mind on,
 * and the one beat of warning a pair gets that it is going to.
 *
 * Drawn from `tellShivers`, which the simulation moves `bossShown` on — so the
 * warning and the lie are the same instant by construction rather than by two
 * files agreeing about a number.
 */
function shivering(view: ViewState, boss: TellState): number {
  if (boss.phase !== "tell" || tellCurrent(boss).feint !== true) return 0;
  const beats = tellWindow(tellCurrent(boss), boss.shorten);
  const since = view.world.beat - boss.phaseBeat;
  return since === tellShivers(beats) ? 1 - view.beatPhase : 0;
}

export function drawTellBody(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  boss: TellState,
): void {
  const { cx, cy, r } = tellBody(l, tellLift(l, view));
  const shiver = shivering(view, boss);
  // The contour goes tight rather than moving: a boss that jumped would be a
  // boss that had already told you, and the shiver has to be small enough to
  // be missed by a pair that is not watching for it.
  const depth = 0.16 - 0.07 * shiver;
  const skin = new Path2D(blobPath(cx, cy, r, r * 0.86, 3, depth, 0.05, view.time, 7));

  // The colour it wears, which decides whether a bolt lands — and which only
  // player 2 is shown. On the pilot's screen the skin is the ship's own violet
  // and says nothing at all.
  const shows = showsTellColor(view.role) && boss.phase !== "lead";
  const wearing = !shows ? PALETTE.hull : boss.bossColor === 1 ? PALETTE.red : PALETTE.cyan;
  ctx.fillStyle = wearing;
  ctx.globalAlpha = 0.24;
  ctx.fill(skin);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = wearing;
  ctx.lineWidth = Math.max(1.5, r * 0.045);
  ctx.stroke(skin);

  drawRing(ctx, l, cx, cy, r, boss.fumbled ? -1 : boss.thrown);
  drawTell(ctx, view, boss, cx, cy, r);
  if (boss.fumbled) drawFumble(ctx, cx, cy, r);
}

/**
 * The half of the tell that is player 1's: the lobe that is filling.
 *
 * A fill and not a highlight, because a fill has a *rate* — the pair can see
 * how much of the window is left in the same mark that says what is coming,
 * which is what lets a call be late on purpose. Player 2's screen draws
 * nothing here, and that is the round.
 */
function drawTell(
  ctx: CanvasRenderingContext2D,
  view: ViewState,
  boss: TellState,
  cx: number,
  cy: number,
  r: number,
): void {
  if (boss.phase !== "tell" || !showsTellHand(view.role)) return;
  const n = ringNode(cx, cy, r, boss.bossShown);
  const fill = tellProgress(view, boss);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = Math.max(1.5, r * 0.05);
  ctx.beginPath();
  ctx.arc(n.x, n.y, n.r * 1.5, -Math.PI / 2, -Math.PI / 2 + fill * Math.PI * 2);
  ctx.stroke();
}

/** Both thumbs at once: the ship threw nothing, and the ring says so. */
function drawFumble(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  ctx.strokeStyle = PALETTE.red;
  ctx.lineWidth = Math.max(2, r * 0.07);
  const d = r * 0.3;
  for (const turn of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(cx - d, cy - d * turn);
    ctx.lineTo(cx + d, cy + d * turn);
    ctx.stroke();
  }
}
