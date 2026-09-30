import type { SimConfig, SpoolState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { phaseInto } from "./phase-into.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";
import type { Point } from "./spool-shape.js";

/**
 * **THE SPOOL's story between the ribs, drawn** (§21; the rules are
 * `sim/spool-story.ts`). Three states, each laid over the line
 * `spool-line.ts` draws and the casing `spool-draw.ts` does:
 *
 * - **The snag**: the line stopped dead and straight, an ember catch where it
 *   leaves the winding, and the casing shuddering on its axle
 *   (`spoolStoryShake`). The catch dims as the pilot's thumb stays off the
 *   brake, beat by beat, and is gone to nothing the beat a grip would free it.
 * - **The whip**: the freed line thrown out wide in a loop off the brake's
 *   side, swinging, and swinging less each beat the brake is held full deep.
 * - **The fray**: the line furred with fibres standing off it, fluttering,
 *   and lying down along it each beat the brake is held featherlight.
 *
 * The brake mark and the knob are never shaken: the casing is, and the thing
 * a thumb has to find stays where it was.
 */

/** How far the casing shudders at most, in tiles, and how fast, in cycles per beat. */
const SHUDDER = 0.06;
const SHUDDER_RATE = 6;
/** What is left of the shudder while THE SLOW asks for the knob beside it (`valve-story.ts`' figure). */
const SHUDDER_HUSHED = 0.04;
/** How wide the whip's loop is thrown, and how big the loop, in tiles. */
const WHIP_WIDE = 1.7;
const WHIP_LOOP = 0.45;
/** What is left of the swing once the brake has been held deep the whole count. */
const WHIP_DAMPED = 0.25;
/** Fibres along the frayed line, and how long they stand, in tiles. */
const FIBRES = 16;
const FIBRE = 0.22;
/** What is left of a fibre's stand once the brake has been held light the whole count. */
const FIBRE_LAID = 0.2;

/** How far a count has got, 0..1. */
function counted(beats: number, need: number): number {
  return Math.min(1, beats / Math.max(1, need));
}

/** The casing's shake this frame, in pixels: the snag's shudder, dying down under `slow`. */
export function spoolStoryShake(
  l: Layout,
  s: SpoolState,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): Point {
  if (s.phase !== "snag") return { x: 0, y: 0 };
  const t = (beat + beatPhase) * SHUDDER_RATE * Math.PI * 2;
  const amp = SHUDDER * slowHush(slow, beat, beatPhase, SHUDDER_HUSHED) * l.tile;
  return { x: amp * Math.sin(t), y: amp * 0.5 * Math.sin(t * 1.7) };
}

/**
 * **The whip's line**: from the winding out wide to the brake's side, round a
 * loop, and back down to the hull. `null` in every other phase, where the
 * line is `spool-line.ts`' own curve.
 */
export function spoolWhipPath(
  l: Layout,
  s: SpoolState,
  cfg: SimConfig,
  top: Point,
  foot: Point,
  side: -1 | 1,
  beat: number,
  beatPhase: number,
): Path2D | null {
  if (s.phase !== "whip") return null;
  const left = 1 - (1 - WHIP_DAMPED) * counted(s.runBeats, cfg.spoolWhipBeats);
  const swing = 0.75 + 0.25 * Math.sin(phaseInto(s, beat, beatPhase) * Math.PI * 2);
  const wide = WHIP_WIDE * left * swing * l.tile;
  const r = WHIP_LOOP * (0.4 + 0.6 * left) * l.tile;
  const apex = { x: (top.x + foot.x) / 2 + side * wide, y: top.y + (foot.y - top.y) * 0.42 };
  const line = new Path2D();
  line.moveTo(top.x, top.y);
  line.quadraticCurveTo(top.x + side * wide * 0.9, top.y + (apex.y - top.y) * 0.3, apex.x, apex.y);
  // The loop, turning away from the field's middle and closing on itself.
  const from = side > 0 ? Math.PI : 0;
  line.arc(apex.x + side * r, apex.y, r, from, from + side * Math.PI * 2, side < 0);
  line.quadraticCurveTo(apex.x - side * wide * 0.2, (apex.y + foot.y) / 2, foot.x, foot.y);
  return line;
}

/**
 * What the snag and the fray lay on the line: the catch at its head, or the
 * fibres along it. `ctrl` is the line's own control point, so the fibres
 * stand off the curve that is drawn.
 */
export function drawSpoolStoryLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SpoolState,
  cfg: SimConfig,
  top: Point,
  ctrl: Point,
  foot: Point,
  beat: number,
  beatPhase: number,
): void {
  if (s.phase === "snag") drawCatch(ctx, l, s, cfg, top, beatPhase);
  else if (s.phase === "fray") drawFibres(ctx, l, s, cfg, top, ctrl, foot, beat, beatPhase);
}

