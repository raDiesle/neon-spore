import { facet, LAT_LIMIT, LIGHT_HALF, pin, surfaceDim } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { litRound } from "./key-light.js";
import { PALETTE } from "./palette.js";
import { farSide, rimWedge } from "./throb.js";
import type { ThrobHalf } from "./throb-look.js";

/**
 * PORES — the owner's words, 20 September 2026: *it will never have the
 * colour of a slick or a bulb in the middle … remove this line in the middle
 * of rotation. Instead it shows the moving black and white dots in the middle
 * all the time.*
 *
 * So the middle is `throbMiddle`, a charcoal with no hue, and over it pores
 * pinned at a longitude and latitude of the **whole** ball, alternately white
 * and black, each crossing at its own rate. A pore placed by `pin` and carried
 * by `facet` crosses the middle fast and crawls at the limb, 22.9 : 1
 * (`docs/dimensional.md`), and narrows to nothing there — the one cue that
 * says this is a ball turning, now that no seam says it.
 *
 * **Which trigger answers it is said by the rim.** The other colour comes
 * round from the side the far hemisphere lies on and takes `share` of the glow
 * (`throb.ts`'s `farShare`): none at turn nought, more than half exactly while
 * `throbColorAt` answers it, all of it half a turn round.
 */

/** How many pores, and how far out of the middle they reach. Fourteen round the
 * whole ball: the seven the far half used to carry, and seven for the near. */
const PORES = 14;
const REACH = 0.74;
/** What a pore keeps of its light where the surface has turned away. */
const FLOOR = 0.5;
/** How wide a pore is, as a share of the body. */
const SIZE = 0.17;

/**
 * Spread through the whole turn by the golden angle, so no two share a
 * meridian, and kept off the poles. Even pins are white and odd ones black, so
 * each colour is spread round the ball rather than gathered on one side.
 */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PINS = Array.from({ length: PORES }, (_, i) =>
  pin((i * GOLDEN) % (Math.PI * 2), Math.sin(i * 1.9) * LAT_LIMIT * 0.75, REACH),
);

export function pores(h: ThrobHalf): void {
  const { ctx, body, rx, ry, tint, own, share, haze, lw, turn, rot } = h;
  const side = farSide(turn);
  const r = Math.max(rx, ry);

  ctx.save();
  ctx.clip(body);
  ctx.fillStyle = haze(PALETTE.throbMiddle);
  ctx.fill(body);
  ctx.restore();

  // The rim, the two colours in their two shares, in the un-turned frame so
  // the far one arrives from the side its hemisphere does.
  for (const [s, part, hex] of [
    [side, share, tint.hex],
    [-side, 1 - share, own],
  ] as const) {
    if (part <= 0) continue;
    ctx.save();
    ctx.rotate(-turn);
    ctx.clip(rimWedge(s, part, r));
    ctx.rotate(turn);
    strokeGlow(ctx, body, hex, lw, 1);
    ctx.restore();
  }

  // The pores, placed on the ball and carried round by the turn — in the
  // un-turned frame, because a pore is a mark on the surface and the turn is
  // what the surface has done. Each is drawn about its own origin and
  // foreshortened by the tangent plane's own map.
  const white = haze(PALETTE.text);
  const black = haze(PALETTE.background);
  ctx.save();
  ctx.clip(body);
  ctx.rotate(-turn);
  for (const [i, p] of PINS.entries()) {
    const f = facet(p, turn);
    if (!f.near) continue;
    ctx.save();
    ctx.translate(f.x * rx, f.y * ry);
    ctx.scale(f.sx, f.sy);
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * SIZE, ry * SIZE, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(i % 2 === 0 ? white : black, surfaceDim(FLOOR, f.lit));
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.save();
  ctx.clip(body);
  litRound(ctx, 0, 0, r, LIGHT_HALF.creature, rot);
  ctx.restore();
}
