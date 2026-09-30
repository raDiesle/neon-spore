import type { PinballState } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import type { Table } from "./pinball-table.js";
import type { ViewState } from "./renderer.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";

/**
 * **PINBALL's clock is the fuse every boss wears, along the top of the table.**
 *
 * The owner, 30 September 2026: *remove all the wave text above, and show the
 * regular boss (choreographed) time indicator, but on top of screen.* So the
 * name, whose press it is and the tally of targets, board and beats are gone,
 * and what stays of them is the one reading a pair acts on — how long this
 * board has left. It is THE SLOW's line (`slow-fuse.ts`), drawn by the same
 * function in the same colours, burning in from both ends and meeting in the
 * middle on the beat the board runs out.
 *
 * **Where.** In the band of clear air every board hangs below
 * (`PIN_TOP_TILES` in `content/src/pinball-rounds.ts`), so no piece is ever
 * under it and the search `slow-fuse-place.ts` runs for a boss's body has
 * nothing here to search for. The rest of the table below it is the ball's.
 *
 * Only while a board is being played: the morph asks nothing in time yet and
 * the verdict has already said how it went. Nothing is stored; the beat says
 * how far it has burnt.
 */

/** How far down the band of air the line stands, in the table's tiles. */
const DOWN = 0.6;

/** How far each end stands in from the side of the screen, in tiles — the
 * round cap and the spark, the side `slow-fuse-place.ts` leaves. */
const SIDE = 0.5;

/** The share of this board's beats still to run, 0 to 1, at a drawn phase. */
export function pinFuseRest(view: ViewState, boss: PinballState): number {
  if (boss.phase !== "play") return 0;
  const round = boss.rounds[Math.min(boss.round, boss.rounds.length - 1)];
  const beats = round?.beats ?? 0;
  if (beats <= 0) return 0;
  const run = view.world.beat - boss.roundBeat + view.beatPhase;
  return Math.max(0, Math.min(1, (beats - run) / beats));
}

/** The fuse for this frame, across the top of the table. */
export function drawPinFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  table: Table,
  view: ViewState,
  boss: PinballState,
): void {
  const rest = pinFuseRest(view, boss);
  if (rest <= 0) return;
  const x = l.width / 2;
  const at = { x, y: table.y + table.tile * DOWN, half: Math.max(0, x - l.tile * SIDE) };
  const { body, core } = fuseColours(rest);
  drawFuseLine(ctx, l, at, rest, body, core);
}
