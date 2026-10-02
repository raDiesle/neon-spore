import type { ControlId } from "@neon-spore/content";
import { GAUGE_FULL, type GaugeState, gaugeRound, type World } from "@neon-spore/sim";
import { drawFireButton } from "./controls.js";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawNose, drawSwing } from "./scout-button.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * THE GAUGE's four presses, as faces on the band's own lobes.
 *
 * The round used to draw three bare rectangles of its own in the band's place,
 * and the owner asked for them to fit the ship's hull and its controls (20
 * September 2026) — the request SNAKE, PINBALL, THE PULSE and THE SCOUT had
 * already had granted. So the three are `lobe` controls in the sockets
 * `band-control.ts` puts every control in, and this file draws only what is
 * *on* each face.
 *
 * **The pilot's two carry the cannon's heading, live**, with the arc a turn
 * swings it through — THE SCOUT's nose and SNAKE's wheel, the same call,
 * because it is the same act: a thing on the field pointing somewhere, and a
 * thumb swinging it. A turn lights while its thumb is on it.
 *
 * **The navigator's two are the ship's own fire buttons**, red and cyan,
 * because a call *is* the cannon firing (`gauge-shot.ts`) — the owner, 25
 * September 2026: *the regular cannon, cyan or red*. Since 27 September the
 * colour is a rule: only a shot in the wound's colour lands
 * (`sim/gauge-call.ts`), and she is the one who can see the wound.
 *
 * A button the round would refuse right now is drawn faint rather than
 * hidden: the call while her thumb holds the band open (`gaugeLobeArmed`).
 * The turns are always live since the jam went, 2 October 2026.
 */

export type GaugeLobe = "left" | "right" | "red" | "cyan";

/** Which of THE GAUGE's four this control is, if any. */
export function gaugeLobeOf(id: ControlId): GaugeLobe | null {
  if (id === "gaugeLeft") return "left";
  if (id === "gaugeRight") return "right";
  if (id === "gaugeRed") return "red";
  if (id === "gaugeCyan") return "cyan";
  return null;
}

/** Whether this lobe is one of her two calls rather than one of his turns. */
function isCall(which: GaugeLobe): which is "red" | "cyan" {
  return which === "red" || which === "cyan";
}

/** How much of a refused button still shows. */
const REFUSED = 0.35;

export function drawGaugeLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  which: GaugeLobe,
  world: World,
  skin: SeatSkin,
): void {
  const { x, y, r } = circle;
  const round = gaugeRound(world);
  const live = round !== null && round.phase === "play";
  const armed = !live || gaugeLobeArmed(round, which);
  ctx.save();
  if (!armed) ctx.globalAlpha = REFUSED;
  if (isCall(which)) {
    drawFireButton(ctx, x, y, r, which, skin);
    ctx.restore();
    return;
  }
  const dir = which === "left" ? -1 : 1;
  const on = live && armed && Math.sign(round.valve) === dir;
  const hex = PALETTE.hull;
  if (on) halo(ctx, x, y, r * 1.8, hex, 0.45);
  ctx.fillStyle = on ? hex : skin.dead[0];
  ctx.strokeStyle = hex;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  const ink = on ? "#1B0630" : hex;
  // The needle as a heading from straight up, clockwise positive: the dial's
  // left end is a quarter turn anticlockwise and its right end a quarter turn
  // clockwise, which is where the cannon on the crown points at either.
  const turn = ((round?.needleMilli ?? GAUGE_FULL / 2) / GAUGE_FULL - 0.5) * Math.PI;
  drawNose(ctx, x, y, r, ink, Math.sin(turn), Math.cos(turn));
  drawSwing(ctx, x, y, r, ink, dir);
  ctx.restore();
}

/**
 * Whether a lobe would answer if it were pressed right now, asked the way the
 * simulation asks it (`sim/gauge.ts`, `gauge-hand.ts`) rather than guessed at.
 *
 * The valve always answers, and the call is refused while her own thumb is
 * holding the band open. The rest
 * between two calls is not in here — it is two beats, and a button that
 * blinked every time she pressed would read as a fault rather than a rhythm;
 * the shot in the air already says it.
 */
export function gaugeLobeArmed(round: GaugeState, which: GaugeLobe): boolean {
  return !isCall(which) || !round.openThumb;
}
