import {
  type ValveState,
  valveFreezeBeats,
  valveMark,
  valveNeedMilli,
  valveOnMark,
  valvePullBeats,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { into, valveSocketGlow } from "./valve-pose.js";
import { bearingAngle, onBearing, valveSocket, valveWheel } from "./valve-shape.js";

/**
 * **THE VALVE's marks**: the three things on the drum that say a gesture —
 * the wheel's mark, which is *turn it here*; the socket's window, which is
 * *tap now*; and the pull's window, which is *draw it out before it thaws*.
 * All plain white (§25, *Colour*): nothing here is colour-gated, since
 * either seat may take the pull. Cut from `valve-draw.ts` the day it was
 * written, along the line its second half will grow on — the grip and the
 * words come here.
 */

/**
 * The mark: a white notch outside the wheel's rim at the bearing the wave
 * authored, lit while a mark is lit. In the third movement, until the lap is
 * made, it is hollow, and a thin arc round the wheel fills with the lap —
 * row 9's long way round, shown as far as it has gone.
 */
export function drawValveMark(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  lit: number,
): void {
  const cfg = world.cfg;
  const { at, r } = valveWheel(l);
  const need = valveNeedMilli(s, cfg);
  const owed = need > 0 && Math.abs(s.travelMilli) < need;
  const mark = valveMark(s);
  const a = bearingAngle(mark);
  const tip = onBearing(at, r * 1.08, mark);
  const side = r * 0.16;
  const notch = new Path2D();
  notch.moveTo(tip.x, tip.y);
  const back = onBearing(at, r * 1.34, mark);
  notch.lineTo(
    back.x + Math.cos(a + Math.PI / 2) * side,
    back.y + Math.sin(a + Math.PI / 2) * side,
  );
  notch.lineTo(
    back.x - Math.cos(a + Math.PI / 2) * side,
    back.y - Math.sin(a + Math.PI / 2) * side,
  );
  notch.closePath();
  if (!owed) {
    ctx.fillStyle = rgba(PALETTE.hullRim, 0.25 + 0.65 * lit);
    ctx.fill(notch);
  }
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.3 + 0.6 * lit);
  ctx.stroke(notch);
  if (valveOnMark(s, cfg) && lit >= 1) strokeGlow(ctx, notch, PALETTE.hullRim, STROKE.inner, 1.2);
  if (need <= 0 || lit < 1) return;
  const share = Math.min(1, Math.abs(s.travelMilli) / need);
  if (share <= 0) return;
  const lap = new Path2D();
  const from = bearingAngle(0);
  const sweep = Math.PI * 2 * share * Math.sign(s.travelMilli);
  lap.arc(at.x, at.y, r * 1.2, from, from + sweep, sweep < 0);
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.55);
  ctx.stroke(lap);
}

/**
 * The pin socket beside the wheel: a white ring, dim at rest, flashing on the
 * beat while the wheel holds and steady once it is frozen; round it, the arc
 * of whichever window is open closing as its beats run — the freeze while
 * the wheel holds, the pull while it is frozen.
 */
export function drawValveSocket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: ValveState,
  beat: number,
  beatPhase: number,
): void {
  const { at, r } = valveSocket(l);
  const glow = valveSocketGlow(s, beatPhase);
  const socket = new Path2D();
  socket.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.rockDark, 0.95);
  ctx.fill(socket);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.35 + 0.5 * glow);
  ctx.stroke(socket);
  if (glow > 0) strokeGlow(ctx, socket, PALETTE.hullRim, STROKE.inner, 0.4 + 1.1 * glow);
  const beats = windowBeats(world, s);
  if (beats === 0) return;
  // The window counts from the beat after it opened (`valve-step.ts`), so it
  // runs out one beat past its length, and the arc with it.
  const left = Math.max(0, 1 - into(s, beat, beatPhase) / (beats + 1));
  const arc = new Path2D();
  arc.arc(at.x, at.y, r * 1.7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * left);
  strokeGlow(ctx, arc, PALETTE.hullRim, STROKE.outline, 1.2);
}

/** The length of whichever window is open, in beats — the story's four as well — and nought while none is. */
function windowBeats(world: World, s: ValveState): number {
  if (s.phase === "hold") return valveFreezeBeats(world, s);
  if (s.phase === "frozen") return valvePullBeats(world, s);
  const cfg = world.cfg;
  if (s.phase === "jet") return cfg.valveJetBeats;
  if (s.phase === "brace") return cfg.valveShudderBeats;
  if (s.phase === "wipe") return cfg.valveWipeBeats;
  if (s.phase === "seal") return cfg.valveStrainBeats;
  return 0;
}
