import { KEY } from "../../../../../packages/content/src/light.js";
import { surfaceDim } from "../../../../../packages/content/src/surface.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { drawWardenCilia } from "../../../../../packages/render/src/warden-cilia.js";
import { drawPlates } from "../../../../../packages/render/src/warden-plates.js";
import { inOpening } from "../../../../../packages/render/src/warden-skin.js";
import {
  drawWardenEdges,
  type WardenSurfaceDraw,
} from "../../../../../packages/render/src/warden-surface.js";
import { tubeAt, tubeLit, tubePoint } from "./tube.js";

/**
 * ROLL — the ring is a smoke ring: a tube turning inside-out, its surface
 * rolling in over the crest and down into the hole, and the eyelets and veins
 * ride it round.
 *
 * The material is shaded as a tube (`tube.ts`): one gradient from the lip
 * up over the crest to the rim with the light read off the tube's own normal,
 * the far side darkened along the key, and a specular along the crest where
 * it faces the light. Every mark is pinned at a bearing and a tube latitude,
 * and the latitude advances on a slow clock, so a mark appears at the outer
 * edge as a sliver, widens over the crest, and narrows into the lip — the
 * reveal a pose cannot fake. Nothing else on the body is touched.
 */

/** One turn of the tube. Slow: a boss that rolled visibly fast would read as
 * a mechanism, and what this has to say is that the material is going
 * somewhere. */
const ROLL_SECONDS = 18;
/** How many points the crest's specular is walked through. */
const SECTORS = 48;
/** The bearing the key light stands at, seen from the ring's centre: up and
 * to the left, which is `KEY`'s own direction read as an angle. */
const KEY_BEARING = Math.atan2(KEY.y, KEY.x);
/** What the material keeps of its light turned fully away. A shadow is cool
 * and never black — `docs/style-guide.md`. */
const FLOOR = 0.22;
const SHADOW = "#0B1024";
/** The eyelets, and how wide one is as a share of the body's radius — the
 * shipped size (`warden-skin.ts`), placed on the tube instead, and more of
 * them because at any instant half are round the back. */
const EYELETS = 40;
const EYELET_W = 0.055;
const SPIRAL = 2.39996;
/** The share of a turn each eyelet's latitude steps by, chosen not to divide
 * the bearing's own step. */
const LAT_STEP = 0.5279;
/** Veins riding the roll: short meridians with a twist, forked at the tip. */
const VEINS = 12;
const VEIN_LEN = 1.1;
const VEIN_TWIST = 0.22;

/**
 * The tube's shade, in three passes and no seams: one radial gradient from
 * the hole's own circle out to the rim's — the two circles a canvas gradient
 * takes are exactly those two, so the crest runs midway between them
 * whatever the hole has slid to — carrying the lip dark, the crest light and
 * the rim dark again; a linear gradient along the key multiplied over it,
 * which is the near side against the far; and the crest's specular where the
 * tube faces the key, stroked in short round-capped runs so it fades along the
 * ring rather than stopping.
 */
function shade(d: WardenSurfaceDraw): void {
  const { ctx, cx, cy, r, pupilX, pupilR } = d;
  const across = ctx.createRadialGradient(pupilX, cy, pupilR, cx, cy, r);
  const at = (lit: number): string => mixHex(SHADOW, PALETTE.rock, surfaceDim(FLOOR, lit) * 0.62);
  // The section's own light, read on the meridian facing the key so the ramp
  // is the tube's and not a flat lamp: the lip turned away, the crest square
  // to us, the rim turned away again.
  across.addColorStop(0, at(tubeLit(KEY_BEARING, -Math.PI / 2) * 0.5));
  across.addColorStop(0.3, at(tubeLit(KEY_BEARING, -0.6)));
  across.addColorStop(0.55, at(tubeLit(KEY_BEARING, 0)));
  across.addColorStop(0.82, at(tubeLit(KEY_BEARING, 0.7)));
  across.addColorStop(1, at(tubeLit(KEY_BEARING, Math.PI / 2) * 0.5));
  ctx.fillStyle = across;
  ctx.fill(d.shape, "evenodd");

  // Near side against far: the light stands up and to the left, so the
  // material falls off toward the lower right. Multiplied, so it darkens
  // without changing the hue of anything drawn under it.
  const kx = Math.cos(KEY_BEARING) * r;
  const ky = Math.sin(KEY_BEARING) * r;
  const along = ctx.createLinearGradient(cx + kx, cy + ky, cx - kx, cy - ky);
  along.addColorStop(0, "rgba(255,255,255,1)");
  along.addColorStop(0.45, "rgba(255,255,255,1)");
  along.addColorStop(1, rgba(SHADOW, 1));
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = along;
  ctx.fill(d.shape, "evenodd");

  // The crest's specular, where the tube faces the key: a wet ridge, and the
  // brightest thing on the body, so the eye reads the roundness off it first.
  // One polyline along the crest and one stroke, its alpha a gradient along
  // the key rather than a run of short strokes — those overlapped at their
  // round caps and came out as a chain of beads.
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const step = (Math.PI * 2) / SECTORS;
  const crest = new Path2D();
  let rho = 0;
  let on = false;
  for (let i = 0; i <= SECTORS; i++) {
    const phi = i * step;
    if (inOpening(phi % (Math.PI * 2), d.cut)) {
      on = false;
      continue;
    }
    const t = tubeAt(d, phi);
    rho = Math.max(rho, t.rho);
    const p = tubePoint(d, t, phi, -0.3);
    if (on) crest.lineTo(p.x, p.y);
    else crest.moveTo(p.x, p.y);
    on = true;
  }
  const gloss = ctx.createLinearGradient(cx + kx, cy + ky, cx - kx * 0.15, cy - ky * 0.15);
  gloss.addColorStop(0, rgba(PALETTE.text, 0.3));
  gloss.addColorStop(0.5, rgba(PALETTE.text, 0.12));
  gloss.addColorStop(1, rgba(PALETTE.text, 0));
  ctx.strokeStyle = gloss;
  ctx.lineWidth = rho * 0.26;
  ctx.stroke(crest);
  ctx.globalCompositeOperation = "source-over";
}

