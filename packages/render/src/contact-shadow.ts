import { type Creature, isBossBody, occupiesCol, type Scar, type SimConfig } from "@neon-spore/sim";
import { SHADOW_DIR } from "./cast-shadow.js";
import { creatureCenter, creatureRadius } from "./creature-place.js";
import { drawnRow, nearness } from "./depth.js";
import type { Layout } from "./layout.js";

/**
 * A BODY ABOUT TO HIT THE HULL CASTS SOMETHING ON IT.
 *
 * One soft dark ellipse, drawn straight onto `l.hullY` — the hull's *known*
 * y, not its true contour. `hull-frame.ts`'s lobes are a few pixels of
 * swelling under the cannon and the shield; reading them here would mean this
 * file importing the frame just to move a shadow by less than it is wide.
 * The brief calls this out for a reason: it is what keeps the geometry
 * arithmetic instead of projection, and what keeps this module clear of
 * `hull.ts` entirely, which matters for the second half of this comment.
 *
 * **Size inherits, it does not duplicate.** `depth.ts`'s `depthNearScale` is
 * already the one place that says how big a body at a row draws — reached
 * here through `creatureRadius`, which applies it the same way
 * `creatures.ts` does. A shadow sized off its own row multiplier would agree
 * with the body it belongs to by coincidence, and only until one of the two
 * numbers was next tuned.
 *
 * **A scar always wins, and not by draw order.** `scars.ts` draws inside
 * `hull.ts`, which this module is never given a reason to import — so there
 * is no call here to make after it and no ordering to get right or wrong.
 * Instead, `castsOn` refuses to build a shadow for a creature whose column,
 * or an immediate neighbour of it, already carries a scar (`scarredNear`,
 * below). The exclusion is in the column space the whole game already
 * speaks in — the same one `occupiesCol` answers a hit or an impact in — so
 * it costs no geometry of its own and cannot drift out of step with where a
 * crack actually runs. `contact-shadow.test.ts` proves the *absence*: a
 * creature over a scarred column gets no shadow at all, so there is no pixel
 * for a scar to lose to, whichever of the two a future frame paints first.
 *
 * **No cache, so no quantising.** `depth.ts`'s haze is stepped because
 * `haloSprite` caches one canvas per colour and a continuously varying tint
 * would allocate one forever. This shadow is a fresh `createRadialGradient`
 * call every frame, the same way `hull.ts`'s own body-fill gradient is — nothing
 * here is cached, so nothing here needs to be. Its darkness (`alpha`, below)
 * is free to vary continuously with distance.
 *
 * **It leans, because the light is somewhere.** This file used to drop its
 * ellipse straight underneath the body, which said the lamp was directly
 * overhead — fine while nothing on the field claimed otherwise, and the only
 * surface disagreeing with `content`'s `KEY` once the light lane landed. A
 * contact shadow and a cast shadow are the same fact at two distances, so the
 * lean comes from `cast-shadow.ts`'s `SHADOW_DIR` and no angle is named here.
 *
 * **Only the x component of it, and that is the derivation rather than a
 * simplification.** The hull is drawn as a flat band at `l.hullY`. For a
 * receiving plane, the part of the light along the plane's normal decides
 * *whether* a shadow lands on it and the part in the plane decides *where*;
 * the band's normal is up the screen, so the in-plane direction is x and the
 * downward half of `SHADOW_DIR` is what puts the shadow on the hull at all.
 * Displacing by it as well would be sliding the shadow off the surface it is
 * lying on.
 */

/** Flat ellipse, not a disc: a shadow lying on a surface reads as wide and
 * short, not as a second body. */
const ASPECT = 0.42;
/** How much the ellipse spans at the far edge of its lead window, in body
 * radii — bigger and softer than the body it belongs to, so it reads as
 * light falling around a shape rather than as the shape's own outline. */
const START_MUL = 1.15;
/** How much it spans at the instant of contact — smaller than the body,
 * so "tightens" is a real shrink and not just a darkening. */
const END_MUL = 0.6;
/** `PALETTE.background` (#07060F) as an rgb triple, for the alpha-graded
 * gradient — the same pattern `torch-alarm.ts`'s `ROCK_RGB` already uses. */
