import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareEye } from "./stare-shape.js";

/**
 * **THE STARE's shell**: the glass the eye stands behind, and the one thing in
 * the picture that says it cannot be hurt.
 *
 * The owner, 2 October 2026: *visual should make clear that eye is
 * invulnerable.* So the cowl, the eye and its lashes stand inside a dome of
 * faceted glass — a lattice of six-sided cells too faint to read through and
 * too regular to be anything but made, with a glint running round its rim on
 * the wall clock. **A bolt rings off it**: the sim's `stareDeflect` lights
 * the whole dome and the cells round where it struck, then lets it fade
 * (`stare-fx.ts`, `ping`), so the pair sees the answer to the shot they
 * should not have spent.
 *
 * Not the player's shield: that is cyan and a thing the navigator moves.
 * This is the rock's own pale, the colour of a thing that is not alive.
 */

/** The dome round the eye: its middle, in socket heights above the eye's, and its half-extents. */
const LIFT = 0.55;
const SHELL_RX = 1.75;
const SHELL_RY = 2.45;
/** A cell's radius, in socket heights. */
const CELL = 0.42;

/** The dome's outline. */
function domePath(e: StareEye): Path2D {
  const p = new Path2D();
  p.ellipse(e.cx, e.cy - e.ry * LIFT, e.rx * SHELL_RX, e.ry * SHELL_RY, 0, 0, Math.PI * 2);
  return p;
}

/**
 * The lattice, kept per socket: a few hundred edges that only move when the
 * layout does, so a frame strokes one path rather than building it. Keyed by
 * the socket and nothing of the world, so there is nothing for a restart to
 * clear.
 */
const CELLS = new Map<string, Path2D>();

function cellsOf(e: StareEye): Path2D {
  const key = `${e.cx},${e.cy},${e.rx},${e.ry}`;
  let p = CELLS.get(key);
  if (p === undefined) {
    if (CELLS.size > 8) CELLS.clear();
    p = cellsPath(e);
    CELLS.set(key, p);
  }
  return p;
}

/** The lattice of cells across the dome's box, as one path; clipped by the caller. */
function cellsPath(e: StareEye): Path2D {
  const r = e.ry * CELL;
  const w = Math.sqrt(3) * r;
  const cx = e.cx;
  const cy = e.cy - e.ry * LIFT;
  const halfW = e.rx * SHELL_RX;
  const halfH = e.ry * SHELL_RY;
  const p = new Path2D();
  const rows = Math.ceil(halfH / (1.5 * r)) + 1;
  const cols = Math.ceil(halfW / w) + 1;
  for (let j = -rows; j <= rows; j++) {
    for (let i = -cols; i <= cols; i++) {
      const x = cx + i * w + (j % 2 === 0 ? 0 : w / 2);
      const y = cy + j * 1.5 * r;
      // Three edges a cell, so neighbours share the rest and no line is drawn twice.
      for (let k = 0; k < 3; k++) {
        const a0 = Math.PI / 6 + (k * Math.PI) / 3;
        const a1 = a0 + Math.PI / 3;
        p.moveTo(x + r * Math.cos(a0), y + r * Math.sin(a0));
        p.lineTo(x + r * Math.cos(a1), y + r * Math.sin(a1));
      }
    }
  }
  return p;
}

/**
 * The dome over everything else of the boss. `ping` is the shell's answer to a
 * bolt, one on the tick and falling; `time` is the wall clock, for the glint.
 */
export function drawStareShell(
  ctx: CanvasRenderingContext2D,
  e: StareEye,
  time: number,
  ping: number,
): void {
  const dome = domePath(e);
  const pale = mixHex(PALETTE.rock, PALETTE.text, 0.5);
  ctx.save();
  ctx.clip(dome);
  ctx.globalAlpha = 0.1 + 0.5 * ping;
  ctx.strokeStyle = ping > 0 ? mixHex(pale, PALETTE.text, ping) : pale;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(cellsOf(e));
  ctx.restore();
  strokeGlow(ctx, dome, pale, STROKE.inner * (1 + ping), 0.5 + 1.5 * ping, 0.35 + 0.5 * ping);
  // The glint, a short arc of the rim travelling over the top of the dome.
  const at = -Math.PI / 2 + Math.sin(time * 0.6) * 1.1;
  const glint = new Path2D();
  glint.ellipse(
    e.cx,
    e.cy - e.ry * LIFT,
    e.rx * SHELL_RX,
    e.ry * SHELL_RY,
    0,
    at - 0.18,
    at + 0.18,
  );
  strokeGlow(ctx, glint, PALETTE.text, STROKE.outline, 1.2, 0.8);
}
