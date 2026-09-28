import type { SimEvent } from "@neon-spore/sim";
import { GripVerdicts } from "./grip-verdict.js";

/**
 * **THE BULB QUEEN's two marks, judged like every mark** (`grip-verdict.ts`).
 *
 * Her marks are a thumb's under BROOD's `pry` and SCREAM's `hold`, and the
 * simulation says each verdict once (`sim/queen-hand.ts`): a pry that landed
 * and a thumb come down on the real mark wash that mark green; a thumb on the
 * other, a flinch, and player 2's press — whose thumb the marks are not for —
 * wash it red. Everything else about her, the colour, the armour, the rings,
 * is read off the boss every frame (`queen.ts`, `queen-grip.ts`); this is the
 * one piece that outlives a frame, cleared in `Effects.reset()`.
 *
 * Two marks, so two keys, `queenMarkKey` of the side — the id the thumb
 * already carries (`queen-grip.ts`).
 */

/** The key a mark's verdict is kept under — the command id of the mark, 0 left, 1 right. */
export function queenMarkKey(side: -1 | 1): number {
  return side === -1 ? 0 : 1;
}

export class QueenFx {
  /** Was the last touch on each mark right. */
  readonly verdicts = new GripVerdicts();

  ingest(events: readonly SimEvent[]): void {
    for (const e of events) {
      switch (e.type) {
        case "queenPry":
          this.verdicts.mark(queenMarkKey(e.side), true);
          break;
        case "queenHold":
          this.verdicts.mark(queenMarkKey(e.side), e.real);
          break;
        case "queenFlinch":
        case "queenRefuse":
          this.verdicts.mark(queenMarkKey(e.side), false);
          break;
        default:
          break;
      }
    }
  }

  update(dt: number): void {
    this.verdicts.update(dt);
  }

  clear(): void {
    this.verdicts.clear();
  }
}
