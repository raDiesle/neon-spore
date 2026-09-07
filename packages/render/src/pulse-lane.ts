import type { ControlSet } from "@neon-spore/content";
import { PULSE_LANES } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { slabPanel } from "./slabs.js";

/**
 * Where THE PULSE's four lanes are, and where the line across them is.
 *
 * **The lanes are read off the buttons, never laid out beside them.** Four
 * arrows falling onto four buttons is the whole of the round's picture, and a
 * lane whose centre is a pixel off the slab under it is a round the pair
 * cannot read. `slabPanel` already answers where a slab is, and it is the same
 * call the draw, the game's hit test and the director's all make — so this
 * takes the x of each and nothing works anything out twice. That is the bug
 * THE GAUGE shipped with once, one level up (`slabs.ts`).
 *
 * A seat with no slabs on this screen — the other half of a split view — gets
 * an even four across the width instead, so a frame test or a thumbnail with
 * no panel under it still draws a picture rather than nothing.
 */

/** One lane, in screen coordinates. */
export interface PulseLaneBox {
  /** Centre of the lane. */
  x: number;
  /** How wide the arrows in it may be. */
  w: number;
}

export interface PulseField {
  lanes: PulseLaneBox[];
  /** Screen y the arrows are judged on — the row of empty receptors. */
  lineY: number;
  /** Screen y an arrow enters at. */
  topY: number;
}

/** Which of this seat's four slabs a lane belongs to. */
function slabIdsFor(role: ViewRole): string[] {
  const seat = role === "p2" ? 2 : 1;
  return PULSE_LANES.map((lane) => `pulse${seat}${lane[0]?.toUpperCase()}${lane.slice(1)}`);
}

export function pulseField(l: Layout, set: ControlSet, role: ViewRole): PulseField {
  const slabs = slabPanel(l, set, role);
  const wanted = slabIdsFor(role);
  const lanes = wanted.map((id, i) => {
    const slab = slabs.find((s) => s.control.id === id);
    if (slab !== undefined) return { x: slab.x + slab.w / 2, w: slab.w };
    const w = l.width / 4;
    return { x: w * (i + 0.5), w: w * 0.82 };
  });
  return {
    // A hand's width above the buttons: an arrow judged *on* a thumb is an
    // arrow nobody can see arrive.
    lineY: l.bandTop - Math.max(28, l.playHeight * 0.09),
    topY: l.playHeight * 0.16,
    lanes,
  };
}

/**
 * The lane wells: four soft channels the arrows come down, drawn as light
 * rather than as lines.
 *
 * A ruled edge either side of each lane would be a table, and this game does
 * not draw tables — the field's own grid is the faintest thing on the screen
 * for the same reason. So a lane is a vertical wash that gets brighter towards
 * the line, which says *where the arrows are going* rather than *where the
 * boundary is*.
 */
export function drawPulseLanes(
  ctx: CanvasRenderingContext2D,
  field: PulseField,
  time: number,
): void {
  for (let i = 0; i < field.lanes.length; i++) {
    const lane = field.lanes[i];
    if (lane === undefined) continue;
    // Each lane breathes on its own phase, so the four are never one block of
    // light — the membrane's rule (`docs/alive.md`), applied to a channel.
    const breath = 0.5 + 0.5 * Math.sin(time * 0.9 + i * 1.7);
    const grad = ctx.createLinearGradient(0, field.topY - 40, 0, field.lineY);
    grad.addColorStop(0, "rgba(36,27,79,0)");
    grad.addColorStop(0.75, `rgba(58,49,96,${0.3 + 0.1 * breath})`);
    grad.addColorStop(1, `rgba(192,92,255,${0.16 + 0.08 * breath})`);
    ctx.fillStyle = grad;
    ctx.fillRect(lane.x - lane.w / 2, field.topY - 40, lane.w, field.lineY - field.topY + 40);
  }
}

/**
 * The line the arrows are judged on: a wet seam across the four lanes, with
 * the pulse of the beat running along it.
 *
 * `beatPhase` rather than wall-clock time, because this is the one mark on the
 * screen that has to agree with the click both players are hearing — a line
 * that shimmered on its own clock would be a second, wrong metronome.
 */
export function drawPulseLine(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  field: PulseField,
  beatPhase: number,
): void {
  const swell = (1 - beatPhase) ** 3;
  ctx.save();
  ctx.strokeStyle = PALETTE.hull;
  ctx.globalAlpha = 0.35 + 0.4 * swell;
  ctx.lineWidth = 1.5 + 2.5 * swell;
  ctx.beginPath();
  ctx.moveTo(l.width * 0.04, field.lineY);
  ctx.lineTo(l.width * 0.96, field.lineY);
  ctx.stroke();
  ctx.restore();
}
