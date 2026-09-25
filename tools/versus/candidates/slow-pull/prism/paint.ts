import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { beatFrac, drawAbout, inField, snapshot } from "../lens.js";

/** The split held for the whole window, as a share of each point's distance from the boss. */
const HOLD = 0.018;

/** What each beat adds on its downbeat, gone again before the next. */
const KICK = 0.028;

/** How fast a beat's kick dies, as a power of what is left of the beat. */
const DECAY = 3;

/**
 * Keeps `img` to one channel: multiplied by pure red, green or blue, every
 * other channel goes to nought and that one is left as it was.
 */
function channel(img: HTMLCanvasElement, colour: string): void {
  const c = img.getContext("2d");
  if (c === null) return;
  c.globalCompositeOperation = "multiply";
  c.fillStyle = colour;
  c.fillRect(0, 0, img.width, img.height);
  c.globalCompositeOperation = "source-over";
}

/**
 * **PRISM — the room splits into its colours, and the boss does not.** The
 * field is pulled apart channel by channel about the boss's head: red swells
 * outward, blue falls inward, green stays. A point's fringe is as wide as it
 * is far from the boss, so the boss itself stays sharp and the edges of the
 * room tear into red and blue — a lens bent round the thing the window is
 * about. Every beat kicks the split wider and lets it settle, so the slowed
 * beat is seen as well as heard.
 *
 * How it can lose: a split is a blur by another name, and a body falling at
 * the edge of the field is the one it blurs most.
 */
export const prismWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up > 0) {
    const at = aim(world, l, world.beat, view.beatPhase);
    const k = up * (HOLD + KICK * (1 - beatFrac(win)) ** DECAY);
    inField(ctx, l, at.x, at.y, (eye) => {
      const red = snapshot(ctx, 0);
      const blue = snapshot(ctx, 1);
      channel(red, "#ff0000");
      channel(blue, "#0000ff");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(0, 0, eye.w, eye.h);
      ctx.globalCompositeOperation = "lighter";
      drawAbout(ctx, red, eye, 1 + k);
      drawAbout(ctx, blue, eye, 1 - k);
    });
  }
  drawFuse(ctx, l, win);
};
