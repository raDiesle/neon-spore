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
import { readSettings } from "./settings.js";

export interface GameAudio {
  frame: (world: World, events: readonly SimEvent[]) => void;
  /** A run is starting over; nothing remembered from the last one is true. */
  restarted: () => void;
  toggleMute: () => boolean;
  /** Turn sound on or off outright. The settings page's switch. */
  setSound: (on: boolean) => void;
}

/**
 * `seat` is a getter rather than a value because the view switch is built
 * after this is, and because a player can change seats without the run
 * restarting. It is a fourth thing only the app knows: almost every cue plays
 * on both devices, and THE LURE's alarm is the one that must not — see
 * `Cue.seat` in `@neon-spore/audio`.
 */
export function bindAudio(canvas: HTMLCanvasElement, seat: () => "p1" | "p2" | "test"): GameAudio {
  const mixer = new Mixer();
  // A player who turned it off last time meant it. The `M` key still works and
  // still does not persist: it is the desk's shortcut, not the setting.
  mixer.setMuted(!readSettings().sound);
  const asSeat = (): 1 | 2 | null => {
    const role = seat();
    // `test` is both halves on one screen, so it hears both halves. A room
    // with two people in it is exactly what it is not.
    if (role === "test") return 2;
    return role === "p2" ? 2 : 1;
  };

  // Every one of these is a gesture a browser accepts as consent. `unlock` is
  // idempotent, so there is nothing to unbind and nothing to get wrong.
  const wake = (): void => mixer.unlock();
  canvas.addEventListener("pointerdown", wake);
  window.addEventListener("keydown", wake);

  window.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") mixer.setMuted(!mixer.muted);
  });

  return {
    frame: (world, events) => {
      mixer.setSeat(asSeat());
      mixer.frame(world, events);
    },
    restarted: () => mixer.reset(),
    toggleMute: () => {
      mixer.setMuted(!mixer.muted);
      return mixer.muted;
    },
    setSound: (on) => mixer.setMuted(!on),
  };
}
