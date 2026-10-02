import { facet, KEY, LIGHT_HALF, pin, surfaceDim } from "@neon-spore/content";
import { drawIrisMarks } from "./eye-iris.js";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE, STROKE } from "./palette.js";
import type { StareEyeLook } from "./stare-eye-look.js";
import {
  APERTURE_LON,
  aperturePath,
  type Globe,
  gapMiddle,
  globePath,
  hairPath,
  lidBottom,
  lidTop,
} from "./stare-globe.js";
import { stareHeat } from "./stare-shape.js";

/**
 * **THE STARE's eye as a ball that turns**, where the game used to squash a
 * flat eye to a sliver and shear it. The ball's outline never changes; the opening,
 * the iris and the lashes are placed on it and carried round, so an eye that
 * looks away is a dark lit globe with its opening folded against the right
 * limb, and the seven beats of the tell bring that opening round to face the
 * pair — the far lashes coming out from behind, the iris foreshortened to an
 * edge and widening to a disc, and the lit shoulder and the wet point staying
 * where the light is while the surface travels under them.
 *
 * **It turns one way, always.** Which seat the eye will watch is told to one
 * screen only (`sim/stare.ts`), so a turn toward a side would tell both.
 *
 * Read off the same `face`, `open` and `lean` as the flat eye was, and
 * nothing new: `face` becomes an angle through `stareHeat`, and `lean` turns
 * the ball further only while it faces the pair. While it turns, the lean was
 * the sliver's shear, the stand-in for exactly this turn, and the ball already
 * draws it. Once it is square the lean is the hurt shudder (`stareFace`), and
 * a struck eye rattles in its socket, which `docs/spec/bosses.md` says it does.
 */

/** The ball against the shipped socket: a little wider, and tall enough to hold the opening. */
const GLOBE_X = 1.15;
const GLOBE_Y = 1.25;
/** How far round the eye stands while it looks elsewhere, in radians. */
const AWAY = 1.25;
/** The pupil against the opening's half-width, and its breath on the beat. */
const PUPIL = 0.3;
/** What a mark on the far side keeps of its colour in full shadow (`surfaceDim`). */
const DIM = 0.5;
/** The iris's home: straight ahead, on the equator. */
const HOME = pin(0, 0, 1);

export function paintGlobe(
  ctx: CanvasRenderingContext2D,
  { e, face, lean, open, ink, time, beats }: StareEyeLook,
): void {
  const heat = stareHeat({ face, open, lean });
  const g: Globe = {
    cx: e.cx,
    cy: e.cy,
    rx: e.rx * GLOBE_X,
    ry: e.ry * GLOBE_Y,
    theta: AWAY * (1 - heat) + (face >= 1 ? lean : 0),
  };
  const ball = globePath(g);

  // The wash the ball stands in, and the ball, lit by the one key light.
  halo(ctx, g.cx, g.cy, g.rx * 1.9, PALETTE.eyeFluid, 0.1 + 0.14 * open);
  ctx.save();
  ctx.fillStyle = mixHex(PALETTE.background, ink.hex, 0.3);
  ctx.fill(ball);
  ctx.clip(ball);
  ctx.translate(g.cx, g.cy);
  ctx.scale(1, g.ry / g.rx);
  litRound(ctx, 0, 0, g.rx + 2, LIGHT_HALF.rock);
  ctx.restore();
  strokeGlow(ctx, globePath(g, 1.06), PALETTE.eyeFluidRim, STROKE.inner, 0.3 + 0.3 * open);

  // The opening, dimmed as it turns off the light.
  const at = facet(HOME, g.theta);
  const lit = surfaceDim(DIM, at.lit);
  const gap = aperturePath(g, open);
  ctx.save();
  ctx.fillStyle = ink.hex;
  ctx.globalAlpha = (0.5 + 0.45 * open) * lit;
  ctx.fill(gap);
  ctx.restore();

  // The iris, placed on the ball and foreshortened by the tangent plane's own
  // map, under the opening's clip so the lids cut it.
  const w = g.rx * Math.sin(APERTURE_LON);
  const pr = w * PUPIL * (0.85 + 0.15 * Math.sin(beats * Math.PI * 2));
  if (at.near) {
    ctx.save();
    ctx.clip(gap);
    ctx.translate(g.cx + g.rx * at.x, g.cy + g.ry * Math.sin(gapMiddle(0, open)));
    ctx.scale(at.sx, at.sy);
    ctx.globalAlpha = lit;
    drawIrisMarks(ctx, 0, 0, pr, ink, open, beats);
    ctx.restore();
  }
  strokeGlow(ctx, gap, ink.rim, STROKE.inner, (0.8 + 0.6 * open) * lit);

  // Lashes off the upper lid and cilia off the lower, rooted on the ball.
  const lashes = hairPath(
    g,
    7,
    (u) => lidTop(u, open) - 0.05,
    (i) => -(i % 2 === 0 ? 0.3 : 0.2) * (1 + open * 0.25),
    (i) => Math.sin(time * 1.6 + i * 2.1) * 0.04,
  );
  strokeGlow(ctx, lashes, ink.rim, STROKE.inner * 1.2, (0.5 + open * 0.7) * lit);
  const cilia = hairPath(
    g,
    13,
    (u) => lidBottom(u, open) + 0.04,
    () => 0.1 * (1 + open * 0.15),
    (i) => Math.sin(time * 2.3 + i * 1.3) * 0.02,
  );
  strokeGlow(ctx, cilia, ink.hex, STROKE.inner * 0.6, (0.35 + open * 0.4) * lit);

  // The wet point, where the light is, and it does not turn with the ball.
  halo(ctx, g.cx + KEY.x * g.rx * 0.5, g.cy + KEY.y * g.ry * 0.5, g.rx * 0.2, PALETTE.text, 0.55);
  strokeGlow(ctx, ball, ink.rim, STROKE.outline, 0.3 + 0.5 * open);
}
