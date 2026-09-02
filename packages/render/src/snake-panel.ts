import { controlSetForWave } from "@neon-spore/content";
import type { SnakeState } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { slabPanel } from "./slabs.js";
import { gape } from "./snake-round.js";

/**
 * Everything around SNAKE's arena: what this screen is told, how long the
 * attempt has, the four buttons, and how it went.
 *
 * Split from `snake-round.ts` on the seam the round is built on — that file is
 * the arena and the body in it, this one is the frame around them — and the
 * frame is where the two screens differ in *words*. `LINES` below is the whole
 * of that difference, written as a table so both halves can be read at once
 * and neither can quietly become a restatement of the other.
 *
 * The buttons come from the wave's control set through `slabPanel`, which is
 * the same call the game's own hit test makes, so a button is never drawn
 * where it is not answered — the defect THE GAUGE shipped with once, and the
 * reason a round's panel is a control set at all.
 */

/**
 * The name, and the one line that teaches this seat its half. Different on the
 * two screens because the halves are: a pair reading the same sentence would
 * have nothing to tell each other.
 */
export function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  round: SnakeState,
): void {
  const y = l.playHeight * 0.09;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("SNAKE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  const lines = LINES[role];
  ctx.fillText(round.phase === "morph" ? lines.folding : lines.taught, l.width / 2, y + 20);
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(lines.withheld, l.width / 2, y + 35);
}

/**
 * The three lines under the name, one row per screen. A table rather than
 * three functions: they are one thought — what this seat has, and what it is
 * not being shown — and reading them side by side is how anybody checks the
 * two halves are still different from each other.
 */
const LINES: Record<ViewRole, { folding: string; taught: string; withheld: string }> = {
  p1: {
    folding: "folding — yours is the shot and the mouth",
    taught: "shoot them, and open on the amber",
    withheld: "YOU CANNOT STEER, AND YOU SEE ONLY BOTH ENDS",
  },
  p2: {
    folding: "folding — yours is the whole of the steering",
    taught: "left and right — you cannot see what is there",
    withheld: "YOU CANNOT SEE WHAT IS IN THE ARENA",
  },
  test: {
    folding: "the ship is folding into the body",
    taught: "one of you drives it, the other works it",
    withheld: "NEITHER HALF IS ENOUGH ON ITS OWN",
  },
};

/**
 * How long this attempt has, and nothing else.
 *
 * It used to carry two rows of pips — enemies left, points left — and the
 * owner had them taken out: they are player 1's screen written twice, and on
 * player 2's they were a count of things that seat is not allowed to know
 * about. What is left is the one number both of them are inside: the clock,
 * which costs the hull when it runs out, so a pair who cannot see it spending
 * are being charged for a thing nobody showed them.
 */
export function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
): void {
  const target = round.rounds[round.round];
  if (!target) return;
  const y = l.playHeight * 0.93;
  const spent = view.world.beat - round.roundBeat;
  const left01 = Math.max(0, Math.min(1, 1 - spent / target.beats));
  const barW = l.width * 0.5;
  const barX = (l.width - barW) / 2;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y, Math.max(1, barW * left01), 4);
  }
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  const again = round.repeats > 0 ? ` · ${round.repeats} AGAIN` : "";
  ctx.fillText(`ROUND ${round.round + 1} OF ${round.rounds.length}${again}`, l.width / 2, y + 18);
}

/**
 * The round's own buttons. The two turns are always player 2's to press and
 * are drawn live throughout; MAW lights while the mouth is actually open,
 * which is the only feedback player 1 has that the press landed, and FIRE dims
 * for the beat it is resting.
 */
export function drawControls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
): void {
  const live = round.phase === "play";
  // See `ViewState.controls`: `view.world.wave` only indexes the shipped
  // `WAVES` for a host actually playing them, so an explicit `view.controls`
  // wins when one is given.
  const set = view.controls === undefined ? controlSetForWave(view.world.wave) : view.controls;
  const resting = view.world.beat - round.shotBeat < view.world.cfg.snakeFireRestBeats;
  for (const slab of slabPanel(l, set, view.role)) {
    const id = slab.control.id;
    const on =
      live &&
      ((id === "snakeMaw" && gape(view, round) > 0) ||
        (id === "snakeFire" && round.shotHit && resting));
    const dim = !live || (id === "snakeFire" && resting);
    ctx.fillStyle = on ? "rgba(255,194,74,.3)" : "rgba(16,11,34,.9)";
    ctx.fillRect(slab.x, slab.y, slab.w, slab.h);
    ctx.strokeStyle = dim ? PALETTE.grid : PALETTE.hull;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(slab.x + 0.5, slab.y + 0.5, Math.max(1, slab.w - 1), Math.max(1, slab.h - 1));
    ctx.fillStyle = dim ? PALETTE.dim : PALETTE.hullRim;
    ctx.font = '600 13px "Courier New",monospace';
    ctx.fillText(slab.control.label, slab.x + slab.w / 2, slab.y + slab.h / 2 + 5);
  }
}

/** How it went, over the arena for a few beats. */
export function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, round: SnakeState): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "CLEARED" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  ctx.fillText(`${round.repeats} started over`, l.width / 2, y + 20);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(round.passed ? "the field is next" : "THE HULL PAID FOR IT", l.width / 2, y + 38);
}
