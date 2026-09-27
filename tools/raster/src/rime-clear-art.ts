/**
 * One frame of THE RIME's bare-core reveal, drawn into a 2D context.
 *
 * Row 6 of §29's beat list: the last frost wiped away and the core lit. It is
 * frost shattering off glass — `docs/raster.md`'s rule 4 case, grain and an
 * irregular edge with no single distance function — so it is painted once,
 * offline, and only the pixels ship. Nothing in the game runs this.
 *
 * Four layers, back to front: a cold bloom over the whole pane that is gone
 * in a quarter, a web of hairline fractures running out from the middle,
 * flakes of frost — thin plates of three to five corners that spin as they
 * fall, catching the light on their flat side and going dull on their edge —
 * and a powder of rime that drifts down slower than the flakes and lasts
 * longer.
 *
 * **Frost colours only** — `PALETTE.rimeFrost`'s pale blue-white,
 * `rimeFrostDeep`'s grey, and a cold white for the light. Never red or cyan:
 * rule 7, a baked effect is the colour it was painted, and the core's colour
 * is the procedural core's.
 *
 * **Self-contained on purpose**, for `burst-art.ts`'s reason: it travels into
 * a headless page as source text, so it carries its own random numbers and
 * may reference nothing outside its own body.
 */
export function drawRimeClearFrame(
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; seed: number },
): void {
  const { size, t, seed } = options;
  let state = seed >>> 0;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  const cx = size / 2;
  const cy = size / 2;
  const ease = 1 - (1 - t) * (1 - t);
  const fade = t < 0.06 ? t / 0.06 : Math.max(0, 1 - (t - 0.06) / 0.94);
  const reach = size * 0.44;
  // Anything nearing the frame's edge fades out before it gets there, so no
  // flake or speck is ever cut square by the frame.
  const inside = (x: number, y: number): number =>
    Math.max(0, Math.min(1, (size * 0.47 - Math.max(Math.abs(x), Math.abs(y))) / (size * 0.1)));

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  // The pane going clear: a cold light over the whole glass, gone in a quarter.
  if (t < 0.26) {
    const k = 1 - t / 0.26;
    const r = size * (0.3 + 0.16 * (t / 0.26));
    const bloom = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    bloom.addColorStop(0, `rgba(244, 248, 252, ${0.7 * k})`);
    bloom.addColorStop(0.55, `rgba(205, 214, 224, ${0.32 * k})`);
    bloom.addColorStop(1, "rgba(109, 120, 133, 0)");
    ctx.fillStyle = bloom;
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.93, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // The fractures: hairlines out from the middle, each kinked twice, drawn
  // out to their length in the first fifth and faded by the half.
  const cracks = 9;
  for (let i = 0; i < cracks; i++) {
    const angle = (i / cracks) * Math.PI * 2 + (random() - 0.5) * 0.5;
    const length = reach * (0.55 + random() * 0.4);
    const kinkA = (random() - 0.5) * 0.5;
    const kinkB = (random() - 0.5) * 0.6;
    const grow = Math.min(1, t / 0.18);
    const alpha = t < 0.5 ? 0.85 * (1 - t / 0.5) : 0;
    if (alpha <= 0.01) continue;
    const at = (d: number, bend: number): [number, number] => [
      Math.cos(angle + bend) * d,
      Math.sin(angle + bend) * d * 0.93,
    ];
    const [ax, ay] = at(length * 0.35 * grow, kinkA * 0.3);
    const [bx, by] = at(length * 0.7 * grow, kinkA);
    const [ex, ey] = at(length * grow, kinkB);
    ctx.strokeStyle = `rgba(244, 248, 252, ${alpha})`;
    ctx.lineWidth = Math.max(0.6, size * 0.007 * (1 - t));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(ex, ey);
    ctx.stroke();
  }

  // The flakes: each one's place on the pane, flight, spin and outline
  // decided once from the seed. They start where the frost was, not at the
  // middle — the pane is cleared all over at once — and fall as they go.
  const flakes = 22;
  for (let i = 0; i < flakes; i++) {
    const from = Math.sqrt(random()) * reach * 0.8;
    const where = random() * Math.PI * 2;
    const sx = Math.cos(where) * from;
    const sy = Math.sin(where) * from * 0.93;
    const push = 0.12 + random() * 0.22;
    const spin = 2 + random() * 6;
    const tilt = random() * Math.PI;
    const big = size * (0.03 + random() * 0.05);
    const corners = 3 + Math.floor(random() * 3);
    const outline: number[] = [];
    for (let c = 0; c < corners; c++) outline.push(0.6 + random() * 0.55);
    const late = random() * 0.15;

    const local = Math.max(0, Math.min(1, (t - late) / (1 - late)));
    if (local <= 0) continue;
    const go = 1 - (1 - local) * (1 - local);
    const away = from > 0.5 ? 1 + (reach * push * go) / from : 1;
    const x = sx * away;
    const y = sy * away + size * 0.12 * local * local;
    // A plate is bright face on and dull edge on, so its light turns with it.
    const turn = Math.abs(Math.cos(tilt + spin * local));
    const alpha = fade * (1 - local * 0.55) * inside(x, y);
    if (alpha <= 0.01) continue;

    const r = big * (1 - local * 0.25);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(tilt + spin * local * 0.6);
    ctx.scale(1, 0.35 + 0.65 * turn);
    ctx.beginPath();
    for (let c = 0; c < corners; c++) {
      const a = (c / corners) * Math.PI * 2;
      const px = Math.cos(a) * r * (outline[c] ?? 1);
      const py = Math.sin(a) * r * (outline[c] ?? 1);
      if (c === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const face = ctx.createLinearGradient(-r, -r, r, r);
    face.addColorStop(0, `rgba(244, 248, 252, ${alpha * (0.45 + 0.55 * turn)})`);
    face.addColorStop(0.5, `rgba(205, 214, 224, ${alpha * 0.7})`);
    face.addColorStop(1, `rgba(109, 120, 133, ${alpha * 0.35})`);
    ctx.fillStyle = face;
    ctx.fill();
    ctx.strokeStyle = `rgba(250, 252, 255, ${alpha * (0.3 + 0.7 * turn)})`;
    ctx.lineWidth = Math.max(0.6, size * 0.006);
    ctx.stroke();
    ctx.restore();
  }

  // The powder: fine rime that drifts down, outlasting the flakes.
  const specks = 60;
  for (let i = 0; i < specks; i++) {
    const from = Math.sqrt(random()) * reach * 0.9;
    const where = random() * Math.PI * 2;
    const drift = (random() - 0.5) * size * 0.12;
    const tone = random();
    const flicker = random();
    const x = Math.cos(where) * from * (1 + 0.25 * ease) + drift * ease;
    const y = Math.sin(where) * from * 0.93 + size * (0.08 + tone * 0.12) * ease;
    const alpha = fade * (1 - t * 0.7) * (0.35 + 0.65 * ((flicker + t * 4) % 1)) * inside(x, y);
    if (alpha <= 0.02) continue;
    const r = Math.max(0.5, size * (0.004 + tone * 0.007));
    ctx.fillStyle =
      tone < 0.6 ? `rgba(244, 248, 252, ${alpha})` : `rgba(205, 214, 224, ${alpha * 0.8})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.restore();
}
