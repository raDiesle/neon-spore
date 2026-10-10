import type { SnakeState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { ViewState } from "./renderer.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";
import type { Arena } from "./snake-draw.js";

/**
 * What stands around SNAKE's arena: how long the attempt has, and how it went.
 *
 * **The top of the arena says nothing, 10 October 2026.** The owner: *remove
 * the permanent text during wave play on top. use generic time progress bar we
 * use for bosses.* The name, the line telling each seat its half and the
 * `ROUND 1 OF 3` row with its little bar are gone — the band's four buttons
 * say whose press is whose, and the guide said it before the round. What is
 * left is THE SLOW's fuse, drawn by the same function in the same colours as
 * every boss's and PINBALL's (`pinball-fuse.ts`, which the owner asked for the
 * same way on 30 September), burning in from both ends over the attempt's
 * beats and meeting in the middle on the beat the clock runs out.
 *
 * The four buttons used to be drawn here too, as a slab panel of the round's
 * own. They are lobes on the band now (`snake-button.ts`).
 */

/** From the fuse to the arena's top edge, in the arena's tiles. */
const FUSE_UP = 0.9;

/** How far each end stands in from the side of the screen, in tiles — the
 * round cap and the spark, the side `slow-fuse-place.ts` leaves. */
const SIDE = 0.5;

/**
 * The share of this attempt's beats still to run, 0 to 1, at a drawn phase.
 * Nought outside play, once the arena is cleared — the way home is not on the
 * clock — and once the body has crashed: there is nothing left to count down.
 */
export function snakeFuseRest(view: ViewState, round: SnakeState, crashed: boolean): number {
  if (round.phase !== "play" || round.clearBeat >= 0 || crashed) return 0;
  const beats = round.rounds[round.round]?.beats ?? 0;
  if (beats <= 0) return 0;
  const run = view.world.beat - round.roundBeat + view.beatPhase;
  return Math.max(0, Math.min(1, (beats - run) / beats));
}

/** The fuse for this frame, across the screen just over the arena. */
export function drawSnakeFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  arena: Arena,
  rest: number,
): void {
  if (rest <= 0) return;
  const x = l.width / 2;
  const at = { x, y: arena.y - arena.tile * FUSE_UP, half: Math.max(0, x - l.tile * SIDE) };
  const { body, core } = fuseColours(rest);
  drawFuseLine(ctx, l, at, rest, body, core);
}

/**
 * How it went, over the arena for a few beats: cleared, or the clock — and a
 * lost round is the wave lost, so the second line says what happens next
 * rather than what it cost (`sim/wave-fail.ts`; the retry count is the HUD's
 * corner).
 *
 * **Nothing on a crash**, the owner, 10 October 2026: *remove the "crashed"
 * animation. it is enough.* The body knocking into what stopped it and the
 * hit coming down the screen say it already (`snake-crash.ts`,
 * `round-hit.ts`), and a banner across the arena hid the place it went wrong.
 */
export function drawVerdict(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  round: SnakeState,
  crashed: boolean,
): void {
  if (crashed && !round.passed) return;
  const y = l.playHeight * 0.42;
  ctx.fillStyle = "rgba(5,4,11,.78)";
  ctx.fillRect(0, y - 46, l.width, 96);
  ctx.fillStyle = round.passed ? PALETTE.good : PALETTE.ember;
  ctx.font = '600 20px "Courier New",monospace';
  ctx.fillText(round.passed ? "CLEARED" : "OUT OF TIME", l.width / 2, y);
  ctx.fillStyle = round.passed ? PALETTE.dim : PALETTE.ember;
  ctx.font = '9px "Courier New",monospace';
  ctx.fillText(round.passed ? "the field is next" : "THE WAVE GOES AGAIN", l.width / 2, y + 30);
}
