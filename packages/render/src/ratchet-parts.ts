import {
  RATCHET_CLEAN,
  type RatchetState,
  ratchetHeld,
  ratchetWorking,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import {
  ratchetBarAt,
  ratchetCatchRail,
  ratchetLock,
  ratchetPawl,
  ratchetPawlY,
  ratchetShoulder,
  ratchetStep,
} from "./ratchet-shape.js";

/**
 * THE RATCHET's fittings round the rack: **the lock** at the top of the strut
 * with its five pins, **the spring** from the lock down to the rack, **the
 * pawl** that bears on it, and **the catch** — the one thing on the whole
 * boss that is a seat's own (`view-role-clocks-c.ts`). Off `ratchet-draw.ts`
 * because the rack is one body and these are the things round it.
 *
 * Each hand carries the fifth standard in its own shape rather than a word: a
 * round pad on a pivot is a thing to press, and a bar on a rail is a thing to
 * pull down and hold.
 */

/**
 * The lock at the top of the strut, its five pins counting the clean
 * advances — **the progress read off the body**: every clean tooth drives a
 * pin home and lights it, a burnt one drives none, and five lit is the lock
 * giving. As the rack opens its two jaws spring wide by `fold`.
 */
export function drawRatchetLock(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
  fold: number,
): void {
  const at = ratchetLock(l, cfg);
  const h = at.half;
  const gap = h * 0.9 * fold;
  for (const side of [-1, 1]) {
    const jaw = new Path2D();
    const x = at.x + side * gap;
    jaw.roundRect(side < 0 ? x - h : x, at.y - h * 0.62, h, h * 1.24, h * 0.3);
    ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
    ctx.fill(jaw);
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = PALETTE.rock;
    ctx.stroke(jaw);
  }
  const pitch = (h * 1.6) / (RATCHET_CLEAN - 1);
  for (let k = 0; k < RATCHET_CLEAN; k++) {
    const pin = new Path2D();
    pin.arc(at.x - h * 0.8 + k * pitch, at.y, h * 0.13, 0, Math.PI * 2);
    const home = k < s.clean;
    ctx.fillStyle = home ? PALETTE.rock : rgba(PALETTE.rockDark, 0.9);
    ctx.fill(pin);
    if (home) {
      // The strut's fade is on the context (`ratchet-draw.ts`), and
      // `strokeGlow` neither reads it nor puts it back: handed on and set
      // again, or the first clean pin and all of the lock after it were whole.
      const fade = ctx.globalAlpha;
      strokeGlow(ctx, pin, PALETTE.rock, STROKE.inner, 0.9, fade);
      ctx.globalAlpha = fade;
    } else {
      ctx.lineWidth = STROKE.inner;
      ctx.strokeStyle = rgba(PALETTE.rock, 0.4);
      ctx.stroke(pin);
    }
  }
}

/**
 * The spring from the lock down to the rack's top, its coils packing tighter
 * as the rack climbs into it — half wound is where it throws the bolt (§22,
 * row 8), so the thing that throws it is the thing drawn winding.
 */
export function drawRatchetSpring(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  top: number,
): void {
  const lock = ratchetLock(l, cfg);
  const from = lock.y + lock.half * 0.62;
  if (top <= from) return;
  const coils = 7;
  const w = l.tile * 0.22;
  const coil = new Path2D();
  coil.moveTo(lock.x, from);
  for (let k = 0; k < coils * 2; k++) {
    const y = from + ((k + 0.5) / (coils * 2)) * (top - from);
    coil.lineTo(lock.x + (k % 2 === 0 ? w : -w), y);
  }
  coil.lineTo(lock.x, top);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.75);
  ctx.stroke(coil);
}

/**
 * The pawl: a pivot beside the rack and an arm whose tip bears on the
 * shoulder of plate `bears`, the last to have passed it. `lift` rides the tip
 * out over the tooth climbing past it and drops it back — the click. Drawn on
 * both screens: the rack and what holds it are the whole of what both seats
 * share.
 *
 * `pad` is the pilot's own mark, the round pad on the pivot he presses, and
 * it is lit while a tooth is waiting — on his screen alone, for the
 * catch's reason (`view-role-clocks-c.ts`).
 */
export function drawRatchetPawl(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
  bears: number,
  lift: number,
  pad: boolean,
): void {
  const pivot = ratchetPawl(l, cfg);
  const seam = ratchetPawlY(l);
  const rest = ratchetShoulder(l, cfg, bears, seam - (bears + 1) * ratchetStep(l));
  const side = Math.sign(pivot.x - rest.x) || 1;
  const tip = { x: rest.x + side * lift * l.tile * 0.24, y: seam };
  const arm = new Path2D();
  arm.moveTo(pivot.x, pivot.y);
  arm.lineTo(tip.x, tip.y);
  ctx.lineCap = "round";
  ctx.lineWidth = l.tile * 0.12;
  ctx.strokeStyle = rgba(PALETTE.rock, 0.9);
  ctx.stroke(arm);
  ctx.lineCap = "butt";
  const hub = new Path2D();
  hub.arc(pivot.x, pivot.y, l.tile * 0.16, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(hub);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = PALETTE.rock;
  ctx.stroke(hub);
  if (!pad) return;
  const ring = new Path2D();
  ring.arc(pivot.x, pivot.y, l.tile * 0.34, 0, Math.PI * 2);
  if (ratchetWorking(s)) strokeGlow(ctx, ring, PALETTE.rock, STROKE.inner, 1.1);
  else {
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.rock, 0.3);
    ctx.stroke(ring);
  }
}

/**
 * The catch, on the navigator's screen: the rail, the notch her thumb has to
 * pass for it to hold, and the bar at the depth she has it — glowing in the
 * target lock's colour while it is set, because it is a lock and not
 * ammunition (§22, *Colour*). A spent catch is drawn with its rail dimmed
 * until she lifts and sets it again.
 */
export function drawRatchetCatch(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
): void {
  if (s.phase === "open" || s.phase === "jam") return;
  const rail = ratchetCatchRail(l, cfg);
  const bar = ratchetBarAt(l, cfg, Math.max(0, s.catchMilli));
  const notch = ratchetBarAt(l, cfg, cfg.ratchetGripMilli);
  const held = ratchetHeld(s, cfg);

  const track = new Path2D();
  track.moveTo(rail.x, rail.top);
  track.lineTo(rail.x, rail.top + rail.length);
  track.moveTo(rail.x - bar.halfW * 0.5, notch.y);
  track.lineTo(rail.x + bar.halfW * 0.5, notch.y);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.rock, s.catchSpent ? 0.2 : 0.5);
  ctx.stroke(track);

  const thick = l.tile * 0.14;
  const plate = new Path2D();
  plate.roundRect(bar.x - bar.halfW, bar.y - thick, bar.halfW * 2, thick * 2, thick);
  ctx.fillStyle = held ? PALETTE.pod : rgba(PALETTE.rock, s.catchSpent ? 0.35 : 0.7);
  ctx.fill(plate);
  if (held) strokeGlow(ctx, plate, PALETTE.pod, STROKE.inner, 1.4);
}
