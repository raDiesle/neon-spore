import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * PILLARS — towers of dark dust stand up out of the bottom of the sky,
 * lit from behind.
 *
 * Three columns of cloud, each a stack of soft lumps narrowing upward, black
 * against a bright glow of the act's colour, their right-hand edges caught by
 * the light and their tips glowing where new stars are being made. The glow
 * behind them breathes slowly; the pillars do not move. Their tips do: each
 * holds a newborn star that brightens and dims on its own clock, and thin
 * veils of lit dust drift sideways in front of them, very slowly.
 *
 * The pillars and the veils are baked once per size and tint; a frame is the
 * deep sky, the glow, the pillars, three newborn stars and the veils twice.
 */

interface Pillar {
  readonly x: number;
  /** How far up the sky its tip reaches, as a share from the top. */
  readonly top: number;
  /** Its width at the foot, as a share of the width. */
  readonly foot: number;
  readonly lean: number;
}

const PILLARS: readonly Pillar[] = [
  { x: 0.2, top: 0.3, foot: 0.3, lean: 0.06 },
  { x: 0.55, top: 0.5, foot: 0.22, lean: -0.04 },
  { x: 0.84, top: 0.42, foot: 0.26, lean: 0.03 },
];

function lumps(p: Pillar, w: number, h: number, i: number) {
  const out: { x: number; y: number; r: number }[] = [];
  const n = 26;
  for (let k = 0; k < n; k++) {
    const u = k / (n - 1);
    const y = h - u * (h - p.top * h);
    const r = w * p.foot * (1 - u * 0.78) * (0.42 + hash01(170_000 + i * 100 + k) * 0.2);
    const x = w * (p.x + p.lean * u) + (hash01(171_000 + i * 100 + k) - 0.5) * r * 0.8;
    out.push({ x, y, r });
  }
  return out;
}

function pillarSheet(tint: string, w: number, h: number): HTMLCanvasElement {
  return baked(`pillars${tint}`, w, h, (g, pw, ph) => {
    const rim = mixHex(tint, "#FFE0C0", 0.55);
    const dust = mixHex(tint, "#000000", 0.75);
    PILLARS.forEach((p, i) => {
      const ls = lumps(p, pw, ph, i);
      // The rim: the same lumps a little to the right and lit.
      for (const b of ls) {
        g.fillStyle = withAlpha(rim, 0.5);
        g.beginPath();
        g.arc(b.x + b.r * 0.12, b.y - b.r * 0.06, b.r, 0, Math.PI * 2);
        g.fill();
      }
      for (const b of ls) {
        const body = g.createRadialGradient(b.x - b.r * 0.2, b.y, 0, b.x, b.y, b.r);
        body.addColorStop(0, dust);
        body.addColorStop(0.85, dust);
        body.addColorStop(1, withAlpha(dust, 0.6));
        g.fillStyle = body;
        g.beginPath();
        g.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        g.fill();
      }
      // The tip, where the light is making stars.
      const tip = ls[ls.length - 1];
      if (tip) {
        const t = g.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, tip.r * 2.2);
        t.addColorStop(0, withAlpha("#FFF0DC", 0.7));
        t.addColorStop(1, withAlpha(rim, 0));
        g.fillStyle = t;
        g.fillRect(tip.x - tip.r * 2.2, tip.y - tip.r * 2.2, tip.r * 4.4, tip.r * 4.4);
      }
    });
  });
}

/** Veils of dust across a sheet two widths wide, tiling sideways. */
function veilSheet(tint: string, w: number, h: number): HTMLCanvasElement {
  return baked(`pillar-veils${tint}`, w * 2, h, (g, pw, ph) => {
    const lit = mixHex(tint, "#FFE0C0", 0.35);
    for (let i = 0; i < 14; i++) {
      const s = 173_000 + i * 5;
      const x = hash01(s + 1) * pw;
      const y = ph * (0.35 + hash01(s + 2) * 0.6);
      const rx = pw * (0.08 + hash01(s + 3) * 0.12);
      const ry = rx * (0.18 + hash01(s + 4) * 0.2);
      for (const dx of [-pw, 0, pw]) {
        g.save();
        g.translate(x + dx, y);
        g.scale(1, ry / rx);
        const veil = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        veil.addColorStop(0, withAlpha(lit, 0.12 + hash01(s + 5) * 0.1));
        veil.addColorStop(1, withAlpha(lit, 0));
        g.fillStyle = veil;
        g.fillRect(-rx, -rx, rx * 2, rx * 2);
        g.restore();
      }
    }
  });
}

/** Widths a second the veils drift. */
const VEIL_DRIFT = 0.004;

export function skyPillars(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 172_000, far: 160 });
  const tint = actTint(d, 0.45);
  lighter(ctx, () => {
    const size = l.width * 2;
    ctx.globalAlpha = 0.5 + 0.12 * Math.sin(time * 0.25);
    ctx.drawImage(
      skyGlow(tint, size),
      l.width * 0.6 - size / 2,
      height * 0.45 - size / 2,
      size,
      size,
    );
  });
  ctx.globalAlpha = 0.95;
  ctx.drawImage(pillarSheet(tint, l.width, height), 0, 0, l.width, height);
  lighter(ctx, () => {
    // The newborn stars in the tips, each on its own clock.
    const born = skyGlow("#FFF4E4", 64, [0, 0.15, 1]);
    PILLARS.forEach((p, i) => {
      const x = l.width * (p.x + p.lean);
      const y = height * p.top;
      const k = 0.5 + 0.5 * Math.sin(time * (0.5 + i * 0.17) + i * 2.3);
      const size = l.width * (0.05 + 0.03 * k);
      ctx.globalAlpha = 0.4 + 0.5 * k;
      ctx.drawImage(born, x - size / 2, y - size / 2, size, size);
    });
    // The veils, drifting in front.
    const veils = veilSheet(tint, l.width, height);
    const f = time * VEIL_DRIFT * 0.5;
    const x = -(f - Math.floor(f)) * l.width * 2;
    ctx.globalAlpha = 0.8;
    ctx.drawImage(veils, x, 0, l.width * 2, height);
    ctx.drawImage(veils, x + l.width * 2, 0, l.width * 2, height);
  });
  ctx.globalAlpha = 1;
}
