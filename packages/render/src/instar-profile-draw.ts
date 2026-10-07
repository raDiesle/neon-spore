import { drawHurt } from "./boss-hurt.js";
import { halo, strokeGlow } from "./glow.js";
import { INSTAR_BODY } from "./instar-body-look.js";
import { drawNests } from "./instar-eggs.js";
import { drawEngines } from "./instar-front.js";
import { BODY_SKIN } from "./instar-front-body.js";
import { INSTAR_HEAD } from "./instar-head-look.js";
import { drawLegs, profileLegs } from "./instar-legs.js";
import { drawMoult } from "./instar-moult.js";
import type { Point } from "./instar-place.js";
import { drawSeam, faded, type Look } from "./instar-plate.js";
import { BREATH_PERIOD, headBob, rollAt } from "./instar-profile-life.js";
import { drawBelly, drawLamps, drawRidge, drawScales } from "./instar-profile-surface.js";
import { drawScutes } from "./instar-scutes.js";
import { swimLook } from "./instar-serpent.js";
import { drawTail } from "./instar-tail.js";
import { sideHead, turnedLines } from "./instar-turning.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawContact } from "./solid-haze.js";
import { drawTube, rimTube } from "./solid-tube-draw.js";

/**
 * **THE INSTAR side-on, drawn** (`instar-profile.ts` lays its lines) — and,
 * with `k` under 1, the same body part of the way round from face-on
 * (`instar-turning.ts`): one body turning rather than two drawings crossed.
 * What only the side view has — the nests, the moult, the belly plates, the
 * glow of the lung, the contact shadows — comes in with `k`; the face-on head
 * goes as the side-on head comes, the one thing still crossed, over the
 * middle of the turn where it moves fastest.
 */

/** How many samples of the spine one seam, lamp or spine spans. */
const EVERY = 2;

/** How far into the body the inner ember glow sits: the lung a dragon's fire
 * comes from, showing through the hide as a soft pulse rather than a lit
 * surface — the "glow inside of body" the owner asked for on 26 September
 * 2026. It breathes with the chest (`instar-profile-life.ts`). */
const EMBER_GLOW_AT = 0.22;

export function drawProfile(ctx: CanvasRenderingContext2D, l: Layout, still: Look, k = 1): void {
  const t = turnedLines(l, still, k);
  const { spine, top, bottom, rear, seats, body, origin } = t;
  // The head and the nests ride the wave the spine swims on, if it swims.
  const look = swimLook(l, still);
  const { head, r, fade, hurt, time } = look;
  const only = fade * k;
  const n = top.length - 1;
  const back = (u: number): Point => top[Math.round(u * n)] ?? rear;
  const [far, near] = t.wings;
  drawWing(ctx, look, far.at, far.w, far.hinge, far.side, 1 - 0.7 * (1 - k));
  const legs = profileLegs(spine, bottom, r, time, t.near);
  drawLegs(ctx, legs, true, BODY_SKIN, r, fade);
  const tailLook = { ...look, r: r * t.tailNear };
  // Face-on the tail goes away behind the body; side-on it comes off the rear over it.
  if (k < 0.5) drawTail(ctx, l, tailLook, rear, t.heading);
  if (k < 1) drawEngines(ctx, rear, r, time, fade * (1 - k));
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  const flame = Math.max(4, Math.round((r * 0.4) / 4) * 4);
  halo(ctx, rear.x + r * 0.1, rear.y, flame, PALETTE.ember, 0.7 * flick * only);
  // Tipped toward the player, the back comes round into view: the rows walk with it.
  const roll = rollAt(time);
  const at = (p: Point): Point => ({ x: p.x - origin.x, y: p.y - origin.y });
  ctx.save();
  ctx.translate(origin.x, origin.y);
  drawRidge(ctx, body, r, roll, fade, true, EVERY);
  const hide = drawTube(ctx, body.seen, BODY_SKIN, fade);
  strokeGlow(ctx, hide, faded(PALETTE.hull, fade), STROKE.inner, 0.5 * fade);
  drawHurt(ctx, hide, hurt * fade);
  drawBelly(ctx, body, hide, roll, fade);
  drawScales(ctx, body, hide, r * 0.13, roll, fade);
  const coarse = <T>(a: readonly T[]): T[] => a.filter((_, i) => i % EVERY === 0);
  drawScutes(ctx, coarse(bottom).map(at), coarse(spine).map(at), r, only);
  const glowAt = at(spine[Math.round(EMBER_GLOW_AT * n)] as Point);
  const breathe = 0.55 + 0.45 * Math.sin((time * (Math.PI * 2)) / BREATH_PERIOD);
  halo(ctx, glowAt.x, glowAt.y, r * 0.5, PALETTE.ember, 0.45 * breathe * only);
  for (let i = EVERY * 2; i < n - 1; i += EVERY * 2) {
    const a = at(top[i] as Point);
    const b = at(bottom[i] as Point);
    RING_LOOK.paint(ctx, { top: a, bottom: b, r, fade, hide });
  }
  drawLamps(ctx, body, r, roll, time, fade, EVERY * 2);
  drawRidge(ctx, body, r, roll, fade, false, EVERY);
  // Where the nests, the near wing and the head bear on the body.
  for (const p of seats.map(at)) drawContact(ctx, hide, p.x, p.y, r * 0.5, only);
  const root = at(back(0.42));
  drawContact(ctx, hide, root.x, root.y, r * 0.3, 0.8 * only);
  const neck = at(spine[0] as Point);
  drawContact(ctx, hide, neck.x, neck.y, r * 0.45, only);
  rimTube(ctx, hide, PALETTE.sheenRim, r * 0.06, fade);
  ctx.restore();
  drawLegs(ctx, legs, false, BODY_SKIN, r, fade);
  drawMoult(ctx, coarse(top), coarse(bottom), { ...look, fade: only });
  if (k >= 0.5) drawTail(ctx, l, tailLook, rear, t.heading);
  drawWing(ctx, look, near.at, near.w, near.hinge, near.side);
  if (k > 0) drawNests(ctx, l, { ...look, fade: only });
  const h = sideHead(k);
  if (h < 1) INSTAR_HEAD.front(ctx, { ...still, fade: still.fade * (1 - h) });
  if (h > 0) INSTAR_BODY.head(ctx, { ...look, fade: fade * h, head: headBob(head, r, time) });
}

/** One ring round the body, where two segments meet: from the back's edge to the belly's. */
export interface BodyRing {
  top: Point;
  bottom: Point;
  r: number;
  fade: number;
  /** The body's outline, for a look that must stay on it. */
  hide: Path2D;
}

/** The seam drawn at each ring, bowed toward the rear; VERSUS offers another. */
export const RING_LOOK: { paint: (ctx: CanvasRenderingContext2D, ring: BodyRing) => void } = {
  paint: (ctx, { top: a, bottom: b, r, fade }) =>
    drawSeam(ctx, a, { x: (a.x + b.x) / 2 + r * 0.12, y: (a.y + b.y) / 2 }, b, fade, 0.35),
};
