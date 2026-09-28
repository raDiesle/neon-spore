import { type Creature, type QueenState, queenAsks } from "@neon-spore/sim";
import { drawVerdictRing, type GripVerdicts } from "./grip-verdict.js";
import { type Layout, showsQueenShape } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { queenMarkCenter } from "./queen-figure.js";
import { queenMarkKey } from "./queen-fx.js";

/**
 * **THE BULB QUEEN's marks answering a touch the way every mark does**
 * (`mark-feedback.ts`, `grip-verdict.ts`; the owner, 27 September 2026: *the
 * consistent visual across all waves*).
 *
 * Her two marks are player 1's while BROOD or SCREAM asks a thumb for them
 * (`sim/queen-hand.ts` `queenAsks`), and both are asked, since he is not shown which is real.
 * So on his screen both wear the halo under the grip's ring (`queen-grip.ts`),
 * all but the one his thumb is holding, whose filled ring says it already; on
 * player 2's both wear the partner's turning ring and the clock — *not your
 * thumb, his* — with her pulsing ring on the real one still hers to call
 * (`queen-egg.ts` `drawSideHint`). Between windows neither is drawn.
 *
 * The verdicts come last, over everything, on every screen: the green of a
 * pry that landed or a thumb on the real mark, the red of a flinch, a thumb
 * on the other, or player 2's press refused (`queen-fx.ts`).
 */

/** The asking, drawn over the shell and under the grip's rings. `ox`/`oy` is her shudder. */
export function drawQueenAsked(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  boss: QueenState,
  time: number,
  ox: number,
  oy: number,
): void {
  const asks = queenAsks(boss, queen);
  if (asks === null) return;
  const mine = showsQueenShape(l.role);
  for (const side of [-1, 1] as const) {
    const at = queenMarkCenter(l, queen, side);
    const x = at.x + ox;
    const y = at.y + oy;
    if (!mine) {
      drawMarkTheirs(ctx, x, y, at.r, time);
      drawMarkWait(ctx, x, y, at.r, time);
    } else if (!(asks === "hold" && boss.holdSide === side)) {
      drawMarkHalo(ctx, x, y, at.r, time);
    }
  }
}

/** The verdict round each mark, last of all. */
export function drawQueenVerdicts(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  queen: Creature,
  verdicts: GripVerdicts,
  ox: number,
  oy: number,
): void {
  for (const side of [-1, 1] as const) {
    const v = verdicts.at(queenMarkKey(side));
    if (v === null) continue;
    const at = queenMarkCenter(l, queen, side);
    drawVerdictRing(ctx, at.x + ox, at.y + oy, at.r, v);
  }
}
