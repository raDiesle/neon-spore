import { LIGHT_HALF } from "@neon-spore/content";
import type { Color } from "@neon-spore/sim";
import {
  capstanBandTick,
  capstanCapR,
  capstanCoreR,
  capstanFacePath,
  capstanHornAt,
} from "./capstan-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPullArrow } from "./pull-knob.js";
import { stepColour } from "./step-colour.js";

/**
 * **THE CAPSTAN's marks**: what says what a step asks — a horn of the cradle
 * lit, which is *lean this way*; the bared face's band lit, which is *rub
 * here*; and the bared core lit, which is *shoot here, in this colour*. The
 * horn and the band are the white of the hull's rim, the plain white §37
 * asks for, the one light on a drum that is otherwise rust; the core is the
 * only part in a cannon's colour, `stepColour`'s, called rather than copied.
 *
 * **A band's health is its marks**: one per reversal the band needs, each
 * scrubbed from grate to bare metal as a reversal wears it, and the whole
 * rim bright for good once the last one is.
 */

/**
 * Face `side` of the drum, `w` pixels wide, round its own middle: the notched
 * rim turned a tooth a reversal, its band's marks worn `worn` of the way, and
 * the rim glowing on its beat while `lit`, flaring bare metal `scrub` bright
 * for the last reversal, and a ring thrown off it `ring` of the way from gone.
 */
export function drawCapstanFace(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  w: number,
  worn: number,
  marks: number,
  lit: boolean,
  beatPhase: number,
  thrown: { scrub: number; ring: number },
): void {
  const bright = worn >= 1;
  const spin = worn * marks * ((Math.PI * 2) / 12);
  const face = capstanFacePath(l, w, spin);
  ctx.fillStyle = PALETTE.capstanRustDark;
  ctx.fill(face);
  ctx.fillStyle = rgba(PALETTE.capstanRust, bright ? 0.5 : 0.85);
  ctx.fill(face);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = bright ? PALETTE.capstanWorn : rgba(PALETTE.capstanRustDark, 0.95);
  ctx.stroke(face);
  if (w < l.tile * 0.12) return;
  const scrubbed = Math.round(worn * marks);
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.inner;
  for (let i = 0; i < marks; i++) {
    const { a, b } = capstanBandTick(l, w, i, marks);
    const tick = new Path2D();
    tick.moveTo(a.x, a.y);
    tick.lineTo(b.x, b.y);
    ctx.strokeStyle = i < scrubbed ? PALETTE.capstanWorn : PALETTE.capstanGrate;
    ctx.stroke(tick);
  }
  if (lit && !bright) {
    const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
    strokeGlow(ctx, face, PALETTE.hullRim, STROKE.outline, pulse, 0.9);
  }
  if (thrown.scrub > 0) {
    ctx.fillStyle = rgba(PALETTE.capstanWorn, 0.45 * thrown.scrub);
    ctx.fill(face);
  }
  if (thrown.ring > 0) {
    const grow = 1 + 0.9 * (1 - thrown.ring);
    const ring = capstanFacePath(l, w * grow, spin);
    strokeGlow(ctx, ring, PALETTE.capstanWorn, STROKE.outline, thrown.ring, thrown.ring);
  }
}

/**
 * The lean's mark on horn `side`: the shared pull arrow (`drawPullArrow`,
 * 30 September 2026) pointing out, the way the phone goes — lit and
 * breathing on the side the step asks for, faint on both while a hold takes
 * either. On the screen of the seat that steers alone (`mine`): a gesture on
 * a mark reads as *your next move*, and the other seat's is the rub.
 */
export function drawCapstanHorn(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  strength: number,
  mine: boolean,
  beatPhase: number,
  time: number,
): void {
  if (strength <= 0 || !mine) return;
  const at = capstanHornAt(l, side);
  const pulse = 0.7 + 0.3 * Math.cos(beatPhase * Math.PI * 2);
  const way = { dx: side === 0 ? -1 : 1, dy: 0 };
  drawPullArrow(ctx, at, HORN_R * l.tile, way, time, {
    alpha: pulse * strength,
    hex: PALETTE.hullRim,
  });
}

