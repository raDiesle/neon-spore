import {
  type Color,
  type HiveState,
  hiveNext,
  hiveOpen,
  hiveSwelling,
  hiveTwins,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { HiveFx } from "./hive-fx.js";
import {
  hiveBreachPath,
  hiveFade,
  hiveMassPath,
  hiveScarPath,
  hiveSite,
  hiveSitePath,
  hiveSwellDrop,
  hiveSwellPhase,
  type Point,
} from "./hive-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsHiveColor, showsHiveSwell } from "./view-role-clocks-b.js";

/**
 * **THE HIVE**: a waxen mass hung over the top of the field above row 0,
 * nearly the width of it, its underside scalloped into a row of hanging
 * lobes with a site in the belly of each — shut, swelling, open, or
 * scarred over — and, on one screen, every open breach in the colour a
 * shot has to be (§11.14).
 *
 * Read off the world every frame and drawn in the order the eye reads it:
 * the mass, then every site in column order. Its health is its underside:
 * a site opened is a breach, a breach sealed is a scar, and when every lobe
 * is scarred the mass closes in on its middle and fades over
 * `hiveOutBeats`. What outlives a frame — the clench of a wrong colour, the
 * jolt of a seal — is `effects.boss.hive` (`hive-fx.ts`).
 *
 * **Each seat is shown the one fact it cannot act on.** On the pilot's
 * screen an open breach is in its colour and nothing swells; on the
 * navigator's every open breach is the same wax-grey and the next site to
 * open bulges through the beats before it does — both of them, once the
 * openings come in pairs (`view-role-clocks-b.ts`).
 */
export function drawHive(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: HiveState,
  beat: number,
  beatPhase: number,
  time: number,
  fx: HiveFx,
): void {
  const cfg = world.cfg;
  const fade = hiveFade(s, cfg, beat, beatPhase);
  if (fade <= 0) return;
  const open = fade * (1 - fx.clench);
  const coloured = showsHiveColor(l.role);
  const swelling = showsHiveSwell(l.role) && hiveSwelling(s, cfg, beat);
  const swell = swelling ? hiveSwellPhase(s, cfg, beat, beatPhase) : 0;
  const next = hiveNext(s);
  const twin = hiveTwins(s, cfg) && next >= 0 && next + 1 < s.cols.length ? next + 1 : -1;

  ctx.save();
  ctx.translate(0, -fx.jolt * l.tile);
  drawMass(ctx, l, cfg, s, open, time, fade);
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    if (s.sealed[i]) drawScar(ctx, l, c, open, fade);
    else if (hiveOpen(s, i)) {
      drawBreach(ctx, l, c, coloured ? (s.colors[i] ?? "red") : null, open, time, fade);
    } else if (swelling && (i === next || i === twin))
      drawSwell(ctx, l, c, swell, open, time, fade);
    else drawShut(ctx, l, c, open, fade);
  }
  ctx.restore();
}

/** A colour at the fade: the hex itself while the body hangs, so the frame tests can count it (`scuttle-draw.ts`). */
function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The mass: dark wax over the background, rimmed in its own yellow, closing in on its way out. */
function drawMass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  open: number,
  time: number,
  fade: number,
): void {
  const p = hiveMassPath(l, cfg, s, open, time);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.bileDeep, fade, 0.8);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bile, fade), STROKE.inner, 0.45 * fade);
}

/** A site still shut: a lobe of the same wax, a shade darker, with nothing in it. */
function drawShut(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  open: number,
  fade: number,
): void {
  const p = hiveSitePath(l, c, 0, open);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bileDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bile, fade), STROKE.inner, 0.3 * fade);
}

/** The next site, swelling: the lobe hangs lower by the beat and its rim brightens, on the screen shown it. */
function drawSwell(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  phase: number,
  open: number,
  time: number,
  fade: number,
): void {
  const throb = 1 + 0.08 * phase * Math.sin(time * 9);
  const p = hiveSitePath(l, c, hiveSwellDrop(l, phase) * throb, open);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bile, fade, 0.35 + 0.4 * phase);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bileRim, fade), STROKE.outline, (0.4 + 0.6 * phase) * fade);
}

/** An open breach: the lobe with an aperture in it — in its colour where the colour is shown, in grey elsewhere. */
function drawBreach(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  color: Color | null,
  open: number,
  time: number,
  fade: number,
): void {
  const lobe = hiveSitePath(l, c, 0, open);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bileDeep, fade, 0.9);
  ctx.fill(lobe);
  ctx.restore();
  strokeGlow(ctx, lobe, faded(PALETTE.bile, fade), STROKE.inner, 0.3 * fade);
  const hex = color === null ? PALETTE.dim : PALETTE[color];
  const rim = color === null ? PALETTE.rock : color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const breath = 1 + 0.05 * Math.sin(time * 5);
  const hole = hiveBreachPath(l, c, open * breath);
  ctx.save();
  ctx.fillStyle = faded(hex, fade);
  ctx.fill(hole);
  ctx.restore();
  strokeGlow(ctx, hole, faded(rim, fade), STROKE.outline, (0.7 + 0.2 * Math.sin(time * 5)) * fade);
}

/** A sealed site: the lobe shut again with the stitch of the seal across it, in the hull's pale. */
function drawScar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  open: number,
  fade: number,
): void {
  const p = hiveSitePath(l, c, 0, open);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bileDeep, fade, 0.9);
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.bile, fade), STROKE.inner, 0.3 * fade);
  strokeGlow(ctx, hiveScarPath(l, c), faded(PALETTE.hullRim, fade), STROKE.inner, 0.5 * fade);
}
