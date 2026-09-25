import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { beatFrac, drawAbout, inField, key, snapshot } from "../lens.js";

/** Copies in a trail — a power of two, because each pass doubles them. */
const TAPS = 32;

/** How far a trail reaches toward the boss, as a share of its distance: at rest, and on a downbeat. */
const REACH = 0.3;
const SURGE = 0.18;

/** How much each doubling keeps of the half it adds, so a trail thins as it goes in. */
const FALL = 0.8;

/** How bright the trails land, over the room's own light. */
const GAIN = 0.24;

/** How much of the room's own light is taken before the trails are laid. */
const DIM = 0.4;

/** How many times the copy is multiplied by itself before it is trailed. */
const KEY = 2;

/**
 * **SWALLOW — a zoom blur whose centre is the boss.** Only the light on the
 * field is kept — the ground is keyed away — and it is smeared toward the
 * boss's head into long soft trails, added over a room that has dimmed as if
 * the light in them had been taken from it. Every lit edge on the field
 * streams into the boss's middle, and on each slowed downbeat the trails
 * surge longer and settle.
 *
 * Thirty-two copies in five passes: each pass lays the trail so far over
 * itself, pulled in twice as far as the last, so the smear is continuous
 * rather than a row of ghosts.
 *
 * How it can lose: the boss's own marks are lit, so they trail into its
 * middle too — the pull the owner asked for, and the thing a pair has to
 * read, in the same place.
 */
export const swallowWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up > 0) {
    const at = aim(world, l, world.beat, view.beatPhase);
    const reach = REACH + SURGE * (1 - beatFrac(win)) ** 2;
    inField(ctx, l, at.x, at.y, (eye) => {
      const trail = snapshot(ctx, 0);
      key(trail, KEY);
      const tc = trail.getContext("2d");
      if (tc !== null) {
        tc.globalCompositeOperation = "lighter";
        tc.globalAlpha = FALL;
        for (let k = 1; k < TAPS; k *= 2) drawAbout(tc, trail, eye, (1 - reach / TAPS) ** k);
        tc.globalCompositeOperation = "source-over";
        tc.globalAlpha = 1;
      }
      ctx.globalAlpha = DIM * up;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, eye.w, eye.h);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = GAIN * up;
      ctx.drawImage(trail, 0, 0);
    });
  }
  drawFuse(ctx, l, win);
};
