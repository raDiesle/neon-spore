import { LIGHT_HALF } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { litRound } from "./key-light.js";
import { halfWedge } from "./throb.js";
import type { ThrobHalf } from "./throb-look.js";

/**
 * HALVES — the owner's words, 17 October 2026: *make it rotating
 * animation/visual so players can clearly see the colour rotating and when to
 * shoot. so colours on each half side should stay.*
 *
 * So each colour owns a half of the body, flesh and rim, and the halves are
 * painted in the body's own space: the turn the context already carries is the
 * whole of how they go round, and the edge between them sweeps past the bottom
 * of the body on exactly the thousandth `throbFacing` changes its answer
 * (`throb.ts`'s `ownArc`). No line is drawn on that edge — the two colours meet
 * and that is the seam.
 *
 * **When to shoot is said by light, not by a second colour.** The half
 * pointing at the cannon is the answer, so it is lit at full and the other is
 * held back. Both stay plainly their own colour the whole way round — a dimmed
 * half that read as grey would be the shield plating this creature lost on
 * purpose (`sim/throb.ts`).
 */

/** How far each half's flesh is lifted from its dark toward its colour: the
 * answering half, and the half turned away. `living-skin.ts`'s FLESH is 0.42. */
const FLESH_ON = 0.8;
const FLESH_OFF = 0.5;
/** How bright each half's rim glows. */
const GLOW_ON = 1;
const GLOW_OFF = 0.55;

export function halves(h: ThrobHalf): void {
  const { ctx, body, rx, ry, tint, own, arc, facing, lw, rot } = h;
  const r = Math.max(rx, ry);

  for (const [isOwn, trio] of [
    [true, own],
    [false, tint],
  ] as const) {
    const on = isOwn === facing;
    const wedge = halfWedge(isOwn, arc, r);

    ctx.save();
    ctx.clip(wedge);
    ctx.save();
    ctx.clip(body);
    ctx.fillStyle = mixHex(trio.dark, trio.hex, on ? FLESH_ON : FLESH_OFF);
    ctx.fill(body);
    ctx.restore();
    strokeGlow(ctx, body, trio.hex, lw, on ? GLOW_ON : GLOW_OFF);
    ctx.restore();
  }

  // The light, over both halves at once: one ball under one lamp, so the
  // shading does not turn with the colours and the turn reads as the paint
  // going round rather than the light.
  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, r, LIGHT_HALF.creature, rot);
  ctx.restore();
}
