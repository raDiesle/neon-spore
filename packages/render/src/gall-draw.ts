import { LIGHT_HALF } from "@neon-spore/content";
import { type GallState, gallClosing, gallLitStep, gallPincher, type World } from "@neon-spore/sim";
import { coreHurt } from "./core-hurt.js";
import { drawGallPinch, drawGallRoot, drawGallScar } from "./gall-marks.js";
import {
  gallArrived,
  gallBearing,
  gallFlat,
  gallHeld,
  gallLeft,
  gallLobes,
  gallPart,
  gallPinch,
  gallRippling,
  gallSpent,
  gallSunk,
  gallSwell,
} from "./gall-pose.js";
import {
  gallNodulePath,
  gallPointAt,
  gallPoints,
  gallRipple,
  gallRootAt,
  gallRootR,
  gallSeamPath,
  gallSize,
} from "./gall-shape.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsGallReach } from "./view-role-clocks-c.js";

// How far a close kept shut presses the nodule down into the seam, at its fullest.
const PRESSED = 0.45;

/**
 * **THE GALL**: a soft nodule riding a raised seam the width of the field,
 * pinched shut by the seat nearer it and jumping, the instant a close lands,
 * to another of the seam's four points (§11.55, `bosses-choreographed.md`
 * §38).
 *
 * **Both screens are drawn the same body.** The seam, its scars and the gall
 * where it sits are on both, because finding it after a jump is the fight;
 * only the pinch's chevrons differ, full for the seat whose half the gall is
 * on (`showsGallReach`).
 *
 * **Its health is read off the nodule** — no bar: a lobe fewer and a sixth
 * smaller for every close, squeezed narrow by the gap between the fingers on
 * it and pressed down into the seam by the beats they keep it shut. After the
 * third close **the view goes into the hull**: the nodule is pulled under,
 * the seam's two lips peel back over the middle column, and what they were
 * hiding is the root, the only part ever shot. Everything is read off
 * `world` each frame; nothing of it outlives one yet.
 */
export function drawGall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GallState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const cfg = world.cfg;
  const arrived = gallArrived(s, cfg, beat, beatPhase);
  const flat = gallFlat(s, cfg, beat, beatPhase);
  const ripple = gallRippling(s, cfg, beat, beatPhase);
  const part = gallPart(s, cfg, beat, beatPhase);

  ctx.save();
  ctx.globalAlpha = 1 - flat;
  drawSeam(ctx, l, time, ripple, part);
  const here = gallPointAt(l, cfg, s.point);
  for (const p of gallPoints(l, cfg)) {
    if (p.x === here.x && !s.bared) continue;
    drawGallScar(ctx, l, p.x, p.y + gallRipple(l, p.x, time, ripple));
  }

  if (part > 0) {
    const root = gallRootAt(l, cfg);
    const step = gallLitStep(s);
    const hurt = coreHurt(s.hits);
    const lit =
      step?.ask === "fire" ? { color: step.color, left: gallLeft(s, beat, beatPhase) } : null;
    ctx.save();
    ctx.translate(root.x, root.y + gallRipple(l, root.x, time, ripple));
    drawGallRoot(ctx, gallRootR(l), part * hurt.size, hurt.bright, lit, beatPhase);
    ctx.restore();
  }

  const sunk = Math.max(
    gallSunk(s, cfg, beat, beatPhase),
    1 - arrived,
    PRESSED * gallHeld(s, cfg, beatPhase),
  );
  if (sunk < 1) {
    ctx.save();
    ctx.translate(here.x, here.y + gallRipple(l, here.x, time, ripple));
    drawNodule(ctx, l, s, world, time, beatPhase, sunk);
    ctx.restore();
  }
  ctx.restore();
}

/** The seam, lifted by its ripple and `part` of the way peeled open over the root. */
function drawSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  ripple: number,
  part: number,
): void {
  const seam = gallSeamPath(l, time, ripple, part);
  ctx.fillStyle = PALETTE.gallSeam;
  ctx.fill(seam);
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.gallSeamDark, 0.95);
  ctx.stroke(seam);
}

/**
 * NOTCH 2's heeled mass at the gall's point, heeled toward its pincher's
 * end, lit off the key light, and the pinch's chevrons round it while a
 * close is lit.
 */
function drawNodule(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: GallState,
  world: World,
  time: number,
  beatPhase: number,
  sunk: number,
): void {
  const cfg = world.cfg;
  const pinch = gallPinch(s, cfg);
  const size = gallSpent(s) * gallSwell(s, cfg, beatPhase);
  const { rx, ry } = gallSize(l);
  // It rises out of the seam: its middle stands above the seam's top by as much as it is up.
  const lift = -ry * 0.55 * size * (1 - sunk);
  ctx.save();
  ctx.translate(0, lift);
  const body = gallNodulePath(l, {
    lobes: gallLobes(s),
    time,
    bearing: gallBearing(s, l.flip),
    heel: 1,
    size,
    pinch,
    sunk,
  });
  ctx.fillStyle = PALETTE.gallFlesh;
  ctx.fill(body);
  ctx.save();
  ctx.clip(body);
  litRound(ctx, -rx * 0.3, -ry * 0.45, rx * 1.1, LIGHT_HALF.creature);
  ctx.restore();
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.gallFleshDark, 0.95);
  ctx.stroke(body);
  ctx.restore();

  if (!gallClosing(s)) return;
  const full = showsGallReach(l.role, gallPincher(s));
  const across = rx * size * (1 - 0.45 * pinch);
  ctx.save();
  ctx.translate(0, lift * 0.6);
  drawGallPinch(ctx, l, across, pinch, gallLeft(s, world.beat, beatPhase), full, beatPhase);
  ctx.restore();
}
