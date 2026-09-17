import { strokeGlow } from "./glow.js";
import { signedHash } from "./hash.js";
import { bleed } from "./lost-blood.js";
import type { LostPaint } from "./lost-look.js";
import { PALETTE } from "./palette.js";

/**
 * The lost screen: plates that shut, and a lit slot where the hull was broken.
 *
 * **What ships**, taken out of the `lost:screen` slot on 17 September 2026 as
 * the `shut` candidate. The plates come in from off both edges over `CLOSE`
 * seconds and meet at the seam, and what is left is one vertical slot in the
 * breach column, ragged and lit, with the field and the hole in the hull seen
 * through it. Nothing else on the screen is field any more.
 *
 * **It is the sentence the owner first picked, drawn the right way round.**
 * The screen this replaced (`shutters`, 16 September 2026) was offered as
 * plates that *slide in over the field from the top and the foot and close on
 * everything but the column it hit*, and drew the reverse: both plates over
 * the field at `age` 0, drawing back over half a second to leave the lower
 * half open. He read the file, found it disagreeing with its own words, and
 * had the other way round put beside it on the VERSUS page rather than onto
 * the field; then chose it, and cleared the three answers offered beside it.
 *
 * **The tension it resolves, and how.** `lost-look.ts` says the pair are meant
 * to look at where it got through, and a full-screen statement that covers it
 * takes the lesson away. This answers with one hole and bets the hole is
 * louder for being the only one. It is the darker of the two screens, and the
 * words and the buttons stand on plate rather than on the ship.
 *
 * **On a wave that scars nothing** (`breachX` null — a wall earths through the
 * dome and leaves no mark) there is no column to leave open, and the plates
 * simply shut. That is the honest picture and not a missing feature: nothing
 * got through the skin, so there is nothing to point at.
 */

/** How long the plates take to shut, seconds. */
const CLOSE = 0.45;

/** Where the two plates meet, as a share of the play area. */
const SEAM = 0.44;

/** How wide the slot is at the hull, in tiles, and how many bites down it. */
const SLOT_TILES = 2.4;
const TEETH = 26;

/** How far a bite cuts into an edge, as a share of a tile. */
const BITE = 0.3;

/**
 * How wide the slot is at the top of the screen, as a share of its width at
 * the hull.
 *
 * It is a tear and not a channel: the thing came in at the hull, so the rip is
 * widest there and closes as it runs up the plates. A slot of one width top to
 * bottom was the first drawing of this and it read as two neon rails down the
 * screen — a stripe, which is the one way this screen fails at what it is for.
 */
const NARROW = 0.42;

const PLATE = "#0C0A16";
const EDGE = "#2A2140";

interface Point {
  readonly x: number;
  readonly y: number;
}

function shut(age: number): number {
  return Math.max(0, Math.min(1, age / CLOSE));
}

/**
 * One ragged edge of the slot, top to bottom, as points.
 *
 * The cut and the light are taken from the same list on purpose: two loops
 * with the same arithmetic in them are one edit away from a glowing line
 * beside a hole rather than on it.
 *
 * `signedHash` and not a random — the screen is drawn twice on one tick on two
 * phones and both have to tear the same way (`lost-blood.ts` makes the same
 * point about its rivulets).
 */
function rim(p: LostPaint, x: number, dir: -1 | 1): Point[] {
  const half = p.l.tile * SLOT_TILES * 0.5;
  const out: Point[] = [];
  for (let i = 0; i <= TEETH; i++) {
    const y = -8 + ((p.l.height + 16) * i) / TEETH;
    const down = Math.max(0, Math.min(1, y / Math.max(1, p.hullY)));
    const wide = half * (NARROW + (1 - NARROW) * down);
    const bite = (1 + signedHash(i, dir === -1 ? 3 : 5, 0)) * 0.5 * p.l.tile * BITE;
    out.push({ x: x + dir * (wide + bite), y });
  }
  return out;
}

function edge(pts: Point[]): Path2D {
  const path = new Path2D();
  for (const [i, q] of pts.entries()) {
    if (i === 0) path.moveTo(q.x, q.y);
    else path.lineTo(q.x, q.y);
  }
  return path;
}

/** The two edges joined into one closed shape, for cutting. */
function cut(ctx: CanvasRenderingContext2D, left: Point[], right: Point[]): void {
  for (const [i, q] of left.entries()) {
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  for (let i = right.length - 1; i >= 0; i--) {
    const q = right[i];
    if (q !== undefined) ctx.lineTo(q.x, q.y);
  }
  ctx.closePath();
}

/** The two plates, coming in, with the slot torn out of both of them. */
function shutPlates(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const k = shut(p.age);
  const seam = p.l.playHeight * SEAM;
  const top = -seam * (1 - k);
  const foot = seam + (1 - k) * (p.l.height - seam);
  const plated = (): void => {
    ctx.rect(0, top, p.l.width, seam);
    ctx.rect(0, foot, p.l.width, p.l.height - foot);
  };
  const left = p.breachX === null ? [] : rim(p, p.breachX, -1);
  const right = p.breachX === null ? [] : rim(p, p.breachX, 1);

  // **Cut, and not drawn.** The slot is a hole the held field is seen through,
  // so it comes off the plates as a clip — everything but the slot — rather
  // than going into their path as a second shape. `evenodd` on the fill was
  // the first drawing of this and it was wrong in the one frame that shows it:
  // between the two plates, where neither covers anything, the slot's own
  // outline was the only shape there and the rule filled it, so a black column
  // stood in the open field for the half second the plates were coming in.
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, p.l.width, p.l.height);
  if (left.length > 0) cut(ctx, left, right);
  ctx.clip("evenodd");

  ctx.beginPath();
  plated();
  ctx.fillStyle = PLATE;
  ctx.fill();

  // The leading edge of each plate, so they read as metal arriving. At rest
  // they are the same line, which is what a bulkhead closed looks like — and
  // inside the clip, because an edge drawn across the tear would be a plate
  // where the plate was torn away.
  const lip = new Path2D();
  lip.moveTo(0, top + seam);
  lip.lineTo(p.l.width, top + seam);
  lip.moveTo(0, foot);
  lip.lineTo(p.l.width, foot);
  strokeGlow(ctx, lip, EDGE, 2, 0.5);
  ctx.restore();

  // The torn edges, lit, and clipped to the plates: a glowing line where no
  // plate has arrived yet would be a slot in the open air.
  if (left.length === 0) return;
  ctx.save();
  ctx.beginPath();
  plated();
  ctx.clip();
  const hot = Math.max(1, p.l.tile * 0.04);
  for (const side of [left, right]) {
    strokeGlow(ctx, edge(side), PALETTE.ember, hot, 0.55);
    // And again over the last stretch before the hull, twice as bright: that
    // is where the thing came in, and a tear lit evenly for the height of a
    // phone says the whole column was opened rather than one place in it.
    strokeGlow(
      ctx,
      edge(side.filter((q) => q.y > p.hullY - p.l.tile * 5)),
      PALETTE.ember,
      hot,
      1.2,
    );
  }
  ctx.restore();
}

/**
 * The plates, and the ship bleeding down them.
 *
 * `bleed` is the shipped fluid, imported and not retyped: what this answer
 * decided was one thing — which way the plates go — and the fluid was split
 * out so that an answer could argue that alone (`lost-blood.ts`).
 */
export function shutVeil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  shutPlates(ctx, p);
  bleed(ctx, p);
}
