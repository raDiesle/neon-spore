import * as look from "../../../../../packages/render/src/pod-look.js";
import { patch, type Variant } from "../../../variant.js";
import { drawBack, drawFront, type Moored, type Seed, seedAt, tipOf } from "../seed.js";

/**
 * **SMART, glinting like a gem** — the same tumbling seed, with a bar of
 * white light sweeping across the sphere every second and a half, and the
 * stud tips that face the viewer taking turns to twinkle as four-point stars.
 * The sweep comes three times as often once the clock is running out.
 */
export const glintPod: Moored = (ctx, l, x, y, t, beatsLeft) => {
  const s = seedAt(l, x, y, t, beatsLeft);
  const style = { spike: "crystal", skin: "facets" } as const;
  drawBack(ctx, s, style);
  ctx.save();
  drawFront(ctx, s, style);
  sweep(ctx, s, (t * (0.7 + 1.4 * s.awake)) % 1);
  twinkles(ctx, s, t);
  ctx.restore();
};

/** The bar of light, `u` 0..1 across, clipped to the sphere, bright mid-sweep. */
function sweep(ctx: CanvasRenderingContext2D, s: Seed, u: number) {
  if (u > 0.45) return;
  const k = u / 0.45;
  const off = (k * 2 - 1) * s.R * 1.6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.R, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(s.x + off, s.y - off * 0.3);
  ctx.rotate(-0.6);
  ctx.globalAlpha = 0.85 * Math.sin(k * Math.PI);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(-s.R * 0.16, -s.R * 1.6, s.R * 0.32, s.R * 3.2);
  ctx.globalAlpha *= 0.5;
  ctx.fillRect(s.R * 0.26, -s.R * 1.6, s.R * 0.1, s.R * 3.2);
  ctx.restore();
}

/** Each near stud tip, in its turn, a four-point star that opens and shuts. */
function twinkles(ctx: CanvasRenderingContext2D, s: Seed, t: number) {
  s.studs.forEach((d, i) => {
    if (d.z < 0.1) return;
    const ph = (t * 0.9 + i * 0.37) % 1;
    if (ph > 0.3) return;
    const k = Math.sin((ph / 0.3) * Math.PI);
    const tip = tipOf(s, d);
    star(ctx, tip.x, tip.y, s.R * (0.25 + 0.45 * k), k);
  });
  // And one on the highlight, slower.
  const k = Math.max(0, Math.sin(t * 2.1)) ** 6;
  star(ctx, s.x - s.R * 0.4, s.y - s.R * 0.45, s.R * 0.7 * k, k);
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  if (r <= 0.5 || a <= 0) return;
  ctx.globalAlpha = a;
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const rr = i % 2 === 0 ? r : r * 0.18;
    ctx.lineTo(x + Math.cos(ang - Math.PI / 2) * rr, y + Math.sin(ang - Math.PI / 2) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

export const POD_REAL_GLINT: Variant = {
  slot: "pod:real",
  name: "glint",
  sentence:
    "SMART's tumbling seed cut into facets and set with crystal shards — a bar of white light sweeping across it, its near spike tips twinkling in turn as stars, like a gem to be picked up",
  dir: "tools/versus/candidates/pod-real/glint",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: glintPod },
    }),
  ],
};
