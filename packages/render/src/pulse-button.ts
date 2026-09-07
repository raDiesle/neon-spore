import type { ControlId } from "@neon-spore/content";
import {
  PULSE_LANES,
  type PulseLane,
  type PulseState,
  pulseLaneIndex,
  pulseNoteAt,
  pulseNoteTick,
  pulseRound,
  pulseVeiled,
  type World,
} from "@neon-spore/sim";
import { halo } from "./glow.js";
import type { Circle } from "./layout.js";
import { paintLobe } from "./lobe-shell.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawPulseArrowMark } from "./pulse-arrow.js";
import { pulseLaneColor, pulseLaneRim } from "./pulse-shape.js";
import type { SeatSkin } from "./seat-skin.js";

/**
 * THE PULSE's four lanes, as a face on one of the band's own lobes.
 *
 * **This round is played on the panel the pair already hold.** It shipped with
 * a slab panel of its own — four rounded plates where the band would be — and
 * the owner asked for the round to look like the game it is part of: the ship
 * on the screen and the buttons in the same style as the default set. So a
 * lane is a `lobe` like every other button in this game, standing in the
 * socket `band-control.ts` puts every control in, and this file draws only
 * what is *on* its face. The socket, the gloss and the tissue around it are
 * not this file's business and never were.
 *
 * **It is lit by what is coming, and that is the design.** A rhythm game's
 * buttons are dead until a thumb lands; these swell as their arrow approaches,
 * so a player glancing down at their hands still knows what is about to
 * happen. It costs nothing — the number is already on the screen above — and
 * it is what makes the panel part of the picture instead of furniture under
 * it.
 *
 * **A veiled arrow lights nothing.** The button it belongs to is exactly what
 * this seat is not being told, and a socket that glowed for it would hand back
 * the half of the chart the round took away.
 */

/** Which seat and which lane a control id is, or null for anything else. */
const LOBE_ID = /^pulse([12])(Left|Down|Up|Right)$/;

export function pulseLobeOf(id: ControlId): { seat: 1 | 2; lane: PulseLane } | null {
  const match = LOBE_ID.exec(id);
  if (match === null) return null;
  return {
    seat: match[1] === "2" ? 2 : 1,
    lane: (match[2] ?? "Left").toLowerCase() as PulseLane,
  };
}

/** How long a press stays lit on its button, in ticks. `pulse-fall.ts`'s. */
const FADE_TICKS = 45;

/**
 * How close the nearest unresolved arrow in each lane is for one seat, 0..1.
 *
 * A question about the *chart*, asked of the world rather than of a view: the
 * button is drawn deep inside the band's own pass, which is handed a `World`
 * and a role and nothing else. Everything it needs is in there — the round is
 * `world.boss`, the clock is `world.tick` — so nothing has to be threaded down
 * through five signatures to reach a face.
 */
export function pulseLaneLight(boss: PulseState, world: World, seat: 1 | 2): number[] {
  const out = [0, 0, 0, 0];
  if (boss.phase !== "play") return out;
  const cfg = world.cfg;
  const judged = seat === 1 ? boss.judged1 : boss.judged2;
  const from = seat === 1 ? boss.from1 : boss.from2;
  for (let i = from; i < boss.notes.length; i++) {
    const note = boss.notes[i];
    if (note === undefined) continue;
    if (pulseNoteTick(cfg, boss.startTick, note) - world.tick > cfg.pulseLeadTicks) break;
    if (judged[i] !== 0) continue;
    if (pulseVeiled(note, seat)) continue;
    const at = Math.max(0, Math.min(1, pulseNoteAt(cfg, boss.startTick, note, world.tick)));
    const lane = pulseLaneIndex(note.lane);
    out[lane] = Math.max(out[lane] ?? 0, at ** 3);
  }
  return out;
}

/** 1 the instant this seat's thumb landed in this lane, fading over a beat. */
function pressed(boss: PulseState, world: World, seat: 1 | 2, lane: number): number {
  const at = seat === 1 ? boss.lastTick1 : boss.lastTick2;
  const which = seat === 1 ? boss.lastLane1 : boss.lastLane2;
  if (at < 0 || which !== lane) return 0;
  return Math.max(0, 1 - (world.tick - at) / FADE_TICKS);
}

/**
 * One lane's face: the arrow it presses, in the lane's own colour, over a body
 * that lights with the chart.
 *
 * Drawn even when the round is not the one running, which is the same rule
 * every other control on the band is drawn under: the picture and the hit test
 * read the same `bandLobes` call, and a button answered but not drawn is the
 * same defect as a button drawn but not answered (`slabs.ts` says it at
 * length). A wave played on this panel with no PULSE behind it — the director
 * looking at the set — gets the four arrows resting.
 */
export function drawPulseLobe(
  ctx: CanvasRenderingContext2D,
  circle: Circle,
  id: ControlId,
  world: World,
  skin: SeatSkin,
): void {
  const it = pulseLobeOf(id);
  if (it === null) return;
  const { x, y, r } = circle;
  const index = pulseLaneIndex(it.lane);
  const boss = pulseRound(world);
  const near = boss === null ? 0 : (pulseLaneLight(boss, world, it.seat)[index] ?? 0);
  const press = boss === null ? 0 : pressed(boss, world, it.seat, index);
  const swell = Math.max(near, press);
  const color = pulseLaneColor(it.lane);

  ctx.save();
  // The body: the panel's own dead flesh at rest, going to the lane's colour
  // as its arrow arrives. Not the colour outright — a button that was always
  // lit would say nothing when something was actually coming.
  ctx.fillStyle = swell > 0.5 ? color : skin.dead[swell > 0.02 ? 0 : 1];
  ctx.globalAlpha = 0.55 + 0.45 * swell;
  ctx.strokeStyle = color;
  ctx.lineWidth = STROKE.outline;
  paintLobe(ctx, x, y, r, "both");
  ctx.globalAlpha = 1;
  ctx.restore();

  drawPulseArrowMark(
    ctx,
    x,
    y,
    r * 0.62,
    it.lane,
    swell > 0.5 ? PALETTE.text : pulseLaneRim(it.lane),
    0.7 + 0.3 * swell,
  );
  if (swell > 0.02) halo(ctx, x, y, r * 1.9, color, 0.2 + 0.5 * swell);
}

/** The four ids one seat's panel carries, in `PULSE_LANES`' order. */
export function pulseLobeIds(seat: 1 | 2): string[] {
  return PULSE_LANES.map((lane) => `pulse${seat}${lane[0]?.toUpperCase()}${lane.slice(1)}`);
}
