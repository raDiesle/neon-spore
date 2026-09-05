import { ROCK_CYCLE } from "@neon-spore/sim";
import { type Layout, showsQueenHint } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawTargetLock } from "./target-lock.js";

/**
 * NEXT TO FALL: the flank the queen's next torch comes off, said on player
 * 2's screen and nowhere else.
 *
 * It used to be `drawSideHint` — the same pulsing ring that says which of her
 * two marks is real. The owner asked for the two to stop looking alike: *use
 * the scanner line square instead, show some text like "next to fall", and a
 * loading indicator timer showing the time going to release the torch.* He is
 * right that they were one picture doing two jobs. Which mark is real is a
 * **column** to call out; which wing drops is a **clock** — the pair has the
 * whole of `ROCK_CYCLE` to hear it, act on it and watch it run out, and a ring
 * that pulses on its own tempo says nothing at all about how long is left.
 *
 * So this is the target lock (`target-lock.ts` — *an instrument has picked
 * this body out, and it cannot tell you the rest*, which is exactly player 2's
 * half of her), the words under it, and a bar that fills as the drop comes on.
 * The ring stays where it started: on the mark, which is the thing it was
 * always saying.
 */

/** How far round the box the frame stands off the torch it is holding. */
const LOCK_SHARE = 1.12;
/** The words, and how far under the box they sit. */
const LABEL = "NEXT TO FALL";
const LABEL_GAP = 10;
/** The bar under them: its height, and how far under the words it runs. */
const BAR_H = 4;
const BAR_GAP = 7;
/** How near the edge of the screen the words and the bar may come. */
const EDGE = 6;

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/**
 * How much of the wait is spent, 0..1 — 0 the beat a torch breaks off, 1 the
 * beat the next one does.
 *
 * Off the **wave's** beat rather than off `boss.releaseBeat`, and that is not
 * a detail: `spitCycle` drops a torch on `waveBeat % ROCK_CYCLE === 0`, so the
 * wave's own clock is where the rule lives and reading the last release would
 * be a second copy of it — one that says nothing at all for the eight beats
 * before the first torch has ever gone, which is exactly when a pair is first
 * learning to read this.
 *
 * A pure function of a beat the simulation already stores, like everything
 * else the queen's picture animates off, so nothing here is remembered between
 * frames and a restart cannot carry a half-run clock into the next wave.
 */
export function dropShare(waveBeat: number, beatPhase: number): number {
  const within = (((waveBeat % ROCK_CYCLE) + ROCK_CYCLE) % ROCK_CYCLE) + beatPhase;
  return clamp01(within / ROCK_CYCLE);
}

/**
 * The whole marking, around one flank torch. Player 2's alone
 * (`showsQueenHint`): the side the next rock comes from is half of what that
 * seat holds, and a copy of it on the other screen would leave the pair
 * nothing to say.
 */
export function drawDropHint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cx: number,
  cy: number,
  r: number,
  side: -1 | 1,
  waveBeat: number,
  beatPhase: number,
  time: number,
): void {
  if (!showsQueenHint(l.role)) return;
  const half = r * LOCK_SHARE;
  // `side + 2` rather than `side`: the marks' own locks are seeded by side,
  // and two frames on one screen blinking in step read as one object.
  drawTargetLock(ctx, cx, cy, half, half, PALETTE.shieldRim, time, 1, side + 2);

  const size = Math.max(8, Math.round(l.tile * 0.26));
  const top = cy + half + LABEL_GAP;
  ctx.save();
  ctx.font = `700 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";

  // A torch rides two and a half tiles out from her column, so on the flank
  // she has drifted towards the words are wider than the screen has left. They
  // slide in off the edge rather than being cut in half: the lock is what says
  // *which* one, and it has not moved.
  const w = Math.max(half * 2, ctx.measureText(LABEL).width);
  const tx = Math.min(l.width - w / 2 - EDGE, Math.max(w / 2 + EDGE, cx));

  ctx.fillStyle = PALETTE.shieldRim;
  ctx.globalAlpha = 0.9;
  ctx.fillText(LABEL, tx, top + size);
  ctx.globalAlpha = 1;

  // The clock. It fills rather than drains, so the eye reads a thing arriving
  // rather than a thing running out — the rock is coming, and what the bar is
  // full of is how much of the warning has already been spent.
  const barY = top + size + BAR_GAP;
  const barX = tx - w / 2;
  ctx.fillStyle = PALETTE.dim;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(barX, barY, w, BAR_H);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.shieldRim;
  ctx.fillRect(barX, barY, w * dropShare(waveBeat, beatPhase), BAR_H);
  ctx.restore();
}
