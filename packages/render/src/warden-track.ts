import type { Circle } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { PALETTE } from "./palette.js";
import { drawTwoWayPull } from "./pull-two-way.js";

/**
 * **THE WARDEN's hatch under GLARE is a swipe, so it is drawn as a pull**:
 * the PULL LAB's knob on its channel, as every pull in the game is
 * (`pull-knob.ts`, `pull-track.ts`) — the owner, 13 October 2026, on THE
 * WARDEN'S SWIPE: *same standard visuals*. Until then it was a red bar of
 * its own with chevrons out along both halves.
 *
 * The throw counts either way across (`sim/warden-hand.ts`), so the channel
 * is one line through the eye, `wardenThrowMilli` long on each side — the
 * two-way pull (`pull-two-way.ts`). The press is still answered on the eye
 * (`warden-grip.ts`), and the knob rides the carry the sim keeps
 * (`wardenSwipeAlong`).
 *
 * On the navigator's screen it is the partner's knob, with no arrow, a dashed
 * ring turning round the eye and the waiting clock on it, the way every mark
 * is shown to the seat it is not asking (`mark-feedback.ts`). She sees the
 * knob travel too, because the carry is the pilot's hand arriving.
 */

/**
 * The hatch's channel through the eye `c` (its ring radius `c.r`), `reach`
 * out each side, with the knob `along` of the way (−1..1, signed the way it
 * goes) and `knob` its radius.
 */
export function drawWardenTrack(
  ctx: CanvasRenderingContext2D,
  c: Circle,
  knob: number,
  reach: number,
  along: number,
  mine: boolean,
  time: number,
): void {
  if (mine) drawMarkHalo(ctx, c.x, c.y, c.r, time);
  drawTwoWayPull(ctx, c, { knob, reach, along, mine, ...LOOK, key: KEY, time });
  if (mine) return;
  drawMarkTheirs(ctx, c.x, c.y, c.r, time);
  drawMarkWait(ctx, c.x, c.y, c.r, time);
}

/** The eye's red, and its lit rim. */
const LOOK = { hex: PALETTE.red, rim: PALETTE.redRim } as const;

/** One hatch on the field, so one key (`PullMemory`). */
const KEY = "warden:hatch";
