import { surfaceDim, surfaceLit } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawWardenCilia } from "./warden-cilia.js";
import { clear, drawPlates } from "./warden-plates.js";
import { drawWardenEyelets } from "./warden-skin.js";
import { drawWardenEdges, type WardenSurfaceDraw } from "./warden-surface.js";

/**
 * MANTLE — a kept look for THE WARDEN, drawn only on the SHAPES page's LIBRARY.
 *
 * It stood beside the shipped surface on VERSUS (`creature:warden`, decided
 * 11 September 2026) and lost; the owner kept the surface the game had and
 * asked for this one to be kept where he can see it, to build another body
 * from. It sits in this package, beside the record it once patched, because
 * it is written against this package's internals; nothing on the field
 * imports it, and the game's bundle drops it.
 *
 * MANTLE — the material is grown in folds: four rings of soft lobes, each
 * ring's free edge lying over the ring inside it, so the hole is the bottom
 * of a throat and not a cut in a disc.
 *
 * SOFT LOBE off the shapes page, laid as overlapping scales. Every lobe is a
 * cushion tilted toward the hole and lit by calling `surfaceLit` on that
 * tilt, which is what makes the funnel read as concave — its lower-right wall
 * faces the key and its upper-left wall turns away, the opposite of a dome.
 * Each ring in is a step darker, the way the inside of anything is. Then the
 * folds move: a wave runs round the ring and each lobe swells and slackens as
 * it passes, one ring lagging the next, so the surface is seen to be working
 * something inward. The eyelets, the fringe, the edges and the armour are
 * the shipped passes.
 */

/** How many rings of lobes from the rim to the lip. */
const RINGS = 4;
/** How many lobes the outermost ring carries; each ring in carries fewer,
 * because it is shorter round. */
const LOBES = 18;
/** How far a ring's free edge reaches over the ring inside it, as a share of
 * one ring's width. */
const OVERLAP = 0.45;
/** How far a lobe's free edge bulges, as a share of its own width. */
const BULGE = 0.55;
/** How much the wave swells a lobe, and how fast it goes round. */
const SWELL = 0.35;
const WAVE_RATE = 1.15;
/** The tilt of a lobe's face toward the hole, in radians off the screen. */
const TILT = 0.55;
/** What a lobe keeps of its light turned fully away, and how much darker each
 * ring in is than the last. A shadow is cool and never black. */
const FLOOR = 0.12;
const DEEPER = 0.14;
const SHADOW = "#0B1024";

/** The ring's width at bearing `phi`: the lip and the rim, off the contour
 * the body was drawn from and the hole's own circle. */
function section(d: WardenSurfaceDraw, phi: number): { rin: number; rout: number } {
  const { cx, cy, outer, pupilX, pupilR } = d;
  const n = outer.length;
  const j = ((Math.round((phi / (Math.PI * 2)) * n) % n) + n) % n;
  const p = outer[j] as { x: number; y: number };
  const rout = Math.hypot(p.x - cx, p.y - cy);
  const dx = pupilX - cx;
  const s = dx * Math.sin(phi);
  const rin = Math.min(
    rout * 0.9,
    dx * Math.cos(phi) + Math.sqrt(Math.max(0, pupilR ** 2 - s * s)),
  );
  return { rin, rout };
}

/** The light a lobe at bearing `phi` takes, its face tilted toward the hole:
 * the normal leans in along the bearing and the projection is called on it. */
function lobeLit(phi: number): number {
  const nx = -Math.sin(TILT) * Math.cos(phi);
  const ny = -Math.sin(TILT) * Math.sin(phi);
  const nz = Math.cos(TILT);
  const cosLat = Math.sqrt(Math.max(1e-6, 1 - ny * ny));
  return surfaceLit(cosLat, ny, nx / cosLat, nz / cosLat);
}

