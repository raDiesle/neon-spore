import { facet } from "../../../../../packages/content/src/surface.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import type { Strike } from "../../../../../packages/render/src/body-hit.js";
import {
  SPORE_PINS,
  SPORE_REACH,
  SPORE_SPIN,
} from "../../../../../packages/render/src/body-spores.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";

/**
 * SCATTER — the spores are set loose.
 *
 * The bulb is a spore case: eleven spheres packed three deep inside it
 * (`body-spores.ts`), and the shipped kill throws squares and wedges of skin
 * and never one of the spores. This is the case failing and its contents
 * getting out. On the beat the contour flashes and is gone, and from where
 * each spore sat — the same eleven pins the interior places them on, so a
 * spore leaves from the place the pair last saw it — a lit ball of the body's
 * cyan flies outward, the deep ones slower and dimmer than the near ones,
 * every one drifting **up** as it slows, because a spore is lighter than the
 * field. Each trails a short thread of its own light, and they blink out one
 * by one over the strike, the last of them well above where the bulb was.
 *
 * It leaves nothing on the ship: spores rise. What it leaves instead is the
 * top of the column, faintly lit for a moment by the last two or three, which
 * is the opposite of every other kill in the game and the reason a pair might
 * remember which body this was.
 *
 * The flash is the rim colour, the spores are the body's cyan pushed toward
 * its rim by how near they were, and the threads are the same at a fraction.
 * The shot's colour and the body's are one.
 *
 * **How it can lose.** *Eleven lit balls in a lane are eleven bodies.* For
 * the first tenth of a second the spores are still inside the contour and
 * read as the bulb; a moment later they are a cloud, and a cloud in a lane
 * the pair has just cleared is the thing `creature:break` warned about. They
 * are small, they leave fast, and they go up out of the lane rather than
 * down it — if that is not enough at 26 px, this loses.
 */

/** How fast a near spore leaves, in tiles per second, how quickly that
 * decays, and the lift, in tiles per second per second, that carries every
 * spore upward as it slows. */
const SPEED = 2.4;
const DRAG = 5;
const LIFT = 3;
/** The flash: how long the contour is held bright, in seconds. */
const FLASH = 0.07;

export function scatter(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);
  const r = Math.max(s.rx, s.ry);
  // The interior's own packing, so a spore leaves from where it sat.
  const reach = Math.min(s.rx, s.ry) * SPORE_REACH;

  if (s.age < FLASH) {
    ctx.beginPath();
    for (let i = 0; i < s.outline.length; i++) {
      const p = s.outline[i] as { x: number; y: number };
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = mixHex(s.rim, "#FFFFFF", 0.5);
    ctx.fill();
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const t = s.age;
  for (let i = 0; i < SPORE_PINS.length; i++) {
    const q = SPORE_PINS[i] as (typeof SPORE_PINS)[number];
    // Each spore has its own moment to go out, the deep ones first.
    const gone = 0.45 + q.depth * 0.5 + hash01(s.seed + i) * 0.1;
    if (k >= gone) continue;
    const fade = 1 - k / gone;
    const f = facet(q.pin, s.t * SPORE_SPIN);
    // Out along the line from the centre through where it sat, slowing, and
    // then up.
    const ox = f.x * reach;
    const oy = f.y * reach;
    const len = Math.hypot(ox, oy) || 1;
    const speed = s.tile * SPEED * q.depth * (0.7 + hash01(s.seed + 20 + i) * 0.6);
    // Distance under drag: speed / DRAG * (1 - e^-DRAG t), and the lift on top.
    const gone1 = (1 - Math.exp(-t * DRAG)) / DRAG;
    const x = ox + (ox / len) * speed * gone1;
    const y = oy + (oy / len) * speed * gone1 - s.tile * LIFT * t * t;
    const size = Math.max(1, r * (0.16 + 0.22 * q.depth) * (1 + 0.4 * Math.min(1, t * 3)));
    const bright = mixHex(s.hex, s.rim, q.depth);
    // The thread behind it: where it was a moment ago.
    const back = Math.min(gone1, 0.06) * speed;
    const bx = x - (ox / len) * back;
    const by = y + s.tile * LIFT * 0.3 * t + back * 0.3;
    ctx.strokeStyle = rgba(bright, 0.5 * fade);
    ctx.lineWidth = Math.max(0.5, size * 0.35);
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(x, y);
    ctx.stroke();
    // The spore: a lit ball, brightest near the key side, the way the
    // interior draws them.
    const g = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, 0, x, y, size);
    g.addColorStop(0, rgba("#FFFFFF", 0.9 * fade));
    g.addColorStop(0.4, rgba(bright, 0.9 * fade));
    g.addColorStop(1, rgba(s.hex, 0.2 * fade));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
