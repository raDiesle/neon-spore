import type { Point } from "../../../../../packages/content/src/index.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { NerveDraw } from "../../../../../packages/render/src/ship-nerves.js";
import { curve, tube } from "../../../tube.js";

/**
 * GULLET's wiring: every control is a **tendon** on the organ it moves.
 *
 * The owner, watching the first whole-ship card: *buttons control the cannon
 * and shield, maybe we could create some visual connections.* On a ship that is
 * a mouth the honest connection is muscle. The cannon's slider knob is the
 * root of a cord that runs up through the throat, through the lip, and ends at
 * the base of the cannon lobe — move the knob and the cord moves with it, and
 * the lobe is what the cord is pulling along. The shield's is the same. Every
 * round button is a thinner cord running up to join the cord of the organ it
 * speaks to: fire and intake to the cannon, guard to the shield.
 *
 * A signal runs up each cord all the time — a bead of light, slow — and runs
 * hot while the window it drives is open. That is the one thing here that is
 * about play rather than anatomy: the cord says *I am being asked something*
 * on the same beat the organ answers.
 */

/** Half-widths in tiles: a main cord where it leaves a knob and where it ends
 * on the organ; a button's cord likewise. */
const CORD = 0.17;
const CORD_END = 0.08;
const THREAD = 0.075;
const THREAD_END = 0.045;

/** How far a cord bows sideways, in tiles, and how slowly it sways. */
const BOW = 0.55;
const SWAY = 0.35;

/** Seconds for one bead to travel a cord, at rest and while its window is open. */
const BEAT_S = 1.9;
const HOT_S = 0.7;

/** Samples along a cord. */
const STEPS = 18;

/** One cord's centreline from `from` up to `to`, bowed sideways so it is never
 * a ruled vertical, with the bow swaying on its own slow clock. */
function cord(from: Point, to: Point, tile: number, phase: number, time: number): Point[] {
  const bow = tile * BOW * Math.sin(phase) + Math.sin(time * SWAY + phase) * tile * 0.12;
  return curve(
    from,
    to,
    { x: from.x + bow, y: from.y + (to.y - from.y) * 0.35 },
    { x: to.x - bow * 0.6, y: from.y + (to.y - from.y) * 0.72 },
    STEPS,
  );
}

/** A point `p` of the way along sampled points. */
function along(pts: readonly Point[], p: number): Point {
  const i = Math.min(pts.length - 1, Math.max(0, Math.floor(p * (pts.length - 1))));
  return pts[i] as Point;
}

/** Which organ a round control speaks to, as the x it stands in. */
function organOf(d: NerveDraw, id: string): { x: number; strip: Point | null } | null {
  if (id === "fireRed" || id === "fireCyan" || id === "intake") {
    return { x: d.cannonX, strip: d.cannon };
  }
  if (id === "guard") return { x: d.shieldX, strip: d.shield };
  return null;
}

/** Where a cord to an organ ends: a little under the skin at that column, or
 * at the roof on a host that drew no ship. */
function organEnd(d: NerveDraw, x: number): Point {
  const y = d.surfaceY ? d.surfaceY(x) + d.l.tile * 0.34 : d.l.bandTop;
  return { x, y };
}

interface Cord {
  readonly mid: Point[];
  readonly wide: number;
  readonly narrow: number;
  readonly hot: boolean;
  readonly phase: number;
}

/** Every cord on this screen: the two organs' from their knobs, and a thread
 * from each button to the cord of the organ it speaks to. */
function cords(d: NerveDraw): Cord[] {
  const { l, time } = d;
  const out: Cord[] = [];
  if (d.cannon) {
    out.push({
      mid: cord(d.cannon, organEnd(d, d.cannonX), l.tile, 0.7, time),
      wide: CORD,
      narrow: CORD_END,
      hot: d.open,
      phase: 0,
    });
  }
  if (d.shield) {
    out.push({
      mid: cord(d.shield, organEnd(d, d.shieldX), l.tile, 2.3, time),
      wide: CORD,
      narrow: CORD_END,
      hot: d.armed,
      phase: 1.1,
    });
  }
  for (const [i, lobe] of d.lobes.entries()) {
    const organ = organOf(d, lobe.control.id);
    if (!organ) continue;
    const c = lobe.circle;
    // To the knob if the organ's strip is on this screen — the thread joins
    // the cord there, a plexus — and straight to the organ if it is not.
    const to = organ.strip ?? organEnd(d, organ.x);
    out.push({
      mid: cord({ x: c.x, y: c.y }, to, l.tile, 1.7 + i * 1.3, time),
      wide: THREAD,
      narrow: THREAD_END,
      hot: lobe.control.id === "guard" ? d.armed : d.open,
      phase: 2 + i * 0.9,
    });
  }
  return out;
}

/** The wiring, as `SHIP_NERVES.draw` takes it. */
export function wired(d: NerveDraw): void {
  const { ctx, l, time, skin } = d;
  const all = cords(d);
  if (all.length === 0) return;

  let body = "";
  let lumen = "";
  for (const c of all) {
    const w = (p: number) => l.tile * (c.wide + (c.narrow - c.wide) * p);
    body += tube(c.mid, w);
  }
  // A cord is flesh, lit from the lip above: brightest where it enters the
  // ship, the seat's tint where it leaves a control.
  const top = Math.min(...all.map((c) => (c.mid[c.mid.length - 1] as Point).y));
  const bottom = Math.max(...all.map((c) => (c.mid[0] as Point).y));
  const grad = ctx.createLinearGradient(0, top, 0, bottom);
  grad.addColorStop(0, rgba(skin.flesh[0], 0.55));
  grad.addColorStop(0.5, rgba(skin.flesh[1], 0.5));
  grad.addColorStop(1, rgba(skin.tint, 0.42));
  const path = new Path2D(body);
  ctx.fillStyle = grad;
  ctx.fill(path);
  ctx.strokeStyle = rgba(skin.rim, 0.2);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.026);
  ctx.stroke(path);

  // The signal: one bead per cord, travelling *up* — from the hand to the
  // organ — and running hot while the organ's window is open.
  for (const c of all) {
    const period = c.hot ? HOT_S : BEAT_S;
    const p = ((time + c.phase) / period) % 1;
    const at = along(c.mid, p);
    const r = l.tile * (c.hot ? 0.3 : 0.2);
    halo(ctx, at.x, at.y, r, skin.rim, c.hot ? 0.6 : 0.28);
    lumen += `M ${at.x.toFixed(2)} ${at.y.toFixed(2)} l 0.1 0 `;
  }
  ctx.strokeStyle = rgba(skin.rim, 0.5);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.2, l.tile * 0.06);
  ctx.stroke(new Path2D(lumen));
}
