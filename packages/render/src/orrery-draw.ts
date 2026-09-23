import { blobPoints, circleSubpath } from "@neon-spore/content";
import {
  ORRERY_RINGS,
  type OrreryState,
  orreryOrbit,
  orreryRingBroken,
  type SimConfig,
} from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { paintCore, paintOrgan } from "./orrery-flesh.js";
import { drawOrreryGrip } from "./orrery-grab.js";
import { drawOrreryShaft } from "./orrery-shaft.js";
import {
  orreryAt,
  orreryCorePoint,
  orreryOrbitPath,
  orreryOrganR,
  orreryPoint,
} from "./orrery-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { showsOrreryRing } from "./view-role-clocks.js";

/**
 * THE ORRERY, drawn: a core in the middle column held inside three flattened
 * orbits of organs, **and two of the three are a lie on every screen**.
 *
 * The geometry is `orrery-shape.ts` and the corridor of light is
 * `orrery-shaft.ts`; this file is what the paint says.
 *
 * **Each seat sees one ring true that the other does not.** The outer is true
 * on both, the middle on the pilot's alone, the inner on the navigator's
 * (`showsOrreryRing`). A ring a seat cannot resolve is drawn with an organ in
 * *every* socket, in rock grey, so it is a rhythm with no hole in it — which
 * is honestly what an orbit you cannot make out looks like, and it means the
 * colour on this screen says exactly one thing: **violet is a ring you can
 * count, grey is a ring you have to be told about.**
 *
 * **Near and far are the other half of the reading.** Slot 0 is the bottom of
 * an orbit and the only slot a shot can pass, so the picture has to make the
 * near arc unmistakable: the far organs are drawn before the core and dimmed,
 * the near ones after it and at full strength, and the flattening puts three
 * rows between the two (`ORRERY_FLATTEN`). A gap at the top of a ring is a gap
 * behind the core, and it should look it.
 *
 * **Nothing here is held between frames.** Every number comes off the boss and
 * the beat, so there is no `Effects` field to clear and a restart cannot show
 * this fight the last one's orbits.
 */

/** Beats the flare of a ring coming off takes to go out. */
const BROKE_FADE = 1.6;

export function drawOrrery(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const core = orreryCorePoint(l, cfg);
  for (let ring = ORRERY_RINGS - 1; ring >= 0; ring--) drawOrbit(ctx, l, cfg, b, ring);
  drawOrgans(ctx, l, cfg, b, beat, beatPhase, core.y, false);
  drawOrreryShaft(ctx, l, cfg, b, beat, beatPhase);
  drawCore(ctx, l, cfg, b, beat, beatPhase, time);
  drawOrgans(ctx, l, cfg, b, beat, beatPhase, core.y, true);
  // Over the organs, because it is the pilot's *control* rather than part of
  // the body: a knurl behind an organ would be a handle you can see except
  // where you would put your thumb (`orrery-grab.ts`).
  drawOrreryGrip(ctx, l, cfg, b);
  drawBroke(ctx, l, cfg, b, beat, beatPhase);
}

/**
 * The thin line an orbit's organs sit on, or the wreck of one that is gone.
 *
 * A broken ring is not erased. Its orbit stays, dashed and nearly dark, and
 * the fight ends with the core hanging inside three of them — which is the
 * picture the design asks for by name, and the only record on screen of how
 * far the pair has got. A wave that erased each ring as it went would end on
 * an empty frame with a core in it.
 */
function drawOrbit(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  ring: number,
): void {
  const path = orreryOrbitPath(l, cfg, ring);
  if (orreryRingBroken(b, ring)) {
    ctx.save();
    ctx.setLineDash([l.tile * 0.1, l.tile * 0.16]);
    strokeGlow(ctx, path, PALETTE.rockDark, STROKE.inner, 0.7);
    ctx.restore();
    return;
  }
  strokeGlow(ctx, path, PALETTE.rock, STROKE.inner, showsOrreryRing(l.role, ring) ? 0.3 : 0.16);
}

