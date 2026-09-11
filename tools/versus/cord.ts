import { openSmoothPath, type Point } from "../../packages/content/src/index.js";
import { halo } from "../../packages/render/src/glow.js";
import { rgba } from "../../packages/render/src/hex.js";
import type { NerveDraw } from "../../packages/render/src/ship-nerves.js";
import { curve } from "./tube.js";

/**
 * THE STRINGS RUNNING UP FROM THE BUTTONS — PLASM's, kept.
 *
 * Of PLASM the owner kept two things on 11 September 2026, and this is the
 * second: *the strings from the buttons going up.* PLASM drew each control's
 * wiring as a bundle of five microtubules with vesicles walking them; what
 * survives is one cord per control — from a button up to the knob on its
 * rail, and from the knob on up to the organ on the hull it moves — a dark
 * cord with a lit thread on it and bright bodies walking it, more of them
 * and quicker while the organ's window is open. `organ.ts` calls it last, so
 * a cord lies over the flesh and under the button.
 */

interface Cord {
  readonly from: Point;
  readonly to: Point;
  readonly hot: boolean;
  readonly seed: number;
}

function organEnd(d: NerveDraw, x: number): Point {
  return { x, y: d.surfaceY ? d.surfaceY(x) + d.l.tile * 0.4 : d.l.bandTop };
}

/** Every cord on the screen: knob to organ, and button to knob. */
function cords(d: NerveDraw): Cord[] {
  const out: Cord[] = [];
  if (d.cannon) out.push({ from: d.cannon, to: organEnd(d, d.cannonX), hot: d.open, seed: 3 });
  if (d.shield) out.push({ from: d.shield, to: organEnd(d, d.shieldX), hot: d.armed, seed: 7 });
  for (const [i, lobe] of d.lobes.entries()) {
    const id = lobe.control.id;
    const toCannon = id === "fireRed" || id === "fireCyan" || id === "intake";
    if (!toCannon && id !== "guard") continue;
    const knob = toCannon ? d.cannon : d.shield;
    out.push({
      from: { x: lobe.circle.x, y: lobe.circle.y },
      to: knob ?? organEnd(d, toCannon ? d.cannonX : d.shieldX),
      hot: toCannon ? d.open : d.armed,
      seed: 11 + i * 5,
    });
  }
  return out;
}

const STEPS = 16;

function cordLine(c: Cord, tile: number, time: number): Point[] {
  const bow = tile * 0.5 * Math.sin(c.seed) + Math.sin(time * 0.3 + c.seed) * tile * 0.1;
  const dy = c.to.y - c.from.y;
  return curve(
    c.from,
    c.to,
    { x: c.from.x + bow, y: c.from.y + dy * 0.35 },
    { x: c.to.x - bow * 0.5, y: c.from.y + dy * 0.72 },
    STEPS,
  );
}

/** The cords, and `beads` bodies walking each one. */
export function beadedCords(d: NerveDraw, beads: number): void {
  const { ctx, l, time, skin } = d;
  const all = cords(d);
  let fine = "";
  const lines: Point[][] = [];
  for (const c of all) {
    const pts = cordLine(c, l.tile, time);
    lines.push(pts);
    fine += openSmoothPath(pts);
  }
  const path = new Path2D(fine);
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.ground[3], 0.45);
  ctx.lineWidth = Math.max(1.5, l.tile * 0.09);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(skin.flesh[0], 0.3);
  ctx.lineWidth = Math.max(0.8, l.tile * 0.03);
  ctx.stroke(path);
  for (const [i, c] of all.entries()) {
    const pts = lines[i] as Point[];
    const period = c.hot ? 0.9 : 2.6;
    for (let v = 0; v < beads; v++) {
      const p = ((time + c.seed * 0.37) / period + v / beads) % 1;
      const at = pts[Math.min(STEPS, Math.floor(p * STEPS))] as Point;
      const r = l.tile * (c.hot ? 0.11 : 0.075);
      halo(ctx, at.x, at.y, Math.round((r * 3) / 2) * 2, skin.tint, c.hot ? 0.4 : 0.18);
      ctx.fillStyle = rgba(skin.rim, c.hot ? 0.9 : 0.6);
      ctx.beginPath();
      ctx.ellipse(at.x, at.y, r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
