import { hash01 } from "./backdrop.js";
import type { Strike } from "./body-hit.js";
import { mixHex, rgba } from "./hex.js";

/**
 * POP — a bubble bursting from the point the shot went in.
 *
 * A bulb is a thin case round a volume, and a thin case round a volume is a
 * bubble; a bubble does not shatter, it **pops**. This is the one strike here
 * that starts from a place rather than from the middle: the bolt came up the
 * column and met the body at the bottom of its contour, so the tear opens
 * there and runs round the outline both ways at once, the two ends racing
 * for the top. What is ahead of the tear is still the body's skin, a stroke
 * of the body's cyan with a bright bead at each running end where the film
 * is pulling back on itself; what is behind it is gone. As the film goes the
 * contour it enclosed lets go — the outline swells outward, thinning, for as
 * long as any of it is still there. Inside, a puff of mist in the body's
 * colour rises and spreads and fades: the volume the case was holding.
 *
 * What it leaves is the film: three or four flecks of it, the bright skin
 * pulled back into beads, fall onto the ship's skin and lie there wet for the
 * rest of the strike.
 *
 * Every colour is the body's cyan or its rim; the mist is the same at a
 * fraction. The shot's colour and the body's are one.
 *
 * **How it can lose.** *A tear is slower than a hit.* The film takes half
 * the strike to be gone, and for that half there is a cyan outline in the
 * lane. It is open — it stops being a closed shape from the first frame — and
 * it is swelling away from where the body was; if at 26 px an open, swelling
 * stroke still reads as a bulb standing in the lane, this loses.
 */

/** The tear has run the whole contour by this share of the strike. */
const TORN_AT = 0.5;
/** How far the freed film swells outward, as a share of the body. */
const SWELL = 0.7;
const FLECKS = 4;

function ease(k: number): number {
  return 1 - (1 - k) * (1 - k);
}

export function pop(ctx: CanvasRenderingContext2D, s: Strike): void {
  const k = Math.min(1, s.age / s.life);
  const r = Math.max(s.rx, s.ry);
  const n = s.outline.length;

  // The film: what is ahead of the tear. The outline is walked from the point
  // nearest the bottom, and the tear has covered `torn` of each half.
  if (k < TORN_AT) {
    const torn = ease(k / TORN_AT);
    const swell = 1 + SWELL * torn;
    // Find the bottom-most point: that is where the bolt met it.
    let start = 0;
    for (let i = 1; i < n; i++) {
      if ((s.outline[i] as { y: number }).y > (s.outline[start] as { y: number }).y) start = i;
    }
    const half = Math.floor(n / 2);
    const left = Math.floor(half * torn);
    ctx.lineWidth = Math.max(1, r * 0.2 * (1 - 0.6 * torn));
    ctx.strokeStyle = mixHex(s.hex, s.rim, 0.5);
    ctx.lineCap = "round";
    for (const dir of [1, -1]) {
      ctx.beginPath();
      let first = true;
      for (let j = left; j <= half; j++) {
        const p = s.outline[(((start + dir * j) % n) + n) % n] as { x: number; y: number };
        if (first) ctx.moveTo(p.x * swell, p.y * swell);
        else ctx.lineTo(p.x * swell, p.y * swell);
        first = false;
      }
      ctx.stroke();
      // The bead at the running end, where the film is pulling back.
      const e = s.outline[(((start + dir * left) % n) + n) % n] as { x: number; y: number };
      ctx.fillStyle = mixHex(s.rim, "#FFFFFF", 0.5);
      ctx.beginPath();
      ctx.arc(e.x * swell, e.y * swell, Math.max(1, r * 0.14), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // The mist: the volume the case was holding, rising, spreading, fading.
  const puff = ease(Math.min(1, k / 0.7));
  const mistR = r * (0.8 + 1.6 * puff);
  const mistY = -r * 1.1 * puff;
  const g = ctx.createRadialGradient(0, mistY, 0, 0, mistY, mistR);
  g.addColorStop(0, rgba(s.rim, 0.8 * (1 - k)));
  g.addColorStop(0.5, rgba(s.hex, 0.45 * (1 - k)));
  g.addColorStop(1, rgba(s.hex, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, mistY, mistR, 0, Math.PI * 2);
  ctx.fill();

  // The flecks: beads of film falling to the ship and lying there wet.
  const t = s.age;
  for (let i = 0; i < FLECKS; i++) {
    const a = Math.PI * (0.15 + 0.7 * hash01(s.seed + i));
    const speed = r * (1.2 + hash01(s.seed + 50 + i) * 1.6);
    const vx = Math.cos(a) * speed * (hash01(s.seed + 90 + i) < 0.5 ? -1 : 1);
    const vy = -Math.sin(a) * speed * 0.6;
    const gr = 12 * r;
    let x = vx * t;
    let y = vy * t + 0.5 * gr * t * t;
    let lying = false;
    if (y >= s.floor) {
      // Landed: where it was when it crossed the line, held there.
      const tl = (-vy + Math.sqrt(vy * vy + 2 * gr * s.floor)) / gr;
      x = vx * tl;
      y = s.floor;
      lying = true;
    }
    const size = Math.max(0.8, r * 0.12);
    ctx.globalAlpha = lying ? 0.8 * (1 - Math.max(0, (k - 0.6) / 0.4)) : 1;
    ctx.fillStyle = lying ? s.hex : mixHex(s.hex, s.rim, 0.7);
    ctx.beginPath();
    ctx.ellipse(x, y, lying ? size * 1.8 : size, lying ? size * 0.5 : size, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
