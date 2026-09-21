import {
  type Color,
  type HiveState,
  hiveNext,
  hiveOpen,
  hiveSwelling,
  hiveTwins,
  hiveWrungAt,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { HiveFx } from "./hive-fx.js";
import { hiveClenchRise, hivePinchPhase, hiveWrungRingPath } from "./hive-hold.js";
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
 *
 * **The two states each seat answers are drawn on both**, and they have to
 * be: the pair's whole conversation under this boss is one of them saying
 * what the other cannot see, and neither *a clench* nor *the next one is
 * wrung* would be worth saying if the seat that has to act on it could not
 * see what it was acting on. So the clench draws the mass up on every screen
 * (`hive-hold.ts`), and a wrung breach wears its collar on every screen —
 * what stays split is only which thumb is offered a ring (`hive-grip.ts`).
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
  const pinch = hivePinchPhase(s, cfg, beat, beatPhase);
  const rise = hiveClenchRise(s, cfg, beat, beatPhase);

  ctx.save();
  ctx.translate(0, -(fx.jolt + rise) * l.tile);
  drawMass(ctx, l, cfg, s, open, time, fade);
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    if (s.sealed[i]) drawScar(ctx, l, c, open, fade);
    else if (hiveOpen(s, i)) {
      const wrung = hiveWrungAt(s, i);
      const color = wrung || !coloured ? null : (s.colors[i] ?? "red");
      drawBreach(ctx, l, c, color, open, time, fade, wrung);
    } else if (swelling && (i === next || i === twin))
      drawSwell(ctx, l, c, swell, open, time, fade, i === s.pinch ? pinch : -1);
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

/**
 * The next site, swelling: the lobe hangs lower by the beat and its rim
 * brightens, on the screen shown it.
 *
 * **`held` is how far through her hold it is**, or `-1` for a lobe nobody has
 * a thumb on. A held lobe stops throbbing and squeezes — narrower and longer
 * the further through the hold it is — so that the gesture looks like a
 * gesture before it has finished being one. It is the picture of a hand and
 * not a countdown: the dial is the ring's, over it (`hive-grip.ts`).
 */
function drawSwell(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  phase: number,
  open: number,
  time: number,
  fade: number,
  held = -1,
): void {
  const squeeze = held < 0 ? 0 : held;
  const throb = held < 0 ? 1 + 0.08 * phase * Math.sin(time * 9) : 1 + 0.35 * squeeze;
  const p = hiveSitePath(l, c, hiveSwellDrop(l, phase) * throb, open * (1 - 0.3 * squeeze));
  ctx.save();
  ctx.fillStyle = faded(PALETTE.bile, fade, 0.35 + 0.4 * phase);
  ctx.fill(p);
  ctx.restore();
  const bright = Math.min(1, 0.4 + 0.6 * phase + squeeze);
  strokeGlow(ctx, p, faded(PALETTE.bileRim, fade), STROKE.outline, bright * fade);
}

/**
 * An open breach: the lobe with an aperture in it — in its colour where the
 * colour is shown, in grey elsewhere.
 *
 * **A `wrung` one has no colour anywhere** and says so with a shape rather
 * than a shade: the pale collar of `hiveWrungRingPath` round the aperture, on
 * both screens, because grey alone is what the navigator's screen already
 * says about every breach she has (`hive-hold.ts`).
 */
function drawBreach(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  color: Color | null,
  open: number,
  time: number,
  fade: number,
  wrung = false,
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
  if (!wrung) return;
  strokeGlow(
    ctx,
    hiveWrungRingPath(l, c, open),
    faded(PALETTE.hullRim, fade),
    STROKE.inner,
    (0.5 + 0.3 * Math.sin(time * 3)) * fade,
  );
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
