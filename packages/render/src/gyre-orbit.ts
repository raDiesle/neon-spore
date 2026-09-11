import { halo, strokeGlow } from "./glow.js";
import { gyreMass, gyreSkinPath, gyreSpecular } from "./gyre-core.js";
import type { GyreCoreDraw } from "./gyre-look.js";
import { STROKE } from "./palette.js";

/**
 * ORBIT, drawn: one band of light girdles the ball at a tilt, and the ball is
 * in the way of half of it.
 *
 * The strongest cue a picture has that a thing is round is another thing
 * going *behind* it. So the marks suspended in the fluid are not granules but
 * one continuous ring — a great circle of the ball tipped off the equator,
 * carried round by the wheel's true rate — and it is drawn in two halves: the
 * far arc first, dim and thin, seen *through* the translucent mass, and the
 * near arc last, bright and wide, over the mass and over the nucleus. Where
 * the ring crosses the limb the two meet and the width goes from one to the
 * other, which is the fold `docs/dimensional.md` calls a reveal: the far half
 * comes round into view and the near half goes behind, once per turn, and
 * nothing posed on a plane can do that.
 *
 * The turn is `surface.ts`'s — a rotation about the vertical axis — written
 * out here for a *curve* rather than a point because `facet` places a mark
 * at one longitude and this is every longitude at once. The tilt is the only
 * number the projection adds.
 */

/** How far off the equator the band is tipped, in radians. A ring turning
 * about the vertical goes edge-on twice a turn whatever its tilt — that is
 * the swap — and the tilt is how open it is between: at this figure it is
 * seen nearly face on at its widest, and a line for only a moment. */
const TILT = 1.05;

/** The ring's radius as a share of the mass's, and how many points it is
 * walked in. */
const REACH = 0.74;
const POINTS = 40;

/** How thick the ring is on the near side, in strokes, and what the far side
 * keeps of that: the mass is translucent, not clear, so the far half shows
 * but shows less. */
const NEAR_WIDTH = 1.5;
const FAR_KEEP = 0.45;

/** A second, fainter band tipped the other way and turning at a different
 * speed, so the two never repeat together. */
const SECOND_RATE = 0.63;

/** A point on a great circle tipped by `tilt`, turned by `theta` about the
 * vertical, as its picture position and how far toward the viewer it is. */
function on(u: number, tilt: number, theta: number): { x: number; y: number; z: number } {
  const cx = Math.cos(u);
  const sy = Math.sin(u) * Math.sin(tilt);
  const cz = Math.sin(u) * Math.cos(tilt);
  return {
    x: cx * Math.cos(theta) + cz * Math.sin(theta),
    y: sy,
    z: -cx * Math.sin(theta) + cz * Math.cos(theta),
  };
}

/** One band, in two passes: `far` draws the half turned away, `near` the half
 * facing. Each run of points on one side is one stroke, so the line breaks
 * exactly at the limb. */
function band(
  ctx: CanvasRenderingContext2D,
  r: number,
  hex: string,
  tilt: number,
  theta: number,
  strength: number,
  nearSide: boolean,
): void {
  let run: Path2D | null = null;
  let last = { x: 0, y: 0, z: 0 };
  const flush = (): void => {
    if (run === null) return;
    const width = STROKE.inner * (nearSide ? NEAR_WIDTH : NEAR_WIDTH * FAR_KEEP);
    ctx.globalAlpha = strength * (nearSide ? 1 : FAR_KEEP);
    strokeGlow(ctx, run, hex, width, nearSide ? 0.45 : 0.25);
    run = null;
  };
  for (let i = 0; i <= POINTS; i++) {
    const p = on((i / POINTS) * Math.PI * 2, tilt, theta);
    const here = nearSide ? p.z >= 0 : p.z < 0;
    if (!here) {
      flush();
      last = p;
      continue;
    }
    if (run === null) {
      run = new Path2D();
      // Start on the limb rather than at the first point past it, so the two
      // halves meet instead of leaving a gap where the ring folds.
      run.moveTo(last.x * r, last.y * r);
    }
    run.lineTo(p.x * r, p.y * r);
    last = p;
  }
  flush();
  ctx.globalAlpha = 1;
}

export function orbit(d: GyreCoreDraw): void {
  const { ctx, x, y, r, tint, rim, flow, time, pull } = d;

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // The aura, the shipped pass.
  halo(ctx, x, y, r * (2.4 + pull * 0.9), tint, 0.13 + 0.16 * pull);

  ctx.save();
  ctx.translate(x, y);
  const skin = gyreSkinPath(r, time);
  ctx.save();
  ctx.rotate(flow);
  ctx.clip(skin);
  ctx.rotate(-flow);

  const reach = r * REACH;
  const second = flow * SECOND_RATE;

  // The far halves, under the mass: the ball is between them and the viewer.
  band(ctx, reach, rim, TILT, flow, 0.5 + 0.2 * pull, false);
  band(ctx, reach * 0.86, tint, -TILT * 0.7, second, 0.35, false);

  // The mass, the shipped one — a ball lit by a light that does not turn.
  gyreMass(ctx, r, tint, pull);

  // The nucleus, inside the mass and behind the near arc, so the arc is seen
  // to pass in front of something and not only over a gradient.
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(-r * 0.06, -r * 0.06, r * 0.17 * (1 + 0.08 * Math.sin(time * 2.2)), 0, Math.PI * 2);
  ctx.fill();

  // The near halves, over everything.
  band(ctx, reach * 0.86, tint, -TILT * 0.7, second, 0.35, true);
  band(ctx, reach, rim, TILT, flow, 0.5 + 0.2 * pull, true);

  gyreSpecular(ctx, r);
  ctx.restore();

  // The membrane over its contents, turned with the wheel — the shipped pass.
  ctx.globalAlpha = 0.9;
  ctx.rotate(flow);
  strokeGlow(ctx, skin, tint, STROKE.inner, 1.4 + pull);
  ctx.restore();
  ctx.restore();

  // A touch of the ring's own light where it is nearest, outside the clip: the
  // one place the band is allowed to say it is brighter than the skin.
  const crest = on(Math.PI / 2, TILT, flow);
  if (crest.z > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    halo(ctx, x + crest.x * reach, y + crest.y * reach, r * 0.5, rim, 0.18 * crest.z);
    ctx.restore();
  }
}
