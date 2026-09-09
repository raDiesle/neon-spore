import {
  facet,
  LAT_LIMIT,
  type Pin,
  pin,
  surfaceDim,
} from "../../../../../packages/content/src/surface.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { TorchFlameDraw } from "../../../../../packages/render/src/torch-look.js";

/**
 * The paint KILN is made of, kept out of `index.ts` so that file stays the
 * argument for the candidate rather than a wall of canvas calls.
 *
 * **Nothing here is a fill and nothing here shades the stone.** The rock's own
 * grey gradient is the shipped one, drawn by the shipped hand at the moment
 * this file asks for it; every mark below is additive fire laid over it or
 * behind it. A candidate that repainted the stone would be arguing about the
 * rock family's material, which is a different question and one the pair would
 * have to answer for every meteor tier at once.
 */

/** How many embers cling to the stone. Eighteen: about half are on the near
 * side at any instant, which is nine marks on a two-tile body — the density
 * `docs/style-guide.md` calls a surface rather than a texture. */
const EMBERS = 18;

/**
 * How far out the fire sits, as a share of the stone's radius. Just past the
 * skin: near embers lie over the face and far ones are hidden by the rock
 * itself, so a spark leaves at one limb and comes back at the other. That
 * occlusion **is** the reveal — it is the one cue no pose can fake, and here it
 * costs nothing at all, because the thing doing the hiding is a rock that was
 * being drawn anyway.
 */
const REACH = 1.12;

/** Seconds for one turn of the fire about the stone's vertical axis. Four and
 * a half, against a fall that lasts about three: an ember crosses the face
 * once while the pair is watching, which is a roll and not a strobe. */
const SPIN_SECONDS = 4.5;

/** What is left of an ember's brightness at the limb. High, because fire is
 * its own light: the cosine here is *distance* rather than shading, and an
 * ember that faded to nothing at the edge would read as a rock going out. */
const EMBER_FLOOR = 0.45;

/** How long one tongue of flame is, along the surface, as a share of the
 * stone's radius — and how wide. Long and thin: a tongue lying flat on the
 * skin, not a dot stuck to it. */
const TONGUE = 0.5;
const TONGUE_WIDE = 0.22;

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Where each ember sits, worked out once. The longitudes are spread by the
 * golden angle so no two ever line up, and the latitudes ride a slow sine
 * through the band a mark may sit in — `LAT_LIMIT` is `surface.ts`'s number and
 * is *called*, because a mark nearer a pole than that is a horizontal hairline
 * whatever the rotation does.
 */
const PINS: Pin[] = Array.from({ length: EMBERS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.8, REACH),
);

/** How hard ember `i` is burning this instant, 0.55..1. Deterministic and off
 * the frame clock alone, so two phones draw one fire — the same argument
 * `own-motion.ts` makes for sampling a pose on a shared clock. */
function flicker(i: number, time: number): number {
  return 0.775 + 0.225 * Math.sin(time * (5.3 + i * 0.37) + i * 2.1);
}

/**
 * One tongue of flame lying on the surface at a facet.
 *
 * Drawn about its own origin and foreshortened by `scale(sx, sy)`, which is the
 * tangent plane's own map: a tongue near the limb narrows across its width
 * *and* swings toward the vertical, because that is what an anisotropic scale
 * does to a direction. Laid out in picture coordinates and squashed as a
 * picture instead, it would read as a sticker shrinking.
 */
function tongue(
  ctx: CanvasRenderingContext2D,
  r: number,
  sx: number,
  sy: number,
  heat: number,
): void {
  ctx.save();
  ctx.scale(sx, sy);
  const long = r * TONGUE;
  const wide = r * TONGUE_WIDE;
  const g = ctx.createLinearGradient(-long / 2, 0, long / 2, 0);
  g.addColorStop(0, rgba(PALETTE.ember, 0));
  g.addColorStop(0.3, rgba(PALETTE.ember, 0.55 * heat));
  g.addColorStop(0.52, rgba(PALETTE.emberRim, heat));
  g.addColorStop(0.78, rgba(PALETTE.ember, 0.75 * heat));
  g.addColorStop(1, rgba(PALETTE.ember, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, long / 2, wide / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * KILN: fire on the stone's skin, rolling with it.
 *
 * Three passes, and the order is the whole candidate. The far embers go down
 * first and the rock is laid over them, so what is left of one is the sliver
 * that reaches past the silhouette; then the near ones burn on the face. A
 * flame drawn all in front of the stone is a ring, which is what the game
 * draws today and what this is offered against.
 */
export function kiln(d: TorchFlameDraw): void {
  const { ctx, r, time } = d;
  const theta = (time / SPIN_SECONDS) * Math.PI * 2;

  const pass = (want: boolean): void => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < PINS.length; i++) {
      const p = PINS[i];
      if (!p) continue;
      const f = facet(p, theta);
      if (f.near !== want) continue;
      const heat = flicker(i, time) * surfaceDim(EMBER_FLOOR, Math.abs(f.sx));
      ctx.save();
      // The pins were placed on a ball of radius `REACH`, so a facet's own
      // coordinates are already in stone-radii and `r` is the only scale left.
      ctx.translate(f.x * r, f.y * r);
      // `Math.abs`: a far facet's `sx` is the cosine of a longitude past the
      // limb and so is negative, and a negative scale is a tongue drawn inside
      // out. What the far pass wants from it is how edge-on the surface is,
      // which is its size.
      tongue(ctx, r, Math.max(0.08, Math.abs(f.sx)), f.sy, want ? heat : heat * 0.7);
      ctx.restore();
    }
    ctx.restore();
  };

  // Behind the rock. It is drawn at all because a body wrapped in fire glows
  // past its own outline — and because the frame in which an ember is *about*
  // to be hidden is the frame that says the rock has a far side.
  pass(false);
  d.stone();
  pass(true);
}