/**
 * The organs of every ring still standing, on one side of the core or the
 * other.
 *
 * Called twice a frame — the far half, then the core, then the near half — so
 * that an organ behind the core is drawn behind it and not merely dimmer than
 * it. `near` decides which half this pass paints and nothing else.
 *
 * The gap is at the ring's own eased slot and the organs are the sockets after
 * it, so the whole ring turns together: on a screen that cannot resolve this
 * ring, the gap's socket is filled too, and every socket is drawn.
 */
function drawOrgans(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  beat: number,
  beatPhase: number,
  coreY: number,
  near: boolean,
): void {
  const r = orreryOrganR(l);
  for (let ring = ORRERY_RINGS - 1; ring >= 0; ring--) {
    if (orreryRingBroken(b, ring)) continue;
    const seen = showsOrreryRing(l.role, ring);
    const orbit = orreryOrbit(cfg, ring);
    const gap = orreryAt(cfg, b, ring, beat, beatPhase);
    for (let k = seen ? 1 : 0; k < orbit; k++) {
      const at = orreryPoint(l, cfg, ring, gap + k);
      if (at.y >= coreY !== near) continue;
      const body = new Path2D(circleSubpath(at.x, at.y, r));
      // Violet for a ring this seat can count, rock grey for one it cannot —
      // and the far half of either at about half strength, which is what the
      // depth is made of (`orrery-flesh.ts`).
      paintOrgan(ctx, body, at.x, at.y, r, seen ? PALETTE.wisp : PALETTE.rock, near, seen);
    }
  }
}

/**
 * The core, and it is the only red or cyan thing in the frame.
 *
 * That is the design's own composition and it earns its place: the whole fight
 * is grey machinery around one coloured statement, so the alignment is
 * literally the pair opening a line of sight to the only colour on screen. The
 * colour is the ammunition a shot has to carry, and it **changes every time a
 * ring comes off** — so a core that has just flipped is the one thing about
 * this boss neither of them has to be told.
 *
 * Naked, it swells on the beat: nothing is in the way any more and only the
 * lance will do, and a core that went on sitting there would not say which of
 * those two facts had changed. Going out, it collapses over the beats the
 * simulation is counting (`orreryOutBeats`).
 */
function drawCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  const { x, y } = orreryCorePoint(l, cfg);
  const hex = b.color === "red" ? PALETTE.red : PALETTE.cyan;
  const rim = b.color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const naked = b.broken >= ORRERY_RINGS;
  // The pulse is a beat wide whatever else is happening, so it can be counted
  // against the rings rather than compared with them.
  const pulse = naked ? 1 - Math.min(1, beatPhase) : 0;
  const out = b.phase === "out" ? Math.min(1, (beat - b.phaseBeat + beatPhase) / dying(cfg)) : 0;
  const r = l.tile * (0.46 + 0.07 * pulse) * (1 - 0.8 * out);
  if (r <= 0) return;
  const body = splinePath(blobPoints(x, y, r, r * 0.9, 3, 0.14, 0.05, time * 0.5, 11, 28), true);
  paintCore(ctx, body, x, y, r, l.tile, hex, rim, (naked ? 1 : 0.7) * (1 - out), pulse);
}

/** Beats the going out takes, never nought — the picture divides by it. */
function dying(cfg: SimConfig): number {
  return Math.max(1, cfg.orreryOutBeats);
}

/**
 * The flare a ring wears on the beat it comes off, along its own orbit.
 *
 * Both screens draw it whichever seat could resolve that ring, and that is the
 * point: a break is the one fact about this boss neither player has to be told
 * by the other, so it is the pair's receipt for a beat they agreed on out loud
 * — including the beat the navigator called and the pilot could not check.
 */
function drawBroke(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  b: OrreryState,
  beat: number,
  beatPhase: number,
): void {
  if (b.brokeBeat === -1 || b.broken === 0) return;
  const since = beat - b.brokeBeat + beatPhase;
  if (since < 0 || since >= BROKE_FADE) return;
  const path = orreryOrbitPath(l, cfg, b.broken - 1);
  strokeGlow(ctx, path, PALETTE.wispRim, STROKE.outline, 0.8, 1 - since / BROKE_FADE);
}
