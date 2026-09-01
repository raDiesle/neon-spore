import { crystalPath, crystalRadiusMul, METEOR, type Point } from "@neon-spore/content";
import { isMeteorKind, type Scar, spanOf } from "@neon-spore/sim";
import { type Layout, tileCX } from "./layout.js";
import { rockRadius, torchRotation } from "./torch.js";

/**
 * A rock's own mark: not the whole rock's silhouette, only the sliver of it
 * that was ever inside the skin. Built from the exact same shape, radius and
 * facing (`torchRotation`) as the rock `RockImpactFx` holds embedded, so the
 * dent is legible as *this* rock's dent, not a generic notch — clipped to the
 * quarter-height overlap the whole embedding was ever defined as, so nothing
 * of it shows above the skin line. A torch scars two columns on the beat it
 * lands (`damageSpan` in sim/hull.ts) and gets one crater between them; every
 * other rock kind scars one and gets a crater sized to its own, smaller
 * radius (`rockRadius`).
 *
 * A hole in the skin is a hole in the *outline* too. The hull's rim is
 * stroked around the crater's mouth rather than across it (`mouth` below,
 * used by `hull.ts` before it strokes) — a rim carried on over the top of a
 * crater draws the ship as unbroken exactly where it broke, and no amount of
 * dark fill underneath undoes a bright line drawn over it.
 */
export interface Crater {
  /** Centre of the rock that made it — the pair's midpoint for a torch. */
  x: number;
  /** The skin line right above it — the crater's mouth sits on this. */
  top: Point;
  r: number;
  rotation: number;
  /** Which scarred columns this crater covers — two for a torch, one otherwise. */
  cols: readonly number[];
}

/**
 * How far above the skin line the fill and the rim gap both start, rather
 * than exactly at it. The rotated crystal's edge only reaches the true skin
 * line at a single point per side — a pixel row sampled exactly on that line
 * catches the shape mid-taper, not yet wide enough to cover the seam, and a
 * sliver of the hull's own bright fill shows through right at the top of the
 * hole. Starting the cut a few pixels higher, where the shape has already
 * widened, closes that seam; `Layout.tile` is never this small, so the bias
 * stays a fixed few pixels rather than a share of anything that could shrink
 * under it.
 */
const LID = 3;

/** Where the fill and the rim-gap measurements actually start — `LID` above the true skin line. */
function cutY(c: Crater): number {
  return c.top.y - LID;
}

/**
 * Every crater a rock has ever left, one per rock, purely as geometry — this
 * says nothing about whether its hole should be drawn open yet. That is a
 * separate question a caller answers itself (`hull.ts` filters this list by
 * `RockImpactFx.coversCrater` before cutting the rim or filling the hole).
 * Kept unconditional here so a crack's *position* (`scars.ts`'s
 * `crackOrigin`) can read a crater's edge from the moment its rock arrives,
 * long before the hole itself is open — a position that later changed once
 * the hole opened used to read as a second crack appearing out of nowhere.
 */
export function craters(l: Layout, scars: readonly Scar[], skinAt: (x: number) => Point): Crater[] {
  const out: Crater[] = [];
  const used = new Set<Scar>();

  // The wide rocks first: a two-tile rock scars both of its columns on the
  // beat it lands (`damageSpan` in sim/hull.ts), and the pair is one hole
  // between them rather than two dents side by side. That used to be the
  // torch's own rule, by name; it is asked of the *span* now, so a plain tier
  // authored two tiles wide (`RockSize`) leaves the same single wide crater
  // instead of falling through to the narrow branch twice.
  for (const a of scars) {
    if (used.has(a) || spanOf(a) < 2) continue;
    const b = scars.find(
      (s) =>
        s !== a &&
        s.kind === a.kind &&
        spanOf(s) === spanOf(a) &&
        s.beat === a.beat &&
        Math.abs(s.col - a.col) === 1,
    );
    if (!b) continue;
    used.add(a);
    used.add(b);
    const loCol = Math.min(a.col, b.col);
    const x = tileCX(l, loCol + 0.5);
    out.push({
      x,
      top: skinAt(x),
      r: rockRadius(l, spanOf(a)),
      rotation: torchRotation(x),
      cols: [a.col, b.col],
    });
  }

  // Every other rock kind scars a single column and gets its own, smaller
  // crater there. A living creature's breach also leaves a scar but is not a
  // rock (`isMeteorKind`), so it never gets one.
  for (const s of scars) {
    if (used.has(s) || !isMeteorKind(s.kind)) continue;
    used.add(s);
    const x = tileCX(l, s.col);
    out.push({
      x,
      top: skinAt(x),
      r: rockRadius(l, spanOf(s)),
      rotation: torchRotation(x),
      cols: [s.col],
    });
  }

  return out;
}

/** The rock's centre while embedded: above the skin line by half its radius,
 * so only its bottom quarter-height ever crosses below the line. Shared with
 * `rock-impact.ts`'s stuck rock, which sits at exactly this height. */
function centreY(c: Crater): number {
  return c.top.y - c.r * 0.5;
}

/**
 * How wide the hole actually is where it cuts the skin: the crystal's own
 * outline intersected with `cutY`, not an estimate from the radius. The rim
 * is left out over exactly this span and no more, so the outline stops where
 * the hull stops.
 */
export function mouth(c: Crater): { left: number; right: number } {
  const cy = centreY(c);
  const cutAt = cutY(c);
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
    const spans = (p.y - cutAt) * (q.y - cutAt) <= 0 && p.y !== q.y;
    if (!spans) continue;
    const hit = p.x + ((q.x - p.x) * (cutAt - p.y)) / (q.y - p.y);
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
export function clipOutMouths(ctx: CanvasRenderingContext2D, l: Layout, list: Crater[]): void {
  if (list.length === 0) return;
  const p = new Path2D();
  p.rect(0, 0, l.width, l.height);
  for (const c of list) {
    const m = mouth(c);
    // Tall enough to swallow the rim's own glow, which spreads well past the
    // line it is drawn on; the hull's fill above and below is unaffected,
    // because only the stroke is drawn through this clip.
    const pad = c.r * 0.5;
    p.rect(m.left, cutY(c) - pad, m.right - m.left, pad * 2);
  }
  ctx.clip(p, "evenodd");
}

/**
 * The holes themselves, drawn after the cracks so the opaque fill covers
 * whatever a crack drew across that patch — the crack stays in the skin, not
 * inside the crater.
 */
export function drawCraters(ctx: CanvasRenderingContext2D, list: Crater[]): void {
  for (const c of list) {
    ctx.save();
    // Everything above `cutY` is outside the ship — clip it away *before*
    // rotating, in screen space, so the cut stays flat and level regardless
    // of which way the rock itself is facing.
    ctx.beginPath();
    ctx.rect(c.x - c.r * 2, cutY(c), c.r * 4, c.r * 2 + LID);
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
