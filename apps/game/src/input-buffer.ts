import type { Command } from "@neon-spore/sim";

/**
 * Collects commands until the next tick consumes them. No timestamp is taken
 * here or needed: `drain(tick)` stamps every pending command with the tick it
 * is drained on, which — because the loop's catch-up drains synchronously —
 * is the first tick after the touch, and `link.ts`'s lockstep then schedules
 * it `inputDelayTicks` further out from there. There is no separate moment
 * of "when the screen was touched" to have captured.
 *
 * Split out of `input.ts` when the ship itself became touchable and that file
 * reached its length limit. The seam is the honest one: this is the *queue*
 * every listener in the app writes into — the band, the keyboard, the rounds'
 * own panels, the wave progression — and next door is one of those listeners.
 * It is re-exported from `input.ts`, so nothing that already imported it
 * through that file had to move.
 */
export class InputBuffer {
  private pending: { player: 1 | 2; command: Command }[] = [];

  push(player: 1 | 2, command: Command): void {
    this.pending.push({ player, command });
  }

  drain(tick: number): { tick: number; player: 1 | 2; command: Command }[] {
    const out = this.pending.map((p) => ({ tick, player: p.player, command: p.command }));
    this.pending.length = 0;
    return out;
  }
}
