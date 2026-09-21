import { blobPath } from "../../../../../packages/content/src/shapes.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { signedHash, sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { LostPaint } from "../../../../../packages/render/src/lost-look.js";
import { shutPlates } from "../../../../../packages/render/src/lost-shut.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * It comes out of the breach at the pair, hits the glass, and runs down it.
 *
 * The owner, 19 September 2026, naming the second of the two answers he
 * wanted against the thirteen rivulets: *a red splash like it is coming from
 * the game screen and splashing towards the user perspective*. So this is one
 * throw, from the place the hull was actually broken, in the one direction
 * nothing in this game ever moves — out of the field and onto the front of the
 * phone. Everything else on this screen is drawn as if the glass were a
 * window; this is the only thing drawn as if it were a surface.
 *
 * **What sells the direction is that they grow and go soft.** A blot arrives
 * small and hard, and over its own half second swells and loses its edge,
 * because a thing approaching a lens covers more of it and leaves focus. That
 * is the whole trick, and it is why each blot is drawn twice — a soft wide
 * pass under a tighter one — rather than being given a shadow blur, which is
 * the most expensive thing a phone GPU can be asked for (`glow.ts`).
 *
 * **It is a fan up the glass and not a ring round the breach.** The first
 * shot of this landed the blots on a circle centred on the break, which put
 * every one of them on top of it — and the rule this slot has, stated in
 * `lost-screen.ts`, is that the breach stays where it was seen. Thrown fluid
 * goes *up* and spreads as it goes, so they are dealt up the glass from the
 * break, wider the higher they got, and the lowest of them is still two tiles
 * clear of the column it came out of. On a wave that scars nothing the throw
 * comes from the middle of the hull instead, which is the case `breachX` is
 * null for.
 *
 * **The presses are not avoided, they are drawn over.** `drawLostScreen` runs
 * the veil, then the words, then the buttons, so what a blot behind RETRY
 * WAVE costs is nothing — the shipped fluid runs its rivulets the whole height
 * of the screen for the same reason. `buttonsY` is here so an answer can keep
 * its *weight* off that half, which is why nothing lands below the hull.
 *
 * **Then it runs**, slowly, and only downward, at a rate that is a share of
 * the blot's own size — big ones hold, small ones streak — and the mark it
 * leaves from where it struck is drawn behind it, narrowing, so the movement
 * is legible on a screen glanced at twice a minute. Nothing leaves the screen:
 * this picture is looked at for as long as the pair want, and the shipped
 * fluid's answer to that is to loop, which no fluid on a real surface ever
 * does.
 *
 * **It draws the shipped plates first.** What the slot decided on 17 September
 * was which way the plates go, and the fluid over them is a separate argument
 * — the same reason `bleed` is its own file (`lost-shut.ts`).
 *
 * **How it can lose.** It breaks the frame on purpose, and a game whose every
 * other rule is that nothing the pair control travels may not want its loss
 * screen to be the one place something comes at them. It is also six blots on
 * the glass at rest, and six of anything is a pattern — if the eye finds the
 * ring the illusion is a decal instead of a splash.
 */

/** Blots that stuck. Six, against the shipped thirteen. */
const BLOTS = 6;

/** Seconds from the screen coming up to the last blot landing. */
const THROW = 0.9;

/** Seconds a blot takes to swell and go soft once it has landed. */
const ARRIVE = 0.55;

/** The top of the band they land in, as a share of the phone — under the
 * words' own stack, which is drawn over this and has to stay read. */
const HIGH = 0.22;

/** How far to either side of the break the highest of them got, as a share of
 * the phone's width. */
const SPREAD = 0.42;

/** A blot at rest, as a share of a tile. */
const SIZE = 1.15;

/** How much wider the soft pass under it is. */
const SOFT = 1.9;

/** Pixels a blot of one tile's width runs down in a second, once it is still. */
const RUN = 1.4;

/** The heaviest a blot gets. */
const DEEP = 0.6;

const HUE = PALETTE.red;
const RIM = PALETTE.redRim;

interface Blot {
  readonly x: number;
  readonly y: number;
  /** Where it hit, which is where its tail is still anchored. */
  readonly struck: number;
  readonly r: number;
  readonly grown: number;
  readonly seed: number;
}

/** Where the throw came from: the break, or the middle of the hull on the
 * waves that leave no mark at all (`breachUnscarred`). */
function origin(p: LostPaint): { x: number; y: number } {
  const x = p.breachX ?? p.l.width / 2;
  return { x, y: p.surfaceY(x) };
}

