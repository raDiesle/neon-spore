/**
 * One frame of THE SLING's arm drawing home, drawn into a 2D context.
 *
 * Rows 2 to 5 of §32's beat list: a cord hauled down off its tine under load
 * and locked drawn. A hinge-and-strain motion — `docs/raster.md`'s rule 4
 * case, a smear, a shimmer running the length of a line under load and a
 * catch snapping shut, not a shape that recolours — so it is painted once,
 * offline, and only the pixels ship. Nothing in the game runs this.
 *
 * Painted for **the pilot's cord**, off the left tine: the tine's tip sits up
 * and right of the frame's middle and the drawn handle down and left of it,
 * the middle being the drawn cord's own. The navigator's is the same strip
 * mirrored (`SpriteBursts.spawn`'s `flip`).
 *
 * Five layers, back to front: the draw's smear, the cord's after-image swept
 * from slack down to drawn and gone in a third; the strain, a pulse of light
 * running up the drawn cord and back; the catch, a flash and a short ring at
 * the handle as it locks; a glint at the tine's tip where the load bears; and
 * fibres and grit shaken off the cord, drifting down.
 *
 * **Cord and steel colours only** — `PALETTE.slingCord`'s pale hemp,
 * `slingSteel`, and a cold white for the light. Never red or cyan: rule 7, a
 * baked effect is the colour it was painted. Drawn additively over the cord
 * the field draws, so it is all light and no body.
 *
 * **Self-contained on purpose**, for `burst-art.ts`'s reason: it travels into
 * a headless page as source text, so it carries its own random numbers and
 * may reference nothing outside its own body.
 */
export function drawSlingDrawFrame(
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; seed: number },
): void {
  const { size, t, seed } = options;
  let state = seed >>> 0;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  // The frame is 3 tiles: the tip, the slack handle and the drawn handle,
  // as `sling-shape.ts` lays them out about the drawn cord's middle.
  const c = size / 2;
  const tip = { x: c + size * 0.083, y: c - size * 0.258 };
  const slack = { x: c + size * 0.083, y: c - size * 0.151 };
  const drawn = { x: c - size * 0.083, y: c + size * 0.258 };
  const along = (u: number): { x: number; y: number } => ({
    x: slack.x + (drawn.x - slack.x) * u,
    y: slack.y + (drawn.y - slack.y) * u,
  });
  const fade = t < 0.06 ? 0.5 + (0.5 * t) / 0.06 : Math.max(0, 1 - (t - 0.06) / 0.94);
  // Anything nearing the frame's edge fades before it gets there.
  const inside = (x: number, y: number): number =>
    Math.max(
      0,
      Math.min(1, (size * 0.47 - Math.max(Math.abs(x - c), Math.abs(y - c))) / (size * 0.08)),
    );

  ctx.clearRect(0, 0, size, size);
  ctx.lineCap = "round";

  // The smear: the cord's after-image, swept from slack down to drawn.
  if (t < 0.34) {
    const k = 1 - t / 0.34;
    const reach = Math.min(1, t / 0.12 + 0.35);
    for (let i = 5; i >= 0; i--) {
      const u = reach * (i / 5);
      const h = along(u);
      ctx.strokeStyle = `rgba(201, 191, 168, ${0.28 * k * (0.35 + 0.65 * (i / 5))})`;
      ctx.lineWidth = Math.max(0.7, size * 0.014);
      ctx.beginPath();
      ctx.moveTo(tip.x, tip.y);
      ctx.lineTo(h.x, h.y);
      ctx.stroke();
    }
  }

  // The strain: a pulse of light running up the drawn cord to the tip and back.
  if (t > 0.08 && t < 0.7) {
    const k = (t - 0.08) / 0.62;
    const run = Math.abs(Math.sin(k * Math.PI * 1.5));
    const px = drawn.x + (tip.x - drawn.x) * run;
    const py = drawn.y + (tip.y - drawn.y) * run;
    const glow = ctx.createRadialGradient(px, py, 0, px, py, size * 0.09);
    glow.addColorStop(0, `rgba(240, 244, 250, ${0.7 * (1 - k)})`);
    glow.addColorStop(0.5, `rgba(201, 191, 168, ${0.3 * (1 - k)})`);
    glow.addColorStop(1, "rgba(201, 191, 168, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(240, 244, 250, ${0.3 * (1 - k)})`;
    ctx.lineWidth = Math.max(0.6, size * 0.01);
    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(drawn.x, drawn.y);
    ctx.stroke();
  }

  // The catch: a flash and a short ring at the handle as it locks drawn.
  if (t > 0.1 && t < 0.62) {
    const k = (t - 0.1) / 0.52;
    const flash = ctx.createRadialGradient(drawn.x, drawn.y, 0, drawn.x, drawn.y, size * 0.12);
    flash.addColorStop(0, `rgba(240, 244, 250, ${0.8 * (1 - k) * (1 - k)})`);
    flash.addColorStop(1, "rgba(139, 149, 163, 0)");
    ctx.fillStyle = flash;
    ctx.beginPath();
    ctx.arc(drawn.x, drawn.y, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(240, 244, 250, ${0.55 * (1 - k)})`;
    ctx.lineWidth = Math.max(0.7, size * 0.016 * (1 - k));
    ctx.beginPath();
    ctx.arc(drawn.x, drawn.y, size * (0.04 + 0.1 * k), 0, Math.PI * 2);
    ctx.stroke();
  }

  // The tip: a glint where the load bears on the tine, pulsing with the strain.
  {
    const beat = 0.5 + 0.5 * Math.cos(t * Math.PI * 4);
    const r = size * 0.07;
    const glint = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, r);
    glint.addColorStop(0, `rgba(240, 244, 250, ${0.55 * beat * fade})`);
    glint.addColorStop(1, "rgba(139, 149, 163, 0)");
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // The fibres and grit: shaken off along the cord as it takes the load.
  const specks = 26;
  for (let i = 0; i < specks; i++) {
    const at = random();
    const side = random() < 0.5 ? -1 : 1;
    const push = 0.3 + random() * 0.7;
    const late = random() * 0.25;
    const grain = random();
    const flicker = random();
    const local = (t - late) / (1 - late);
    if (local <= 0) continue;
    const ox = tip.x + (drawn.x - tip.x) * at;
    const oy = tip.y + (drawn.y - tip.y) * at;
    // Thrown square off the cord, then falling.
    const x = ox + side * size * 0.16 * push * local;
    const y = oy - side * size * 0.05 * push * local + size * 0.14 * local * local;
    const alpha = fade * (1 - local) * (0.4 + 0.6 * ((flicker + t * 5) % 1)) * inside(x, y);
    if (alpha <= 0.02) continue;
    const r = Math.max(0.5, size * (0.005 + grain * 0.006));
    ctx.fillStyle =
      grain < 0.6 ? `rgba(201, 191, 168, ${alpha})` : `rgba(240, 244, 250, ${alpha * 0.8})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
