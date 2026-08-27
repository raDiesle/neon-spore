/**
 * The game's sound, wired to the loop.
 *
 * Everything that decides what a sound *is* lives in `@neon-spore/audio`; this
 * file is the three things only the app knows: a browser will not start audio
 * until a finger has landed, a restart has to clear what the mixer remembers,
 * and there has to be a way to turn it off without leaving the field.
 *
 * The mixer is fed once per frame rather than once per tick, for the same
 * reason render/ is: a frame covers several ticks and the world clears its
 * events on every one of them, so the host collects them and hands over the
 * batch.
 */

import { Mixer } from "@neon-spore/audio";
import type { SimEvent, World } from "@neon-spore/sim";

export interface GameAudio {
  frame: (world: World, events: readonly SimEvent[]) => void;
  /** A run is starting over; nothing remembered from the last one is true. */
  restarted: () => void;
  toggleMute: () => boolean;
}

export function bindAudio(canvas: HTMLCanvasElement): GameAudio {
  const mixer = new Mixer();

  // Every one of these is a gesture a browser accepts as consent. `unlock` is
  // idempotent, so there is nothing to unbind and nothing to get wrong.
  const wake = (): void => mixer.unlock();
  canvas.addEventListener("pointerdown", wake);
  window.addEventListener("keydown", wake);

  window.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") mixer.setMuted(!mixer.muted);
  });

  return {
    frame: (world, events) => mixer.frame(world, events),
    restarted: () => mixer.reset(),
    toggleMute: () => {
      mixer.setMuted(!mixer.muted);
      return mixer.muted;
    },
  };
}
