import { LIGHT_HALF } from "@neon-spore/content";
import { drawHurt } from "./boss-hurt.js";
import { mixHex, rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { FOLD_GAPE, FOLD_SHUT, type Morsel } from "./lamprey-chomp.js";
import { drawFang, type Fang } from "./lamprey-fang.js";
import type { LampreyPose, Point } from "./lamprey-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE LAMPREY's head seen from the side, eating** (`lamprey-chomp.ts` has
 * the clock). The round sucker is split across its middle into two halves
 * hinged at the mouth: at fold 1 they lie in one line, the disc edge-on with
 * its fangs pointing at what it faces; by fold 2 they have folded forward
 * into gaping jaws; at fold 3 they are shut, the fangs of each crossing the
 * seam into the other — what is between them crushed.
 *
 * Each jaw is laid in the screen's pixels by its axis out from the hinge and
 * the normal toward the other jaw, so lit from the fixed key like the body.
 */

/** How wide the jaws gape at fold 2, and how far apart they still are shut, radians either side. */
const GAPE = 0.62;
const SHUT = 0.05;
/** A jaw's length and thickness, where its fangs stand along it, the skull behind it, in mouth radii. */
const LEN = 1.1;
const THICK = 0.36;
const FANGS = [0.32, 0.52, 0.72, 0.9] as const;
const FANG_STAGGER = 0.1;
const SKULL = 0.54;

const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;

/** How far each jaw is turned from the facing at `fold`, radians. */
export function jawAngle(fold: number): number {
  if (fold <= 1) return Math.PI / 2;
  if (fold <= FOLD_GAPE) return lerp(Math.PI / 2, GAPE, fold - 1);
  return lerp(GAPE, SHUT, Math.min(1, fold - FOLD_GAPE) / (FOLD_SHUT - FOLD_GAPE));
}

interface Jaw {
  /** Out from the hinge to the tip, a unit long. */
  axis: Point;
  /** Toward the other jaw: the side its fangs stand on. */
  inner: Point;
}

function jaw(face: number, turn: number, s: 1 | -1): Jaw {
  const a = face + s * turn;
  const axis = { x: Math.cos(a), y: Math.sin(a) };
  return { axis, inner: { x: s * axis.y, y: -s * axis.x } };
}

/** A point `u` out along a jaw and `v` toward the other, from the hinge. */
function on(h: Point, j: Jaw, u: number, v: number): Point {
  return { x: h.x + j.axis.x * u + j.inner.x * v, y: h.y + j.axis.y * u + j.inner.y * v };
}

/**
 * The jaw: its biting edge straight out and hooked in at the tip, its back
 * bowed, its root tucked under the skull — the only edge left unoutlined.
 */
function jawPath(h: Point, j: Jaw, r: number): { fill: Path2D; edge: Path2D } {
  const pt = (u: number, v: number) => on(h, j, u * r, v * r);
  const root = pt(-0.15, 0);
  const bite = pt(LEN * 0.84, 0);
  const hookAt = pt(LEN, -0.04);
  const tip = pt(LEN * 1.02, 0.13);
  const nose = pt(LEN * 1.06, -0.22);
  const back = pt(LEN * 0.55, -THICK);
  const bow = pt(LEN * 0.1, -THICK * 1.15);
  const heel = pt(-0.15, -THICK * 0.9);
  const edge = new Path2D();
  edge.moveTo(root.x, root.y);
  edge.lineTo(bite.x, bite.y);
  edge.quadraticCurveTo(hookAt.x, hookAt.y, tip.x, tip.y);
  edge.quadraticCurveTo(nose.x, nose.y, back.x, back.y);
  edge.quadraticCurveTo(bow.x, bow.y, heel.x, heel.y);
  const fill = new Path2D(edge);
  fill.closePath();
  return { fill, edge };
}

const LIP = rgba(PALETTE.lampreyFin, 0.95);
const OUTLINE = rgba(PALETTE.lampreyHideDark, 0.95);
const THROAT = rgba(PALETTE.lampreyThroat, 0.9);
const RIM = mixHex(PALETTE.lampreyTooth, PALETTE.lampreyHide, 0.2);

/**
 * The skull under the jaws' roots, laid toward the neck so it joins the body
 * whichever way the head has turned: hide, lit, an eye on its upper side.
 */
function drawSkull(
  ctx: CanvasRenderingContext2D,
  h: Point,
  face: number,
  back: number,
  r: number,
  hurt: number,
): void {
  const c = { x: h.x + Math.cos(back) * 0.32 * r, y: h.y + Math.sin(back) * 0.32 * r };
  const skull = new Path2D();
  skull.ellipse(c.x, c.y, SKULL * r * 1.15, SKULL * r * 1.05, back, 0, Math.PI * 2);
  ctx.fillStyle = PALETTE.lampreyHide;
  ctx.fill(skull);
  ctx.save();
  ctx.clip(skull);
  litRound(ctx, c.x, c.y, SKULL * r * 1.15 + 2, LIGHT_HALF.rock);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = OUTLINE;
  ctx.stroke(skull);
  drawHurt(ctx, skull, hurt);
  // The eye on whichever side of the neck is up the screen.
  const up = Math.cos(back) >= 0 ? 1 : -1;
  const ex = c.x + Math.sin(back) * up * 0.28 * r;
  const ey = c.y - Math.cos(back) * up * 0.28 * r;
  ctx.fillStyle = PALETTE.lampreyEye;
  ctx.beginPath();
  ctx.arc(ex, ey, 0.13 * r, 0, Math.PI * 2);
  ctx.fill();
  const lookX = ex + Math.cos(face) * 0.03 * r;
  const lookY = ey + Math.sin(face) * 0.03 * r;
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.beginPath();
  ctx.arc(lookX, lookY, 0.065 * r, 0, Math.PI * 2);
  ctx.fill();
}

