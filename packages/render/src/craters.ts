import { crystalRadiusMul, METEOR, type Point } from "@neon-spore/content";
import { isWardable, type Scar, spanOf } from "@neon-spore/sim";
import { type Crater, type CraterShape, centreY, cutY } from "./crater-geom.js";
import { CRATER_LOOK } from "./crater-look.js";
import type { HullSkin } from "./hull.js";
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
 *
 * What a crater *is* moved to `crater-geom.ts` and what one *looks like* to
 * `crater-pit.ts`, on the day the hole's paint became a record a candidate can
 * patch (`crater-look.ts`). This file is where craters are *found*, which is
 * the half nothing may argue with: the mouth it measures is read by `scars.ts`
 * to start a crack on the rim and by `clipOutMouths` to break the outline.
 */

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
/** A crater with its mouth measured — the one place `mouth` is ever called. */
function withMouth(c: CraterShape): Crater {
  return { ...c, ...mouth(c) };
}

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
    out.push(
      withMouth({
        x,
        top: skinAt(x),
        r: rockRadius(l, spanOf(a)),
        rotation: torchRotation(x),
        cols: [a.col, b.col],
      }),
    );
  }

  // Every other rock kind scars a single column and gets its own, smaller
  // crater there. A living creature's breach also leaves a scar but is not
  // warded (`isWardable`), so it never gets one — THE VOLLEY is, and its shell
  // tears the hull the way the tier it is drawn as does.
  for (const s of scars) {
    if (used.has(s) || !isWardable(s.kind)) continue;
    used.add(s);
    const x = tileCX(l, s.col);
    out.push(
      withMouth({
        x,
        top: skinAt(x),
        r: rockRadius(l, spanOf(s)),
        rotation: torchRotation(x),
        cols: [s.col],
      }),
    );
  }

  return out;
}

/**
 * How wide the hole actually is where it cuts the skin: the crystal's own
 * outline intersected with `cutY`, not an estimate from the radius. The rim
 * is left out over exactly this span and no more, so the outline stops where
 * the hull stops.
 */
function mouth(c: CraterShape): { left: number; right: number } {
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
    // Tall enough to swallow the rim's own glow, which spreads well past the
    // line it is drawn on; the hull's fill above and below is unaffected,
    // because only the stroke is drawn through this clip.
    const pad = c.r * 0.5;
    p.rect(c.left, cutY(c) - pad, c.right - c.left, pad * 2);
  }
  ctx.clip(p, "evenodd");
}

/**
 * The holes themselves, drawn after the cracks so the opaque fill covers
 * whatever a crack drew across that patch — the crack stays in the skin, not
 * inside the crater.
 *
 * `skin` is the ship's own, and it is passed rather than read off a palette
 * because there are three ships: player one's violet, player two's amber and
 * THE MIRROR's blood (`seat-skin.ts`, `MIRROR_SKIN`).
 *
 * **`body` is the ship's own filled contour, and every hole is clipped to it.**
 * The membrane is a curve and a crater knows one point on it — the skin
 * directly over its own middle — so a pit measuring its own reach off that one
 * point paints material *above the surface* wherever the hull falls away to one
 * side of the hole. The owner saw exactly that on 9 September 2026. It is
 * answered here and not in the paint because it is a fact about the ship rather
 * than a taste about damage: inside the membrane is the only place a hole in the
 * membrane can be, and no later candidate can argue with it
 * (`crater-look.ts`).
 *
 * Guarded on there being a hole at all, so an undamaged ship pays nothing: a
 * clip is a counted op, and every wave budget in
 * `packages/render/test/wave-budget.test.ts` is measured on a frame with no
 * craters in it.
 */
export function drawCraters(
  ctx: CanvasRenderingContext2D,
  list: Crater[],
  skin: HullSkin,
  body: Path2D,
): void {
  if (list.length === 0) return;
  ctx.save();
  ctx.clip(body);
  for (const c of list) CRATER_LOOK.pit(ctx, c, skin);
  ctx.restore();
}

export type { Crater } from "./crater-geom.js";