/** The horn's arrow, in tiles: the chevron's reach it replaces. */
const HORN_R = 0.16;

/**
 * The core and its cap, at the drum's middle. The core is soft and dull
 * while no shot is owed and lit in the step's colour while one is — `size`
 * of its fullest and `bright`, a core's hurt per hit — with a ring closing
 * as the step's beats run out. The cap hangs off a hinge along its top:
 * `cover` 1 shut over the core, 0 swung up flat, under 0 swung past it.
 */
export function drawCapstanCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cover: number,
  size: number,
  bright: number,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const r = capstanCoreR(l);
  if (cover < 1) {
    const face = new Path2D();
    face.arc(0, 0, r * size, 0, Math.PI * 2);
    if (lit === null) {
      ctx.fillStyle = PALETTE.capstanCore;
      ctx.fill(face);
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.9);
      ctx.stroke(face);
    } else {
      const { body, rim } = stepColour(lit.color);
      ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
      ctx.fill(face);
      strokeGlow(ctx, face, rim, STROKE.inner, 0.8 + bright);
      const ring = new Path2D();
      ring.arc(0, 0, r * 1.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
      strokeGlow(ctx, ring, body, STROKE.outline, 1);
    }
  }
  drawCap(ctx, l, cover);
}

/**
 * What a hit leaves on the core, and the spent drum's: a flash of the hull's
 * white wider for every hit, and a wash of rust over the whole drum as the
 * cap swings wide — both fading as `capstan-fx.ts` lets them.
 */
export function drawCapstanFlash(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  flash: { now: number; hits: number },
  open: number,
): void {
  if (flash.now > 0 && flash.hits > 0) {
    const hits = Math.min(3, flash.hits);
    const r = capstanCoreR(l) * (0.6 + 0.5 * hits) * (1.4 - 0.4 * flash.now);
    const p = new Path2D();
    p.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.hullRim, flash.now * (0.35 + 0.2 * hits));
    ctx.fill(p);
    strokeGlow(ctx, p, PALETTE.hullRim, STROKE.inner, flash.now * (0.6 + 0.4 * hits));
  }
  if (open > 0) {
    const p = new Path2D();
    p.arc(0, 0, capstanCapR(l) * (2.6 - 0.8 * open), 0, Math.PI * 2);
    ctx.fillStyle = rgba(PALETTE.capstanWorn, 0.4 * open);
    ctx.fill(p);
  }
}

/**
 * The cap, hinged along its top edge and folded `cover` of the way down over
 * the core: a disc seen flatter as it swings, its underside dark once past.
 */
function drawCap(ctx: CanvasRenderingContext2D, l: Layout, cover: number): void {
  if (Math.abs(cover) < 0.04) return;
  const R = capstanCapR(l);
  const cy = -R + R * cover;
  const cap = new Path2D();
  cap.ellipse(0, cy, R, R * Math.abs(cover), 0, 0, Math.PI * 2);
  ctx.fillStyle = cover > 0 ? PALETTE.capstanRust : PALETTE.capstanRustDark;
  ctx.fill(cap);
  if (cover > 0) {
    ctx.save();
    ctx.clip(cap);
    litRound(ctx, -R * 0.3, cy - R * 0.3 * cover, R * 1.3, LIGHT_HALF.rock);
    ctx.restore();
    // A cross of rivets, so the cap reads as a lid and not as another face.
    const d = 0.04 * l.tile;
    ctx.fillStyle = PALETTE.capstanRustDark;
    for (const [x, y] of [
      [0, -0.6],
      [0.6, 0],
      [0, 0.6],
      [-0.6, 0],
    ] as const) {
      ctx.fillRect(x * R - d, cy + y * R * cover - d, d * 2, d * 2);
    }
  }
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.capstanRustDark, 0.95);
  ctx.stroke(cap);
}