function ring(d: WardenSurfaceDraw, k: number): void {
  const { ctx, cx, cy, time, cut } = d;
  const count = LOBES - k * 3;
  const arc = (Math.PI * 2) / count;
  // Each ring's lobes sit between the seams of the ring outside it.
  const offset = arc * 0.5 * (k % 2) + Math.sin(time * 0.17 + k) * 0.02;
  const deeper = (k / (RINGS - 1)) * DEEPER;
  ctx.lineJoin = "round";
  for (let i = 0; i < count; i++) {
    const a0 = i * arc + offset;
    for (const [s, e] of clear(a0, a0 + arc, cut)) {
      const mid = (s + e) / 2;
      const sec = section(d, mid);
      const h = sec.rout - sec.rin;
      const w = h / RINGS;
      // The wave: a swell running round, each ring a little behind the last.
      const swell = 1 + SWELL * Math.sin(time * WAVE_RATE - mid * 2 + k * 0.9);
      const ro = sec.rout - k * w + (k > 0 ? w * OVERLAP * 0.5 : 0);
      const ri = Math.max(sec.rin, sec.rout - (k + 1) * w - w * OVERLAP * (0.5 + 0.5 * swell));
      const bulge = (e - s) * sec.rout * BULGE * 0.5 * swell;
      const lit = lobeLit(mid);
      // The cushion: dark rock lifted toward the light, and a step darker for
      // every ring in.
      const face = mixHex(
        mixHex(PALETTE.rockDark, SHADOW, deeper),
        PALETTE.rock,
        surfaceDim(FLOOR, lit) * 0.7,
      );
      const path = new Path2D();
      path.arc(cx, cy, ro, s, e);
      path.lineTo(cx + Math.cos(e) * ri, cy + Math.sin(e) * ri);
      // The free edge, bulging toward the hole.
      path.quadraticCurveTo(
        cx + Math.cos(mid) * (ri - bulge),
        cy + Math.sin(mid) * (ri - bulge),
        cx + Math.cos(s) * ri,
        cy + Math.sin(s) * ri,
      );
      path.closePath();
      ctx.fillStyle = face;
      ctx.fill(path);
      // The seam where the lobe lies on the ring beneath: the contact shadow,
      // without which the folds float. Darkest where the lobe is brightest.
      const edge = new Path2D();
      edge.moveTo(cx + Math.cos(e) * ri, cy + Math.sin(e) * ri);
      edge.quadraticCurveTo(
        cx + Math.cos(mid) * (ri - bulge),
        cy + Math.sin(mid) * (ri - bulge),
        cx + Math.cos(s) * ri,
        cy + Math.sin(s) * ri,
      );
      ctx.strokeStyle = rgba(SHADOW, 0.18 + 0.12 * lit);
      ctx.lineWidth = STROKE.outline * 3.2;
      ctx.stroke(edge);
      ctx.strokeStyle = rgba(SHADOW, 0.4 + 0.3 * lit);
      ctx.lineWidth = STROKE.outline * 1.1;
      ctx.stroke(edge);
      // The lit lip of the fold, only where the light reaches it.
      if (lit > 0.2) {
        ctx.strokeStyle = rgba(PALETTE.text, 0.08 + 0.4 * (lit - 0.2));
        ctx.lineWidth = STROKE.outline * 0.6;
        ctx.stroke(edge);
      }
    }
  }
}

export function mantle(d: WardenSurfaceDraw): void {
  const { ctx, cx, cy, r, time, openness, cut } = d;
  ctx.save();
  ctx.clip(d.shape, "evenodd");
  // Innermost first, so every ring's free edge lies over the one inside it.
  for (let k = RINGS - 1; k >= 0; k--) ring(d, k);
  ctx.restore();
  drawWardenEyelets(ctx, cx, cy, r, d.pupilX, d.pupilR, time, openness, cut);
  drawWardenCilia(ctx, d.outer, cx, cy, r, time, openness, cut);
  drawWardenEdges(d);
  drawPlates(d);
}
