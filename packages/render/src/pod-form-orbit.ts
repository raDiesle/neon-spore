import { halo } from "./glow.js";
import { faded } from "./pod-fade.js";
import { countSwell, drawShine, type PodDraw } from "./pod-pickup.js";
import { blinkAt, type Seed, seedAt, type V } from "./pod-seed.js";
import { drawBack, drawFront, type SeedLight } from "./pod-seed-draw.js";
import { FAKE_PAINT, REAL_PAINT, type SeedPaint } from "./pod-seed-paint.js";

/**
 * **ORBIT** — the seed panelled like a ball and spiked with cones, circled by
 * three white sparks on a tilted ring that pass in front of it and behind,
 * the way a power-up is circled in a game. It flashes on the count, the
 * coin's shine crosses it, and the sparks circle faster as the clock runs out.
 *
 * **Its fake is an ECLIPSE.** In dark blood-red with red sparks, and on the
 * count the light goes out of it: the body turns black inside a red corona,
 * the opposite of a bonus's flash.
 */
const STYLE = { spike: "cone", skin: "panels" } as const;
const SPARKS = 3;
const TAIL = 9;
/** The ring's tilt: its near side dips, so it reads as a ring, not a line. */
const TILT = 0.42;

export const drawOrbitForm: PodDraw = (ctx, x, y, r, t, beatsLeft, fake) => {
  const s = seedAt(x, y, r, t, beatsLeft);
  const flash = blinkAt(t, beatsLeft);
  const spin = t * (1.6 + 2.6 * s.awake);
  const paint = fake ? FAKE_PAINT : REAL_PAINT;
  const light: SeedLight = { flash, paint, ...STYLE };
  const lit = 0.6 + 0.4 * flash;
  drawBack(ctx, s, light);
  sparks(ctx, s, spin, lit, false, paint);
  ctx.restore();
  ctx.save();
  drawFront(ctx, s, light);
  if (!fake) drawShine(ctx, s, t);
  else eclipse(ctx, s, countSwell(t, beatsLeft, 0.45));
  sparks(ctx, s, spin, lit, true, paint);
};

function at(a: number): V {
  return { x: Math.cos(a), y: Math.sin(a) * Math.sin(TILT), z: Math.sin(a) * Math.cos(TILT) };
}

/**
 * The sparks on one side of the sphere — the near side over it, the far
 * under. Their tails are one fill a side and their heads another, the tail
 * thinning toward its end, because a pod is in the frame's op budget
 * (`wave-budget.test.ts`).
 */
function sparks(
  ctx: CanvasRenderingContext2D,
  s: Seed,
  spin: number,
  lit: number,
  near: boolean,
  paint: SeedPaint,
) {
  const rr = s.R * 1.65;
  const head = paint === REAL_PAINT ? "#FFFFFF" : paint.flashRim;
  const heads: { x: number; y: number; r: number }[] = [];
  ctx.globalAlpha = faded(lit * (near ? 0.6 : 0.35));
  ctx.fillStyle = paint.tip;
  ctx.beginPath();
  for (let k = 0; k < SPARKS; k++) {
    const a0 = spin + (k / SPARKS) * Math.PI * 2;
    for (let j = TAIL; j >= 0; j--) {
      const p = at(a0 - j * 0.11);
      if (p.z > 0 !== near) continue;
      const depth = 0.55 + 0.45 * p.z;
      const px = s.x + p.x * rr;
      const py = s.y + p.y * rr;
      if (j === 0) {
        heads.push({ x: px, y: py, r: s.R * 0.3 * depth });
        continue;
      }
      const rad = s.R * 0.2 * (1 - j / (TAIL + 1)) * depth;
      ctx.moveTo(px + rad, py);
      ctx.arc(px, py, rad, 0, Math.PI * 2);
    }
  }
  ctx.fill();
  if (heads.length === 0) return;
  ctx.globalAlpha = faded(lit * (near ? 1 : 0.55));
  ctx.fillStyle = head;
  ctx.beginPath();
  for (const h of heads) {
    ctx.moveTo(h.x + h.r, h.y);
    ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
  }
  ctx.fill();
  if (near) for (const h of heads) halo(ctx, h.x, h.y, s.R * 0.9, head, 0.5 * lit);
}

/** The light going out: black over the body inside a red ring, `k` 0..1. */
function eclipse(ctx: CanvasRenderingContext2D, s: Seed, k: number) {
  if (k <= 0.05) return;
  ctx.globalAlpha = faded(k);
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = FAKE_PAINT.flashRim;
  ctx.lineWidth = Math.max(1.5, s.R * 0.16);
  ctx.stroke();
  halo(ctx, s.x, s.y, s.R * 2.2, FAKE_PAINT.halo, 0.45 * k);
}
