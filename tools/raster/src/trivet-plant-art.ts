/**
 * One frame of THE TRIVET's foot planting home, drawn into a 2D context.
 *
 * Rows 2 to 5 of §30's beat list: an outer foot swung down and slammed onto
 * its plate. It is `docs/raster.md`'s rule 4 case — a hinge and a slam are a
 * smear, a squashed shock and grit thrown along the ground, not a shape that
 * recolours — so it is painted once, offline, and only the pixels ship.
 * Nothing in the game runs this.
 *
 * Painted for **the pilot's foot**, the one splayed to the left, which swings
 * down from the upper left; the navigator's is the same strip mirrored
 * (`SpriteBursts.spawn`'s `flip`). The frame's middle is where the plate
 * comes down.
 *
 * Five layers, back to front: the swing's smear, an arc of the plate's
 * after-image coming down from the upper left and gone in a fifth; a flat
 * flash along the plate's footprint; a shock squashed flat on the ground and
 * running out both ways; dust puffs rolling outward and rising a little; and
 * grit and a few cold sparks thrown low along the ground, falling back.
 *
 * **Metal colours only** — `PALETTE.trivetMetal`'s gunmetal, `trivetMetalDark`
 * under it, and `trivetSocket`'s cold blue-white for the light. Never red or
 * cyan: rule 7, a baked effect is the colour it was painted.
 *
 * **Self-contained on purpose**, for `burst-art.ts`'s reason: it travels into
 * a headless page as source text, so it carries its own random numbers and
 * may reference nothing outside its own body.
 */
export function drawTrivetPlantFrame(
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; seed: number },
): void {
  const { size, t, seed } = options;
  let state = seed >>> 0;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const ease = 1 - (1 - t) * (1 - t);
  const fade = Math.max(0, 1 - t);
  // The plate is a quarter of the frame long; the ground runs through the middle.
  const plate = size * 0.24;
  // Anything nearing the frame's edge fades before it gets there.
  const inside = (x: number, y: number): number =>
    Math.max(0, Math.min(1, (size * 0.47 - Math.max(Math.abs(x), Math.abs(y))) / (size * 0.08)));

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(size / 2, size / 2);

  // The swing: the plate's after-image, an arc from the upper left down onto the ground.
  if (t < 0.2) {
    const k = 1 - t / 0.2;
    const pivot = { x: plate * 1.3, y: -size * 0.34 };
    const r = Math.hypot(pivot.x, pivot.y);
    const down = Math.atan2(-pivot.y, -pivot.x);
    const sweep = 0.62;
    for (let i = 5; i >= 0; i--) {
      const a = down + (sweep * i) / 5;
      const x = pivot.x + Math.cos(a) * r;
      const y = pivot.y + Math.sin(a) * r;
      const alpha = 0.5 * k * (1 - i / 6);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(a - down);
      ctx.fillStyle = `rgba(217, 232, 250, ${alpha * 0.55})`;
      ctx.fillRect(-plate / 2, -size * 0.022, plate, size * 0.044);
      ctx.restore();
    }
  }

  // The footprint's flash: a flat bar of light where the plate met the ground.
  if (t < 0.35) {
    const k = 1 - t / 0.35;
    const half = plate * (0.6 + 0.5 * (t / 0.35));
    const bar = ctx.createLinearGradient(-half, 0, half, 0);
    bar.addColorStop(0, "rgba(217, 232, 250, 0)");
    bar.addColorStop(0.5, `rgba(240, 246, 255, ${0.9 * k})`);
    bar.addColorStop(1, "rgba(217, 232, 250, 0)");
    ctx.fillStyle = bar;
    const h = Math.max(1, size * 0.05 * k);
    ctx.fillRect(-half, -h / 2, half * 2, h);
  }

  // The shock: a ring squashed flat on the ground, running out both ways.
  if (t < 0.6) {
    const k = 1 - t / 0.6;
    const rx = size * (0.12 + 0.32 * ease);
    ctx.strokeStyle = `rgba(217, 232, 250, ${0.55 * k})`;
    ctx.lineWidth = Math.max(0.7, size * 0.018 * k);
    ctx.beginPath();
    ctx.ellipse(0, size * 0.01, rx, rx * 0.16, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The dust: puffs rolling out along the ground both ways, rising a little.
  const puffs = 10;
  for (let i = 0; i < puffs; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const speed = 0.45 + random() * 0.5;
    const lift = 0.02 + random() * 0.08;
    const big = size * (0.05 + random() * 0.05);
    const late = random() * 0.1;
    const local = Math.max(0, Math.min(1, (t - late) / (1 - late)));
    if (local <= 0) continue;
    const go = 1 - (1 - local) * (1 - local);
    const x = side * (plate * 0.4 + size * 0.36 * speed * go);
    const y = -size * lift * go;
    const r = big * (0.6 + 0.9 * go);
    const alpha = 0.45 * (1 - local) * inside(x, y);
    if (alpha <= 0.01) continue;
    const puff = ctx.createRadialGradient(x, y, 0, x, y, r);
    puff.addColorStop(0, `rgba(91, 97, 110, ${alpha})`);
    puff.addColorStop(0.6, `rgba(91, 97, 110, ${alpha * 0.5})`);
    puff.addColorStop(1, "rgba(35, 38, 46, 0)");
    ctx.fillStyle = puff;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // The grit and the sparks: thrown low along the ground from the plate's ends, falling back.
  const specks = 34;
  for (let i = 0; i < specks; i++) {
    const side = random() < 0.5 ? -1 : 1;
    const speed = 0.35 + random() * 0.7;
    const rise = 0.06 + random() * 0.22;
    const spark = random() < 0.25;
    const flicker = random();
    const grain = random();
    const x = side * (plate * 0.5 + size * 0.4 * speed * ease);
    const y = -size * rise * 4 * t * (1 - t) + size * 0.02;
    const alpha = fade * (0.4 + 0.6 * ((flicker + t * 5) % 1)) * inside(x, y);
    if (alpha <= 0.02) continue;
    if (spark && t < 0.5) {
      // A streak along its flight, bright and short-lived.
      const len = size * 0.05 * (1 - t * 2);
      ctx.strokeStyle = `rgba(240, 246, 255, ${alpha})`;
      ctx.lineWidth = Math.max(0.6, size * 0.01);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - side * len, y + len * 0.4);
      ctx.stroke();
      continue;
    }
    const r = Math.max(0.5, size * (0.006 + grain * 0.008));
    ctx.fillStyle = spark
      ? `rgba(217, 232, 250, ${alpha * 0.8})`
      : `rgba(150, 156, 168, ${alpha * 0.85})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.restore();
}