/** What is caught: a lump in its colour, carried in, then squashed flat along the jaws. */
function drawMorsel(ctx: CanvasRenderingContext2D, m: Morsel, mid: Point, face: number, r: number) {
  const x = lerp(m.from.x, mid.x, m.in);
  const y = lerp(m.from.y, mid.y, m.in);
  const size = 0.32 * r;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(face);
  ctx.scale(1 + 0.5 * m.crush, 1 - 0.75 * m.crush);
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const k = size * (0.82 + ((i * 5) % 3) * 0.12);
    if (i === 0) ctx.moveTo(k * Math.cos(a), k * Math.sin(a));
    else ctx.lineTo(k * Math.cos(a), k * Math.sin(a));
  }
  ctx.closePath();
  ctx.fillStyle = m.hex;
  ctx.fill();
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.lampreyHideDark, 0.9);
  ctx.stroke();
  ctx.restore();
}

/** A jaw's fangs along its biting edge, hooked back toward the throat; the second jaw's staggered. */
function jawFangs(h: Point, j: Jaw, r: number, stagger: number): Fang[] {
  return FANGS.map((u0) => {
    const u = (u0 + stagger) * LEN * r;
    return {
      root: on(h, j, u, -0.02 * r),
      dir: j.inner,
      side: { x: -j.axis.x, y: -j.axis.y },
      len: r * (0.16 + 0.13 * (u / r)),
      half: r * 0.075,
      hook: 0.35,
    };
  });
}

/**
 * The head from the side at `fold` (1..3), facing `face`: the mouth's dark
 * between the jaws, the morsel in it, both jaws lit and lipped over the
 * skull, and every fang over all of it so that shut they cross the seam.
 */
export function drawLampreyJaws(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  fold: number,
  face: number,
  morsel: Morsel | null,
  hurt: number,
): void {
  const r = p.r;
  const h = { x: p.x, y: p.y };
  const turn = jawAngle(fold);
  const jaws = [jaw(face, turn, 1), jaw(face, turn, -1)] as const;
  drawSkull(ctx, h, face, Math.atan2(-Math.cos(p.lean) * p.tilt, Math.sin(p.lean)), r, hurt);
  const [a, b] = jaws;
  // The mouth's dark, only between the biting edges: none at all edge-on.
  const tipA = on(h, a, LEN * r, 0);
  const tipB = on(h, b, LEN * r, 0);
  const reach = (LEN * Math.cos(turn) + 0.1) * r;
  const inside = new Path2D();
  inside.moveTo(h.x, h.y);
  inside.lineTo(tipA.x, tipA.y);
  inside.quadraticCurveTo(
    h.x + Math.cos(face) * reach,
    h.y + Math.sin(face) * reach,
    tipB.x,
    tipB.y,
  );
  inside.closePath();
  ctx.fillStyle = PALETTE.lampreyMouth;
  ctx.fill(inside);
  // The throat, opening behind the teeth as the jaws part.
  const throat = 0.3 * r * Math.min(1, Math.cos(turn) * 1.6);
  ctx.fillStyle = THROAT;
  ctx.beginPath();
  const tx = h.x + Math.cos(face) * 0.15 * r;
  const ty = h.y + Math.sin(face) * 0.15 * r;
  ctx.ellipse(tx, ty, throat, throat, 0, 0, Math.PI * 2);
  ctx.fill();

  const mid = { x: h.x + Math.cos(face) * 0.55 * r, y: h.y + Math.sin(face) * 0.55 * r };
  if (morsel !== null) drawMorsel(ctx, morsel, mid, face, r);

  for (const j of jaws) {
    const { fill, edge } = jawPath(h, j, r);
    ctx.fillStyle = PALETTE.lampreyHide;
    ctx.fill(fill);
    ctx.save();
    ctx.clip(fill);
    litRound(ctx, h.x, h.y, LEN * r + 2, LIGHT_HALF.rock);
    ctx.restore();
    ctx.lineWidth = STROKE.outline;
    ctx.strokeStyle = OUTLINE;
    ctx.stroke(edge);
    drawHurt(ctx, fill, hurt);
    // The lip along the biting edge: the sucker's rim, seen side-on.
    const from = on(h, j, 0, -0.07 * r);
    const to = on(h, j, LEN * 0.84 * r, -0.07 * r);
    ctx.lineCap = "round";
    ctx.lineWidth = 0.13 * r;
    ctx.strokeStyle = LIP;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  jaws.forEach((j, i) => {
    for (const f of jawFangs(h, j, r, i === 0 ? 0 : FANG_STAGGER)) drawFang(ctx, f, RIM);
  });
}
