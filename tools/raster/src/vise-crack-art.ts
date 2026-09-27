/**
 * One frame of THE VISE's kernel crack, drawn into a 2D context.
 *
 * The payoff frame of §28: the spent kernel giving way as the case splits
 * down its spine. It is `docs/raster.md`'s rule 4 case — a shell breaking is
 * smears and irregular debris, not a shape that recolours — so it is painted
 * once, offline, and only the pixels ship. Nothing in the game runs this.
 *
 * Four layers, back to front: an ember bloom where the kernel was, dust
 * smeared back along each shard's flight, the shards themselves — husk
 * fragments of four to six jittered corners, spinning out and dropping a
 * little as they go — and a grain of fine grit that thins as it flies. The
 * first few frames carry a white-hot seam down the spine, which is the split
 * the procedural flash already marks, painted into the husk.
 *
 * **Husk colours only** — `PALETTE.viseCrack`'s bone, `viseCase`'s tan, and a
 * warm white for the ember. Never red or cyan: rule 7, a baked effect is the
 * colour it was painted, and the kernel's colour is the procedural flash's.
 *
 * **Self-contained on purpose**, for `burst-art.ts`'s reason: it travels into
 * a headless page as source text, so it carries its own random numbers and
 * may reference nothing outside its own body.
 */
export function drawViseCrackFrame(
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
  const fade = t < 0.08 ? t / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.92);
  const reach = size * 0.46;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);

  // The ember where the kernel was: hot and small, then wide and dim.
  const emberR = Math.max(1, size * (0.08 + 0.26 * ease));
  const emberA = 0.8 * fade * (1 - t) * (1 - t * 0.5);
  if (emberA > 0.01) {
    const ember = ctx.createRadialGradient(0, size * 0.02, 0, 0, 0, emberR);
    ember.addColorStop(0, `rgba(255, 246, 226, ${emberA})`);
    ember.addColorStop(0.3, `rgba(236, 196, 138, ${emberA * 0.7})`);
    ember.addColorStop(1, "rgba(156, 122, 82, 0)");
    ctx.fillStyle = ember;
    ctx.beginPath();
    ctx.arc(0, 0, emberR, 0, Math.PI * 2);
    ctx.fill();
  }

  // The spine splitting: a white seam top to bottom, gone in a fifth.
  if (t < 0.22) {
    const k = 1 - t / 0.22;
    const half = size * (0.18 + 0.2 * (t / 0.22));
    const seam = ctx.createLinearGradient(0, -half, 0, half);
    seam.addColorStop(0, "rgba(255, 250, 238, 0)");
    seam.addColorStop(0.5, `rgba(255, 250, 238, ${0.95 * k})`);
    seam.addColorStop(1, "rgba(255, 250, 238, 0)");
    ctx.fillStyle = seam;
    const w = Math.max(0.8, size * 0.022 * k);
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(w, -half * 0.35);
    ctx.lineTo(-w * 0.6, half * 0.1);
    ctx.lineTo(w * 0.8, half * 0.55);
    ctx.lineTo(0, half);
    ctx.lineTo(-w, half * 0.4);
    ctx.lineTo(w * 0.5, -half * 0.05);
    ctx.lineTo(-w * 0.8, -half * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // The shards: each one's flight, spin and outline decided once from the seed.
  const shards = 15;
  for (let i = 0; i < shards; i++) {
    // Mostly sideways — the lobes spring left and right — with a few up and down.
    const side = i % 2 === 0 ? -1 : 1;
    const tilt = (random() - 0.5) * 1.9;
    const angle = (side < 0 ? Math.PI : 0) + tilt;
    const speed = 0.45 + random() * 0.55;
    const spin = (random() - 0.5) * 7;
    const big = size * (0.035 + random() * 0.06);
    const corners = 4 + Math.floor(random() * 3);
    const outline: number[] = [];
    for (let c = 0; c < corners; c++) outline.push(0.55 + random() * 0.6);
    const bone = random() < 0.55;
    const late = random() * 0.12;

    const local = Math.max(0, Math.min(1, (t - late) / (1 - late)));
    if (local <= 0) continue;
    const go = 1 - (1 - local) * (1 - local) * (1 - local);
    const dist = reach * speed * go;
    const drop = size * 0.16 * local * local;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist + drop;
    const alpha = fade * (1 - local * 0.65);
    if (alpha <= 0.01) continue;

    // The dust it drags: a soft smear back toward where it broke from.
    const tail = Math.min(dist, size * 0.2) * (1 - local * 0.4);
    if (tail > 1) {
      const bx = x - Math.cos(angle) * tail;
      const by = y - Math.sin(angle) * tail - drop * 0.3;
      const smear = ctx.createLinearGradient(x, y, bx, by);
      smear.addColorStop(0, `rgba(230, 220, 198, ${alpha * 0.45})`);
      smear.addColorStop(1, "rgba(156, 122, 82, 0)");
      ctx.strokeStyle = smear;
      ctx.lineCap = "round";
      ctx.lineWidth = big * (0.9 - local * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    const r = big * (1 - local * 0.3);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin * local + angle);
    ctx.beginPath();
    for (let c = 0; c < corners; c++) {
      const a = (c / corners) * Math.PI * 2;
      const px = Math.cos(a) * r * (outline[c] ?? 1) * 1.35;
      const py = Math.sin(a) * r * (outline[c] ?? 1) * 0.7;
      if (c === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    const face = ctx.createLinearGradient(-r, -r * 0.7, r, r * 0.7);
    const lit = bone ? "230, 220, 198" : "196, 158, 110";
    face.addColorStop(0, `rgba(255, 248, 232, ${alpha})`);
    face.addColorStop(0.35, `rgba(${lit}, ${alpha * 0.95})`);
    face.addColorStop(1, `rgba(120, 90, 60, ${alpha * 0.5})`);
    ctx.fillStyle = face;
    ctx.fill();
    // One hard lip, the break face, on the edge nearest where it came from.
    ctx.strokeStyle = `rgba(255, 250, 238, ${alpha * 0.8})`;
    ctx.lineWidth = Math.max(0.6, size * 0.008);
    ctx.beginPath();
    ctx.moveTo(Math.cos(0) * r * (outline[0] ?? 1) * 1.35, 0);
    ctx.lineTo(Math.cos(Math.PI * 0.4) * r * 0.9, Math.sin(Math.PI * 0.4) * r * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  // The grit: fine specks that go further than the shards and thin out first.
  const specks = 46;
  for (let i = 0; i < specks; i++) {
    const angle = random() * Math.PI * 2;
    const speed = 0.3 + random() * 0.75;
    const tone = random();
    const flicker = random();
    const dist = reach * 1.02 * speed * ease;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist * 0.85 + size * 0.1 * t * t;
    const alpha = fade * (1 - t) * (0.4 + 0.6 * ((flicker + t * 5) % 1));
    if (alpha <= 0.02) continue;
    const r = Math.max(0.5, size * (0.006 + tone * 0.01) * (1 - t * 0.5));
    ctx.fillStyle =
      tone < 0.5 ? `rgba(255, 244, 222, ${alpha})` : `rgba(210, 176, 128, ${alpha * 0.85})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.restore();
}