/** The eyelets, pinned to the tube and carried round by the roll. */
function eyelets(d: WardenSurfaceDraw, theta: number): void {
  const { ctx, r, time, openness, cut } = d;
  const lids = new Path2D();
  const pupils = new Path2D();
  const w = r * EYELET_W;
  for (let k = 0; k < EYELETS; k++) {
    const phi = k * SPIRAL;
    if (inOpening(((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), cut)) continue;
    // Each at its own latitude, so the set is spread over the whole width of
    // the tube at any instant rather than arriving in a ring. Not the golden
    // ratio again: that is one less the turn the bearing already takes, and
    // the two together laid every eighth eyelet on one diagonal chain.
    const beta = Math.PI / 2 - ((k * LAT_STEP * Math.PI * 2 + theta) % (Math.PI * 2));
    const face = Math.cos(beta);
    if (face < 0.08) continue;
    const t = tubeAt(d, phi);
    const p = tubePoint(d, t, phi, beta);
    let open = Math.max(0, Math.sin(time * (0.47 + (k % 5) * 0.13) + k * 1.71)) ** 0.7;
    // An eyelet the hole is coming for shuts rather than vanishing, as the
    // shipped ones do (`warden-skin.ts`).
    const clear = (Math.hypot(p.x - d.pupilX, p.y - d.cy) - d.pupilR) / (w * 3);
    open *= Math.max(0, Math.min(1, clear));
    if (open < 0.05) continue;
    // Along the ring, and foreshortened across the tube by where it stands
    // on it: full height on the crest, a sliver at either edge.
    const h = w * 0.92 * open * face;
    const ux = -Math.sin(phi);
    const uy = Math.cos(phi);
    const nx = Math.cos(phi);
    const ny = Math.sin(phi);
    lids.moveTo(p.x - ux * w, p.y - uy * w);
    lids.quadraticCurveTo(p.x - nx * h * 2, p.y - ny * h * 2, p.x + ux * w, p.y + uy * w);
    lids.quadraticCurveTo(p.x + nx * h * 2, p.y + ny * h * 2, p.x - ux * w, p.y - uy * w);
    // The pupil is a disc *on* the surface, so it is foreshortened the same
    // way the lid is: round on the crest, a line at the edge. Gated on the
    // lid's own height rather than on the blink alone, or an eyelet at the
    // limb would be a dark bead with no lid round it.
    if (open * face < 0.3) continue;
    const pr = w * 0.5 * open;
    pupils.moveTo(p.x + pr, p.y);
    pupils.ellipse(p.x, p.y, pr, Math.max(0.5, pr * face), phi, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.eyeFluid;
  ctx.globalAlpha = 0.2 + openness * 0.18;
  ctx.fill(lids);
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.9;
  ctx.fill(pupils);
  ctx.strokeStyle = PALETTE.eyeFluidRim;
  ctx.lineWidth = STROKE.inner * 0.7;
  ctx.globalAlpha = 0.7 + openness * 0.3;
  ctx.stroke(lids);
  ctx.globalAlpha = 1;
}

/** The veins: short meridians with a twist, riding the roll under the skin. */
function veins(d: WardenSurfaceDraw, theta: number): void {
  const { ctx, openness, cut } = d;
  const path = new Path2D();
  for (let k = 0; k < VEINS; k++) {
    const phi0 = (k / VEINS) * Math.PI * 2 + 0.55;
    if (inOpening(phi0, cut)) continue;
    const b0 = Math.PI / 2 - ((k * 1.3 + theta) % (Math.PI * 2));
    const t = tubeAt(d, phi0);
    let started = false;
    for (let s = 0; s <= 8; s++) {
      const beta = b0 - (s / 8) * VEIN_LEN;
      if (Math.cos(beta) < 0.05) {
        started = false;
        continue;
      }
      const phi = phi0 + VEIN_TWIST * (b0 - beta);
      const p = tubePoint(d, t, phi, beta);
      if (started) path.lineTo(p.x, p.y);
      else path.moveTo(p.x, p.y);
      started = true;
      if (s === 8) {
        for (const fork of [-0.7, 0.8]) {
          const q = tubePoint(d, t, phi + fork * 0.18, beta - 0.28);
          path.moveTo(p.x, p.y);
          path.lineTo(q.x, q.y);
        }
      }
    }
  }
  strokeGlow(ctx, path, PALETTE.eyeFluid, STROKE.inner * 0.7, 0.22 + openness * 0.25);
}

export function roll(d: WardenSurfaceDraw): void {
  const { ctx, time } = d;
  const theta = ((time / ROLL_SECONDS) * Math.PI * 2) % (Math.PI * 2);
  ctx.save();
  ctx.clip(d.shape, "evenodd");
  shade(d);
  veins(d, theta);
  eyelets(d, theta);
  ctx.restore();
  drawWardenCilia(ctx, d.outer, d.cx, d.cy, d.r, time, d.openness, d.cut);
  drawWardenEdges(d);
  drawPlates(d);
}
