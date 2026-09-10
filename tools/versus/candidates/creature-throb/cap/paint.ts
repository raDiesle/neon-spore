import { KEY, LIGHT_HALF } from "../../../../../packages/content/src/light.js";
import { drawDetails } from "../../../../../packages/render/src/creature-detail.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { litRound } from "../../../../../packages/render/src/key-light.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { farRegion, seamAt } from "../../../../../packages/render/src/throb.js";
import type { ThrobHalf } from "../../../../../packages/render/src/throb-look.js";

/**
 * CAP — the far colour is a shell: a cap with a thickness sitting on the
 * body, and where it ends you see its cut edge.
 *
 * The shipped half is paint on the ball, and paint has no edge. This makes
 * the far half a cap standing a little proud of the body — PLATE off the
 * shapes page, cut to the body's own contour as a second border rather than
 * a ring round it — and draws the **wall** where the cap stops: a crescent of
 * the cap's own dark material along the meridian, on the near-colour side,
 * as wide as the cap is thick times how squarely the cut face is turned to
 * us. That width is the claim. The cut face is edge-on when the meridian runs
 * down the middle and faces us when the meridian has swung out to the limb,
 * so the wall swells from nothing to its full thickness and back twice a
 * revolution — a thing a coin cannot do and a ball with a shell on it must.
 * The wall takes a lit line on the flank toward the key. The interior marks
 * and the light pass are the shipped ones.
 */

/** How far the cap stands proud of the body, as a share of its size. */
const PROUD = 0.08;
/** How thick the cap is, in line widths — what the wall shows at its widest. */
const THICK = 2.6;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function cap(h: ThrobHalf): void {
  const { ctx, body, rx, ry, isBulb, tint, seamHue, lw, turn, rot } = h;
  const { half, side } = seamAt(turn, rx);
  const far = farRegion(half, side, rx, ry);
  const squash = Math.max(0.18, Math.abs(half) / rx);
  // How squarely the cut face is turned to us: nothing when the meridian is
  // edge-on down the middle, all of it at the limb.
  const facing = Math.abs(half) / rx;

  ctx.save();
  ctx.rotate(-turn);
  ctx.clip(far);
  ctx.rotate(turn);
  // The cap: the body's own contour a little larger, so it stands proud of
  // the near half by a visible lip.
  ctx.save();
  ctx.scale(1 + PROUD, 1 + PROUD);
  ctx.fillStyle = tint.dark;
  ctx.fill(body);
  strokeGlow(ctx, body, tint.hex, lw / (1 + PROUD), 1);
  ctx.restore();
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

  // The wall: the cap's cut edge, a crescent between the meridian and the
  // same meridian moved toward the near half by the thickness the turn shows.
  ctx.save();
  ctx.clip(body);
  ctx.rotate(-turn);
  const w = lw * THICK * facing;
  const inner = Math.max(0.5, Math.abs(half));
  const wall = new Path2D();
  wall.ellipse(0, 0, inner, ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  wall.ellipse(-side * w, 0, inner, ry, 0, Math.PI / 2, -Math.PI / 2, !(half < 0));
  wall.closePath();
  ctx.fillStyle = mixHex(tint.dark, SHADOW, 0.45);
  ctx.fill(wall);
  // The wall's lit line, on its flank toward the key. Screen space, so the
  // key is turned back by the lean this frame still carries.
  const lean = rot - turn;
  const fx = Math.cos(-lean) * KEY.x - Math.sin(-lean) * KEY.y;
  // Only the flank that faces the light takes it: the near-colour side of the
  // wall is the one the key reaches when the key stands on that side.
  if (-side * fx > 0.2 && w > 0.6) {
    const lit = new Path2D();
    lit.ellipse(-side * w, 0, inner, ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
    ctx.strokeStyle = rgba(PALETTE.text, 0.5 * facing);
    ctx.lineWidth = lw * 0.7;
    ctx.stroke(lit);
  }
  // The seam itself, on the cap's own edge.
  const meridian = new Path2D();
  meridian.ellipse(0, 0, inner, ry, 0, -Math.PI / 2, Math.PI / 2, half < 0);
  ctx.strokeStyle = seamHue;
  ctx.lineWidth = lw * 1.4;
  ctx.stroke(meridian);
  ctx.restore();

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, Math.max(rx, ry), LIGHT_HALF.creature, rot);
  ctx.restore();
}
