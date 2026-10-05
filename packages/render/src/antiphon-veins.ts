import { type AntiphonState, antiphonSlotCol, type SimConfig } from "@neon-spore/sim";
import { faded } from "./antiphon-flesh.js";
import { antiphonCandidateAt, antiphonOrganCircle, antiphonPerch } from "./antiphon-shape.js";
import { drawAntiphonVeinTracks } from "./antiphon-vein-track.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SharpRect } from "./slow-intake-aim.js";

/**
 * **THE ANTIPHON's veins, and what stands at the organ's place on the
 * screen not shown the organ** (the owner, 5 October 2026: *every organ
 * candidate is connected with the original organ shape with some vene
 * blood … the other person sees only some magical unknown animation
 * instead*).
 *
 * A vein runs from each candidate's perch to the organ's place, straight —
 * the candidate is carried down it in a straight line (`antiphonCandidateAt`),
 * and a vein that curved would let it leave its own vein — but alive along
 * its length: a wobble a fraction of a tile wide and beads of ichor flowing
 * down toward the organ. It grows out with the organ (`grow`), so the veins
 * are the rail's arrival as well as its road.
 *
 * **Both screens draw the veins**, because both have to talk about them:
 * the chooser carries along one, and the explainer, who is shown no
 * candidate, sees each vein end in a closed knot and the one in hand as a
 * bead coming down it — *which* is still the chooser's to know, but *how
 * far* is something the explainer can call out. The bead has no shape, so it
 * names nothing.
 *
 * The veins are the organ's green gone deep (`PALETTE.vein`): blood in the
 * owner's word, an ichor in the picture, because red is the cannon's and the
 * whole of the redesign was taking the cannon's colours off this fight.
 */

/**
 * How thick a vein is drawn, in tiles: on the chooser's screen wide enough
 * to carry the pull's channel inside it, on the explainer's thin enough to
 * leave the organ the thing to read. Its rim, and its bright core.
 */
const VEIN_W = 1.25;
const VEIN_THIN_W = 0.45;
const RIM_W = 0.05;
const CORE_W = 0.07;
/** How far a vein wobbles off its line, in tiles, and how many waves it has along its length. */
const WOBBLE = 0.06;
const WAVES = 3;
/** Beads of ichor on each vein, and how many seconds one takes to run its length. */
const BEADS = 3;
const RUN_S = 2.4;
/** The knot a vein ends in on the explainer's screen, and the bead in hand, in tiles. */
const KNOT_R = 0.22;
const HELD_R = 0.32;

interface Point {
  x: number;
  y: number;
}

/** A point `k` of the way down vein `from` → `to`, wobbled off its line by the clock. */
function along(from: Point, to: Point, k: number, tile: number, time: number, seed: number): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // Pinned at both ends, so the vein meets the perch and the organ exactly.
  const w =
    WOBBLE * tile * Math.sin(k * Math.PI * WAVES + time * 1.7 + seed) * Math.sin(k * Math.PI);
  return { x: from.x + dx * k - (dy / len) * w, y: from.y + dy * k + (dx / len) * w };
}

