import { type RatchetState, ratchetHeld, type SimConfig } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { ratchetBarAt, ratchetCatchRail } from "./ratchet-shape.js";

/**
 * THE RATCHET's catch — the navigator's half, the one thing on the whole boss
 * that is a seat's own (`view-role-clocks-c.ts`): the rail, the notch and the
 * bar she pulls down and holds. Off `ratchet-parts.ts` because it touches
 * neither the rack nor the pawl; `ratchet-stop.ts` and the grip read the bar.
 */

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
  const bar = ratchetCatchBar(l, cfg, s);
  if (bar === null) return;
  const rail = ratchetCatchRail(l, cfg);
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

  const plate = new Path2D();
  plate.roundRect(bar.x - bar.halfW, bar.y - bar.thick, bar.halfW * 2, bar.thick * 2, bar.thick);
  ctx.fillStyle = held ? PALETTE.pod : rgba(PALETTE.rock, s.catchSpent ? 0.35 : 0.7);
  ctx.fill(plate);
  if (held) strokeGlow(ctx, plate, PALETTE.pod, STROKE.inner, 1.4);
}

/** The catch's bar at the depth she has it and its half-thickness, or `null` once the rack is open or jammed. */
export function ratchetCatchBar(
  l: Layout,
  cfg: SimConfig,
  s: RatchetState,
): { x: number; y: number; halfW: number; thick: number } | null {
  if (s.phase === "open" || s.phase === "jam") return null;
  return { ...ratchetBarAt(l, cfg, Math.max(0, s.catchMilli)), thick: l.tile * 0.14 };
}
