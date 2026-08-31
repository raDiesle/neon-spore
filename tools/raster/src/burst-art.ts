/**
 * One frame of the burst, drawn into a 2D context.
 *
 * It is a picture rather than a rule, which is the whole point of the
 * exercise: this runs **once**, offline, in a browser that has all the time in
 * the world, and what ships is the pixels it produced. Nothing in the game
 * ever executes it. That is what a baked effect buys — cost paid at build
 * time, and a look that no per-frame budget has to be argued with.
 *
 * The shape follows the reference the owner attached: a hot core, a crown of
 * thin spikes at irregular angles and lengths, a soft violet bloom behind
 * them, and a fifth stage that is nothing but pale needles. Colours are the
 * game's own — `PALETTE.hull` and its rim, so a hit belongs to the same world
 * as the thing it happens to.
 *
 * **Self-contained on purpose.** `render.ts` ships this function into a
 * headless page with `Function.prototype.toString`, so a reference to
 * anything outside its own body would arrive as a crash rather than as a
 * type error. It carries its own random number generator for the same reason
 * `packages/sim` does: two runs of the generator must produce the same asset,
 * or a regenerated file is an unreviewable diff.
 */
export function drawBurstFrame(
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; spikes: number; seed: number },
): void {
  const { size, t, spikes, seed } = options;
  let state = seed >>> 0;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const cx = size / 2;
  const cy = size / 2;
  const ease = 1 - (1 - t) * (1 - t) * (1 - t);
  const fade = t < 0.12 ? t / 0.12 : Math.max(0, 1 - (t - 0.12) / 0.88);
  const reach = size * (0.06 + 0.44 * ease);

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, reach * 1.05));
  const bloomAlpha = 0.55 * fade * (1 - t * 0.55);
  bloom.addColorStop(0, `rgba(255, 214, 255, ${bloomAlpha})`);
  bloom.addColorStop(0.35, `rgba(192, 92, 255, ${bloomAlpha * 0.7})`);
  bloom.addColorStop(1, "rgba(120, 40, 220, 0)");
  ctx.fillStyle = bloom;
  ctx.beginPath();
  ctx.arc(0, 0, Math.max(1, reach * 1.05), 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < spikes; i++) {
    const angle = (i / spikes) * Math.PI * 2 + (random() - 0.5) * 0.42;
    const long = 0.45 + random() * 0.85;
    const late = random();
    // Uncapped, the longest spikes at the latest ease reach 1.28× the frame
    // size from centre — the canvas is only 0.5× that from centre to edge, so
    // they were not fading out, they were being hard-clipped by the canvas
    // boundary square. The gradient already fades every spike to alpha 0 at
    // its own tip; the clamp only keeps that tip inside the frame that has to
    // draw it, so what ships is the fade the gradient always intended rather
    // than a flat cut partway through it.
    const length = Math.min(reach * (0.8 + long * 1.35) * (0.55 + 0.45 * ease), size * 0.47);
    const width = Math.max(0.6, size * 0.028 * (1 - t * 0.72) * (0.5 + long * 0.6));
    const alpha = fade * (0.35 + late * 0.65) * (1 - t * 0.35);
    if (alpha <= 0.01) continue;

    ctx.save();
    ctx.rotate(angle);
    const shaft = ctx.createLinearGradient(0, 0, length, 0);
    shaft.addColorStop(0, `rgba(255, 120, 255, ${alpha})`);
    shaft.addColorStop(0.4, `rgba(170, 80, 255, ${alpha * 0.85})`);
    shaft.addColorStop(1, `rgba(228, 210, 255, 0)`);
    ctx.fillStyle = shaft;
    ctx.beginPath();
    ctx.moveTo(0, -width);
    ctx.lineTo(length, 0);
    ctx.lineTo(0, width);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  const coreRadius = Math.max(0.5, size * 0.11 * (1 - t) * (1 - t * 0.4) + size * 0.02);
  const coreAlpha = fade * (1 - t) * (1 - t);
  if (coreAlpha > 0.01) {
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    core.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
    core.addColorStop(0.45, `rgba(255, 110, 245, ${coreAlpha * 0.9})`);
    core.addColorStop(1, "rgba(192, 92, 255, 0)");
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
