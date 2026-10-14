import type { ChrysalisSkin, ChrysalisState, ChrysalisStep, World } from "@neon-spore/sim";
import { drawHurt } from "./boss-hurt.js";
import { drawChrysalisHeart, drawChrysalisSacs } from "./chrysalis-belly.js";
import { drawChrysalisQuills, drawChrysalisSlime } from "./chrysalis-coat.js";
import type { ChrysalisFx } from "./chrysalis-fx.js";
import { drawChrysalisHide, drawChrysalisSilk } from "./chrysalis-hide.js";
import { chrysalisPose } from "./chrysalis-pose.js";
import { drawChrysalisReceipts } from "./chrysalis-receipts.js";
import { type At, CHRYSALIS_SKIN_TILES, chrysalisReach } from "./chrysalis-shape.js";
import { drawChrysalisRegrow, drawChrysalisShed } from "./chrysalis-shed.js";
import { smoothstep } from "./ease.js";
import type { Layout } from "./layout.js";
import { showsChrysalisHeart } from "./view-role-clocks-c.js";

/**
 * **THE CHRYSALIS** (§11.63): a living cocoon hung over the field on strands
 * of silk, an alien grub inside four skins, drawn from the hide out — the
 * hide, ridged and marked, with the grub glowing through it; the sacs off
 * its belly or the heart's pores under its last skin; the quills standing
 * out of it; and the slime over the lot.
 *
 * **Both screens draw the one cocoon**; only the heart differs, shown to the
 * pilot alone (`showsChrysalisHeart`).
 *
 * **Progress is read off the cocoon, never a bar**: a half of slime thins
 * turn by turn and is gone, a quill stands out along its track and leaves a
 * raw socket, a sac swells and is a scar, a pore is stitched shut — and every
 * skin off leaves the cocoon smaller and turned half round, the skin falling
 * away in two halves (`chrysalis-shed.ts`).
 *
 * Everything is read off `world` each frame but its receipts — the quills
 * flung, the globs, the spores, the shudder and the blow (`chrysalis-fx.ts`,
 * drawn by `chrysalis-receipts.ts`).
 */
export function drawChrysalis(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ChrysalisState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: ChrysalisFx,
): void {
  const p = chrysalisPose(l, world.cfg, s, beat, beatPhase, time);
  const c = p.c;
  const reach = chrysalisReach(l, s);
  ctx.save();
  ctx.translate(fx.hurt.shakeX(time, l.tile), 0);
  if (p.near < 1) {
    // Out of the dark: small and dim, swelling to its full size.
    const k = 0.15 + 0.85 * p.near;
    ctx.translate(c.x, c.y);
    ctx.scale(k, k);
    ctx.translate(-c.x, -c.y);
    ctx.globalAlpha = 0.3 + 0.7 * p.near;
  }
  drawChrysalisSilk(ctx, l, c, reach);
  const on = s.steps[s.cursor]?.skin ?? null;
  const hideStep = stepFrom(s, (skin) => skin !== "slime");
  const hideSkin = hideStep?.skin ?? null;
  const fresh = freshness(s, p.grow, p.shed);
  const grow = (skin: ChrysalisSkin | null, draw: () => void) =>
    grown(ctx, c, skin !== null && skin === on ? fresh : 1, draw);
  let body = new Path2D();
  grow(hideSkin, () => {
    const r = hideSkin === null ? 0 : CHRYSALIS_SKIN_TILES[hideSkin] * l.tile;
    body = drawChrysalisHide(ctx, l, p, hideSkin, r, time);
    if (hideStep?.skin === "sacs") drawChrysalisSacs(ctx, l, world.cfg, s, hideStep, p, time);
    if (hideSkin === "heart")
      drawChrysalisHeart(ctx, l, world.cfg, s, p, showsChrysalisHeart(l.role));
    if (hideSkin === "quills") drawChrysalisQuills(ctx, l, world.cfg, s, p);
  });
  if (on === "slime") {
    const lit = s.phase === "skin";
    grow("slime", () => drawChrysalisSlime(ctx, l, s, p, lit, time));
  }
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();
  if (p.shed !== null) drawChrysalisShed(ctx, l, c, p.shed.skin, p.shed.k, reach);
  if (s.phase === "regrow" && on !== null) drawChrysalisRegrow(ctx, l, c, on, p.grow, p.pulse);
  drawChrysalisReceipts(ctx, l, c, fx);
}

/** The first step from the cursor on whose skin `which` takes, or null past the last. */
function stepFrom(
  s: ChrysalisState,
  which: (skin: ChrysalisSkin) => boolean,
): ChrysalisStep | null {
  for (let j = s.cursor; j < s.steps.length; j++) {
    const step = s.steps[j];
    if (step !== undefined && which(step.skin)) return step;
  }
  return null;
}

/**
 * How whole the skin at the cursor is: growing back after it ran out, or —
 * when the skin just peeled was the same skin, its second course — growing
 * in under the one falling away.
 */
function freshness(
  s: ChrysalisState,
  grow: number,
  shed: { skin: ChrysalisSkin; k: number } | null,
): number {
  if (s.phase === "regrow") return grow;
  if (shed !== null && shed.skin === s.steps[s.cursor]?.skin) return smoothstep(shed.k);
  return 1;
}

/** A skin growing is drawn smaller, filling out to where it stands. */
function grown(ctx: CanvasRenderingContext2D, c: At, grow: number, draw: () => void): void {
  if (grow >= 1) {
    draw();
    return;
  }
  const k = 0.7 + 0.3 * grow;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(k, k);
  ctx.translate(-c.x, -c.y);
  ctx.globalAlpha *= 0.4 + 0.6 * grow;
  draw();
  ctx.restore();
}
