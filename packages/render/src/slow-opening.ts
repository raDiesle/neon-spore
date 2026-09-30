import { NO_SLOW, slowing, type World } from "@neon-spore/sim";

/**
 * **The beat the window's latest opening was made on**, so the fuse starts
 * whole every time the pair is asked for something.
 *
 * `openSlow` keeps the start of a window it re-opens and moves only its end
 * (`sim/slow.ts`): two dramatic beats in a row are one border closing. That is
 * right for the light and wrong for a measure. THE INSTAR asks its next step
 * inside the window the last one left open, and a fuse counting the whole
 * window from its first beat started that step already short, and grew back
 * when the end moved — the owner, 30 September 2026: *right now its shorter
 * when there is shorter time*, and *we do not need to show the loading*.
 *
 * The world keeps no record of the latest opening, and adding one would move
 * every pinned replay's hash for a picture's sake, so the renderer remembers
 * it: the frame the end is seen to move is the beat it moved on. A new window —
 * its start moved — opens on its own start. Kept in `Effects` and cleared in
 * `resetAll`, because it outlives a frame (`test/restart.test.ts`).
 */
export class SlowOpening {
  private fromBeat = NO_SLOW;
  private toBeat = NO_SLOW;
  private opened = NO_SLOW;

  /** The beat the window this frame is inside last opened on, or `NO_SLOW`. */
  seen(world: World): number {
    if (!slowing(world)) {
      this.clear();
      return NO_SLOW;
    }
    if (world.slowFromBeat !== this.fromBeat) this.opened = world.slowFromBeat;
    else if (world.slowToBeat !== this.toBeat) this.opened = world.beat;
    this.fromBeat = world.slowFromBeat;
    this.toBeat = world.slowToBeat;
    return this.opened;
  }

  clear(): void {
    this.fromBeat = NO_SLOW;
    this.toBeat = NO_SLOW;
    this.opened = NO_SLOW;
  }
}
