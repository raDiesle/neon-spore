import type { ControlSet } from "@neon-spore/content";
import { bandLobes, type Layout, type ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";
import { pulseLobeIds } from "./pulse-button.js";

/**
 * Where THE PULSE's four lanes are, and where the line across them is.
 *
 * **The lanes are read off the buttons, never laid out beside them.** Four
 * arrows falling onto four buttons is the whole of the round's picture, and a
 * lane whose centre is a pixel off the button under it is a round the pair
 * cannot read. `bandLobes` already answers where a lobe is, and it is the same
 * call the band's draw, the game's hit test and the director's all make — so
 * this takes the x of each and nothing works anything out twice. That is the
 * bug THE GAUGE shipped with once, one level up (`slabs.ts`).
 *
 * **The buttons are lobes on the band now**, not a slab panel of the round's
 * own. The owner asked for THE PULSE to look like the game it is part of — the
 * ship on the screen and the same four sockets the pair have been holding
 * since wave one — so the only thing that changed here is which call answers
 * *where a button is*.
 *
 * A seat with no buttons on this screen — the other half of a split view —
 * gets an even four across the width instead, so a frame test or a thumbnail
 * with no panel under it still draws a picture rather than nothing.
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

export function pulseField(l: Layout, set: ControlSet, role: ViewRole): PulseField {
  const seat: 1 | 2 = role === "p2" ? 2 : 1;
  const lobes = bandLobes(l, set, seat);
  // The four ids this seat's panel carries, asked of the file that draws them
  // rather than spelled out again — a second copy of how a lane is named is a
  // second copy of the panel (`pulse-button.ts`).
  const wanted = pulseLobeIds(seat);
  const lanes = wanted.map((id, i) => {
    const lobe = lobes.find((s) => s.control.id === id);
    // Wider than the button, because a lane is the *channel* an arrow comes
    // down and the button is only where it lands. Never wider than the pitch
    // between two of them, or the four washes would overlap into one.
    if (lobe !== undefined) return { x: lobe.circle.x, w: lobe.circle.r * 2.3 };
    const w = l.width / 4;
    return { x: w * (i + 0.5), w: w * 0.82 };
  });
  return {
    // Above the ship rather than above the band: the hull is on the screen
    // again and the line has to clear it — the crown of a swelling stands a
    // tile proud of the skin, and a receptor drawn into that is a judgement
    // happening inside the thing the arrow is about to fall into. Straight and
    // still, though: the membrane breathes, and a judgement line that breathed
    // with it would be the one mark on a rhythm screen nobody could read. The
    // owner was asked which, and chose the straight one.
    lineY: l.hullY - Math.max(46, l.tile * 1.9),
    topY: l.playHeight * 0.22,
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
  const prev = ctx.globalCompositeOperation;
  // Added rather than laid over. The round sits in the field's own water now,
  // and a wash painted onto it darkened the light shafts it crossed — four
  // dark bars where four lit channels were meant to be. `lighter` is the same
  // bargain the seam and the bolts make (`band-seam.ts`): a lane is light, and
  // light does not cover what is under it.
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < field.lanes.length; i++) {
    const lane = field.lanes[i];
    if (lane === undefined) continue;
    // Each lane breathes on its own phase, so the four are never one block of
    // light — the membrane's rule (`docs/alive.md`), applied to a channel.
    const breath = 0.5 + 0.5 * Math.sin(time * 0.9 + i * 1.7);
    const grad = ctx.createLinearGradient(0, field.topY - 40, 0, field.lineY);
    grad.addColorStop(0, "rgba(24,18,52,0)");
    grad.addColorStop(0.75, `rgba(38,30,72,${0.5 + 0.16 * breath})`);
    grad.addColorStop(1, `rgba(96,44,142,${0.36 + 0.16 * breath})`);
    ctx.fillStyle = grad;
    ctx.fillRect(lane.x - lane.w / 2, field.topY - 40, lane.w, field.lineY - field.topY + 40);
  }
  ctx.globalCompositeOperation = prev;
}

/**
 * The line the arrows are judged on: a wet seam across the four lanes, with
 * the pulse of the beat running along it.
 *
 * `beatPhase` rather than wall-clock time, because this is the one mark on the
 * screen that has to agree with the click both players are hearing — a line
 * that shimmered on its own clock would be a second, wrong metronome.
 *
 * **It reaches the lanes and no further.** It used to run the whole width,
 * which is right on a phone — where a seat's four buttons *are* the width —
 * and plainly wrong on the rig, where they are half of it and the line went on
 * across a half with no lanes in it at all.
 */
export function drawPulseLine(
  ctx: CanvasRenderingContext2D,
  field: PulseField,
  beatPhase: number,
): void {
  const first = field.lanes[0];
  const last = field.lanes[field.lanes.length - 1];
  if (first === undefined || last === undefined) return;
  const swell = (1 - beatPhase) ** 3;
  ctx.save();
  ctx.strokeStyle = PALETTE.hull;
  ctx.globalAlpha = 0.35 + 0.4 * swell;
  ctx.lineWidth = 1.5 + 2.5 * swell;
  ctx.beginPath();
  ctx.moveTo(first.x - first.w * 0.72, field.lineY);
  ctx.lineTo(last.x + last.w * 0.72, field.lineY);
  ctx.stroke();
  ctx.restore();
}
