import { KEY } from "@neon-spore/content";
import { mixHex, rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";
import { drawWardenCilia } from "./warden-cilia.js";
import { drawPlates } from "./warden-plates.js";
import { drawWardenEyelets, inOpening } from "./warden-skin.js";
import { drawWardenEdges, type WardenSurfaceDraw } from "./warden-surface.js";

/**
 * WHORL — a kept look for THE WARDEN, drawn only on the SHAPES page's LIBRARY.
 *
 * It stood beside the shipped surface on VERSUS (`creature:warden`, decided
 * 11 September 2026) and lost; the owner kept the surface the game had and
 * asked for this one to be kept where he can see it, to build another body
 * from. It sits in this package, beside the record it once patched, because
 * it is written against this package's internals; nothing on the field
 * imports it, and the game's bundle drops it.
 *
 * WHORL — the material is muscle: a sphincter of ridged fibres winding from
 * the rim into the hole, turning, with a pulse running down them.
 *
 * RIDGE off the shapes page, laid in a spiral. The ring is shaded as a bowl
 * — darkest at the lip, and its lower-right wall lit because that is the
 * wall that faces a key standing up and to the left — and thirty fibres run
 * down it, each a ridge drawn as a shadow line and a lit line offset toward
 * the key, so the surface is corrugated rather than striped. The whole
 * whorl turns on a slow clock, which on a spiral reads as the fibres flowing
 * inward, and a bead of the body's own green runs down each one into the
 * hole, so the thing is seen to be *drawing in* — the one motion a body
 * whose middle is a hole should have. The eyelets, the fringe, the edges and
 * the armour are the shipped passes.
 */

/** How many fibres, and how far round the ring one winds on its way in. */
const FIBRES = 30;
const TWIST = 1.35;
/** One turn of the whorl. Slow, so it is a flow and not a wheel. */
const TURN_SECONDS = 26;
/** How many points a fibre is walked through. */
const STEPS = 9;
/** How far the lit line stands off the shadow line, in pixels: the width of
 * the ridge as the eye reads it. */
const RIDGE = 1.4;
/** How many seconds a bead takes to run from the rim into the hole. */
const BEAD_SECONDS = 3.2;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";
const KEY_BEARING = Math.atan2(KEY.y, KEY.x);

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

/** The bowl: deep at the lip, and lit on the wall that faces the key. */
function bowl(d: WardenSurfaceDraw): void {
  const { ctx, cx, cy, r, pupilX, pupilR } = d;
  const depth = ctx.createRadialGradient(pupilX, cy, pupilR, cx, cy, r);
  depth.addColorStop(0, rgba(SHADOW, 0.6));
  depth.addColorStop(0.5, rgba(SHADOW, 0.25));
  depth.addColorStop(1, rgba(SHADOW, 0.05));
  ctx.fillStyle = depth;
  ctx.fill(d.shape, "evenodd");
  // Concave, so the near wall is the far one: the side away from the key
  // faces it, and the side toward the key turns away.
  const kx = Math.cos(KEY_BEARING) * r;
  const ky = Math.sin(KEY_BEARING) * r;
  const wall = ctx.createLinearGradient(cx - kx, cy - ky, cx + kx, cy + ky);
  wall.addColorStop(0, "rgba(255,255,255,1)");
  wall.addColorStop(0.5, "rgba(255,255,255,1)");
  wall.addColorStop(1, rgba(mixHex(SHADOW, PALETTE.rock, 0.35), 1));
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = wall;
  ctx.fill(d.shape, "evenodd");
  ctx.globalCompositeOperation = "source-over";
}

/** One fibre's path from the rim to the lip, starting at bearing `phi0`. */
function fibre(d: WardenSurfaceDraw, phi0: number, into: Path2D): { x: number; y: number }[] {
  const { cx, cy } = d;
  const pts: { x: number; y: number }[] = [];
  for (let s = 0; s <= STEPS; s++) {
    const u = s / STEPS;
    const phi = phi0 + u * TWIST;
    const sec = section(d, phi);
    const rad = sec.rout - u * (sec.rout - sec.rin);
    const p = { x: cx + Math.cos(phi) * rad, y: cy + Math.sin(phi) * rad };
    pts.push(p);
    if (s === 0) into.moveTo(p.x, p.y);
    else into.lineTo(p.x, p.y);
  }
  return pts;
}

function fibres(d: WardenSurfaceDraw): void {
  const { ctx, time, cut } = d;
  const theta = ((time / TURN_SECONDS) * Math.PI * 2) % (Math.PI * 2);
  const shadow = new Path2D();
  const lit = new Path2D();
  const beads = new Path2D();
  const beadR = Math.max(2, d.r * 0.022);
  for (let k = 0; k < FIBRES; k++) {
    const phi0 = (k / FIBRES) * Math.PI * 2 + theta;
    // A fibre is drawn whole or not at all: one that crossed the way in would
    // close the shot lane with a line, which is all it takes.
    let crosses = false;
    for (let s = 0; s <= STEPS; s += 3) {
      if (
        inOpening(
          (((phi0 + (s / STEPS) * TWIST) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2),
          cut,
        )
      ) {
        crosses = true;
      }
    }
    if (crosses) continue;
    const pts = fibre(d, phi0, shadow);
    fibre(d, phi0, lit);
    // The bead, running in on its own phase.
    const u = ((time / BEAD_SECONDS + k * 0.37) % 1) * STEPS;
    const a = pts[Math.floor(u)];
    const b = pts[Math.min(STEPS, Math.floor(u) + 1)];
    if (!a || !b) continue;
    const f = u - Math.floor(u);
    const bx = a.x + (b.x - a.x) * f;
    const by = a.y + (b.y - a.y) * f;
    beads.moveTo(bx + beadR, by);
    beads.arc(bx, by, beadR, 0, Math.PI * 2);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // The ridge: its shadow line, then its lit line a hair toward the key.
  ctx.strokeStyle = rgba(SHADOW, 0.55);
  ctx.lineWidth = STROKE.outline * 1.3;
  ctx.stroke(shadow);
  ctx.save();
  ctx.translate(KEY.x * RIDGE, KEY.y * RIDGE);
  ctx.strokeStyle = rgba(PALETTE.rock, 0.6);
  ctx.lineWidth = STROKE.outline * 0.7;
  ctx.stroke(lit);
  ctx.restore();
  // The beads: the body's own green, the same as every other sign of life on
  // it, drawn in added light so they read as being under a wet skin.
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rgba(PALETTE.eyeFluid, 0.8);
  ctx.fill(beads);
  ctx.globalCompositeOperation = "source-over";
}

export function whorl(d: WardenSurfaceDraw): void {
  const { ctx, cx, cy, r, time, openness, cut } = d;
  ctx.save();
  ctx.clip(d.shape, "evenodd");
  bowl(d);
  fibres(d);
  ctx.restore();
  drawWardenEyelets(ctx, cx, cy, r, d.pupilX, d.pupilR, time, openness, cut);
  drawWardenCilia(ctx, d.outer, cx, cy, r, time, openness, cut);
  drawWardenEdges(d);
  drawPlates(d);
}
