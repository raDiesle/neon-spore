import { openSmoothPath } from "../../../../../packages/content/src/index.js";
import { KEY } from "../../../../../packages/content/src/light.js";
import { handleSag } from "../../../../../packages/render/src/handle-draw.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import type { TetherDraw } from "../../../../../packages/render/src/tether-look.js";

/**
 * CORD — the rope is round, and it has a side the light is on.
 *
 * **The rope.** The same sag, drawn as a cylinder instead of a stroke: a
 * cool shadow the full width of the cord underneath, the body colour over it
 * a little narrower, and a thin highlight along the key side, laid on the
 * same path displaced toward the light by a share of the width. Three
 * strokes on one curve are what make a line into a thing with a near side —
 * `.claude/skills/depth`'s terminator, body and specular on the one shape in
 * the game that has no inside to shade. Pulled, the cord thins and the
 * highlight goes bright and hard, so the tension is still read off the rope
 * alone.
 *
 * **The root.** A grommet: the cord passes *through* the eye's underside
 * rather than starting at a dot on it. A dark ellipse the cord's width for
 * the hole, a lit rim round it that brightens with the pull.
 *
 * **How it can lose.** *Three strokes at four pixels are one stroke.* The
 * cord is thin on a phone; if the highlight and the shadow merge into a
 * slightly wider line, the round has cost width and bought nothing. Judge it
 * slack, where the cord is widest.
 */

/** The cord's full width slack and taut, in tiles. */
const WIDE = 0.16;
const TAUT = 0.09;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** How far the highlight sits off the axis toward the key, as a share of the
 * width, and how wide it is. */
const HIGH_OFF = 0.22;
const HIGH_W = 0.28;
/** The grommet's rim past the hole, in tiles. */
const GROMMET = 0.06;

function width(d: TetherDraw): number {
  return d.tile * (WIDE + (TAUT - WIDE) * d.pull);
}

export function cord(d: TetherDraw): void {
  const { ctx, anchor, head, held, pull, time, hex, rim } = d;
  const pts = handleSag({
    anchor,
    head,
    held,
    pull,
    time,
    segments: 14,
    waveHeld: 1.2,
    waveSlack: 3.5,
  });
  const w = width(d);
  const axis = new Path2D(openSmoothPath(pts));
  const off = w * HIGH_OFF;
  const high = new Path2D(
    openSmoothPath(pts.map((p) => ({ x: p.x + KEY.x * off, y: p.y + KEY.y * off }))),
  );
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // The shadow: the cord's whole width, cool.
  ctx.strokeStyle = mixHex(hex, SHADOW, 0.7);
  ctx.lineWidth = w;
  ctx.stroke(axis);
  // The body, narrower, so the shadow shows along the away side.
  ctx.strokeStyle = held ? mixHex(hex, rim, pull * 0.5) : hex;
  ctx.lineWidth = w * 0.72;
  ctx.stroke(axis);
  // The highlight along the key side, hard and bright under tension.
  ctx.strokeStyle = rgba(rim, 0.45 + 0.55 * pull);
  ctx.lineWidth = Math.max(1, w * HIGH_W);
  ctx.stroke(high);
  ctx.restore();
}

export function grommet(d: TetherDraw): void {
  const { ctx, anchor, hex, rim, pull, tile } = d;
  const w = width(d);
  const hole = w * 0.6;
  ctx.save();
  ctx.fillStyle = mixHex(hex, SHADOW, 0.85);
  ctx.beginPath();
  ctx.ellipse(
    anchor.x,
    anchor.y,
    hole + tile * GROMMET,
    (hole + tile * GROMMET) * 0.6,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.strokeStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.5 + 0.5 * pull;
  ctx.lineWidth = Math.max(1, tile * GROMMET * 0.6);
  ctx.stroke();
  ctx.restore();
}
