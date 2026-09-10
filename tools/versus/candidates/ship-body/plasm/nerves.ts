import { openSmoothPath, type Point } from "../../../../../packages/content/src/index.js";
import { hash01 } from "../../../../../packages/render/src/backdrop.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { NerveDraw } from "../../../../../packages/render/src/ship-nerves.js";
import { curve } from "../../../tube.js";

/**
 * PLASM's wiring: every control is a **microtubule bundle** to the organ it
 * moves.
 *
 * A cell has no tendons. What it has is a cytoskeleton — fibres too thin to
 * see one at a time, laid in bundles, with vesicles walking along them from
 * where a signal starts to where it is wanted. So a control does not root a
 * cord here; it roots a bundle of four or five fibres that leave it together,
 * splay a little on the way, and gather again at the organ. Vesicles run up
 * them all the time, more of them and faster while the organ's window is open.
 *
 * It differs from GULLET's tendons in exactly the way the two ships differ:
 * a mouth moves things with muscle, a cell moves things with transport.
 */

/** Fibres to a bundle, how far they splay in tiles, and the bow a whole bundle
 * takes so it is never a ruled vertical. */
const FIBRES = 5;
const SPLAY = 0.22;
const BOW = 0.5;

/** Seconds for a vesicle to walk a bundle, at rest and while the organ's
 * window is open; and how many walk each bundle. */
const WALK_S = 2.6;
const HOT_S = 0.9;
const VESICLES = 3;

const STEPS = 16;

function organOf(d: NerveDraw, id: string): { x: number; strip: Point | null } | null {
  if (id === "fireRed" || id === "fireCyan" || id === "intake") {
    return { x: d.cannonX, strip: d.cannon };
  }
  if (id === "guard") return { x: d.shieldX, strip: d.shield };
  return null;
}

function organEnd(d: NerveDraw, x: number): Point {
  const y = d.surfaceY ? d.surfaceY(x) + d.l.tile * 0.4 : d.l.bandTop;
  return { x, y };
}

interface Bundle {
  readonly from: Point;
  readonly to: Point;
  readonly hot: boolean;
  readonly seed: number;
}

function bundles(d: NerveDraw): Bundle[] {
  const out: Bundle[] = [];
  if (d.cannon) out.push({ from: d.cannon, to: organEnd(d, d.cannonX), hot: d.open, seed: 3 });
  if (d.shield) out.push({ from: d.shield, to: organEnd(d, d.shieldX), hot: d.armed, seed: 7 });
  for (const [i, lobe] of d.lobes.entries()) {
    const organ = organOf(d, lobe.control.id);
    if (!organ) continue;
    out.push({
      from: { x: lobe.circle.x, y: lobe.circle.y },
      to: organ.strip ?? organEnd(d, organ.x),
      hot: lobe.control.id === "guard" ? d.armed : d.open,
      seed: 11 + i * 5,
    });
  }
  return out;
}

/** One fibre of a bundle: the bundle's own bowed curve, offset sideways by an
 * amount that is zero at both ends and largest in the middle — so the fibres
 * leave together, splay, and gather. */
function fibre(b: Bundle, k: number, tile: number, time: number): Point[] {
  const bow = tile * BOW * Math.sin(b.seed) + Math.sin(time * 0.3 + b.seed) * tile * 0.1;
  const mid = curve(
    b.from,
    b.to,
    { x: b.from.x + bow, y: b.from.y + (b.to.y - b.from.y) * 0.35 },
    { x: b.to.x - bow * 0.5, y: b.from.y + (b.to.y - b.from.y) * 0.72 },
    STEPS,
  );
  const spread = (k / (FIBRES - 1) - 0.5) * 2 * tile * SPLAY * (0.6 + hash01(b.seed + k) * 0.8);
  return mid.map((p, i) => {
    const t = i / STEPS;
    return { x: p.x + spread * Math.sin(t * Math.PI), y: p.y };
  });
}

export function transported(d: NerveDraw): void {
  const { ctx, l, time, skin } = d;
  const all = bundles(d);
  if (all.length === 0) return;

  let fine = "";
  const walks: Point[][] = [];
  for (const b of all) {
    for (let k = 0; k < FIBRES; k++) {
      const pts = fibre(b, k, l.tile, time);
      fine += openSmoothPath(pts);
      if (k === Math.floor(FIBRES / 2)) walks.push(pts);
    }
  }
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(skin.flesh[0], 0.22);
  ctx.lineWidth = Math.max(0.6, l.tile * 0.022);
  ctx.stroke(new Path2D(fine));
  ctx.strokeStyle = rgba(skin.rim, 0.08);
  ctx.lineWidth = Math.max(1.5, l.tile * 0.08);
  ctx.stroke(new Path2D(fine));

  // The vesicles: small bright bodies walking up the middle fibre of each
  // bundle, spaced along it, quicker and brighter while the window is open.
  for (const [i, b] of all.entries()) {
    const pts = walks[i];
    if (!pts) continue;
    const period = b.hot ? HOT_S : WALK_S;
    for (let v = 0; v < VESICLES; v++) {
      const p = ((time + b.seed * 0.37) / period + v / VESICLES) % 1;
      const at = pts[Math.min(STEPS, Math.floor(p * STEPS))] as Point;
      const r = l.tile * (b.hot ? 0.11 : 0.075);
      halo(ctx, at.x, at.y, r * 3, skin.rim, b.hot ? 0.4 : 0.18);
      ctx.fillStyle = rgba(skin.rim, b.hot ? 0.9 : 0.6);
      ctx.beginPath();
      ctx.ellipse(at.x, at.y, r, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
