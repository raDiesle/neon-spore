import { circleSubpath, openSmoothPath } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { handleSag } from "../../../../../packages/render/src/handle-draw.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { STROKE } from "../../../../../packages/render/src/palette.js";
import type { TetherDraw } from "../../../../../packages/render/src/tether-look.js";

/**
 * TWIST — the rope is two strands laid round each other, and the twist is
 * what the tension does.
 *
 * **The rope.** The same sag, and two strands wound about it: each is the
 * axis displaced across the line by a sine along its length, the two half a
 * turn apart, so they cross and re-cross the whole way down. Where a strand
 * is on the *near* half of its turn it is drawn last and brighter, where it
 * goes behind it is drawn first and dimmer — so the crossings read as one
 * strand passing in front of the other, which is the only depth a rope has.
 * Pulled, the lay tightens: the wind gets shorter and the strands pull in
 * toward the axis, so a taut rope is a hard, finely twisted line and a slack
 * one a loose open braid. That is the tension read off the rope alone, as
 * the shipped stroke does with width and brightness.
 *
 * **The root.** A seizing: a short ring of turns where the two strands are
 * bound together at the eye, drawn as a small stroked loop that draws in and
 * brightens as the pull comes on.
 *
 * **How it can lose.** *A braid at four pixels is a wobble.* If the two
 * strands cannot be told apart on a phone, the rope is a stroke with a
 * tremor on it. Judge it slack, where the lay is most open.
 */

/** Turns along the rope slack and taut. More turns is a tighter lay. */
const TURNS_SLACK = 5;
const TURNS_TAUT = 11;
/** How far a strand stands off the axis slack and taut, in tiles. */
const LAY_SLACK = 0.09;
const LAY_TAUT = 0.03;
/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";
/** Points along each strand — twice the sag's, so a tight lay is still a
 * curve rather than a zigzag. */
const SEGMENTS = 28;
/** The seizing's radius, in tiles. */
const SEIZE = 0.09;

type Point = { x: number; y: number };

/** The two strands as point lists, and for each point whether it is near. */
function strands(d: TetherDraw): { pts: Point[]; near: boolean[] }[] {
  const { anchor, head, held, pull, time, tile } = d;
  const axis = handleSag({
    anchor,
    head,
    held,
    pull,
    time,
    segments: SEGMENTS,
    waveHeld: 1.2,
    waveSlack: 3.5,
  });
  const turns = TURNS_SLACK + (TURNS_TAUT - TURNS_SLACK) * pull;
  const lay = tile * (LAY_SLACK + (LAY_TAUT - LAY_SLACK) * pull);
  // The lay crawls slowly along the rope, so a slack rope is seen to be a
  // wound thing rather than a drawn pattern.
  const crawl = time * 1.5;
  const out: { pts: Point[]; near: boolean[] }[] = [];
  for (let s = 0; s < 2; s++) {
    const pts: Point[] = [];
    const near: boolean[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const prev = axis[Math.max(0, i - 1)]!;
      const next = axis[Math.min(SEGMENTS, i + 1)]!;
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const phase = t * Math.PI * 2 * turns + crawl + s * Math.PI;
      const off = Math.sin(phase) * lay;
      const p = axis[i]!;
      pts.push({ x: p.x + (-dy / len) * off, y: p.y + (dx / len) * off });
      near.push(Math.cos(phase) > 0);
    }
    out.push({ pts, near });
  }
  return out;
}

export function twist(d: TetherDraw): void {
  const { ctx, held, pull, hex, rim } = d;
  const paint = held ? rim : hex;
  const w = STROKE.outline * (1 - pull * 0.3);
  const [a, b] = strands(d);
  // Both strands laid down dim first — the far halves — then each redrawn
  // bright only where it is near, so a crossing has an over and an under.
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = mixHex(paint, SHADOW, 0.55);
  ctx.lineWidth = w;
  for (const s of [a!, b!]) ctx.stroke(new Path2D(openSmoothPath(s.pts)));
  ctx.strokeStyle = rgba(paint, 0.85 + 0.15 * pull);
  for (const s of [a!, b!]) {
    ctx.beginPath();
    let open = false;
    for (let i = 0; i <= SEGMENTS; i++) {
      const p = s.pts[i]!;
      if (s.near[i]) {
        if (open) ctx.lineTo(p.x, p.y);
        else ctx.moveTo(p.x, p.y);
        open = true;
      } else open = false;
    }
    ctx.stroke();
  }
  ctx.restore();
  if (pull > 0) {
    // Under tension the whole lay glows, faintly, as the shipped stroke does.
    const glow = new Path2D(openSmoothPath(a!.pts));
    strokeGlow(ctx, glow, rim, w * 0.5, pull * 1.2);
  }
}

export function seizing(d: TetherDraw): void {
  const { ctx, anchor, hex, rim, pull, tile } = d;
  const r = tile * SEIZE * (1 - 0.35 * pull);
  const p = new Path2D(circleSubpath(anchor.x, anchor.y, r));
  ctx.save();
  ctx.strokeStyle = pull > 0 ? rim : hex;
  ctx.globalAlpha = 0.6 + 0.4 * pull;
  ctx.lineWidth = STROKE.outline * (1 + pull);
  ctx.stroke(p);
  ctx.restore();
}
