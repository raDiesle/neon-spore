import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { aim } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";
import { drawAbout, handSeconds, inField, snapshot } from "../lens.js";

/** How far the field is pushed in at the top of the punch, as a share of its size. */
const PEAK = 0.11;

/** How far in it stays for the rest of the window. */
const HOLD = 0.04;

/** Seconds to the top of the punch. */
const ATTACK = 0.07;

/** Seconds the punch takes to settle onto the hold. */
const SETTLE = 0.22;

/** How fast the settle rings, in radians a second. */
const RING = 16;

/** Seconds, at the end, the field takes to let go — and how far past it springs. */
const RELEASE = 0.35;
const SPRING = 0.025;

/** How dark the corners go, at the hold and at the top of the punch. */
const SHADE = 0.55;

/**
 * How far in the field stands this frame: a snap to the peak as the window
 * opens, a ring down onto the hold, and at the end a release that springs a
 * little past where it started and lands on nothing on the beat it shuts.
 */
function push(since: number, until: number): number {
  const ring = Math.exp(-since / SETTLE) * Math.cos(since * RING);
  const open = smoothstep(since / ATTACK) * (HOLD + (PEAK - HOLD) * ring);
  if (until >= RELEASE) return open;
  const e = 1 - until / RELEASE;
  return open * (1 - smoothstep(e)) - SPRING * Math.sin(Math.PI * e);
}

/**
 * **PUNCH — the lens jumps onto the boss.** On the beat the window opens the
 * whole field is pushed in about the boss's head, overshoots and rings down
 * onto a closer hold, and the corners of the room go dark around it. On the
 * beat it shuts the field lets go, springs a hair past where it began, and is
 * back. The window is a camera move, and nothing else is drawn.
 *
 * How it can lose: while the field is pushed in, a body is not over the
 * column it stands in — the cannon and the column lines below it are not
 * moved, and a pair aiming by eye aims at a picture four hundredths too big.
 */
export const punchWindow: SlowLook["paint"] = (ctx, l, world, view, win) => {
  const at = aim(world, l, world.beat, view.beatPhase);
  const { since, until } = handSeconds(win, world.cfg);
  const z = push(since, until);
  const dark = SHADE * Math.min(1, Math.max(0, z / HOLD));
  inField(ctx, l, at.x, at.y, (eye) => {
    const snap = snapshot(ctx, 0);
    // Laid on the field's own ground, so a spring past the start shows an
    // empty edge of the room and never the page behind the canvas.
    ctx.fillStyle = PALETTE.background;
    ctx.fillRect(0, 0, eye.w, eye.h);
    drawAbout(ctx, snap, eye, 1 + z);
    const far = Math.hypot(Math.max(eye.x, eye.w - eye.x), Math.max(eye.y, eye.h - eye.y));
    const shade = ctx.createRadialGradient(eye.x, eye.y, at.r * eye.px * 1.4, eye.x, eye.y, far);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, `rgba(0,0,0,${Math.min(0.85, dark)})`);
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, eye.w, eye.h);
  });
  drawFuse(ctx, l, win);
};
