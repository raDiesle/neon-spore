import { BALLOON, balloonOutline } from "@neon-spore/content";
import { balloonPopSkin } from "./balloon.js";
import { balloonFilm } from "./balloon-alive.js";
import type { BreakLook } from "./break-look.js";
import { type PiecePaint, piecePath } from "./break-piece.js";
import { contourClock } from "./creature-place.js";
import type { Debris } from "./debris.js";
import { mixHex, rgba } from "./hex.js";
import { type Layout, tileCX, tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";
import { tileSeed } from "./tile-seed.js";

/**
 * **THE BALLOON popping**: the skin the pair stretched, torn into shreds that
 * fly outward and fade in the air.
 *
 * The owner asked for this by name on 14 September 2026 — *realistic, like a
 * balloon becoming many pieces blowing up* — and it is the one point of that
 * day's ruling that did not get built with the rest of it. Until now the end
 * of a balloon was the same dozen squares every kill in the game throws: the
 * `destroy` beside the pop on the same tick (`sim/balloon-rub.ts`), and
 * nothing whatever of the body two people had just spent a hold on.
 *
 * **It is a break, not a new machine.** `Debris` already cuts a contour into
 * pieces, throws them along the ray they were cut on and lets them fall and
 * fade (`shatter.ts`, `shatter-fall.ts`), and every one of those verbs is
 * what a popping balloon does. What this file adds is the
 * two things that are *this body's*: which contour is cut, and what a piece of
 * skin looks like as opposed to a piece of body.
 *
 * **The cut has two rings and the paint has no inside.** An ordinary break
 * reads `Shard.depth` and fills the near ring dark, because the interior of a
 * body is the surface a player has never seen and showing it is the whole
 * point (`break-piece.ts`). A balloon has no interior to show: it is a skin
 * with air behind it, so `shred` below ignores depth entirely and every piece
 * is painted as skin.
 *
 * The second ring is kept for what it does to the *pieces* rather than to
 * their colour. One ring was tried first and thrown away on the picture: with
 * every wedge a single slice from the middle to the rim, all sixteen were the
 * same size and left at the same speed, and what the frame showed a third of a
 * second later was a ring of arrowheads opening evenly — a shockwave, not a
 * skin. Cut again at `innerAt` the same body gives two sizes leaving at two
 * speeds (`shatter.ts` hastens the near ring and slows the far one), and the
 * ring comes apart on its own by the second frame. **Only the picture could
 * have found that**, which is why one was taken.
 */

/**
 * How many ways round the skin tears. Twelve, and twenty-four pieces — a skin
 * under tension tears where it likes rather than along a few faces, and a body
 * that came apart into nine is a body that broke. Twenty-four is under the
 * thirty `break-look.ts` names as the worst case a wave of small bodies makes,
 * and a pop is one body rather than a wave of them.
 */
const SHREDS = 12;

/** Where the near ring ends. Lower than a body's half, so the scrap nearer the
 * tear is plainly the smaller of the two and the pieces do not read as one
 * size cut twice. */
const INNER = 0.42;

/** How far out towards the rim the skin gives, as a share of the half-width,
 * and how far up the body that point is. Well out and a little above the
 * middle, which is where a skin two hands have stretched is thinnest: the
 * widest part of the body, on the side one of them is pulling. */
const TEAR_OUT = 0.62;
const TEAR_UP = 0.18;

/**
 * Where this balloon's skin gave, in the body's own pixels.
 *
 * Which side is the seed's, and nothing either player did: both hands are
 * taut and the body is symmetrical at the instant it goes, so there is no side
 * that *earned* it. The same seed picks the same side on both phones, which is
 * the only part of that a pair can notice.
 */
export function balloonTear(
  skin: { rx: number; ry: number },
  seed: number,
): { x: number; y: number } {
  return { x: (seed % 2 === 0 ? 1 : -1) * skin.rx * TEAR_OUT, y: -skin.ry * TEAR_UP };
}

/** How much of the film reaches a shred's fill, against the deep it sits on.
 * Lower than the whole body's `SOAK` (`balloon-alive.ts`): a scrap of skin has
 * the field behind it rather than a lit body, and a fill as solid as the
 * balloon's own reads as a piece of something heavy. */
const SOAK = 0.6;
/** And how much of the fall's own fade a shred keeps. Skin is thin, and the
 * one thing that says so with no light and no thickness to draw is that the
 * field is faintly visible through it the whole way down. */
const THIN = 0.72;
/** How bright a torn edge is once the shred is lying on the ship, as a share
 * of what it had in the air. `break-piece.ts`' `LANDED_RIM`, and its reason:
 * something settled is not lit from the direction it was lit while it turned. */
const LANDED_EDGE = 0.34;

/**
 * One shred, painted.
 *
 * **Its colour is where on the skin it tore from.** The body's fill is the
 * oil-slick film laid across it, a whole turn of the loop from one side to the
 * other (`balloonSkinFill`), so a piece taken off the top of the body and a
 * piece taken off the bottom were never the same colour — and a break that
 * painted all sixteen in one hue would be a balloon that changed colour on the
 * frame it came apart. `balloonFilm` is asked for the piece's own angle about
 * the body's centre, which is the position on the loop it was cut at.
 *
 * Both edges are stroked, not one, and `Shard.depth` is not read at all.
 * `facet` lights the edge that used to face outward and leaves the cut faces
 * dark, because on a body those are two different surfaces; on a skin they are
 * the same surface, a tear runs all the way round a shred, and there is no
 * inside for a piece to have come from.
 */
export function shred(ctx: CanvasRenderingContext2D, p: PiecePaint): void {
  const { pose, shard, scale } = p;
  if (pose.alpha <= 0) return;
  const film = balloonFilm(Math.atan2(shard.y, shard.x) / (Math.PI * 2));
  ctx.save();
  ctx.globalAlpha = pose.alpha * THIN;
  ctx.translate(pose.x * scale, pose.y * scale);
  ctx.rotate(pose.angle);
  piecePath(ctx, shard.points, scale);
  ctx.fillStyle = mixHex(p.dark, film, SOAK);
  ctx.fill();
  ctx.strokeStyle = rgba(mixHex(film, p.hex, 0.45), pose.landed ? LANDED_EDGE : 1);
  ctx.lineWidth = Math.max(0.8, scale * 0.03);
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.restore();
}

/**
 * How a balloon comes apart, against `BREAK_LOOK`'s answer for a body.
 *
 * Every figure that differs differs because skin is not meat. It leaves
 * faster, because a pop is the release of everything two hands put into it and
 * a body's break is a shot arriving; it falls slower, because a scrap of
 * rubber is light; it turns faster, because a shred has no mass to steady it.
 *
 * **It follows the break, and nothing settles on the hull.** Until 17
 * September 2026 the pull here was 11 tiles a second squared with half the
 * speed kept on landing, so the shreds fell to the plating and slid along it —
 * which was the heavier picture of the two once `creature:debris` / `drift`
 * took the ordinary break's pull down to 1, the light thing falling and the
 * heavy thing floating. The owner chose that a pop opens and fades in the air
 * like everything else (`docs/queue.md`, "The balloon's pop now falls harder
 * than a struck body's break"), so the pull is under the break's and `skid` is
 * 0: a shred never lands.
 *
 * `sparkScale` is the one field that is not about the shreds at all. The
 * `destroy` on the same tick still throws the ordinary kill's squares, and
 * sixteen shreds *and* a dozen squares is the old effect playing on top of the
 * new one — `break-look.ts` argued exactly this when the fracture landed. What
 * is left of the squares is the flash: the instant of the give, which the
 * shreds are far too slow to carry.
 */
export const BALLOON_SKIN: BreakLook = {
  wedges: SHREDS,
  innerAt: INNER,
  speedTiles: 2.3,
  spin: 12,
  gravityTiles: 0.6,
  life: 1.1,
  fade: 0.5,
  skid: 0,
  sparkScale: 0.3,
  // No slivers off a skin: what a balloon is made of tears, and a tear has no
  // face to splinter off (`splinter.ts`).
  splinters: 0,
  paint: shred,
};

/**
 * The pop, cut and thrown.
 *
 * The body is already off the field by the time this is reached — the
 * simulation removes it on the tick it pops — so the contour is rebuilt from
 * the size a balloon is drawn at on that frame (`balloonPopSkin`) rather than
 * read off a creature. Both half-widths are the same one: a pop only happens
 * with both hands taut, so the skin was symmetrical at the instant it gave.
 *
 * The seed is the tile's, which is the only pair of numbers both phones agree
 * about (`tile-seed.ts`) — the same shreds fly the same way on both screens,
 * and a pair naming a column to each other is looking at one picture.
 */
export function balloonShreds(
  debris: Debris,
  l: Layout,
  time: number,
  e: { col: number; row: number },
): void {
  const seed = tileSeed(e.col, e.row);
  const skin = balloonPopSkin(l.tile);
  const tear = balloonTear(skin, seed);
  debris.break({
    look: BALLOON_SKIN,
    outline: balloonOutline(
      skin.rx,
      skin.rx,
      skin.ry,
      BALLOON.wobble,
      contourClock(seed, time),
      seed % 16,
    ),
    ox: tear.x,
    oy: tear.y,
    // The outline is already in pixels — `balloonPopSkin` is handed the tile —
    // so there is no contour unit here to convert from, unlike a living body's
    // break where the silhouette is in its own units (`effects-break.ts`).
    scale: 1,
    x: tileCX(l, e.col),
    y: tileCY(l, e.row),
    tile: l.tile,
    floor: l.hullY,
    // The film's brightest value for a torn edge and the ground it travels
    // over for the skin itself, which are the two colours the whole body is
    // painted out of (`balloon-alive.ts`).
    hex: PALETTE.sheenRim,
    dark: PALETTE.sheenDeep,
    seed,
  });
}
