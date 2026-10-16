import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * GALAXY — a spiral galaxy, tilted, turning behind the field.
 *
 * Two arms wound out of a warm core, made of a few thousand soft points in
 * the act's colour, seen at a slant so the disc is an ellipse, and turning
 * once every few minutes. It sits high and to the right, half of it off the
 * edge, so the middle columns get its quiet outer arms and not its core.
 *
 * Baked face-on once per size and tint; a frame turns and squashes it in one
 * transform and blits it — the stars, the galaxy and its core glow.
 */

const AT = { x: 0.78, y: 0.24 } as const;
/** Radius as a share of the width. */
const RADIUS = 0.95;
/** How flat the slant makes it, and which way it leans. */
const SQUASH = 0.42;
const LEAN = -0.45;
/** Radians a second. */
const TURN = 0.012;

function galaxySheet(tint: string, size: number): HTMLCanvasElement {
  return baked(`galaxy${tint}`, size, size, (g, w) => {
    const r = w / 2;
    const arm = mixHex(tint, "#C8D4FF", 0.45);
    const hot = mixHex(tint, "#FFE6C8", 0.7);
    // A haze along the whole disc, under the arms.
    const haze = g.createRadialGradient(r, r, 0, r, r, r);
    haze.addColorStop(0, withAlpha(hot, 0.5));
    haze.addColorStop(0.25, withAlpha(tint, 0.35));
    haze.addColorStop(1, withAlpha(tint, 0));
    g.fillStyle = haze;
    g.fillRect(0, 0, w, w);
    // Two logarithmic arms, each a cloud of points scattered about its line.
    // Wound so the arm's far end lands just inside the rim.
    const turns = Math.PI * 3.2;
    const pitch = Math.log(0.95 / 0.08) / turns;
    for (let a = 0; a < 2; a++) {
      for (let i = 0; i < 2600; i++) {
        const s = 40_000 + a * 7000 + i * 4;
        const u = hash01(s + 1);
        const along = u * turns;
        const theta = along + a * Math.PI;
        const rad = r * 0.08 * Math.exp(pitch * along);
        if (rad > r * 0.98) continue;
        const spread = (hash01(s + 2) - 0.5) * (0.12 + u * 0.2) * rad;
        const ang = theta + (hash01(s + 3) - 0.5) * 0.35;
        const x = r + Math.cos(ang) * (rad + spread);
        const y = r + Math.sin(ang) * (rad + spread);
        const fade = 1 - rad / r;
        const dot = 0.6 + hash01(s + 4) * 1.4;
        g.fillStyle = withAlpha(hash01(s + 4) < 0.15 ? hot : arm, 0.18 + fade * 0.5);
        g.fillRect(x - dot / 2, y - dot / 2, dot, dot);
        // A soft puff under every few points, so an arm is a cloud and not a
        // string of beads.
        if (i % 3 === 0) {
          const puff = r * (0.03 + fade * 0.05);
          const p = g.createRadialGradient(x, y, 0, x, y, puff);
          p.addColorStop(0, withAlpha(arm, 0.08 + fade * 0.08));
          p.addColorStop(1, withAlpha(arm, 0));
          g.fillStyle = p;
          g.fillRect(x - puff, y - puff, puff * 2, puff * 2);
        }
      }
    }
    // Dust lanes on the inner edge of each arm.
    g.strokeStyle = "rgba(4,3,10,0.28)";
    g.lineWidth = r * 0.04;
    for (let a = 0; a < 2; a++) {
      g.beginPath();
      for (let k = 0; k <= 60; k++) {
        const along = (k / 60) * turns * 0.8;
        const theta = along + a * Math.PI + 0.25;
        const rad = r * 0.09 * Math.exp(pitch * along);
        const x = r + Math.cos(theta) * rad;
        const y = r + Math.sin(theta) * rad;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
  });
}

export function skyGalaxy(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 52_000, far: 200 });

  const tint = actTint(d, 0.4);
  const r = l.width * RADIUS;
  const cx = l.width * AT.x;
  const cy = height * AT.y;
  const sheet = galaxySheet(tint, r * 2);
  lighter(ctx, () => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(LEAN);
    ctx.scale(1, SQUASH);
    ctx.rotate(time * TURN);
    ctx.globalAlpha = 0.72;
    ctx.drawImage(sheet, -r, -r, r * 2, r * 2);
    ctx.restore();
    const core = r * 0.55;
    ctx.globalAlpha = 0.55;
    ctx.drawImage(
      skyGlow(mixHex(tint, "#FFE6C8", 0.6), core),
      cx - core / 2,
      cy - core / 2,
      core,
      core,
    );
  });
}
