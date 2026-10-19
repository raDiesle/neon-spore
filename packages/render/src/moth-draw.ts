import { type MothState, mothBellyOpen, type World } from "@neon-spore/sim";
import { bossAura } from "./body-aura.js";
import { drawHurt } from "./boss-hurt.js";
import { heartLight } from "./heartbeat.js";
import { mixHex, rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawMothBody } from "./moth-body.js";
import type { MothFx } from "./moth-fx.js";
import {
  BODY_LIFT,
  type MothPose,
  mothPlates,
  mothPoseAt,
  mothSpotsShown,
  mothWingTears,
} from "./moth-place.js";
import { FORE, HIND, wingBand, wingOutline, wingPoint } from "./moth-shape.js";
import { PALETTE } from "./palette.js";
import { lightWithin } from "./part-light.js";
import { splinePath } from "./spline.js";

/**
 * THE MOTH, drawn: a great moth hung over the field, five columns from wing
 * tip to wing tip, beating its wings on the beat (`moth-place.ts`), its four
 * wings THE CASE's half-shells and its belly THE TITHE's plates
 * (`moth-shape.ts`), its body between them (`moth-body.ts`).
 *
 * **What it asks for glows red from within, and nothing else does**: the
 * eyespots lit on its wings, each a dark ring round a red iris beating on
 * the heart's curve, a black pupil and the light caught in it — and, on the
 * last step, the belly while it sinks. A spot waiting its turn is the same
 * eye shut dark. Nothing writes a word: the spots say where, the cannon's
 * column says when (`boss-cue.ts`).
 *
 * **It has two faces and turns between them.** Each rest folds its wings up
 * over its back, edge on, and opens them on the other face: dusk-violet with
 * pale veins on one step, moon-pale with green veins on the next. Its torn
 * wings stay torn through the turn: its health is how much wing it has left.
 *
 * Comes down a little way, fading in; beaten, its wings droop, it greys, and
 * it falls away fading.
 */

interface Face {
  fill: string;
  edge: string;
  vein: string;
}

const DUSK: Face = {
  fill: mixHex(PALETTE.hull, PALETTE.background, 0.62),
  edge: mixHex(PALETTE.hull, PALETTE.background, 0.85),
  vein: mixHex(PALETTE.hullRim, PALETTE.hull, 0.45),
};
const MOON: Face = {
  fill: mixHex(mixHex(PALETTE.organRim, PALETTE.good, 0.2), PALETTE.background, 0.4),
  edge: mixHex(PALETTE.organ, PALETTE.background, 0.7),
  vein: mixHex(PALETTE.organ, PALETTE.organRim, 0.3),
};

export function drawMoth(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: MothState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: MothFx,
): void {
  const tile = l.tile;
  const base = mothPoseAt(l, world.cfg, s, beat, beatPhase, time);
  fx.note(base.meetY);
  const quiver = fx.shake() * 0.35 * Math.sin(time * 38);
  const p: MothPose = {
    ...base,
    x: base.x + fx.slideX(tile) + fx.hurt.shakeX(time, tile),
    flap: base.flap + quiver,
  };
  const face = p.face === 1 ? DUSK : MOON;
  const tears = mothWingTears(s);
  const wings: { cut: typeof FORE; side: 1 | -1; off: number }[] = [
    { cut: FORE, side: -1, off: -2 },
    { cut: FORE, side: 1, off: 2 },
    { cut: HIND, side: -1, off: -1 },
    { cut: HIND, side: 1, off: 1 },
  ];
  const paths = wings.map((w) =>
    splinePath(wingOutline(p, tile, w.cut, w.side, tears.get(w.off) ?? 0), true),
  );

  ctx.save();
  ctx.globalAlpha *= p.alpha;
  // A flit banks it into the turn, about its own body.
  ctx.translate(p.x, p.y);
  ctx.rotate(fx.bank());
  ctx.translate(-p.x, -p.y);
  if (p.spent < 0.5) bossAura(ctx, paths, face.vein, tile, 0, 0.3 * (1 - p.fold));
  paths.forEach((path, i) => {
    const w = wings[i];
    if (w === undefined) return;
    // The hind wings warmer than the fore, so the four read as four.
    const tint = w.cut === HIND ? { ...face, fill: mixHex(face.fill, PALETTE.ember, 0.14) } : face;
    paintWing(ctx, path, p, tile, tint, w.cut, w.side);
  });
  drawSpots(ctx, p, tile, s, beatPhase, fx.lightIn());
  drawMothBody(ctx, p, tile, mothPlates(s), mothBellyOpen(s), beatPhase, time);
  for (const path of paths) drawHurt(ctx, path, fx.hurt.value);
  ctx.restore();
  fx.draw(ctx, l);
}

