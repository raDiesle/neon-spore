import { hash01, withAlpha } from "./backdrop.js";
import type { BackdropDraw } from "./backdrop-look.js";
import { mixHex } from "./hex.js";
import { drawDeepSky } from "./sky-depth.js";
import { actTint, baked, lighter, skyGlow } from "./sky-kit.js";

/**
 * HOLE — a black hole high on the left, its disc on fire.
 *
 * A flat disc of gas, white-hot at its inner edge and cooling to the act's
 * colour outward, seen nearly edge-on and turning; the far half of it passes
 * behind the hole and the near half in front, and a thin bright ring of
 * bent light hugs the black. The stars nearest it are swallowed.
 *
 * Out of both poles a thin jet of blue-white goes up and down the sky,
 * flickering, knots of it running outward; the side of the disc turning
 * toward us burns brighter than the side turning away, and that bright side
 * breathes.
 *
 * The disc is baked face-on once per size and tint; a frame turns and
 * squashes it twice, the far half and the near half, each under a clip, and
 * lays the jets and the bright side over it.
 */

const AT = { x: 0.3, y: 0.3 } as const;
/** The shadow's radius, and the disc's, as shares of the width. */
const SHADOW = 0.09;
const DISC = 0.5;
const SQUASH = 0.2;
const LEAN = 0.18;
const TURN = 0.25;
const JET = "#C8D8FF";
/** How many knots run up each jet. */
const KNOTS = 4;

/** One jet, pointing up from the bottom centre of its sheet: a narrow cone
 * of light, brightest at the hole, fading as it goes. */
function jetSheet(): HTMLCanvasElement {
  return baked("hole-jet", 32, 256, (g, w, h) => {
    const along = g.createLinearGradient(0, h, 0, 0);
    along.addColorStop(0, withAlpha(JET, 0.9));
    along.addColorStop(0.3, withAlpha(JET, 0.35));
    along.addColorStop(1, withAlpha(JET, 0));
    g.fillStyle = along;
    g.beginPath();
    g.moveTo(w / 2 - 1.5, h);
    g.lineTo(w * 0.15, 0);
    g.lineTo(w * 0.85, 0);
    g.lineTo(w / 2 + 1.5, h);
    g.closePath();
    g.fill();
  });
}

/** The jets and their knots, in the hole's frame leaned with the disc. */
function drawJets(d: BackdropDraw, cx: number, cy: number, reach: number): void {
  const { ctx, time } = d;
  const jet = jetSheet();
  const knot = skyGlow(JET, 64, [0, 0.25, 1]);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(LEAN);
  // The up jet, then the frame flipped for the down one.
  for (const dir of [0, 1]) {
    if (dir === 1) ctx.scale(1, -1);
    const flicker = 0.75 + 0.15 * Math.sin(time * 3.1 + dir) + 0.1 * Math.sin(time * 7.3);
    const tall = reach * (0.92 + 0.08 * Math.sin(time * 0.8 + dir));
    const wide = reach * 0.07;
    ctx.globalAlpha = 0.42 * flicker;
    ctx.drawImage(jet, -wide / 2, -tall, wide, tall);
    for (let k = 0; k < KNOTS; k++) {
      const p = time * 0.09 + k / KNOTS + dir * 0.13;
      const u = p - Math.floor(p);
      const size = reach * (0.05 - 0.025 * u);
      ctx.globalAlpha = 0.7 * (1 - u) * Math.min(1, u * 8);
      ctx.drawImage(knot, -size / 2, -u * tall - size / 2, size, size);
    }
  }
  ctx.restore();
}

