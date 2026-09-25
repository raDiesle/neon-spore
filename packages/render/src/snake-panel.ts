import { type SnakeState, snakeCrashed } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";

/**
 * The words around SNAKE's arena: what this screen is told, how long the
 * attempt has, and how it went.
 *
 * Split from `snake-round.ts` on the seam the round is built on — that file is
 * the arena and the body in it, this one is the header over them — and the
 * header is where the two screens differ in *words*. `LINES` below is the
 * whole of that difference, written as a table so both halves can be read at
 * once and neither can quietly become a restatement of the other.
 *
 * The four buttons used to be drawn here too, as a slab panel of the round's
 * own. They are lobes on the band now, in the sockets every other control
 * stands in (`snake-button.ts`), since the owner asked for them to look like
 * the others.
 */

/**
 * The name, and the one line that teaches this seat its half. Different on the
 * two screens because the hands are, though the picture under them is one.
 */
export function drawTitle(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  role: ViewRole,
  round: SnakeState,
  top: number,
): void {
  // The name's baseline; the two rows hang off it. The caller says where the
  // top is.
  const y = top;
  ctx.fillStyle = PALETTE.hull;
  ctx.font = '600 16px "Courier New",monospace';
  ctx.fillText("SNAKE", l.width / 2, y);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '11px "Courier New",monospace';
  const lines = LINES[role];
  ctx.fillText(round.phase === "morph" ? lines.emerging : lines.taught, l.width / 2, y + 18);
}

/**
 * The line under the name, one row per screen. A table rather than three
 * functions: they are one thought — what this seat has, and what it is not
 * being shown — and reading them side by side is how anybody checks the two
 * halves are still different from each other. The row that used to say what
 * each seat is *not* shown went with the slab panel: the header is one line
 * now so the arena under it can be as tall as the screen allows.
 */
const LINES: Record<ViewRole, { emerging: string; taught: string }> = {
  p1: {
    emerging: "it is coming out. You shoot and eat.",
    taught: "you shoot and eat. Player 2 steers.",
  },
  p2: {
    emerging: "it is coming out. You steer it.",
    taught: "you steer, left and right. Player 1 shoots and eats.",
  },
  test: {
    emerging: "the body is coming out of the ship",
    taught: "one of you drives it, the other works it",
  },
};

/**
 * How long this attempt has, and which attempt it is, in one row under the
 * name.
 *
 * It used to carry two rows of pips — enemies left, points left — and the
 * owner had them taken out: they are player 1's screen written twice, and on
 * player 2's they were a count of things that seat is not allowed to know
 * about. What is left is the one number both of them are inside: the clock,
 * which costs the hull when it runs out, so a pair who cannot see it spending
 * are being charged for a thing nobody showed them. It stood under the arena
 * until the ship took that ground; now it is the header's last row.
 */
export function drawTally(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  view: ViewState,
  round: SnakeState,
  y: number,
): void {
  const target = round.rounds[round.round];
  if (!target) return;
  // The clock stops on the beat the arena is cleared: the way home is not on it.
  const now = round.clearBeat >= 0 ? round.clearBeat : view.world.beat;
  const spent = now - round.roundBeat;
  const left01 = Math.max(0, Math.min(1, 1 - spent / target.beats));
  ctx.fillStyle = PALETTE.dim;
  ctx.font = '9px "Courier New",monospace';
  ctx.textAlign = "left";
  ctx.fillText(`ROUND ${round.round + 1} OF ${round.rounds.length}`, l.width * 0.12, y + 4);
  ctx.textAlign = "center";
  const barW = l.width * 0.4;
  const barX = l.width * 0.48;
  ctx.fillStyle = "#241B4F";
  ctx.fillRect(barX, y, barW, 4);
  if (left01 > 0) {
    ctx.fillStyle = left01 < 0.25 ? PALETTE.ember : PALETTE.hull;
    ctx.fillRect(barX, y, Math.max(1, barW * left01), 4);
  }
}

/**
 * How it went, over the arena for a few beats. Three ways out and a word for
 * each: cleared, the clock, or the body meeting something — and a lost round
 * is the wave lost, so the second line says what happens next rather than
 * what it cost (`sim/wave-fail.ts`; the retry count is the HUD's corner).
 */
export function drawVerdict(ctx: CanvasRenderingContext2D, l: Layout, round: SnakeState): void {
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  const word = round.passed ? "CLEARED" : snakeCrashed(round) ? "CRASHED" : "OUT OF TIME";
  ctx.fillText(word, l.width / 2, y);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(round.passed ? "the field is next" : "THE WAVE GOES AGAIN", l.width / 2, y + 30);
}
