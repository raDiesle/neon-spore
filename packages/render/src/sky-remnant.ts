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
 * Two shells turn very slowly against each other, the outer one way and a
 * fainter inner one the other, so the threads seem to slide over one another;
 * and the dead star is a pulsar, two thin beams of light sweeping round it
 * like a lighthouse's, flashing as they pass.
 *
 * Kept faint: the owner asked for REMNANT *more subtle* on 17 October 2026,
 * so the threads are thinner and dimmer, the beams a pale sweep, and the
 * flash small and soft.
 *
 * The shell and the beams are baked once per size and tint; a frame is the
 * deep sky, the shell twice, the beams and the flash.
 */

const AT = { x: 0.45, y: 0.36 } as const;
/** The shell's radius as a share of the width. */
const RADIUS = 0.62;
/** Radians a second for the two shells, and for the beams. */
const TURN = 0.006;
const SWEEP = 0.5;

/** Two opposite beams from the middle of the sheet, along +x and −x. */
function beams(): HTMLCanvasElement {
  return baked("remnant-beams", 512, 64, (g, w, h) => {
    for (const dir of [-1, 1]) {
      const ray = g.createLinearGradient(w / 2, 0, w / 2 + (dir * w) / 2, 0);
      ray.addColorStop(0, "rgba(232,240,255,0.9)");
      ray.addColorStop(0.4, "rgba(232,240,255,0.25)");
      ray.addColorStop(1, "rgba(232,240,255,0)");
      g.fillStyle = ray;
      g.beginPath();
      g.moveTo(w / 2, h / 2 - 1);
      g.lineTo(w / 2 + (dir * w) / 2, 0);
      g.lineTo(w / 2 + (dir * w) / 2, h);
      g.lineTo(w / 2, h / 2 + 1);
      g.closePath();
      g.fill();
    }
  });
}

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
      g.strokeStyle = withAlpha(out > 0.6 ? amber : inner, 0.15 + hash01(s + 5) * 0.3);
      g.lineWidth = 0.6 + hash01(s + 6) * 1.6;
      g.beginPath();
      g.arc(c, c, rad, a0, a0 + span);
      g.stroke();
    }
    // A faint fill inside the shell, so it reads as a bubble and not a hoop.
    const fill = g.createRadialGradient(c, c, 0, c, c, r);
    fill.addColorStop(0, withAlpha(inner, 0.04));
    fill.addColorStop(0.8, withAlpha(inner, 0.12));
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
    const sheet = shell(tint, size);
    const s = size * swell;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * TURN);
    ctx.globalAlpha = 0.55;
    ctx.drawImage(sheet, -s / 2, -s / 2, s, s);
    // The inner shell, smaller, fainter and turning the other way.
    const inner = s * 0.72;
    ctx.rotate(-time * TURN * 2.5 + 2.4);
    ctx.globalAlpha = 0.25;
    ctx.drawImage(sheet, -inner / 2, -inner / 2, inner, inner);
    // The beams, sweeping round; a wide sheet tilted toward the eye.
    const sweep = time * SWEEP;
    ctx.rotate(time * TURN * 1.5 - 2.4 + sweep);
    const reach = l.width * 0.9;
    ctx.globalAlpha = 0.12 + 0.1 * Math.abs(Math.cos(sweep));
    ctx.drawImage(beams(), -reach, -reach * 0.045, reach * 2, reach * 0.09);
    ctx.restore();
    // The dead star: a flash each time a beam faces us, twice a turn.
    const beat = (((sweep / Math.PI) % 1) + 1) % 1;
    const star = l.width * 0.05;
    ctx.globalAlpha = 0.25 + 0.35 * Math.exp(-beat * 9);
    ctx.drawImage(skyGlow("#E8F0FF", star, [0, 0.1, 1]), cx - star / 2, cy - star / 2, star, star);
  });
}
