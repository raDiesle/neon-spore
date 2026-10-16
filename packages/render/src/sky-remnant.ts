import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * REMNANT — the shell of a star that blew up, filling the sky.
 *
 * A huge ragged ring of glowing threads, amber on its outer edge and the
 * act's colour inside, torn open on one side, and at its centre the tiny
 * dead star that is left, flashing. The shell is still growing, too slowly
 * for anyone to see — it swells by a hair and settles on a slow breath.
 *
 * The shell is baked once per size and tint; a frame is the stars, one
 * scaled blit and the flash.
 */

const AT = { x: 0.45, y: 0.36 } as const;
/** The shell's radius as a share of the width. */
const RADIUS = 0.62;

function shell(tint: string, size: number): HTMLCanvasElement {
  return baked(`remnant${tint}`, size, size, (g, w) => {
    const c = w / 2;
    const r = c * 0.82;
    const amber = mixHex(tint, "#FFB060", 0.6);
    const inner = mixHex(tint, "#C8B8FF", 0.4);
    g.lineCap = "round";
    // Threads: short arcs at a ragged radius, outer ones amber.
    for (let i = 0; i < 340; i++) {
      const s = 200_000 + i * 6;
      const a0 = hash01(s + 1) * Math.PI * 2;
      // Torn open toward the lower right.
      const gap = Math.cos(a0 - Math.PI * 0.25);
      if (gap > 0.85 && hash01(s + 2) < 0.8) continue;
      const out = hash01(s + 3);
      const rad = r * (0.72 + out * 0.3 + Math.sin(a0 * 7 + i) * 0.03);
      const span = 0.08 + hash01(s + 4) * 0.35;
      g.strokeStyle = withAlpha(out > 0.6 ? amber : inner, 0.25 + hash01(s + 5) * 0.45);
      g.lineWidth = 0.8 + hash01(s + 6) * 2.4;
      g.beginPath();
      g.arc(c, c, rad, a0, a0 + span);
      g.stroke();
    }
    // A faint fill inside the shell, so it reads as a bubble and not a hoop.
    const fill = g.createRadialGradient(c, c, 0, c, c, r);
    fill.addColorStop(0, withAlpha(inner, 0.08));
    fill.addColorStop(0.8, withAlpha(inner, 0.22));
    fill.addColorStop(1, withAlpha(inner, 0));
    g.fillStyle = fill;
    g.fillRect(0, 0, w, w);
  });
}

export function skyRemnant(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 210_000, far: 170 });
  const tint = actTint(d, 0.4);
  const cx = l.width * AT.x;
  const cy = height * AT.y;
  const size = (l.width * RADIUS * 2) / 0.82;
  const swell = 1 + 0.015 * Math.sin(time * 0.3);
  lighter(ctx, () => {
    ctx.globalAlpha = 0.9;
    const s = size * swell;
    ctx.drawImage(shell(tint, size), cx - s / 2, cy - s / 2, s, s);
    // The dead star: a flash a little faster than a heartbeat.
    const beat = (time * 1.4) % 1;
    const star = l.width * 0.07;
    ctx.globalAlpha = 0.35 + 0.6 * Math.exp(-beat * 9);
    ctx.drawImage(skyGlow("#E8F0FF", star, [0, 0.1, 1]), cx - star / 2, cy - star / 2, star, star);
  });
}
