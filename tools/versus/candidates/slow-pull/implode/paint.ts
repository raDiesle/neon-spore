import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { beatFrac, drawAbout, type Eye, inField, snapshot } from "../lens.js";

/** How much the light inside a ring is bent inward, as a share of its distance. */
const BEND = 0.06;

/** A ring's width, in layout pixels, at the edge of the screen and at the boss. */
const WIDE = 34;
const NARROW = 8;

/** How bright a ring's edge is drawn, where it sets off. */
const EDGE = 0.45;

/** How bright the flash is where a ring goes into the boss, and how wide, in body radii. */
const FLASH = 0.55;
const CORE = 0.7;

/** The last share of a beat, in which the ring has gone in and the middle flashes. */
const SWALLOWED = 0.18;

/** One ring: the snapshot bent inside it, and a thin bright edge so an empty room still shows it. */
function ring(
  ctx: CanvasRenderingContext2D,
  snap: HTMLCanvasElement,
  eye: Eye,
  rad: number,
  width: number,
  fade: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(eye.x, eye.y, rad + width / 2, 0, Math.PI * 2);
  ctx.arc(eye.x, eye.y, Math.max(0, rad - width / 2), 0, Math.PI * 2, true);
  ctx.clip();
  drawAbout(ctx, snap, eye, 1 - BEND);
  ctx.restore();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineWidth = Math.max(1, width * 0.12);
  ctx.strokeStyle = `rgba(190,215,255,${EDGE * fade})`;
  ctx.beginPath();
  ctx.arc(eye.x, eye.y, rad + width / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

/**
 * **IMPLODE — the room's light falls into the boss, a ring at a time.** Once
 * every slowed beat a ring sets off from beyond the corners of the screen and
 * closes on the boss's head, slow at first and faster as it falls, like
 * something going down a drain. Inside the ring the field is bent inward — a
 * lens, not a line — with a thin cold edge so it still reads over an empty
 * room. It shrinks into the middle of the boss and the middle flashes as it
 * goes; the next ring is already on its way in.
 *
 * How it can lose: a ring is a moving edge crossing every body on the field
 * once a beat, and a pair watching for a fall may read it as one.
 */
export const implodeWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const up = ramp(win, world.cfg);
  if (up > 0) {
    const at = aim(world, l, world.beat, view.beatPhase);
    const u = beatFrac(win);
    inField(ctx, l, at.x, at.y, (eye) => {
      const snap = snapshot(ctx, 0);
      const r = at.r * eye.px;
      const far = Math.hypot(Math.max(eye.x, eye.w - eye.x), Math.max(eye.y, eye.h - eye.y));
      const fall = Math.min(1, u / (1 - SWALLOWED));
      // Falling: the distance left goes as the square of the time left.
      const rad = far * (1 - fall) ** 2;
      if (fall < 1) {
        const width = (NARROW + (WIDE - NARROW) * (rad / far)) * eye.px;
        ring(ctx, snap, eye, rad, width, up * Math.min(1, rad / r));
      }
      const into = u < 1 - SWALLOWED ? 0 : (u - (1 - SWALLOWED)) / SWALLOWED;
      const flash = up * FLASH * Math.sin(Math.PI * into);
      if (flash > 0) {
        const g = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, r * CORE);
        g.addColorStop(0, `rgba(235,240,255,${flash})`);
        g.addColorStop(1, "rgba(235,240,255,0)");
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = g;
        ctx.fillRect(eye.x - r, eye.y - r, r * 2, r * 2);
      }
    });
  }
  drawFuse(ctx, l, win);
};