function veinPath(
  from: Point,
  to: Point,
  reach: number,
  tile: number,
  time: number,
  seed: number,
): Path2D {
  const p = new Path2D();
  const steps = 16;
  for (let n = 0; n <= steps; n++) {
    const q = along(from, to, (n / steps) * reach, tile, time, seed);
    if (n === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  return p;
}

/**
 * Every vein on the rail, grown `grow` of the way down. `chooser` is whether
 * this screen is shown the rail: there the candidates are drawn over the
 * perches; elsewhere each vein ends in a knot and the candidate in hand is a
 * bead on its way down.
 */
export function drawAntiphonVeins(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: AntiphonState,
  grow: number,
  time: number,
  fade: number,
  chooser: boolean,
): void {
  if (grow <= 0 || s.rail.length === 0) return;
  const to = antiphonOrganCircle(l, cfg);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  s.rail.forEach((c, i) => {
    const from = antiphonPerch(l, cfg, c.col);
    const path = veinPath(from, to, grow, l.tile, time, i * 2.1);
    // The vein's wall, a lighter rim round dark flesh.
    ctx.strokeStyle = faded(PALETTE.organRim, fade, 0.35);
    const w = chooser ? VEIN_W : VEIN_THIN_W;
    ctx.lineWidth = l.tile * (w + RIM_W * 2);
    ctx.stroke(path);
    ctx.strokeStyle = faded(PALETTE.vein, fade);
    ctx.lineWidth = l.tile * w;
    ctx.stroke(path);
    // On the chooser's screen the pull's channel runs down the middle
    // (`antiphon-vein-track.ts`); elsewhere a bright core with the ichor
    // running down it toward the organ, the vein's direction said by the
    // vein itself.
    if (chooser) return;
    ctx.strokeStyle = rgba(PALETTE.organ, 0.45 * fade);
    ctx.lineWidth = l.tile * CORE_W;
    ctx.stroke(path);
    ctx.fillStyle = rgba(PALETTE.organRim, 0.7 * fade);
    for (let b = 0; b < BEADS; b++) {
      const k = (((time / RUN_S + b / BEADS + i * 0.13) % 1) + 1) % 1;
      if (k > grow) continue;
      const q = along(from, to, k, l.tile, time, i * 2.1);
      ctx.beginPath();
      ctx.arc(q.x, q.y, l.tile * CORE_W * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    knot(ctx, l, s.carried === i ? antiphonCandidateAt(l, cfg, s, i) : from, s.carried === i, fade);
  });
  ctx.restore();
  if (chooser) drawAntiphonVeinTracks(ctx, l, cfg, s, time, fade);
}

/** The end of a vein on the explainer's screen: a closed knot, or the candidate in hand as a bead. */
function knot(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Point,
  held: boolean,
  fade: number,
): void {
  const r = l.tile * (held ? HELD_R : KNOT_R);
  ctx.fillStyle = faded(held ? PALETTE.organ : PALETTE.vein, fade);
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = faded(PALETTE.organRim, fade, held ? 0.9 : 0.5);
  ctx.lineWidth = Math.max(1, l.tile * 0.05);
  ctx.stroke();
}

/** Motes circling the unknown, and the arcs turning in it. */
const MOTES = 7;
const ARCS = 3;

/**
 * **The unknown**: what the chooser sees at the organ's place instead of the
 * organ — a slow vortex of green, arcs turning against each other and motes
 * circling a pulsing core, so the place the candidates are carried to is a
 * place, and the shape there is the explainer's to say. Grown with the organ
 * and gone with it.
 */
export function drawAntiphonUnknown(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  grow: number,
  time: number,
  fade: number,
): void {
  if (grow <= 0) return;
  const c = antiphonOrganCircle(l, cfg);
  const r = c.r * grow;
  ctx.save();
  const glow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * 1.3);
  glow.addColorStop(0, rgba(PALETTE.organRim, 0.55 * fade));
  glow.addColorStop(0.35, rgba(PALETTE.organ, 0.3 * fade));
  glow.addColorStop(1, rgba(PALETTE.vein, 0));
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(c.x, c.y, r * 1.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  for (let a = 0; a < ARCS; a++) {
    const turn = time * (0.9 + a * 0.45) * (a % 2 === 0 ? 1 : -1) + a * 2.1;
    ctx.strokeStyle = rgba(PALETTE.organRim, (0.75 - a * 0.18) * fade);
    ctx.lineWidth = Math.max(1, l.tile * (0.1 - a * 0.02));
    ctx.beginPath();
    ctx.arc(c.x, c.y, r * (0.6 + a * 0.3), turn, turn + Math.PI * (1.1 - a * 0.15));
    ctx.stroke();
  }
  ctx.fillStyle = rgba(PALETTE.organRim, 0.85 * fade);
  for (let m = 0; m < MOTES; m++) {
    const ang = time * (0.6 + (m % 3) * 0.35) + (m * Math.PI * 2) / MOTES;
    const rr = r * (0.6 + 0.45 * Math.abs(Math.sin(time * 0.8 + m)));
    ctx.beginPath();
    ctx.arc(
      c.x + Math.cos(ang) * rr,
      c.y + Math.sin(ang) * rr,
      Math.max(1, l.tile * 0.06),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  const core = r * (0.2 + 0.06 * Math.sin(time * 3));
  ctx.fillStyle = rgba(PALETTE.organRim, 0.9 * fade);
  ctx.beginPath();
  ctx.arc(c.x, c.y, core, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The rail, its veins, the organ's place and the word under it, as one
 * rectangle THE SLOW's prism leaves whole (`slow-boss-aim-c.ts`): from the
 * outermost slot to the outermost, the rail's row to under the organ.
 */
export function antiphonSharp(l: Layout, cfg: SimConfig, s: AntiphonState): SharpRect {
  const n = Math.max(s.rail.length, cfg.antiphonRail);
  const left = antiphonPerch(l, cfg, antiphonSlotCol(cfg, n, 0));
  const right = antiphonPerch(l, cfg, antiphonSlotCol(cfg, n, n - 1));
  const organ = antiphonOrganCircle(l, cfg);
  const pad = l.tile * SHARP_PAD;
  const top = left.y - pad;
  return { x: left.x - pad, y: top, w: right.x - left.x + pad * 2, h: organ.y + pad * 1.6 - top };
}

/** How far past a candidate's middle the prism's whole rectangle reaches, in tiles. */
const SHARP_PAD = 1.4;
