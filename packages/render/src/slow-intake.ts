import { drawFuse } from "./slow-fuse.js";
import { aim, ramp } from "./slow-intake-aim.js";
import { drawStreams } from "./slow-intake-streams.js";
import type { SlowLook } from "./slow-look.js";
import { drawPrism } from "./slow-prism.js";

/**
 * **The owner's answer for THE SLOW's window: light run in round the boss,
 * and a fuse along the top of the screen.**
 *
 * The owner settled the slot on 22 September 2026: the light *around the full
 * boss*, much more visible, stopping before its body. So this is not a fourth
 * argument about the window — it is the one that won, with the streams built
 * on the boss's own radius.
 *
 * **The measure is the fuse** (`slow-fuse.ts`). A notched bar under the body
 * counted the window down from 22 September 2026 until the owner took it out
 * on the 24th — *it was a stupid idea to introduce it* — and on the 25th he
 * asked for *some progress indicator* back. The fuse stands where the light
 * starts, well away from the body, and the other answers to the same question
 * are in VERSUS against it (`slow:measure`).
 *
 * **Under the streams, the prism** (`slow-prism.ts`): the owner took it from
 * the `slow:pull` slot on 26 September 2026 *on top of what we have*, so the
 * room tears into red and blue about the boss and the streams run in over the
 * torn room, whole — a stream split three ways would be three streams.
 *
 * **The light first, the fuse over it**: the fuse is the one thing here a pair
 * may have to read under pressure, and light added over a measure is a measure
 * that got harder to count.
 *
 * **It ends.** Four tenths of a second of fade at each end, spent inside the
 * window, so the light arrives from nothing and is gone on the beat the game
 * comes back up to speed rather than being at its loudest then
 * (`slow-intake-aim.ts`). The fuse does not fade: see its own file.
 */
export const intakeWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const up = ramp(win, world.cfg);
  if (up > 0) {
    drawPrism(ctx, l, at, up, win);
    drawStreams(ctx, l, at, up, win.through);
  }
  drawFuse(ctx, l, win);
};