/** The line caught on the casing: an ember hook and a pinch across the line, loosening as the thumb stays off. */
function drawCatch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SpoolState,
  cfg: SimConfig,
  top: Point,
  beatPhase: number,
): void {
  const held = 1 - counted(s.runBeats, cfg.spoolSnagBeats);
  const pulse = 0.6 + 0.4 * Math.cos(beatPhase * Math.PI * 2);
  const r = l.tile * 0.2;
  const hook = new Path2D();
  hook.arc(top.x, top.y + r * 0.6, r, -Math.PI * 0.15, Math.PI * 1.15);
  for (const k of [1, 2] as const) {
    const y = top.y + r * (0.9 + 0.8 * k);
    hook.moveTo(top.x - r * 0.7, y);
    hook.lineTo(top.x + r * 0.7, y + r * 0.25);
  }
  const alpha = ctx.globalAlpha;
  strokeGlow(
    ctx,
    hook,
    PALETTE.emberRim,
    STROKE.outline,
    1.1,
    alpha * (0.25 + 0.75 * held) * pulse,
  );
  ctx.globalAlpha = alpha;
}

/** The fibres, standing off the curve either side and fluttering; each held beat lays them closer. */
function drawFibres(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SpoolState,
  cfg: SimConfig,
  top: Point,
  ctrl: Point,
  foot: Point,
  beat: number,
  beatPhase: number,
): void {
  const stand = 1 - (1 - FIBRE_LAID) * counted(s.runBeats, cfg.spoolFrayBeats);
  const t0 = phaseInto(s, beat, beatPhase);
  const fibres = new Path2D();
  for (let i = 0; i < FIBRES; i++) {
    const t = (i + 0.5) / FIBRES;
    const u = 1 - t;
    const x = u * u * top.x + 2 * u * t * ctrl.x + t * t * foot.x;
    const y = u * u * top.y + 2 * u * t * ctrl.y + t * t * foot.y;
    // The curve's normal at t, the side alternating fibre by fibre.
    const dx = 2 * u * (ctrl.x - top.x) + 2 * t * (foot.x - ctrl.x);
    const dy = 2 * u * (ctrl.y - top.y) + 2 * t * (foot.y - ctrl.y);
    const n = Math.hypot(dx, dy) || 1;
    const way = i % 2 === 0 ? 1 : -1;
    const flutter = 0.7 + 0.3 * Math.sin((t0 + i * 0.37) * Math.PI * 2);
    const len = FIBRE * l.tile * stand * flutter * (0.7 + 0.3 * ((i * 7) % 3));
    // Standing off the line and leaning down it, as fibre does off a running line.
    fibres.moveTo(x, y);
    fibres.lineTo(
      x + ((-dy * way) / n) * len + (dx / n) * len * 0.4,
      y + ((dx * way) / n) * len + (dy / n) * len * 0.4,
    );
  }
  const alpha = ctx.globalAlpha;
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9);
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(fibres);
  strokeGlow(ctx, fibres, PALETTE.hull, STROKE.inner, 0.6, alpha * 0.7);
  ctx.globalAlpha = alpha;
}
