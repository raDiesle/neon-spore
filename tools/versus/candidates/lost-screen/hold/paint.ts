import { HAMMER_SECONDS, hammer } from "../../../../../packages/render/src/breach-hammer.js";
import { REND_SECONDS, rend } from "../../../../../packages/render/src/breach-rend.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { veil } from "../../../../../packages/render/src/lost-shutters.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drop } from "../../../../../packages/render/src/text-drop.js";
import { retriesText } from "../../../../../packages/sim/src/index.js";

/**
 * The shipped plates, and the hit still burning under them.
 *
 * `veil` is imported rather than retyped: what this answer argues is *one*
 * thing, and a candidate that redrew the plates in order to add a char would
 * be asking the owner two questions at once and getting one answer.
 */
export function holdVeil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  veil(ctx, p);
  strike(ctx, p);
}

/**
 * The breach replayed on this screen's own clock.
 *
 * **The crest runs once and the char stays.** The owner's words on 17
 * September 2026: *the wave animation we always show, and the dark as well on
 * top, and the dark stays for the whole time of "wave lost", but we let the
 * animation of wave end and not repeat.* So the blow is drawn while its own
 * 0.55 seconds last and never again, and the tear's clock is *pinned* at 1
 * rather than allowed past it — at 1 the char is at full width and the forks
 * have gone out, which is the settled picture `breach-rend.ts` already ends
 * on, so holding it is holding a frame the field itself drew.
 *
 * The blow goes down first and the tear over it: the char is the thing the eye
 * is meant to land on, and a crest of white drawn over a burnt patch is a
 * light in a hole.
 */
function strike(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  if (p.breachX === null || p.breach === null) return;
  const s = {
    x: p.breachX,
    y: p.surfaceY(p.breachX),
    tile: p.l.tile,
    span: p.breach.span,
    hex: p.breach.hex,
    surfaceY: p.surfaceY,
    l: p.l,
    seed: p.breach.seed,
  };
  const blow = p.age / HAMMER_SECONDS;
  if (blow < 1) hammer(ctx, { ...s, t: blow });
  rend(ctx, { ...s, t: Math.min(1, p.age / REND_SECONDS) });
}

/**
 * Where the words go, as a share of the play area.
 *
 * The shipped stack starts at 0.16 — as high up the upper plate as the plate
 * goes — and the owner asked for it lower: *text of "wave lost" more down near
 * the game screen*. The plate's own foot is the seam at 0.44, the buttons are
 * at 0.52, and the stack is about four lines deep, so 0.26 puts the last line
 * a finger's width above the plate's edge and the whole of it in the half of
 * the screen nearer the ship.
 */
const TOP = 0.26;

/** The shipped words, moved down the plate. Nothing else about them changes. */
export function holdWords(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  let y = p.l.playHeight * TOP;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '700 30px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 24;
  drop(ctx, mid, y, p.age, 2, 0, () => {
    ctx.font = '600 12px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries} · RUN IT AGAIN`, 0, 0);
  });
  y += 22;
  drop(ctx, mid, y, p.age, 3, 0, () => {
    ctx.font = '13px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("The tear is where it came in.", 0, 0);
  });
  y += 20;
  drop(ctx, mid, y, p.age, 4, 0, () => {
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.globalAlpha *= 0.8;
    ctx.fillText(`THIS RUN · ${retriesText(p.retries)}`, 0, 0);
  });
  ctx.textAlign = "left";
}
