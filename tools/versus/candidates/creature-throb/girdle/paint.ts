import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { drawDetails } from "../../../../../packages/render/src/creature-detail.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { farRegion, seamAt } from "../../../../../packages/render/src/throb.js";
import type { ThrobHalf } from "../../../../../packages/render/src/throb-look.js";

/**
 * GIRDLE — the cut between the two colours is a ridge with a thickness, and
 * the far half is a lit dome rather than a flat pool of its colour.
 *
 * Two things, both about the seam. The far half is filled with a gradient
 * whose bright centre stands toward the key and whose edge falls to a cool
 * dark, so the painted hemisphere bulges instead of lying flat under the
 * light pass. And the meridian is drawn three times: a shadow line offset
 * away from the key, a lit line offset toward it, and the mixed hue between
 * — a raised welt round the ball, WELT off the shapes page, which catches the
 * light on one flank and casts none on the other. Both offsets are in
 * screen space, so as the ball turns the ridge's lit flank stays where the
 * light is while the ridge itself swings from a line to the limb and back.
 * The interior marks and the light pass are the shipped ones.
 */

/** How far the ridge's two flanks stand off its line, in line widths. */
const FLANK = 0.9;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function girdle(h: ThrobHalf): void {
  const { ctx, body, rx, ry, isBulb, tint, seamHue, lw, turn, rot } = h;
  const { half, side } = seamAt(turn, rx);
  const far = farRegion(half, side, rx, ry);
  const squash = Math.max(0.18, Math.abs(half) / rx);
  // The key's own direction in the body's frame: screen space turned back
  // through the whole rotation the context carries.
  const kx = Math.cos(-rot) * KEY.x - Math.sin(-rot) * KEY.y;
  const ky = Math.sin(-rot) * KEY.x + Math.cos(-rot) * KEY.y;

  ctx.save();
  ctx.rotate(-turn);
  ctx.clip(far);
  ctx.rotate(turn);
  // The dome: its bright centre toward the key, which is fixed on the screen
  // and so is turned back through everything the context carries before it
  // is used — the same argument `key-light.ts` makes with `spin`.
  const r = Math.max(rx, ry);
  const dome = ctx.createRadialGradient(kx * r * 0.35, ky * r * 0.35, 0, 0, 0, r * 1.05);
  dome.addColorStop(0, mixHex(tint.dark, tint.hex, 0.55));
  dome.addColorStop(0.55, tint.dark);
  dome.addColorStop(1, mixHex(tint.dark, SHADOW, 0.6));
  ctx.fillStyle = dome;
  ctx.fill(body);
  strokeGlow(ctx, body, tint.hex, lw, 1);
  ctx.rotate(-turn);
  ctx.scale(squash, 1);
  drawDetails(ctx, isBulb ? "bulb" : "slick", {
    hex: tint.hex,
    rim: tint.rim,
    dark: tint.dark,
    rx,
    ry,
    rot: 0,
    t: 0,
  });
  ctx.restore();

  // The ridge. Three strokes of the one meridian: the shadow flank away from
  // the key, the lit flank toward it, the seam's own hue between them.
  ctx.save();
  ctx.clip(body);
  ctx.rotate(-turn);
  const meridian = new Path2D();
  meridian.ellipse(0, 0, Math.max(0.5, Math.abs(half)), ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  // The flanks are offsets in *screen* space; this frame is the body's less
  // the turn, so the key is turned back by the lean alone.
  const lean = rot - turn;
  const fx = Math.cos(-lean) * KEY.x - Math.sin(-lean) * KEY.y;
  const fy = Math.sin(-lean) * KEY.x + Math.cos(-lean) * KEY.y;
  ctx.lineWidth = lw * 1.2;
  ctx.save();
  ctx.translate(-fx * lw * FLANK, -fy * lw * FLANK);
  ctx.strokeStyle = rgba(SHADOW, 0.75);
  ctx.stroke(meridian);
  ctx.restore();
  ctx.save();
  ctx.translate(fx * lw * FLANK, fy * lw * FLANK);
  ctx.strokeStyle = rgba(PALETTE.text, 0.55);
  ctx.stroke(meridian);
  ctx.restore();
  ctx.strokeStyle = seamHue;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(meridian);
  ctx.restore();

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature, rot);
  ctx.restore();
}