const SHADOW_RGB = "7,6,15";
/**
 * How far the ellipse leans along the light, in body radii, at the far edge of
 * the lead window — and 0 at contact, because at contact the body is on the
 * hull and its shadow is under its own foot.
 *
 * It stays *contact* rather than turning into a second body, and the number is
 * what decides which: 0.9 radii along a 45° light is 0.64 of a radius of
 * sideways lean, against an ellipse 1.15 radii wide, so the shadow still
 * covers the point directly under the body for the whole of its travel. There
 * is never a gap between the two for an eye to read as two things.
 * `contact-shadow.test.ts` asserts that, so this cannot be raised quietly.
 *
 * **The gap-to-lean curve is quadratic, not linear, in `t`.** A directional
 * light offsets a raised point by `height * tan(angle)`, which is linear in
 * height and was this file's first guess. But `t` is not height — it is
 * `nearness`, and a body's *actual* clearance over the hull for a given `t`
 * is not a fixed fraction of the frame either: `depthScale` already dilates
 * everything near the hull, which is the same fact stated the other way
 * round — a step near contact reads as more of the remaining gap than the
 * same step does far out. Scaling the lean by `1 - t²` instead of `1 - t`
 * keeps it near its full value while the body is still mostly gap, so the
 * two obvious cues (bigger, darker) carry the early fall, and lets it
 * collapse sharply only in the last stretch — which is also where the eye
 * already is, watching the body about to land. `1 - t` would have spent that
 * same visible collapse gradually across the whole window instead of saving
 * it for the moment that reads as the rock closing the last of the distance.
 */
const LEAN = 0.9;

export interface ContactShadow {
  x: number;
  y: number;
  rx: number;
  ry: number;
  alpha: number;
}

/** Whether a scar sits under this creature's own columns or immediately
 * beside them. Beside, not only under: `scars.ts`'s crack leans and forks a
 * fraction of a tile off its own column's centre, and a shadow that stopped
 * exactly at the column line could still graze one growing out of its
 * neighbour. One column of margin either side is more than that ever
 * reaches, at the cost of a shadow that goes quiet a column early. */
function scarredNear(c: Creature, scars: readonly Scar[]): boolean {
  for (const s of scars) {
    if (occupiesCol(c, s.col - 1) || occupiesCol(c, s.col) || occupiesCol(c, s.col + 1)) {
      return true;
    }
  }
  return false;
}

/**
 * The shadow one creature casts this frame, or null if it casts none: too
 * far out, no lead window at all, a boss body or tether (neither falls, so
 * neither arrives), or a scarred column underneath it.
 */
export function contactShadowFor(
  cfg: SimConfig,
  l: Layout,
  c: Creature,
  beatPhase: number,
  scars: readonly Scar[],
): ContactShadow | null {
  if (isBossBody(c.kind) || c.kind === "tether") return null;
  const span = Math.max(1, l.rows - 1);
  const leadFrac = Math.min(1, cfg.contactShadowLeadRows / span);
  if (leadFrac <= 0) return null;
  const near = nearness(l, drawnRow(c, beatPhase));
  const threshold = 1 - leadFrac;
  if (near <= threshold) return null;
  if (scarredNear(c, scars)) return null;

  // 0 at the lead window's own far edge, 1 at the hull — monotonic in `near`,
  // which is itself monotonic in the row while a body glides toward the hull.
  const t = (near - threshold) / leadFrac;
  const { x } = creatureCenter(l, c, beatPhase);
  const bodyR = creatureRadius(l, c, beatPhase, cfg);
  const rx = bodyR * (START_MUL + (END_MUL - START_MUL) * t);
  const lean = SHADOW_DIR.x * bodyR * LEAN * (1 - t * t);
  return { x: x + lean, y: l.hullY, rx, ry: rx * ASPECT, alpha: t * cfg.contactShadowMaxAlpha };
}

function drawOne(ctx: CanvasRenderingContext2D, s: ContactShadow): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.scale(1, s.ry / s.rx);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s.rx);
  g.addColorStop(0, `rgba(${SHADOW_RGB},${s.alpha})`);
  g.addColorStop(1, `rgba(${SHADOW_RGB},0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, s.rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Every creature's shadow this frame, farthest first — not that two ever
 * overlap enough to matter, but there is no reason to leave the order to
 * spawn order when `world.creatures` is already in it. */
export function drawContactShadows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  creatures: readonly Creature[],
  scars: readonly Scar[],
  beatPhase: number,
): void {
  for (const c of creatures) {
    const s = contactShadowFor(cfg, l, c, beatPhase, scars);
    if (s) drawOne(ctx, s);
  }
}
