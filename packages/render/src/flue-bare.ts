import { blobPoints } from "@neon-spore/content";
import {
  type FlueState,
  flueCannonCol,
  flueLitLevel,
  flueOver,
  midCol,
  type SimConfig,
} from "@neon-spore/sim";
import { flueEmberR, type Point } from "./flue-shape.js";
import { haloSprite, strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **The spore bare over the cannon, and shielded everywhere else** (the
 * owner, 6 October 2026: *when the ball is in the area of damage it must get
 * some visual that it's vulnerable … and when leaving it gets a shield
 * animation around*).
 *
 * Away from the sight the spore wears a shield, a faint lobed bubble in the
 * shield's own cyan. As it comes over the cannon — inside `flueHitMilli`,
 * where a shot meets it — the shield **breaks**: its pieces fly off and a red
 * shock opens round it, and the spore goes red for the whole of its stay,
 * reddest at the middle, so a pair that has not fired yet still sees *now it
 * can be hurt*. As it leaves, the bubble **closes** back round it from wide
 * and settles.
 *
 * **Read off the world, nothing kept**: how long the spore has been over the
 * cannon, or since it left, is the distance it has run past the edge of the
 * zone over the level's speed, so a restart or a rewound beat draws the right
 * thing with no `Effects` to clear. It is the pilot's alone, like the spore it
 * is drawn on (`showsFlueEmber`): it says where the ember is.
 */

/** How long the shield's pieces fly as it breaks, and how long it takes to close, in beats. */
const BREAK_BEATS = 0.45;
const CLOSE_BEATS = 0.4;
/** The shield's radius against the spore's, resting and as it starts to close. */
const SHIELD = 1.3;
const SHIELD_WIDE = 2.3;
/** How faint the shield rests, and how many pieces it breaks into. */
const SHIELD_REST = 0.6;
const PIECES = 6;

export interface FlueBareness {
  /** Over the cannon, where a shot meets it. */
  over: boolean;
  /** How red: 0 shielded, up to 1 over the middle of the zone. */
  red: number;
  /** Beats since it came over the cannon, or since it left; Infinity when it never has this lap. */
  since: number;
}

const SHIELDED: FlueBareness = { over: false, red: 0, since: Number.POSITIVE_INFINITY };

/** Where the spore stands against the zone over the cannon, read off the lit level. */
export function flueBareness(cfg: SimConfig, s: FlueState): FlueBareness {
  const level = flueLitLevel(s);
  if (level === null || level.speedMilli <= 0) return SHIELDED;
  const hit = cfg.flueHitMilli;
  const off = s.emberMilli - (flueCannonCol(cfg) - midCol(cfg)) * 1000;
  const ahead = s.emberDir * off;
  if (flueOver(cfg, s, flueCannonCol(cfg))) {
    const red = 0.7 + 0.3 * (1 - Math.abs(off) / Math.max(1, hit));
    return { over: true, red, since: (ahead + hit) / level.speedMilli };
  }
  if (ahead > hit) return { over: false, red: 0, since: (ahead - hit) / level.speedMilli };
  return SHIELDED;
}

/** The spore's red heat round it while it is bare: a halo flickering fast. */
export function drawFlueBareHeat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  bare: FlueBareness,
  time: number,
): void {
  if (!bare.over) return;
  const r = flueEmberR(l);
  const flicker = 0.8 + 0.2 * Math.sin(time * 38);
  const halo = haloSprite(PALETTE.red, Math.round(r * 2.6));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha *= 0.85 * bare.red * flicker;
  ctx.drawImage(halo, at.x - halo.width / 2, at.y - halo.height / 2);
  ctx.restore();
}

/**
 * Over the spore: the shield breaking as it comes bare, the red shock round
 * it, and the shield closing back as it leaves and resting after.
 */
export function drawFlueShield(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  bare: FlueBareness,
  time: number,
): void {
  const r = flueEmberR(l);
  if (bare.over) {
    const k = bare.since / BREAK_BEATS;
    if (k < 1) drawBreak(ctx, at, r, k);
    const ring = new Path2D();
    ring.arc(at.x, at.y, r * (1.05 + 0.08 * Math.sin(time * 24)), 0, Math.PI * 2);
    strokeGlowFaded(ctx, ring, PALETTE.red, STROKE.outline, 1.4 * bare.red, 1);
    return;
  }
  const k = Math.min(1, bare.since / CLOSE_BEATS);
  const ease = 1 - (1 - k) * (1 - k) * (1 - k);
  const radius = r * (SHIELD_WIDE + (SHIELD - SHIELD_WIDE) * ease);
  const bright = SHIELD_REST + (1 - SHIELD_REST) * (1 - k) * 1.6;
  const bubble = splinePath(
    blobPoints(at.x, at.y, radius, radius, PIECES, 0.06, 0.03, time * 0.9, 31, 24),
    true,
  );
  ctx.fillStyle = rgba(PALETTE.shield, 0.1 + 0.2 * (1 - k));
  ctx.fill(bubble);
  strokeGlowFaded(ctx, bubble, PALETTE.shieldRim, STROKE.inner, bright, Math.min(1, bright));
}

/** The shield's pieces flying off as it breaks, and a red shock opening, `k` 0..1 through it. */
function drawBreak(ctx: CanvasRenderingContext2D, at: Point, r: number, k: number): void {
  const fade = 1 - k;
  const out = r * (SHIELD + 1.4 * Math.sqrt(k));
  const span = (Math.PI * 2) / PIECES;
  for (let i = 0; i < PIECES; i++) {
    const a = i * span + 0.4 * k;
    const piece = new Path2D();
    piece.arc(at.x, at.y, out, a + span * 0.12, a + span * (0.72 - 0.3 * k));
    strokeGlowFaded(ctx, piece, PALETTE.shieldRim, STROKE.outline, 1.3 * fade, fade);
  }
  const shock = new Path2D();
  shock.arc(at.x, at.y, r * (1 + 1.8 * k), 0, Math.PI * 2);
  strokeGlowFaded(ctx, shock, PALETTE.red, STROKE.outline * (1 + 2 * fade), 1.5 * fade, fade);
}
