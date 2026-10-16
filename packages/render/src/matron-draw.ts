import type { MatronState, World } from "@neon-spore/sim";
import { bossAura } from "./body-aura.js";
import { drawHurt } from "./boss-hurt.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import type { MatronFx } from "./matron-fx.js";
import { type MotherBox, matronBodyAt, matronEggs, matronHanging } from "./matron-place.js";
import { matronLobe, matronLobeRoot, matronOutline } from "./matron-shape.js";
import { MATRON_CORE, MATRON_FLESH, MATRON_RIM } from "./matron-tint.js";
import { PALETTE } from "./palette.js";
import { podCenter } from "./pods.js";
import { splinePath } from "./spline.js";

/**
 * THE MATRON, drawn: a mother slime of deep blue hung over the field, a lobe
 * reaching down out of her belly to every pod she holds, and the eggs of the
 * clutches still to come glowing inside her — and nothing else, because the
 * pods are the field's own (`pods.ts`, drawn over her lobes' tips) and so is
 * everything she throws.
 *
 * **Her health is what she carries**: the lobes of the clutch hanging and the
 * eggs of the ones to come (`matron-place.ts`). A pod shot loose, its lobe
 * springs back up into her (`matron-fx.ts`); a clutch cleared, she rears
 * back, taller and narrower, and the next comes down out of her. She shrinks
 * a little with every lobe gone.
 *
 * **She moves as a whole.** She breathes on the beat, leans toward the column
 * she throws down and rights herself, and the eggs inside her slide the
 * other way as she leans, so she reads as a body with depth rather than a
 * flat outline. Fades in as she settles over the field; beaten, she greys, sags and
 * goes.
 */

/** Eggs to a row inside her, and their radius in tiles. */
const EGG_ROW = 5;
const EGG_TILES = 0.24;

/** Her breath, 0 at the beat and back to it, peaking halfway. */
function breathOf(beatPhase: number): number {
  return 0.5 - 0.5 * Math.cos(beatPhase * Math.PI * 2);
}

export function drawMatron(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MatronState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: MatronFx,
): void {
  const box = matronBodyAt(l, world.cfg, s, beat, beatPhase, fx.lean());
  const spent = s.phase === "spent";
  const breath = spent ? 0 : breathOf(beatPhase);
  const b = { ...box, rx: box.rx * (1 + 0.012 * breath), ry: box.ry * (1 + 0.035 * breath) };
  const body = splinePath(matronOutline(b, time), true);
  const lobes = matronHanging(world, s).map(({ i, pod }) => {
    const tip = podCenter(l, pod);
    const root = matronLobeRoot(b, tip.x);
    const sway = Math.sin(time * 1.7 + i * 2.3) * l.tile * 0.2;
    return splinePath(matronLobe(root, tip, l.tile * 0.75, sway), true);
  });

  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  ctx.globalAlpha = b.alpha;
  paintFlesh(ctx, [...lobes, body], b, l.tile, spent);
  drawEggs(ctx, body, b, matronEggs(s), l.tile, time);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  fx.draw(ctx, l);
}

/**
 * Translucent blue slime, lit from above, darker toward the belly. Every
 * piece is rimmed at twice the width first and filled over after, so the
 * rim runs round the outside of body and lobes together and never across
 * where a lobe leaves her.
 */
function paintFlesh(
  ctx: CanvasRenderingContext2D,
  pieces: readonly Path2D[],
  b: MotherBox,
  tile: number,
  spent: boolean,
): void {
  // Her light round every lobe she has out, under them; spent, none (`body-aura.ts`).
  if (!spent) bossAura(ctx, pieces, MATRON_RIM, tile, 0);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, tile * 0.14);
  for (const p of pieces) {
    // Set per piece, so a frame says how many lobes she has out.
    ctx.strokeStyle = spent ? rgba(PALETTE.dim, 0.8) : rgba(MATRON_RIM, 0.85);
    ctx.stroke(p);
  }
  const core = spent ? PALETTE.rockDark : MATRON_CORE;
  const light = spent ? PALETTE.sparkDim : MATRON_FLESH;
  const g = ctx.createRadialGradient(
    b.x - b.rx * 0.2,
    b.y - b.ry * 0.5,
    tile * 0.3,
    b.x,
    b.y + b.ry,
    b.rx * 1.1,
  );
  g.addColorStop(0, rgba(light, 0.9));
  g.addColorStop(0.5, rgba(core, 0.9));
  g.addColorStop(1, rgba(core, 0.96));
  ctx.fillStyle = g;
  for (const p of pieces) ctx.fill(p);
  ctx.restore();
  if (!spent) halo(ctx, b.x - b.rx * 0.25, b.y - b.ry * 0.45, tile * 1.1, MATRON_RIM, 0.3);
}

/**
 * The eggs of the clutches to come, in rows low in her body: dim amber, each
 * breathing on its own clock, sliding against her lean so she has a depth.
 */
function drawEggs(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  b: MotherBox,
  eggs: number,
  tile: number,
  time: number,
): void {
  if (eggs <= 0) return;
  ctx.save();
  ctx.clip(body);
  const r = EGG_TILES * tile;
  const rows = Math.ceil(eggs / EGG_ROW);
  for (let i = 0; i < eggs; i++) {
    const row = Math.floor(i / EGG_ROW);
    const inRow = Math.min(EGG_ROW, eggs - row * EGG_ROW);
    const k = i - row * EGG_ROW;
    const x = b.x + (k - (inRow - 1) / 2) * r * 3 - b.lean * b.rx * 0.6;
    const y = b.y + b.ry * 0.15 + (row - (rows - 1) / 2) * r * 2.6;
    const glow = 0.55 + 0.25 * Math.sin(time * 2 + i * 1.3);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.pod, 0.85 * glow);
    ctx.fill();
    ctx.strokeStyle = rgba(PALETTE.podRim, 0.55);
    ctx.lineWidth = Math.max(1, tile * 0.04);
    ctx.stroke();
    // The yolk's light, off-centre toward hers.
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.podRim, 0.7 * glow);
    ctx.fill();
  }
  ctx.restore();
}