/** One wing: its face, shaded darker to the margin, its veins fanned from the root. */
function paintWing(
  ctx: CanvasRenderingContext2D,
  path: Path2D,
  p: MothPose,
  tile: number,
  face: Face,
  cut: typeof FORE,
  side: 1 | -1,
): void {
  const grey = (hex: string) => mixHex(hex, PALETTE.rockDark, p.spent * 0.85);
  const root = wingPoint(p, tile, side, { x: 0.2, y: -0.3 });
  const end = wingPoint(p, tile, side, cut.tip);
  const g = ctx.createRadialGradient(
    root.x,
    root.y,
    1,
    root.x,
    root.y,
    Math.hypot(end.x - root.x, end.y - root.y) * 1.1,
  );
  g.addColorStop(0, grey(mixHex(face.fill, PALETTE.text, 0.15)));
  g.addColorStop(0.75, grey(face.fill));
  g.addColorStop(1, grey(face.edge));
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.save();
  ctx.clip(path);
  // The veins: fanned from the root to the margin, and a band along it.
  ctx.strokeStyle = rgba(grey(face.vein), 0.55 * (1 - 0.6 * p.fold));
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = -0.35 + i * 0.32;
    const reach = 3.2;
    const q = wingPoint(p, tile, side, {
      x: 0.2 + Math.cos(a) * reach * 0.9,
      y: -0.3 + Math.sin(a) * reach * 0.55,
    });
    ctx.moveTo(root.x, root.y);
    ctx.quadraticCurveTo((root.x + q.x) / 2, (root.y + q.y) / 2 + tile * 0.12, q.x, q.y);
  }
  ctx.stroke();
  // The pale zigzag band across it, and the dark margin round it.
  ctx.strokeStyle = rgba(grey(mixHex(face.vein, PALETTE.text, 0.4)), 0.7 * (1 - 0.6 * p.fold));
  ctx.lineWidth = Math.max(1, tile * 0.05);
  ctx.beginPath();
  wingBand(cut, 0.62).forEach((q, i) => {
    const at = wingPoint(p, tile, side, q);
    if (i === 0) ctx.moveTo(at.x, at.y);
    else ctx.lineTo(at.x, at.y);
  });
  ctx.stroke();
  ctx.strokeStyle = rgba(grey(face.edge), 0.8);
  ctx.lineWidth = Math.max(1, tile * 0.22);
  ctx.stroke(path);
  ctx.strokeStyle = rgba(grey(face.vein), 0.5);
  ctx.lineWidth = Math.max(1, tile * 0.03);
  ctx.setLineDash([tile * 0.05, tile * 0.07]);
  ctx.stroke(path);
  ctx.setLineDash([]);
  ctx.restore();
  ctx.strokeStyle = rgba(grey(face.edge), 0.95);
  ctx.lineWidth = Math.max(1, tile * 0.045);
  ctx.stroke(path);
}

/**
 * Its eyespots, each on its own column on the row a bolt meets it: lit, a red
 * iris beating within a dark ring; waiting its turn, shut dark.
 */
function drawSpots(
  ctx: CanvasRenderingContext2D,
  p: MothPose,
  tile: number,
  s: MothState,
  beatPhase: number,
  flare: number,
): void {
  const squeeze = Math.max(0.2, Math.cos(p.flap) * (1 - 0.88 * p.fold));
  for (const spot of mothSpotsShown(s)) {
    const side = spot.off < 0 ? -1 : 1;
    const at = wingPoint(p, tile, side, { x: Math.abs(spot.off), y: BODY_LIFT });
    const r = tile * 0.32 * (spot.lit ? 0.5 + 0.5 * flare : 0.8);
    ctx.fillStyle = rgba(PALETTE.background, 0.9);
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r * squeeze, r, 0, 0, Math.PI * 2);
    ctx.fill();
    const iris = new Path2D();
    iris.ellipse(at.x, at.y, r * 0.72 * squeeze, r * 0.72, 0, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.redDark;
    ctx.fill(iris);
    if (spot.lit) {
      lightWithin(ctx, iris, PALETTE.red, heartLight(beatPhase), { x: at.x, y: at.y, r: r * 0.72 });
    }
    ctx.fillStyle = PALETTE.background;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, r * 0.28 * squeeze, r * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!spot.lit) continue;
    ctx.fillStyle = rgba(PALETTE.text, 0.85);
    ctx.beginPath();
    ctx.arc(at.x - r * 0.22 * squeeze, at.y - r * 0.28, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
}
