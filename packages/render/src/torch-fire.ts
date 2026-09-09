import { facet, LAT_LIMIT, pin, surfaceDim } from "@neon-spore/content";
import { bakedCache } from "./baked.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { ball, EMBER_FLOOR, flicker, plumes } from "./torch-ball.js";
import type { TorchFlameDraw } from "./torch-look.js";

/**
 * THE TORCH's fire: a ball of flame with a rock at the heart of it.
 *
 * It was one faint ring stroked just outside the outline at 0.4 alpha — honest
 * about the rule and the flattest mark in the game, a circle drawn once, in
 * front of everything, at the same brightness the whole way round. The owner
 * took KILN out of VERSUS on 9 September 2026 and asked for its fire **much
 * bigger, more like a big fireball**, with the stone still reading as a solid
 * dark mass at the heart of it — so the craters a shot opens stay countable.
 *
 * That is what this is, in two halves that answer different questions.
 *
 * **The ball** is `torch-ball.ts` next door: everything outside the stone, all
 * of it laid down before the rock.
 *
 * **The skin** is here, and it is KILN's own argument: eighteen tongues at
 * fixed longitudes and latitudes on the stone's surface, turning about its
 * vertical axis, the far half hidden behind the stone and coming back at the
 * other limb. A tongue crossing the face is wide and fast and one near the limb
 * is a thin sliver crawling — the 22.9 : 1 ratio `docs/dimensional.md`
 * measures, against the 1.10 : 1 an affine pose manages. That occlusion is the
 * one depth cue that is a difference in kind rather than of degree, and here it
 * costs nothing at all, because the thing doing the hiding is a rock that was
 * being drawn anyway.
 *
 * **Nothing here shades the stone and nothing here is a fill over it.** The
 * rock's own grey gradient is drawn by the shipped hand at the moment this file
 * asks for it; every mark is additive fire laid over it or behind it, so a
 * torch is still unmistakably the rock family (`drawStone`, torch.ts).
 */

/** How many embers cling to the stone's own skin. Eighteen: about half are on
 * the near side at any instant, which is nine marks on a two-tile body — the
 * density `docs/style-guide.md` calls a surface rather than a texture. */
const EMBERS = 18;

/** How far out the embers sit, as a share of the stone's radius. Just past the
 * skin: near ones lie over the face and far ones are hidden by the rock itself,
 * so a spark leaves at one limb and comes back at the other. */
const REACH = 1.12;

/** Seconds for one turn of the fire about the stone's vertical axis. Four and a
 * half, against a fall that lasts about three: a plume crosses the face once
 * while the pair is watching, which is a roll and not a strobe. */
const SPIN_SECONDS = 4.5;

/** How much of a near plume is drawn again over the stone's face. Low on
 * purpose — enough that the rock reads as being *inside* the fire rather than
 * behind it, little enough that it stays a dark mass and the craters stay
 * countable. */
const VEIL = 0.2;

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
const PINS = Array.from({ length: EMBERS }, (_, i) =>
  pin(i * GOLDEN, Math.sin(i * 1.7) * LAT_LIMIT * 0.8, REACH),
);

/**
 * How big the baked tongue is, in device pixels. It is blitted at whatever size
 * a stone asks for, so this is only the resolution the ramp is drawn at — wide
 * enough that a two-tile torch never sees the seams of it, small enough that
 * the whole thing is one 8 KB canvas.
 */
const TONGUE_PX = 96;

const tongues = bakedCache<number, HTMLCanvasElement>();

/**
 * One tongue of flame, baked once.
 *
 * Every stop of its ramp is the same alpha times the same heat, so a single
 * sprite at full heat blitted under `globalAlpha` is the identical picture —
 * which is what takes eighteen `createLinearGradient` calls per torch per frame
 * down to eighteen blits of one canvas. That was the second half of the cost
 * BULB QUEEN's sockets found (`torch-ball.ts`).
 */
function tongueSprite(): HTMLCanvasElement {
  const held = tongues.get(TONGUE_PX);
  if (held) return held;
  const w = TONGUE_PX;
  const h = Math.round(TONGUE_PX * (TONGUE_WIDE / TONGUE));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (g) {
    const ramp = g.createLinearGradient(0, 0, w, 0);
    ramp.addColorStop(0, rgba(PALETTE.ember, 0));
    ramp.addColorStop(0.3, rgba(PALETTE.ember, 0.55));
    ramp.addColorStop(0.52, rgba(PALETTE.emberRim, 1));
    ramp.addColorStop(0.78, rgba(PALETTE.ember, 0.75));
    ramp.addColorStop(1, rgba(PALETTE.ember, 0));
    g.fillStyle = ramp;
    g.beginPath();
    g.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    g.fill();
  }
  tongues.set(TONGUE_PX, c);
  return c;
}

/**
 * One tongue lying on the stone's surface at a facet.
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
  ctx.globalAlpha = heat;
  const long = r * TONGUE;
  const wide = r * TONGUE_WIDE;
  ctx.drawImage(tongueSprite(), -long / 2, -wide / 2, long, wide);
  ctx.restore();
}

/** The tongues on one hemisphere of the stone: the far half before the rock is
 * drawn, the near half after it. */
function skin(
  ctx: CanvasRenderingContext2D,
  r: number,
  theta: number,
  time: number,
  want: boolean,
): void {
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
    // `Math.abs`: a far facet's `sx` is the cosine of a longitude past the limb
    // and so is negative, and a negative scale is a tongue drawn inside out.
    // What the far pass wants from it is how edge-on the surface is, which is
    // its size.
    tongue(ctx, r, Math.max(0.08, Math.abs(f.sx)), f.sy, want ? heat : heat * 0.7);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * The fire, in four passes, and the order is the whole picture.
 *
 * The ball goes down first, then the far tongues on the stone's own skin, then
 * the stone itself over all of it, and only then the near tongues and a thin
 * veil of the nearest plumes across the face. What the pair sees is a rock
 * burning inside a fire rather than a rock with fire around it. That order is
 * the whole reason the seam hands the stone back as a field of the draw
 * (`torch-look.ts`).
 */
export function fireball(d: TorchFlameDraw): void {
  const { ctx, r, time } = d;
  const theta = (time / SPIN_SECONDS) * Math.PI * 2;

  ball(ctx, r, theta, time);
  skin(ctx, r, theta, time, false);
  d.stone();
  skin(ctx, r, theta, time, true);

  // The veil: the nearest plumes again, faintly, over the stone's face. Without
  // it the rock reads as standing in front of the fire rather than inside it;
  // with it any louder, the craters stop being countable, and the craters are
  // the only readout this body carries.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = VEIL;
  plumes(ctx, r, theta, time, true);
  ctx.restore();
}
