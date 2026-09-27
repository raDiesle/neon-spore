import { countDisc } from "../../../../../packages/render/src/countdown.js";
import { CORE, SOCKET } from "../../../../../packages/render/src/countdown-iris.js";
import * as look from "../../../../../packages/render/src/countdown-look.js";
import type { Body } from "../../../../../packages/render/src/creature-body-in.js";
import { contourClock } from "../../../../../packages/render/src/creature-place.js";
import { hazed } from "../../../../../packages/render/src/depth.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "A count's socket and a
 * throb's far half hide the two cores that would move them". THE COUNT on the
 * navigator's screen is a socket with a core in it that never moves: IRIS's
 * eye that never blinks. Here the core wanders a hair about the bottom of the
 * socket, on the body's own contour clock, the way a pupil is never quite
 * still — and it still never blinks, and still reads nothing of the count.
 *
 * On the pilot's screen the blades cover the socket until zero, and at zero
 * the blazing core is drawn over this one, centred, in the same light and
 * never narrower than it, so that seat's picture is all but unchanged. The throb was the other half of the entry
 * and has no candidate: its pores are carried round by its spin on every
 * frame, which is what the owner asked it to show, and a clock of their own
 * would blur which colour is facing the cannon.
 *
 * Rates off every term that already moves a body — the contour's 0.9, 0.53
 * and 0.31 and the smoke's 0.9 — so the core is not read as the outline.
 */
const WANDER_X = 0.61;
const WANDER_Y = 0.47;
/** How far the core wanders, as a share of the body's radius. The socket
 * leaves it 0.35 of room; at 0.06 the move was a pixel on a phone and read as
 * nothing (checked 27 September 2026). */
const WANDER = 0.09;
const TAU = Math.PI * 2;

function wanderingEye(b: Body): void {
  const { ctx, world, near, c, time } = b;
  const { cx, cy, r, trio } = countDisc(b);
  ctx.fillStyle = rgba(trio.dark, 0.96);
  ctx.beginPath();
  ctx.arc(cx, cy, r * SOCKET, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(trio.rim, 0.35);
  ctx.lineWidth = Math.max(0.8, r * 0.05);
  ctx.beginPath();
  ctx.arc(cx, cy, r * SOCKET, Math.PI * 0.85, Math.PI * 1.95);
  ctx.stroke();
  const t = contourClock(c.id, time);
  const dx = Math.sin(t * WANDER_X) * r * WANDER;
  const dy = Math.sin(t * WANDER_Y + 1.1) * r * WANDER;
  ctx.fillStyle = hazed(world.cfg, trio.rim, near);
  ctx.beginPath();
  ctx.arc(cx + dx, cy + dy, r * CORE, 0, TAU);
  ctx.fill();
}

export const COUNTDOWN_EYE_DRIFT: Variant = {
  slot: "countdown:eye",
  name: "drift",
  sentence:
    "drift — on the navigator's screen the count's core wanders a hair in its socket, where today it never moves; it still never blinks and still says nothing of the count",
  dir: "tools/versus/candidates/countdown-eye/drift",
  patches: [
    patch({
      target: look.COUNTDOWN_LOOK,
      reached: () => look.COUNTDOWN_LOOK,
      where: {
        file: "packages/render/src/countdown-look.ts",
        symbol: "COUNTDOWN_LOOK",
        type: "CountdownLook",
      },
      fields: { over: wanderingEye },
    }),
  ],
};
