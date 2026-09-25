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
import { drawHurt } from "./boss-hurt.js";
import { strokeGlow } from "./glow.js";
import { paintBreach, paintLobe } from "./hive-cell.js";
import type { HiveFx } from "./hive-fx.js";
import { hiveClenchRise, hivePinchPhase, hiveWrungRingPath } from "./hive-hold.js";
import {
  hiveBox,
  hiveBreachPath,
  hiveFade,
  hiveMassPath,
  hiveScarPath,
  hiveSite,
  hiveSitePath,
  hiveSwellDrop,
  hiveSwellPhase,
  type Point,
  SITE_R,
} from "./hive-shape.js";
import { faded, paintWax } from "./hive-wax.js";
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
  ctx.translate(fx.hurt.shakeX(time, l.tile), -(fx.jolt + rise) * l.tile);
  drawMass(ctx, l, cfg, s, open, time, fade, fx.hurt.value);
  for (let i = 0; i < s.cols.length; i++) {
    const c = hiveSite(l, s, i);
    if (s.sealed[i]) drawScar(ctx, l, c, open, fade);
    else if (hiveOpen(s, i)) {
      const wrung = hiveWrungAt(s, i);
      const color = wrung || !coloured ? null : (s.colors[i] ?? "red");
      drawBreach(ctx, l, c, color, open, time, fade, wrung);
    } else if (swelling && (i === next || i === twin))
      drawSwell(ctx, l, c, swell, open, time, fade, i === s.pinch ? pinch : -1);
    else lobe(ctx, l, c, 0, open, fade);
  }
  ctx.restore();
}

/** The mass: wax, pressed with comb, closing in on its middle on its way out (`hive-wax.ts`). */
function drawMass(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  open: number,
  time: number,
  fade: number,
  hurt: number,
): void {
  const box = hiveBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const wax = { ...box, left: mid - hw, right: mid + hw, tile: l.tile };
  const path = hiveMassPath(l, cfg, s, open, time);
  paintWax(ctx, path, wax, fade);
  drawHurt(ctx, path, hurt * fade);
}

/** A lobe of the mass's own wax hung at `c`, `drop` lower, its lower wall lit in `rim` — shut, it is only this. */
function lobe(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Point,
  drop: number,
  open: number,
  fade: number,
  hex: string = PALETTE.bileDeep,
  fillA = 0.9,
  rim: string = PALETTE.bile,
  rimA = 0.35,
): void {
  const r = l.tile * SITE_R * open;
  const p = hiveSitePath(l, c, drop, open);
  paintLobe(ctx, p, c.x, c.y + (r + drop) * 0.4, r, l.tile, hex, fillA, rim, rimA, fade);
}

/**
 * The next site, swelling: the lobe hangs lower by the beat and fills with
 * light from inside, on the screen shown it.
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
  const drop = hiveSwellDrop(l, phase) * throb;
  const bright = Math.min(1, 0.4 + 0.6 * phase + squeeze);
  const fill = 0.35 + 0.4 * phase;
  lobe(
    ctx,
    l,
    c,
    drop,
    open * (1 - 0.3 * squeeze),
    fade,
    PALETTE.bile,
    fill,
    PALETTE.bileRim,
    bright,
  );
}

/**
 * An open breach: the lobe with a wet socket opened in it — its colour
 * welling in it where the colour is shown, grey elsewhere.
 *
 * **A `wrung` one has no colour anywhere** and says so with a shape rather
 * than a shade: the pale collar of `hiveWrungRingPath` round the aperture, on
 * both screens, because grey alone is what the navigator's screen already
 * says about every breach she has (`hive-hold.ts`). The collar is a marker
 * and keeps its glow.
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
  lobe(ctx, l, c, 0, open, fade);
  const hex = color === null ? PALETTE.dim : PALETTE[color];
  const rim = color === null ? PALETTE.rock : color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const breath = 1 + 0.05 * Math.sin(time * 5);
  const r = l.tile * SITE_R * 0.55 * open * breath;
  const hole = hiveBreachPath(l, c, open * breath);
  paintBreach(
    ctx,
    hole,
    c.x,
    c.y + r * 0.5,
    r,
    l.tile,
    hex,
    rim,
    fade,
    0.5 + 0.5 * Math.sin(time * 5),
  );
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
  lobe(ctx, l, c, 0, open, fade);
  strokeGlow(ctx, hiveScarPath(l, c), faded(PALETTE.hullRim, fade), STROKE.inner, 0.5 * fade);
}
