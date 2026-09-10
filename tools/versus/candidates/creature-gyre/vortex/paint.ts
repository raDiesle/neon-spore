import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { gyreSkinPath } from "../../../../../packages/render/src/gyre-core.js";
import type { GyreCoreDraw } from "../../../../../packages/render/src/gyre-look.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";

/**
 * VORTEX, drawn: the organelle is a throat, not a ball.
 *
 * The fluid inside the membrane is seen from above and a little in front, and
 * it goes *down*: five terraces, each deeper than the last, each one darker,
 * each one drawn higher on the picture than the one outside it because a
 * viewer looking down into a funnel sees its far wall. Three arms of light
 * spiral down the terraces at the wheel's true rate and faster as they get
 * deeper, which is what fluid going down a hole does and what a pattern going
 * round a disc never does. The nucleus sits at the bottom of the throat.
 *
 * The depth cue is the funnel's own asymmetry: an arm on the far wall is seen
 * face-on and bright, and the same arm a half turn later is on the near wall,
 * foreshortened and dimmed by the lip in front of it. That is one period of
 * brightness per turn laid over the arms' own three-fold pattern — two periods,
 * which a flat spiral cannot produce at any setting (`docs/dimensional.md`).
 */

/** How many terraces the throat is cut in, and how far the innermost one has
 * dropped, as a share of the organelle's radius. */
const TERRACES = 5;
const DROP = 0.3;

/** The terraces seen at an angle: how far an ellipse across the throat is
 * flattened. Under one, because a circle seen square-on is a disc again. */
const TILT = 0.56;

/** A shadow is cool and never black (`.claude/skills/depth`). */
const SHADOW = "#0B1024";

/** How much of the membrane the mouth of the throat fills, and how narrow the
 * bottom of it is. */
const MOUTH = 0.9;
const THROAT = 0.2;

/** How many arms of light go down, and how many extra turns the bottom of an
 * arm has made over the top of it. */
const ARMS = 3;
const TWIST = 1.6;

/** Points along one arm. */
const STEPS = 14;

/**
 * Where a point on the throat's wall lands on the picture: `t` is depth, 0 at
 * the mouth and 1 at the bottom; `a` is its bearing round the axis. Deeper is
 * narrower, flatter and higher up the picture.
 *
 * Not `facet` (`packages/content/src/surface.ts`), on purpose: that is a
 * sphere turning about a vertical axis seen square from the side, and a
 * funnel is a surface of revolution about an axis pointing *at* the viewer
 * and tipped away, which is a different projection. `near` plays `lit`'s
 * part — the far wall is the one seen face on.
 */
function wall(r: number, t: number, a: number): { x: number; y: number; near: number } {
  const rho = r * (MOUTH - (MOUTH - THROAT) * t);
  const sinA = Math.sin(a);
  return {
    x: Math.cos(a) * rho,
    y: sinA * rho * TILT - t * r * DROP,
    // 1 on the far wall, seen face on; 0 on the near wall, behind the lip.
    near: 0.5 - 0.5 * sinA,
  };
}

export function vortex(d: GyreCoreDraw): void {
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

  // The terraces, outermost first, and **not** in added light: the mouth is
  // the fluid's lit surface, and every terrace inside it is a step down into
  // shadow, painted in the shadow colour over what is outside it. A hole
  // drawn in added light is a lamp; a hole is dark at the bottom.
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < TERRACES; i++) {
    const t = i / (TERRACES - 1);
    const rho = r * (MOUTH - (MOUTH - THROAT) * t);
    ctx.beginPath();
    ctx.ellipse(0, -t * r * DROP, rho, rho * TILT, 0, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? rgba(tint, 0.5 + 0.12 * pull) : rgba(SHADOW, 0.32);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "lighter";
  // The lip of each terrace: the far edge catches the light and the near
  // edge is the underside of a step, which is what a hole seen from above
  // looks like — and the one thing that separates these from a target.
  for (let i = 0; i < TERRACES; i++) {
    const t = i / (TERRACES - 1);
    const rho = r * (MOUTH - (MOUTH - THROAT) * t);
    ctx.beginPath();
    ctx.ellipse(0, -t * r * DROP, rho, rho * TILT, 0, Math.PI * 1.1, Math.PI * 1.9);
    ctx.strokeStyle = rgba(rim, 0.3 * (1 - 0.6 * t));
    ctx.lineWidth = STROKE.inner * (i === 0 ? 1.4 : 0.9);
    ctx.stroke();
  }

  // The arms, going down the wall and speeding up as they go — the wheel's own
  // rate at the mouth, and `TWIST` extra turns by the bottom. Plain strokes,
  // one per step: each step has its own brightness, and a glow on each would
  // pile up into one white smear at the size a core is drawn.
  ctx.lineCap = "round";
  for (let k = 0; k < ARMS; k++) {
    const base = flow + (k * Math.PI * 2) / ARMS;
    let prev = wall(r, 0, base);
    for (let i = 1; i <= STEPS; i++) {
      const t = i / STEPS;
      const p = wall(r, t, base + t * t * TWIST * Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = rgba(rim, (0.4 + 0.6 * p.near) * (1 - 0.4 * t) * (0.8 + 0.2 * pull));
      ctx.lineWidth = STROKE.inner * (2.2 - 1.2 * t);
      ctx.stroke();
      prev = p;
    }
  }

  // The specular, stationary on the surface of the fluid at the mouth: it is
  // the one mark here that does not go round, and the one that says the mouth
  // is a wet surface rather than a ring.
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.2, r * 0.22, r * 0.09, -0.35, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.text, 0.2);
  ctx.fill();
  ctx.restore();

  // The membrane over the throat, turned with the wheel — the shipped pass.
  ctx.globalAlpha = 0.9;
  ctx.rotate(flow);
  strokeGlow(ctx, skin, tint, STROKE.inner, 1.4 + pull);
  ctx.restore();

  // The nucleus at the bottom of the throat: smaller than the shipped one and
  // drawn where the terraces end, so it reads as the thing everything is
  // being drawn down toward.
  ctx.globalAlpha = 1;
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.arc(x, y - r * DROP, r * 0.13 * (1 + 0.08 * Math.sin(time * 2.2)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