function blots(p: LostPaint): Blot[] {
  const from = origin(p);
  const top = p.l.height * HIGH;
  // Nothing on the ship: the lowest of them is a tile clear of the hull, so
  // the breach is on plain ground however long the pair look at it.
  const foot = Math.min(p.l.hullY, p.buttonsY + (p.l.hullY - p.buttonsY) * 0.8) - p.l.tile;
  const out: Blot[] = [];
  if (foot <= top) return out;
  for (let i = 0; i < BLOTS; i++) {
    // Landed by now, or not yet: they go up together and arrive apart.
    const landed = p.age - (THROW * i) / BLOTS;
    if (landed <= 0) continue;
    // How far up the glass this one got, and so how far out it is: a throw
    // fans, and the ones that went highest went widest.
    const rose = Math.min(1, Math.max(0, (i + 0.5) / BLOTS + signedHash(i, 3) * 0.1));
    const wide = Math.max(
      p.l.tile * 2,
      (0.3 + 0.7 * rose) * p.l.width * SPREAD * (0.5 + sinHash(i, 4) * 0.85),
    );
    // Either side of the break in turn: six draws off one hash landed all six
    // on the right of it, in a row, and a row of anything is a caterpillar.
    const side = i % 2 === 0 ? 1 : -1;
    const grown = smoothstep(Math.min(1, landed / ARRIVE));
    const r = p.l.tile * SIZE * (0.55 + sinHash(i, 5) * 0.55);
    // And it runs, once it is there, at a rate its own size sets.
    const still = Math.max(0, landed - ARRIVE);
    const fell = (still * RUN * p.l.tile) / r;
    const struck = foot - (foot - top) * rose;
    out.push({
      x: Math.min(p.l.width - r, Math.max(r, from.x + side * wide)),
      y: Math.min(foot - r, struck + fell),
      struck,
      r,
      grown,
      seed: i + 1,
    });
  }
  return out;
}

/** What it left behind coming down: a tail from where it hit to where it is,
 * narrowing as it goes, so the run is a mark on the glass and not a body
 * sliding across it. Nothing at all until it has moved. */
function tailPath(b: Blot, r: number): Path2D | null {
  if (b.y - b.struck < r * 0.2) return null;
  // Wound the way `blobPath` winds its contour. The first shot of this drew
  // it the other way round, and the two subpaths of one `fill` cancelled
  // where they lay over each other — a dark trapezoid punched out of every
  // blot, which is what a nonzero fill does to opposed windings.
  const path = new Path2D();
  path.moveTo(b.x + r * 0.3, b.struck);
  path.lineTo(b.x + r * 0.48, b.y);
  path.lineTo(b.x - r * 0.48, b.y);
  path.lineTo(b.x - r * 0.3, b.struck);
  path.closePath();
  return path;
}

/** One blot: the soft pass it is arriving through, then the body and its own
 * tail as one shape.
 *
 * **One shape and one fill, not two.** The first shot of the tail drew it
 * under the body as a second translucent fill, and the two alphas added where
 * they lay over each other — a bright hard-edged wedge standing inside every
 * blot, which read as a beam of light. Two translucent marks that are one
 * thing have to be one path. */
function paintBlot(ctx: CanvasRenderingContext2D, b: Blot): void {
  // Small and hard on the way in, wide and soft once it is on the glass.
  const r = b.r * (0.35 + 0.65 * b.grown);
  const spread = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * SOFT);
  spread.addColorStop(0, rgba(HUE, DEEP * 0.55 * b.grown));
  spread.addColorStop(1, rgba(HUE, 0));
  ctx.fillStyle = spread;
  ctx.beginPath();
  ctx.arc(b.x, b.y, r * SOFT, 0, Math.PI * 2);
  ctx.fill();
  // The body is a blob, because everything with a contour in this game is.
  const body = new Path2D(blobPath(b.x, b.y, r, r * 0.86, 4, 0.11, 0.05, 0, b.seed));
  const shape = new Path2D();
  shape.addPath(body);
  const tail = tailPath(b, r);
  if (tail !== null) shape.addPath(tail);
  // Gone where it started and heaviest where it is now: a drop on glass is
  // thin at the top of its own smear.
  const down = ctx.createLinearGradient(0, b.struck - r, 0, b.y);
  down.addColorStop(0, rgba(HUE, 0));
  down.addColorStop(1, rgba(HUE, DEEP));
  ctx.fillStyle = down;
  ctx.fill(shape);
  ctx.strokeStyle = rgba(RIM, 0.35 * b.grown);
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.stroke(body);
}

export const splashVeil = (ctx: CanvasRenderingContext2D, p: LostPaint): void => {
  shutPlates(ctx, p);
  ctx.save();
  for (const b of blots(p)) paintBlot(ctx, b);
  ctx.restore();
};
