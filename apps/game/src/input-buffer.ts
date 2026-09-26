import type { Command } from "@neon-spore/sim";
import type { PressLag } from "./press-lag.js";

/**
 * Collects commands until the next tick consumes them. `drain(tick)` stamps
 * every pending command with the tick it is drained on, which — because the
 * loop's catch-up drains synchronously — is the first tick after the touch,
 * and `link.ts`'s lockstep then schedules it `inputDelayTicks` further out
 * from there. The simulation never hears a wall-clock moment.
 *
 * `lag` is the one exception, and it is not the simulation's: under `?lag=1` a
 * press carries the touch event's own time as far as the frame that shows it
 * (`press-lag.ts`), so the wait a thumb feels can be read rather than argued
 * about. Unset, which is always unless the flag built one, nothing is stamped.
 *
 * Split out of `input.ts` when the ship itself became touchable and that file
 * reached its length limit. The seam is the honest one: this is the *queue*
 * every listener in the app writes into — the band, the keyboard, the rounds'
 * own panels, the wave progression — and next door is one of those listeners.
 * It is re-exported from `input.ts`, so nothing that already imported it
 * through that file had to move.
 */
export class InputBuffer {
  private pending: { player: 1 | 2; command: Command; at: number | null }[] = [];
  lag: PressLag | null = null;

  push(player: 1 | 2, command: Command): void {
    const at = this.lag ? this.lag.stamp(performance.now()) : null;
    this.pending.push({ player, command, at });
  }

  drain(tick: number): { tick: number; player: 1 | 2; command: Command }[] {
    const out = this.pending.map((p) => ({ tick, player: p.player, command: p.command }));
    if (this.lag) {
      const stamps: number[] = [];
      for (const p of this.pending) if (p.at !== null) stamps.push(p.at);
      this.lag.drained(stamps, tick);
    }
    this.pending.length = 0;
    return out;
  }

  /**
   * What is waiting for the next tick, unstamped and left where it is — so a
   * press can be asked about against the ones already sent ahead of it on the
   * same tick (`handle-press.ts` `wouldHear`).
   */
  queued(): { player: 1 | 2; command: Command }[] {
    return this.pending.map((p) => ({ player: p.player, command: p.command }));
  }

  /** Paused: what was pressed is dropped, and was never answered. */
  clear(): void {
    this.pending.length = 0;
  }
}
