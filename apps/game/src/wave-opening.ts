import { introSeconds } from "@neon-spore/render";
import { introHolds, type World } from "@neon-spore/sim";
import type { InputBuffer } from "./input.js";

/**
 * The clock that carries a wave's introduction past, cut out of `waves.ts`
 * when that file neared its line ceiling: opening a wave is one subject and
 * counting its introduction down is another.
 *
 * **The introduction's seconds are counted here, and this is the only place
 * they could be.** `packages/sim` may not read a wall clock — that is what
 * makes lockstep possible — so the wave's opening is held in the world and let
 * go by a command, exactly like the guide's. Where the guide's command comes
 * from a thumb, the introduction's comes from this countdown, one seat's worth
 * per device. Two devices therefore leave the introduction a few frames apart
 * and the world agrees about it anyway, because the acks travel the same wire
 * every other press does.
 *
 * How long the introduction stands — long enough to read a short sentence
 * twice; at 2.6 s the old banner's hint was gone before anyone had finished
 * it — **lives in `render/wave-intro.ts` and is imported.** The words fade out
 * over the last half-second of it, and the fade is drawn there while the
 * countdown is run here — two places that have to agree about one duration,
 * which is the definition of a number that should only be written once.
 */

/**
 * How long to wait, **in world ticks**, before asking again when the
 * introduction is somehow still standing.
 *
 * Ticks and not seconds, and that is the whole of what makes the retry safe.
 * An ack is scheduled `inputDelayTicks` into the future, so for a moment after
 * it is sent the introduction is legitimately still up — a retry on a wall
 * clock fires into that gap, the world moves on to the guide, and the second
 * pair of acks arrives to put away a guide nobody has read. That is not a race
 * that showed up under load: it happened on the first frame anybody looked at.
 *
 * Counting the world's own ticks fixes both halves at once. It cannot fire
 * before the first ack has had time to land, and it cannot fire while the game
 * is paused — which is the one case a retry exists for, since a paused loop
 * throws buffered commands away — because a paused world does not tick either.
 */
const RETRY_TICKS = 60;

export interface WaveOpening {
  /** Sets the clock for the wave `startWave` has just opened. */
  arm(): void;
  /** Counts the introduction down, and lets it go when it runs out. */
  tick(dtSeconds: number): void;
}

export function createWaveOpening(world: World, buffer: InputBuffer): WaveOpening {
  /** Seconds left on the introduction that is up, or 0 when none is. */
  let left = 0;
  /** The world tick the acks were sent on, or -1 while none has been sent. */
  let sentAtTick = -1;

  return {
    arm: () => {
      // Armed only for an opening that has an introduction in it. A guided
      // wave crosses its gate straight onto the field (`sim/briefing.ts`), so
      // a clock set here would be counting down a screen nobody will see.
      // Read after `startWave`, which is what counts this try: a wave gone
      // again stands for half as long (`RETRY_INTRO_SECONDS`).
      left = introHolds(world) ? introSeconds(world.waveTries) : 0;
      sentAtTick = -1;
    },
    tick: (dtSeconds) => {
      // The world is the authority on whether the introduction is still up: a
      // headless check that acked it by hand, or a partner who was slower than
      // this device, both show up here as the phase having moved on.
      if (!introHolds(world)) {
        sentAtTick = -1;
        return;
      }
      if (sentAtTick >= 0) {
        // Already asked once. Ask again only when the world has ticked far
        // enough past that for the answer to have been lost rather than merely
        // to be in flight — see `RETRY_TICKS`, which is why this counts ticks.
        if (world.tick - sentAtTick < RETRY_TICKS) return;
      } else {
        left -= dtSeconds;
        if (left > 0) return;
      }
      buffer.push(1, { kind: "brief" });
      buffer.push(2, { kind: "brief" });
      sentAtTick = world.tick;
    },
  };
}
