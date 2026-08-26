import { crystalPath, crystalRadiusMul, METEOR, type Point } from "@neon-spore/content";
import type { Scar } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { torchRadius, torchRotation } from "./torch.js";

/**
 * The torch's own mark: not the whole rock's silhouette, only the sliver of
 * it that was ever inside the skin. Built from the exact same shape, radius
 * and facing (`torchRotation`) as the rock `TorchImpactFx` holds embedded, so
 * the dent is legible as *this* rock's dent, not a generic notch — clipped to
 * the quarter-height overlap the whole embedding was ever defined as, so
 * nothing of it shows above the skin line. One per torch that ever reached
 * the hull, sitting between the two cracks its impact scarred (`damageSpan`
 * in sim/beat.ts always scars a torch's two columns together on the same
 * beat, which is the only signal needed to find the pair here — no extra sim
 * state).
 *
 * A hole in the skin is a hole in the *outline* too. The hull's rim is
 * stroked around the crater's mouth rather than across it (`mouth` below,
 * used by `hull.ts` before it strokes) — a rim carried on over the top of a
 * crater draws the ship as unbroken exactly where it broke, and no amount of
 * dark fill underneath undoes a bright line drawn over it.
 */
export interface Crater {
  /** Centre of the pair of scarred columns. */
  x: number;
  /** The skin line right above it — the crater's mouth sits on this. */
  top: Point;
  r: number;
  rotation: number;
}

/**
 * Every crater the hull currently shows, paired off the scars. `visible`
 * decides which ones exist yet: `TorchImpactFx.coversCrater` says no while
 * the rock that made it is still falling into it or lodged in it, so the hole
 * appears when the rock leaves and not a beat before the rock arrives.
 */
export function torchCraters(
  l: Layout,
  scars: readonly Scar[],
  skinAt: (x: number) => Point,
  visible: (x: number) => boolean,
): Crater[] {
  const craters: Crater[] = [];
  const used = new Set<Scar>();
  for (const a of scars) {
    if (used.has(a)) continue;
    const b = scars.find((s) => s !== a && s.beat === a.beat && Math.abs(s.col - a.col) === 1);
    if (!b) continue;
    used.add(a);
    used.add(b);

    const x = tileCX(l, Math.min(a.col, b.col) + 0.5);
    if (!visible(x)) continue;
    craters.push({ x, top: skinAt(x), r: torchRadius(l), rotation: torchRotation(x) });
  }
  return craters;
}

/** The rock's centre while embedded: above the skin line by half its radius,
 * so only its bottom quarter-height ever crosses below the line. Shared with
 * `torch-impact.ts`'s stuck rock, which sits at exactly this height. */
function centreY(c: Crater): number {
  return c.top.y - c.r * 0.5;
}

/**
 * How wide the hole actually is where it cuts the skin: the crystal's own
 * outline intersected with the skin line, not an estimate from the radius.
 * The rim is left out over exactly this span and no more, so the outline
 * stops where the hull stops.
 */
export function mouth(c: Crater): { left: number; right: number } {
  const cy = centreY(c);
  const cos = Math.cos(c.rotation);
  const sin = Math.sin(c.rotation);
  const pts: Point[] = [];
  for (let i = 0; i < METEOR.sides; i++) {
    const a = (i / METEOR.sides) * Math.PI * 2;
    const m = crystalRadiusMul(a, METEOR.sides, METEOR.depth, METEOR.wobble, 0, METEOR.seed);
    const px = Math.cos(a) * c.r * m;
    const py = Math.sin(a) * c.r * m;
    pts.push({ x: c.x + px * cos - py * sin, y: cy + px * sin + py * cos });
  }
  let left = c.x;
  let right = c.x;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]!;
    const q = pts[(i + 1) % pts.length]!;
    const spans = (p.y - c.top.y) * (q.y - c.top.y) <= 0 && p.y !== q.y;
    if (!spans) continue;
    const hit = p.x + ((q.x - p.x) * (c.top.y - p.y)) / (q.y - p.y);
    left = Math.min(left, hit);
    right = Math.max(right, hit);
  }
  return { left, right };
}

/**
 * Cut the craters' mouths out of whatever is drawn next — the hull's rim, in
 * the one place this is used. Even-odd against a rectangle covering the
 * screen: everything is inside except the mouths.
 */
export function clipOutMouths(ctx: CanvasRenderingContext2D, l: Layout, craters: Crater[]): void {
  if (craters.length === 0) return;
  const p = new Path2D();
  p.rect(0, 0, l.width, l.height);
  for (const c of craters) {
    const m = mouth(c);
    // Tall enough to swallow the rim's own glow, which spreads well past the
    // line it is drawn on; the hull's fill above and below is unaffected,
    // because only the stroke is drawn through this clip.
    const pad = c.r * 0.5;
    p.rect(m.left, c.top.y - pad, m.right - m.left, pad * 2);
  }
  ctx.clip(p, "evenodd");
}

/**
 * The holes themselves, drawn after the cracks so the opaque fill covers
 * whatever a crack drew across that patch — the crack stays in the skin, not
 * inside the crater.
 */
export function drawTorchCraters(ctx: CanvasRenderingContext2D, craters: Crater[]): void {
  for (const c of craters) {
    ctx.save();
    // Everything above the skin line is outside the ship — clip it away
    // *before* rotating, in screen space, so the cut stays flat and level
    // regardless of which way the rock itself is facing.
    ctx.beginPath();
    ctx.rect(c.x - c.r * 2, c.top.y, c.r * 4, c.r * 2);
    ctx.clip();

    ctx.translate(c.x, centreY(c));
    ctx.rotate(c.rotation);
    const d = crystalPath(
      0,
      0,
      c.r,
      c.r,
      METEOR.sides,
      METEOR.depth,
      METEOR.wobble,
      0,
      METEOR.seed,
    );
    // Fill only — no outline. A stroke here reads as the rock's own material
    // edge, the same light grey the ship's solid rock objects are rimmed in;
    // a hole has no rim of its own material, only the dark of what is gone.
    ctx.fillStyle = "#14101F";
    ctx.fill(new Path2D(d));
    ctx.restore();

    // A hairline of the tail's old colour along the cut itself — the seam
    // where the rock ended and the skin resumes, still a little hot. It runs
    // the mouth's own width, so it reads as the lip of this hole.
    const m = mouth(c);
    const rim = ctx.createLinearGradient(m.left, c.top.y, m.right, c.top.y);
    rim.addColorStop(0, "rgba(255,122,47,0)");
    rim.addColorStop(0.5, "rgba(255,122,47,0.4)");
    rim.addColorStop(1, "rgba(255,122,47,0)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(m.left, c.top.y);
    ctx.lineTo(m.right, c.top.y);
    ctx.stroke();
  }
}
