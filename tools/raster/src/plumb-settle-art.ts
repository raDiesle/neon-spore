/**
 * One frame of THE PLUMB's weight settling true, drawn into a 2D context.
 *
 * Rows 2 to 5 of §31's beat list: a counterweight on its chain easing to a
 * stop as its level settles. It is a damped swing with a verdigris sheen —
 * `docs/raster.md`'s rule 4 case, light sliding over a lobed ball and dust
 * shaken off at every turn, not a shape that recolours — so it is painted
 * once, offline, and only the pixels ship. Nothing in the game runs this.
 *
 * The frame hangs from **the beam's end**: the pivot is a tenth of the way
 * down the frame's middle and the ball rests a chain's length under it, so
 * the field anchors the strip where the chain is hooked rather than at the
 * ball, which swings. Painted for the pilot's weight, which swings in from
 * the left; the navigator's is the same strip mirrored.
 *
 * Four layers, back to front: the swing's after-image, the ball's last few
 * places along its arc fading behind it; the chain's own after-image; the
 * sheen, a crescent of light that slides across the ball as it swings and
 * holds as it stops; and verdigris shaken off at each turn of the swing,
 * drifting down. As the swing dies a ring of light goes out from the ball at
 * rest — the weight true.
 *
 * **Bronze and verdigris only** — `PALETTE.plumbBronze`, `plumbGlass`'s pale
 * green for the light, and a verdigris between them. Never red or cyan: rule
 * 7, a baked effect is the colour it was painted. It is drawn additively over
 * the ball the field already draws, so it is all light and no body.
 *
 * **Self-contained on purpose**, for `burst-art.ts`'s reason: it travels into
 * a headless page as source text, so it carries its own random numbers and
 * may reference nothing outside its own body.
 */
export function drawPlumbSettleFrame(
  ctx: CanvasRenderingContext2D,
  options: { size: number; t: number; seed: number },
): void {
  const { size, t, seed } = options;
  let state = seed >>> 0;
  const random = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };

  // Three tiles to the frame: a 1.25-tile chain and a ball of about 0.54.
  const pivot = { x: size / 2, y: size * 0.1 };
  const chain = size * 0.417;
  const ball = size * 0.18;
  // The swing: out to the left, dying away in about two and a half turns.
  const swing = 0.45;
  const turns = 2.5;
  const angle = (u: number): number =>
    -swing * Math.exp(-3.2 * u) * Math.cos(u * turns * Math.PI * 2);
  const at = (u: number): { x: number; y: number } => {
    const a = angle(u);
    return { x: pivot.x + Math.sin(a) * chain, y: pivot.y + Math.cos(a) * chain };
  };
  const fade = t < 0.08 ? 0.5 + (0.5 * t) / 0.08 : Math.max(0, 1 - (t - 0.08) / 0.92);
  // Anything nearing the frame's edge fades before it gets there.
  const inside = (x: number, y: number): number =>
    Math.max(
      0,
      Math.min(
        1,
        (size * 0.47 - Math.max(Math.abs(x - size / 2), Math.abs(y - size / 2))) / (size * 0.08),
      ),
    );

  ctx.clearRect(0, 0, size, size);
  const now = at(t);

  // The after-image: the ball's rim at its last places along the arc, oldest
  // faintest — outlines, so the ball the field draws stays its own bronze.
  const ghosts = 6;
  ctx.lineWidth = Math.max(0.7, size * 0.01);
  for (let i = ghosts; i >= 1; i--) {
    const back = t - i * 0.02;
    if (back < 0) continue;
    const p = at(back);
    const alpha = 0.3 * (1 - i / (ghosts + 1)) * fade;
    ctx.strokeStyle = `rgba(120, 168, 128, ${alpha})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, ball * 0.96, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The chain's after-image, from the hook to the ball.
  ctx.strokeStyle = `rgba(143, 134, 96, ${0.35 * fade})`;
  ctx.lineWidth = Math.max(0.8, size * 0.012);
  ctx.beginPath();
  ctx.moveTo(pivot.x, pivot.y);
  ctx.lineTo(now.x, now.y);
  ctx.stroke();

  // The sheen: a crescent of light on the ball's upper side, sliding with the
  // swing — the light comes from above, so it runs against the lean.
  const lean = angle(t);
  const glint = ctx.createRadialGradient(
    now.x - lean * ball * 1.6 - ball * 0.25,
    now.y - ball * 0.45,
    0,
    now.x - lean * ball * 1.6 - ball * 0.25,
    now.y - ball * 0.45,
    ball * 0.7,
  );
  const shine = (0.35 + 0.35 * Math.min(1, Math.abs(lean) / swing + t)) * fade;
  glint.addColorStop(0, `rgba(227, 238, 196, ${shine})`);
  glint.addColorStop(0.3, `rgba(120, 168, 128, ${shine * 0.45})`);
  glint.addColorStop(1, "rgba(42, 42, 30, 0)");
  ctx.save();
  ctx.beginPath();
  ctx.arc(now.x, now.y, ball, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = glint;
  ctx.fillRect(now.x - ball, now.y - ball, ball * 2, ball * 2);
  ctx.restore();

  // True: a ring out from the ball at rest as the swing dies.
  if (t > 0.55) {
    const k = (t - 0.55) / 0.45;
    const rest = at(1);
    ctx.strokeStyle = `rgba(227, 238, 196, ${0.5 * (1 - k)})`;
    ctx.lineWidth = Math.max(0.7, size * 0.014 * (1 - k));
    ctx.beginPath();
    ctx.arc(rest.x, rest.y, ball * (1.05 + 0.9 * k), 0, Math.PI * 2);
    ctx.stroke();
  }

  // The verdigris: flecks shaken off at each turn of the swing, drifting down.
  const flecks = 28;
  for (let i = 0; i < flecks; i++) {
    const turn = Math.floor(random() * 4);
    const round = random() * Math.PI * 2;
    const push = 0.3 + random() * 0.7;
    const grain = random();
    const flicker = random();
    const born = (turn + 0.5) / (turns * 2);
    const local = (t - born) / 0.4;
    if (local <= 0 || local >= 1) continue;
    const from = at(born);
    const x = from.x + Math.cos(round) * ball * (1 + push * local * 0.8);
    const y = from.y + Math.sin(round) * ball * 0.9 + size * 0.12 * local * local;
    const alpha = (1 - local) * (0.4 + 0.6 * ((flicker + t * 6) % 1)) * inside(x, y);
    if (alpha <= 0.02) continue;
    const r = Math.max(0.5, size * (0.005 + grain * 0.006));
    ctx.fillStyle =
      grain < 0.5 ? `rgba(120, 168, 128, ${alpha})` : `rgba(227, 238, 196, ${alpha * 0.8})`;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
