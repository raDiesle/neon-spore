import { LIGHT_HALF } from "@neon-spore/content";
import { type GallState, gallClosing, gallLitStep, gallPresser, type World } from "@neon-spore/sim";
import type { BoltStops } from "./bolt-stop.js";
import { drawHurt } from "./boss-hurt.js";
import { coreHurt } from "./core-hurt.js";
import type { GallFx } from "./gall-fx.js";
import { drawGallPress, drawGallRoot, drawGallScar } from "./gall-marks.js";
import {
  gallArrived,
  gallBearing,
  gallFlat,
  gallHeld,
  gallLeft,
  gallLobes,
  gallPart,
  gallPress,
  gallRippling,
  gallSpent,
  gallSunk,
  gallSwell,
} from "./gall-pose.js";
import { drawGallFlash, drawGallPuff, drawGallTear } from "./gall-receipts.js";
import {
  gallNodulePath,
  gallPointAt,
  gallPoints,
  gallRipple,
  gallRootAt,
  gallRootR,
  gallSeamGap,
  gallSeamPath,
  gallSize,
} from "./gall-shape.js";
import { gallStopper } from "./gall-stop.js";
import { drawGallMarkFeedback } from "./gall-verdicts.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { stepColour } from "./step-colour.js";
import { showsGallReach } from "./view-role-clocks-c.js";

// How far a close kept shut presses the nodule down into the seam, at its fullest.
const PRESSED = 0.45;
// How much bigger a window run out swells the nodule back, at the swell's height.
const BULGE = 0.22;

/**
 * **THE GALL**: a soft nodule riding a raised seam the width of the field,
 * pressed shut by the seat nearer it and jumping, the instant a close lands,
 * to another of the seam's four points (§11.55, `bosses-choreographed.md`
 * §38).
 *
 * **Both screens are drawn the same body.** The seam, its scars and the gall
 * where it sits are on both, because finding it after a jump is the fight;
 * only the press's chevrons differ, full for the seat whose half the gall is
 * on (`showsGallReach`).
 *
 * **Its health is read off the nodule** — no bar: a lobe fewer and a sixth
 * smaller for every close, squeezed narrow by the press on
 * it and pressed down into the seam by the beats they keep it shut. After the
 * third close **the view goes into the hull**: the nodule is pulled under,
 * the seam's two lips peel back over the middle column, and what they were
 * hiding is the root, the only part ever shot. Everything is read off
 * `world` each frame but what outlives one — a press's flare, a slip's
 * shudder, a swell's bulge, the ghost a close leaves, the lips tearing, the
 * root's flash and the blow the gall takes — which is `fx` (`gall-fx.ts`),
 * told the root's colour here.
 */
export function drawGall(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: GallState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: GallFx,
  stops?: BoltStops,
): void {
  const cfg = world.cfg;
  const shake = fx.hurt.shakeX(time, l.tile);
  const arrived = gallArrived(s, cfg, beat, beatPhase);
  const flat = gallFlat(s, cfg, beat, beatPhase);
  const ripple = gallRippling(s, cfg, beat, beatPhase, world);
  const part = gallPart(s, cfg, beat, beatPhase);
  stops?.aim(gallStopper(l, world, s, time, ripple, part, shake));

  ctx.save();
  ctx.globalAlpha = 1 - flat;
  drawSeam(ctx, l, time, ripple, part);
  const here = gallPointAt(l, cfg, s.point);
  for (const p of gallPoints(l, cfg)) {
    if (p.x === here.x && !s.bared) continue;
    drawGallScar(ctx, l, p.x, p.y + gallRipple(l, p.x, time, ripple));
  }
  drawGallPuff(ctx, l, cfg, fx.puff, time, ripple);

  if (part > 0) {
    const root = gallRootAt(l, cfg);
    const step = gallLitStep(s);
    const hurt = coreHurt(s.hits);
    const lit =
      step?.ask === "fire" ? { color: step.color, left: gallLeft(s, beat, beatPhase) } : null;
    if (step?.ask === "fire") fx.tell(stepColour(step.color).rim);
    ctx.save();
    ctx.translate(root.x, root.y + gallRipple(l, root.x, time, ripple));
    drawGallTear(ctx, l, gallSeamGap(l, part), fx.tear);
    ctx.translate(shake, 0);
    const r = gallRootR(l);
    drawGallRoot(ctx, r, part * hurt.size, hurt.bright, lit, beatPhase);
    drawGallFlash(ctx, r * part * hurt.size, fx.flash, fx.hurt.value);
    ctx.restore();
  }

  const sunk = Math.max(
    gallSunk(s, cfg, beat, beatPhase),
    1 - arrived,
    PRESSED * gallHeld(s, cfg, beatPhase),
  );
  if (sunk < 1) {
    ctx.save();
    const x = here.x + shake + fx.shudderX(time, l.tile);
    ctx.translate(x, here.y + gallRipple(l, here.x, time, ripple));
    drawNodule(ctx, l, s, world, time, beatPhase, sunk, fx);
    ctx.restore();
  }
  drawGallMarkFeedback(ctx, l, cfg, s, time, 1 - flat, fx.verdicts.verdicts);
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
 * NOTCH 2's heeled mass at the gall's point, heeled toward its presser's
 * end, lit off the key light, and the press's chevrons round it while a
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
  fx: GallFx,
): void {
  const cfg = world.cfg;
  const press = gallPress(s, cfg);
  const size = gallSpent(s) * gallSwell(s, cfg, beatPhase) * (1 + BULGE * fx.bulge);
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
    press,
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
  // A press come shut lights its rim; a close or a hit reddens it.
  if (fx.flare > 0) strokeGlow(ctx, body, PALETTE.hullRim, STROKE.outline, fx.flare);
  drawHurt(ctx, body, fx.hurt.value);
  ctx.restore();

  if (!gallClosing(s)) return;
  const full = showsGallReach(l.role, gallPresser(s));
  const across = rx * size * (1 - 0.45 * press);
  ctx.save();
  ctx.translate(0, lift * 0.6);
  drawGallPress(ctx, l, across, press, gallLeft(s, world.beat, beatPhase), full, beatPhase);
  ctx.restore();
}
