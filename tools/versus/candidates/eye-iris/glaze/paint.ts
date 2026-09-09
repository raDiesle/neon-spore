import { KEY } from "../../../../../packages/content/src/index.js";
import { drawIrisMarks, type IrisDraw } from "../../../../../packages/render/src/eye-iris.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * The paint GLAZE is made of.
 *
 * Nothing here draws an iris and nothing here moves one: `drawIrisMarks` is
 * the shipped assembly, called at the middle of the gap exactly where the game
 * puts it today, so the ring, the six spokes and the hole are unmoved and
 * unchanged. What this file adds is the *ball they are painted on* — a wash
 * that is bright toward the key and cool away from it, and one wet point over
 * the top of everything.
 *
 * **The socket's own frame, and that is where the two ends of this argument
 * meet.** `rx` and `ry` are on `IrisDraw` because a look may need to know
 * whether it is drawing on THE WARDEN's round hole or THE LID's almond, and
 * this is the look that needs it: every mark below is laid out in a frame
 * squashed by `ry / rx`, so the dome is the shape of the socket rather than a
 * circle pasted into it, and the highlight sits on the socket's curve rather
 * than on the aperture's.
 *
 * **No clock of its own.** The wash and the highlight are decided by `KEY`,
 * which does not move, and by `pr`, which is the pupil the game is already
 * breathing. Nothing here reads `t` except through the marks it hands to the
 * shipped function. That is deliberate and it is half the argument: the pair
 * are counting beats out loud, and a second thing turning on a screen they are
 * reading a column and a colour off is a cost, not a feature.
 */

/** Where the dome's bright side sits, as a share of the aperture's half-width,
 * along `KEY`. Well inside the rim: a highlight *on* the edge reads as the
 * edge being lit, which is the failure `docs/dimensional.md` names — a light
 * that follows the outline instead of falling on the surface. */
const DOME_AT = 0.5;

/** How far the wash reaches from that point before it is all shade. Larger
 * than the aperture, because a ball is lit across its whole face and only a
 * sticker has an edge. */
const DOME_R = 1.5;

/** How much of the eye's own colour the lit side takes, and how much of the
 * background the far side does. The shade is the smaller of the two on
 * purpose: this is a wet eye catching a light, not a body half in the dark. */
const DOME = 0.4;
const SHADE = 0.34;

/** The wet point: where it sits along `KEY` as a share of the half-width, how
 * wide it is, and how bright. Tighter and nearer the rim than the dome, which
 * is what makes the two read as a surface and a reflection rather than as one
 * blur. */
const WET_AT = 0.62;
const WET_R = 0.26;
const WET = 0.6;

/**
 * How much the wet point swells with the eye's own breath.
 *
 * Read off `pr`, never restated: the pupil's pulse is `eye-lens.ts`'s rule and
 * a second copy of its frequency here would be exactly the drift the COPIES
 * sweep exists to catch. `pr / reach` *is* that pulse, already computed by the
 * caller, so the highlight tightens and swells with the hole at the middle of
 * the eye and there is only ever one clock in the picture.
 */
const BREATH = 0.9;

export function glaze(d: IrisDraw): void {
  const { ctx, cx, cy, pr, reach, rx, ry, ink, openness, t } = d;
  if (pr <= 0 || openness <= 0) return;

  const squash = ry / rx;
  const lx = KEY.x * reach * DOME_AT;
  const ly = KEY.y * reach * DOME_AT;

  // **The dome.** One wash across the whole opening, in the socket's own
  // squashed frame: the eye's colour where the light is, falling through
  // nothing to the cool ground at the far rim. It is drawn *under* the
  // machinery, so the ring, the spokes and the hole keep the exact values the
  // game gives them and the colour the pair reads off this body is untouched.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, squash);
  const dome = ctx.createRadialGradient(lx, ly, 0, lx, ly, reach * DOME_R);
  dome.addColorStop(0, rgba(ink.rim, DOME * openness));
  dome.addColorStop(0.45, rgba(ink.hex, DOME * 0.35 * openness));
  dome.addColorStop(1, rgba(PALETTE.background, SHADE * openness));
  ctx.fillStyle = dome;
  ctx.fillRect(-reach * 1.6, -reach * 1.6, reach * 3.2, reach * 3.2);
  ctx.restore();

  // The machinery, dead centre, untouched. The pupil stays where player 2
  // reads a column off it, which is the whole conservative half of this
  // answer.
  drawIrisMarks(ctx, cx, cy, pr, ink, openness, t);

  // **The wet point, over everything.** A film has one bright reflection, it
  // is where the light is, and it does not go anywhere. What it *does* do is
  // breathe with the pupil — the one motion this eye already has — so a wide
  // open eye is never a still picture even though nothing in it travels.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, squash);
  ctx.globalCompositeOperation = "lighter";
  const wx = KEY.x * reach * WET_AT;
  const wy = KEY.y * reach * WET_AT;
  const r = reach * WET_R * (1 + BREATH * (pr / reach));
  const spot = ctx.createRadialGradient(wx, wy, 0, wx, wy, r);
  spot.addColorStop(0, rgba(PALETTE.text, WET * openness));
  spot.addColorStop(1, rgba(PALETTE.text, 0));
  ctx.fillStyle = spot;
  ctx.fillRect(-reach * 1.6, -reach * 1.6, reach * 3.2, reach * 3.2);
  ctx.restore();
}
