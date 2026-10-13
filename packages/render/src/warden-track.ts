import type { Circle } from "./layout.js";
import { drawMarkHalo, drawMarkTheirs, drawMarkWait } from "./mark-feedback.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import type { PullWay } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W } from "./pull-track.js";

/**
 * **THE WARDEN's hatch under GLARE is a swipe, so it is drawn as a pull**:
 * the PULL LAB's knob on its channel, as every pull in the game is
 * (`pull-knob.ts`, `pull-track.ts`) — the owner, 13 October 2026, on THE
 * WARDEN'S SWIPE: *same standard visuals*. Until then it was a red bar of
 * its own with chevrons out along both halves.
 *
 * The throw counts either way across (`sim/warden-hand.ts`), so the channel
 * is one line through the eye, `wardenThrowMilli` long on each side, and the
 * knob starts in the middle with an arrow of two heads. The press is still
 * answered on the eye (`warden-grip.ts`). The knob rides toward the side the
 * thumb is carrying it (`sim` `wardenSwipeAlong`), its arrow that way alone,
 * and the channel fills green behind it — so the end of the channel is the
 * end of the swipe, said before the lift.
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
  const fill = Math.max(-1, Math.min(1, along));
  const pts = [
    { x: c.x - reach, y: c.y },
    { x: c.x + reach, y: c.y },
  ];
  const held = fill !== 0;
  const at = { x: c.x + fill * reach, y: c.y };
  if (mine) drawMarkHalo(ctx, c.x, c.y, c.r, time);
  drawPullTrack(
    ctx,
    { pts, w: knob * PULL_TRACK_W },
    { ...LOOK, held, origin: 0.5, at: 0.5 + fill / 2, time, key: KEY },
  );
  drawPullKnob(ctx, at, knob, {
    ...LOOK,
    held,
    time,
    way: mine ? (fill < 0 ? LEFT : RIGHT) : null,
    either: fill === 0,
    theirs: !mine,
    key: KEY,
  });
  if (mine) return;
  drawMarkTheirs(ctx, c.x, c.y, c.r, time);
  drawMarkWait(ctx, c.x, c.y, c.r, time);
}

const LEFT: PullWay = { dx: -1, dy: 0 };
const RIGHT: PullWay = { dx: 1, dy: 0 };

/** The eye's red, and its lit rim. */
const LOOK = { hex: PALETTE.red, rim: PALETTE.redRim } as const;

/** One hatch on the field, so one key (`PullMemory`). */
const KEY = "warden:hatch";