function discSheet(tint: string, size: number): HTMLCanvasElement {
  return baked(`hole-disc${tint}`, size, size, (g, w) => {
    const r = w / 2;
    const inner = r * (SHADOW / DISC) * 1.4;
    const hot = "#FFF4E0";
    const warm = mixHex(tint, "#FFB070", 0.6);
    const grad = g.createRadialGradient(r, r, inner, r, r, r);
    grad.addColorStop(0, withAlpha(hot, 1));
    grad.addColorStop(0.12, withAlpha(warm, 0.85));
    grad.addColorStop(0.45, withAlpha(tint, 0.45));
    grad.addColorStop(1, withAlpha(tint, 0));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(r, r, r, 0, Math.PI * 2);
    g.arc(r, r, inner, 0, Math.PI * 2, true);
    g.fill();
    // Streaks round the disc, so the turn can be seen.
    for (let i = 0; i < 90; i++) {
      const rad = inner + hash01(140_000 + i) ** 1.5 * (r - inner);
      const a0 = hash01(141_000 + i) * Math.PI * 2;
      const span = 0.3 + hash01(142_000 + i) * 0.9;
      g.strokeStyle = withAlpha(hash01(143_000 + i) < 0.5 ? hot : "#000000", 0.18);
      g.lineWidth = 1 + hash01(144_000 + i) * 2.5;
      g.beginPath();
      g.arc(r, r, rad, a0, a0 + span);
      g.stroke();
    }
  });
}

/** The disc turned, squashed and clipped to one side of the hole's centre
 * line: `far` is the half above it, behind the black; the rest is in front. */
function drawDisc(d: BackdropDraw, sheet: HTMLCanvasElement, r: number, far: boolean): void {
  const { ctx, l, time } = d;
  const cx = l.width * AT.x;
  const cy = l.bandTop * AT.y;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(LEAN);
  ctx.beginPath();
  ctx.rect(-r * 1.2, far ? -r : 0, r * 2.4, r);
  ctx.clip();
  ctx.scale(1, SQUASH);
  ctx.rotate(time * TURN);
  ctx.drawImage(sheet, -r, -r, r * 2, r * 2);
  ctx.restore();
}

export function skyHole(d: BackdropDraw): void {
  const { ctx, l, time } = d;
  const height = l.bandTop;
  if (height <= 0 || l.width <= 0) return;
  const cx = l.width * AT.x;
  const cy = height * AT.y;
  // Fewer stars the nearer the hole: it has eaten its neighbours.
  const near = (x: number, y: number) =>
    Math.min(1, Math.hypot((x - AT.x) * 1, (y - AT.y) * (height / l.width)) / 0.35);
  drawDeepSky(d, { seed: 150_000, far: 190, weight: near, key: "hole" });

  const tint = actTint(d, 0.45);
  const r = l.width * DISC;
  const shadow = l.width * SHADOW;
  const sheet = discSheet(tint, r * 2);
  lighter(ctx, () => {
    const halo = l.width * 1.4;
    ctx.globalAlpha = 0.22;
    ctx.drawImage(skyGlow(tint, halo), cx - halo / 2, cy - halo / 2, halo, halo);
    ctx.globalAlpha = 0.85;
    drawDisc(d, sheet, r, true);
    // The bent light: the far side of the disc seen over the top of the hole.
    const ring = shadow * 3.2;
    ctx.globalAlpha = 0.9 + 0.1 * Math.sin(time * 0.7);
    ctx.drawImage(
      skyGlow("#FFE8C8", ring, [0.66, 0.74, 1]),
      cx - ring / 2,
      cy - ring / 2,
      ring,
      ring,
    );
  });
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(cx, cy, shadow, 0, Math.PI * 2);
  ctx.fill();
  lighter(ctx, () => {
    ctx.globalAlpha = 0.9;
    drawDisc(d, sheet, r, false);
    // The side turning toward us, brighter: a glow on the disc's left.
    const bright = r * 0.9;
    const bx = cx - Math.cos(LEAN) * r * 0.42;
    const by = cy - Math.sin(LEAN) * r * 0.42;
    ctx.globalAlpha = 0.3 + 0.1 * Math.sin(time * 0.9);
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(LEAN);
    ctx.scale(1, SQUASH * 1.6);
    ctx.drawImage(skyGlow("#FFF0DC", 256, [0, 0.3, 1]), -bright / 2, -bright / 2, bright, bright);
    ctx.restore();
    drawJets(d, cx, cy, height * 0.55);
  });
}
