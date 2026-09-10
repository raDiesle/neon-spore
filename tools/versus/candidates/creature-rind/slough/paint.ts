import { KEY } from "../../../../../packages/content/src/light.js";
import { halo } from "../../../../../packages/render/src/glow.js";
import { mixHex, rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { RindShed } from "../../../../../packages/render/src/rind-look.js";
import { drawCrush } from "../../../../../packages/render/src/rind-skin.js";

/**
 * SLOUGH — the skin drops off the body whole, like a sock: it falls under its
 * own weight, stretches long and narrow as it goes, gathers at the top into
 * a mouth that shows the dark inside, and fades as it slides away below.
 *
 * The shipped husk goes *outward*, evenly, in every direction at once, which
 * is what light does and not what a skin does. A skin that has just come off
 * a body is a bag with nothing in it, and a bag falls. So this is the worn
 * contour again, filled and translucent, dropped under gravity — slow to
 * start and still gathering speed at the end — and
 * stretched as it falls: longer, because an empty skin hangs, and narrower,
 * because it has nothing to hold it open. The top of the bag, where the body
 * left it, is drawn as a mouth: an ellipse of the cool inside colour, ringed
 * in the rim, narrowing as the skin gathers. Three folds run down from it,
 * because a skin with nothing in it creases. The light on it is one gradient
 * along `KEY`, so it has a lit side and a dark side like everything else on
 * the field. The crush stays exactly as it ships.
 */

/** How far the bag falls over its life, in the size it came off at. */
const FALL = 1.35;
/** How much longer and how much narrower it is at the end than at the start. */
const STRETCH = 0.55;
const PINCH = 0.4;
/** The mouth: how tall it stands, and how far it shuts. */
const MOUTH = 0.32;
const GATHER = 0.6;
const FOLDS = 3;
/** A shadow is cool and never black — `docs/style-guide.md`. */
const SHADOW = "#0B1024";

export function slough(s: RindShed): void {
  const { ctx, x, y, path, unit, hex, rim, t, was } = s;
  drawCrush(s);
  const alpha = (1 - t) ** 1.4;
  // Gravity, with a push: a skin just cut loose is already moving, so the
  // drop is between linear and squared — clear of the body by a third of the
  // life, and still gathering speed at the end.
  const drop = was * FALL * t ** 1.5;
  const sy = 1 + STRETCH * t;
  const sx = 1 - PINCH * t;
  const cy = y + drop + was * (sy - 1) * 0.5;
  const scale = was / unit;

  // The bloom sits where the bag is, not where the body is.
  const step = Math.max(2, was * 0.25);
  halo(ctx, x, cy, Math.round((was * 0.8) / step) * step, hex, alpha * 0.3);

  ctx.save();
  ctx.translate(x, cy);
  ctx.scale(sx * scale, sy * scale);
  // The skin as a bag: filled with its own colour thinly, lit along the key so
  // the side toward the light is brighter than the side away from it.
  const g = ctx.createLinearGradient(KEY.x * unit, KEY.y * unit, -KEY.x * unit, -KEY.y * unit);
  g.addColorStop(0, rgba(mixHex(hex, rim, 0.4), 0.55));
  g.addColorStop(0.55, rgba(hex, 0.4));
  g.addColorStop(1, rgba(mixHex(hex, SHADOW, 0.5), 0.45));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = rim;
  ctx.lineWidth = Math.max(0.6, was * 0.05) / scale;
  ctx.stroke(path);

  // The folds: creases running down from the mouth, drawn in the shadow tone.
  // They lengthen as the bag stretches, because that is what the stretch is.
  ctx.strokeStyle = rgba(SHADOW, 0.4);
  ctx.lineWidth = Math.max(0.5, was * 0.035) / scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  for (let i = 0; i < FOLDS; i++) {
    const fx = ((i - (FOLDS - 1) / 2) / FOLDS) * unit * 0.9;
    ctx.moveTo(fx * 0.35, -unit * 0.75);
    ctx.quadraticCurveTo(fx * 1.1, -unit * 0.1, fx * 0.8, unit * (0.2 + 0.55 * t));
  }
  ctx.stroke();
  ctx.restore();

  // The mouth, at the top of the bag where the body left it: the dark inside,
  // rimmed, gathering shut as the skin drops away.
  const mw = was * sx * 0.7 * (1 - GATHER * t);
  const mh = was * MOUTH * (1 - GATHER * t * 0.6);
  const my = cy - was * sy * 0.8;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.ellipse(x, my, Math.max(0.5, mw), Math.max(0.5, mh), 0, 0, Math.PI * 2);
  ctx.fillStyle = rgba(mixHex(hex, SHADOW, 0.7), 0.7);
  ctx.fill();
  ctx.strokeStyle = rgba(mixHex(rim, PALETTE.text, 0.2), 0.7);
  ctx.lineWidth = Math.max(0.6, was * 0.04);
  ctx.stroke();
  ctx.restore();
}
