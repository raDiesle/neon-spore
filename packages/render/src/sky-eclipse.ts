import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * ECLIPSE — a dark world stands in front of a star, far off in the sky.
 *
 * A small disc a shade darker than space, high on the right, its edge lit:
 * a thin ring of light, a faint corona of long uneven streamers turning very
 * slowly around it, one small bead of the star breaking past the limb, and a
 * soft glow of the act's colour around it.
 *
 * It was a big black disc in a burning ring at the top of the field until
 * 16 October 2026, and the owner said players would take it for an enemy.
 * So it is smaller, off the middle where the bodies come down, and quiet:
 * the corona is a haze and the disc is the sky with the stars taken out,
 * not a hole.
 *
 * It is alive the way a corona is: two layers of streamers turn against
 * each other, so the light seems to stir rather than spin; loops of rose
 * prominence stand on the limb and swell and fade; the bead breathes.
 *
 * The corona and the loops are baked once per size and tint; a frame is the
 * deep sky, the glow, the corona twice, the loops, the bead and the black disc.
 */

const AT = { x: 0.8, y: 0.16 } as const;
/** The black disc's radius, as a share of the width. */
const RADIUS = 0.06;
const TURN = 0.02;
/** The prominences' colour: a rose, well off a body's red. */
const ROSE = "#F0A8D0";

/** Arches of glowing gas standing on the limb, in the corona's own frame. */
function loops(size: number): HTMLCanvasElement {
  return baked("eclipse-loops", size, size, (g, w) => {
    const c = w / 2;
    const r = c * 0.32;
    g.lineCap = "round";
    for (let i = 0; i < 5; i++) {
      const a = hash01(123_000 + i) * Math.PI * 2;
      const span = 0.08 + hash01(124_000 + i) * 0.14;
      const tall = r * (0.12 + hash01(125_000 + i) * 0.22);
      const x0 = c + Math.cos(a - span) * r;
      const y0 = c + Math.sin(a - span) * r;
      const x1 = c + Math.cos(a + span) * r;
      const y1 = c + Math.sin(a + span) * r;
      const mx = c + Math.cos(a) * (r + tall * 2);
      const my = c + Math.sin(a) * (r + tall * 2);
      for (const [lw, al] of [
        [6, 0.18],
        [2.5, 0.55],
      ] as const) {
        g.strokeStyle = withAlpha(ROSE, al);
        g.lineWidth = lw * (w / 512);
        g.beginPath();
        g.moveTo(x0, y0);
        g.quadraticCurveTo(mx, my, x1, y1);
        g.stroke();
      }
    }
  });
}

function corona(colour: string, size: number): HTMLCanvasElement {
  return baked(`corona${colour}`, size, size, (g, w) => {
    const c = w / 2;
    const r = c * 0.32;
    // Streamers: long thin wedges of light, uneven.
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2 + hash01(120_000 + i) * 0.12;
      const len = r * (1.25 + hash01(121_000 + i) ** 2 * 1.9);
      const wid = 0.02 + hash01(122_000 + i) ** 2 * 0.11;
      const grad = g.createRadialGradient(c, c, r * 0.9, c, c, len);
      grad.addColorStop(0, withAlpha(colour, 0.38));
      grad.addColorStop(1, withAlpha(colour, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(c + Math.cos(a - wid) * r, c + Math.sin(a - wid) * r);
      g.lineTo(c + Math.cos(a) * len, c + Math.sin(a) * len);
      g.lineTo(c + Math.cos(a + wid) * r, c + Math.sin(a + wid) * r);
      g.closePath();
      g.fill();
    }
    // The inner corona, hugging the limb.
    const inner = g.createRadialGradient(c, c, r * 0.95, c, c, r * 1.6);
    inner.addColorStop(0, withAlpha("#FFF6E8", 0.6));
    inner.addColorStop(0.15, withAlpha(colour, 0.6));
    inner.addColorStop(1, withAlpha(colour, 0));
    g.fillStyle = inner;
    g.fillRect(0, 0, w, w);
  });
}

export function skyEclipse(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  drawDeepSky(d, { seed: 130_000, far: 150 });

  const tint = actTint(d, 0.45);
  const light = mixHex(tint, "#FFE0C0", 0.5);
  const r = l.width * RADIUS;
  const cx = l.width * AT.x;
  const cy = height * AT.y;

  lighter(ctx, () => {
    // The light falling down the sky from it.
    const fall = l.width * 1.1;
    ctx.globalAlpha = 0.1;
    ctx.drawImage(skyGlow(tint, fall, [0, 0.3, 1]), cx - fall / 2, cy - fall / 2, fall, fall);
    const size = (r / 0.32) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * TURN);
    const sheet = corona(light, size);
    ctx.globalAlpha = 0.2;
    ctx.drawImage(sheet, -size / 2, -size / 2, size, size);
    // The outer layer, larger and turning the other way.
    const outer = size * 1.3;
    ctx.rotate(-time * TURN * 2.6 + 1.7);
    ctx.globalAlpha = 0.12 + 0.04 * Math.sin(time * 0.35);
    ctx.drawImage(sheet, -outer / 2, -outer / 2, outer, outer);
    // The loops turn with neither, slower still, and breathe.
    ctx.rotate(time * TURN * 2.1);
    ctx.globalAlpha = 0.22 + 0.1 * Math.sin(time * 0.6);
    ctx.drawImage(loops(512), -size / 2, -size / 2, size, size);
    ctx.restore();
  });

  // The bead: the star breaking past the lower-right limb, breathing.
  lighter(ctx, () => {
    const a = 0.75;
    const bx = cx + Math.cos(a) * r;
    const by = cy + Math.sin(a) * r;
    const bead = r * (0.7 + 0.08 * Math.sin(time * 1.3));
    ctx.globalAlpha = 0.3;
    ctx.drawImage(skyGlow("#FFF6E8", r, [0, 0.1, 1]), bx - bead / 2, by - bead / 2, bead, bead);
  });

  // The disc last, so the bead shows only past the limb.
  // Not quite opaque: the haze behind still shows a little through it.
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#06050D";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
