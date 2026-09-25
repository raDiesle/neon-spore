import { rgba } from "../../../../../packages/render/src/hex.js";
import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { beatFrac, inField, key, snapshot } from "../lens.js";

/** How much colour the room loses, at full strength, and the colourless fill that takes it. */
const DRAIN = 0.92;
const GREY = "#808080";

/** The cold the room is multiplied into, and how far. */
const COLD = "#7fa2ff";
const CHILL = 0.55;

/** How dark the corners go. */
const SHADE = 0.6;

/** Where the grade starts and where it is whole, in body radii from the head. */
const INNER = 1.1;
const OUTER = 2.6;

/** Where the burn starts to thin, in body radii — it is gone by `INNER`. */
const SOFT = 0.55;

/** How hot the boss burns between beats, and on a downbeat. */
const GLOW = 0.4;
const FLARE = 0.7;

/**
 * **GRADE — the room goes cold, and the boss burns.** Everything on the field
 * outside the boss is drained toward grey and multiplied into a cold blue,
 * softly from its skin outward, and the corners sink. The boss keeps every
 * colour it has — a mark that means something by its red still means it —
 * and a copy of it is added over itself so it runs hotter than anything in
 * the room, flaring on each slowed downbeat and easing between them.
 *
 * How it can lose: the grade is a disc about the head, and THE INSTAR's chain
 * runs up out of it into the cold, so the body reads as warm at one end only.
 */
export const gradeWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up > 0) {
    const at = aim(world, l, world.beat, view.beatPhase);
    const burn = Math.min(1, up * (GLOW + FLARE * (1 - beatFrac(win)) ** 2));
    inField(ctx, l, at.x, at.y, (eye) => {
      const whole = snapshot(ctx, 0);
      const r = at.r * eye.px;
      const far = Math.hypot(Math.max(eye.x, eye.w - eye.x), Math.max(eye.y, eye.h - eye.y));
      const reach = (alpha: number, hex: string): CanvasGradient => {
        const g = ctx.createRadialGradient(eye.x, eye.y, r * INNER, eye.x, eye.y, r * OUTER);
        g.addColorStop(0, rgba(hex, 0));
        g.addColorStop(1, rgba(hex, alpha));
        return g;
      };
      // Grey, with no hue: `saturation` takes the room's hue and light and
      // this fill's lack of colour.
      ctx.globalCompositeOperation = "saturation";
      ctx.fillStyle = reach(DRAIN * up, GREY);
      ctx.fillRect(0, 0, eye.w, eye.h);
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = reach(CHILL * up, COLD);
      ctx.fillRect(0, 0, eye.w, eye.h);
      ctx.globalCompositeOperation = "source-over";
      const shade = ctx.createRadialGradient(eye.x, eye.y, r * OUTER, eye.x, eye.y, far);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, `rgba(0,0,0,${SHADE * up})`);
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, eye.w, eye.h);
      // The boss over itself, added, fading out where the grade fades in:
      // the copy is keyed to its light and masked by a soft disc, so there is
      // no edge where the burn stops and the room's ground is not lifted.
      key(whole, 1);
      const wc = whole.getContext("2d");
      if (wc !== null) {
        const mask = wc.createRadialGradient(eye.x, eye.y, r * SOFT, eye.x, eye.y, r * INNER);
        mask.addColorStop(0, "#000");
        mask.addColorStop(1, "rgba(0,0,0,0)");
        wc.globalCompositeOperation = "destination-in";
        wc.fillStyle = mask;
        wc.fillRect(0, 0, eye.w, eye.h);
        wc.globalCompositeOperation = "source-over";
      }
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = burn;
      ctx.drawImage(whole, 0, 0);
    });
  }
  drawFuse(ctx, l, win);
};
