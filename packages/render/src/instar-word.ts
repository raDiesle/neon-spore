import { saysKind } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The word beside a mark, in a scanner box** — one or two words naming the
 * gesture the ring wants, bracketed at the four corners the way a scanner
 * frames what it has found, so it reads as *the body's* label on the part
 * rather than a caption the game wrote. Beside and not over, outside the
 * window ring, on the side away from the field's middle so it never sits
 * on the mouth or the other mark. Bright on the seat the mark wants, dim
 * on the other, where the word is the owner's name.
 *
 * It says nothing the ring and its glyph do not already show; it is there
 * for the first second of a step, when the pair has not yet read the glyph
 * and the window is already closing. The briefing for the wave says less
 * for the same reason: what the marks say during the wave is not said
 * before it (`content/src/waves/act-7g.ts`).
 *
 * **And, since 19 September 2026, the kind line the owner's own brief asked
 * for and this box never drew** (`bosses.md` §11.32: *"one word … and above
 * it what kind of action is required"*). `docs/decisions.md` #34 generalised
 * that idea into a `CueKind` line over the verb everywhere else in the game
 * (`boss-cue-text.ts`); this box drew the verb alone until this box and that
 * reading were made to say the same two lines — `kind`, optional so THE
 * STARE's and THE FILAMENT's own calls, which name a seat rather than an
 * action, still draw one line. `boss-cue-text.ts`'s own rule travels with it:
 * a kind that equals the word — a `turn` mark's `TURN` over `TURN` — draws
 * once, and `CARRY` over `PULL DOWN` draws `PULL DOWN` alone (`saysKind`).
 *
 * Its own file because `instar-marks.ts` was at its limit with the rings.
 */

/** The word's size, in tiles — THE WARDEN's loud hint (`handle-draw.ts`). */
const FONT_TILES = 0.3;

/** The kind line's size, against the word's — `boss-cue-text.ts`'s own
 * ratio (8px over 11), the grammar of the instruction sat over its verb. */
const KIND_TILES = FONT_TILES * (8 / 11);

/** Between the kind line and the word, in tiles. */
const KIND_GAP_TILES = FONT_TILES * 0.35;

/** How far off the edge of the glass a box is kept, in tiles. */
const INSET_TILES = 0.12;

/** The two fonts, which every measurement and every line is set in. */
function fonts(l: Layout): { word: string; kind: string } {
  return {
    word: `600 ${Math.round(l.tile * FONT_TILES)}px system-ui, sans-serif`,
    kind: `600 ${Math.round(l.tile * KIND_TILES)}px system-ui, sans-serif`,
  };
}

/** Half the box, brackets and padding and all — what decides where it may
 * stand before it decides what it looks like. */
function halfWidth(ctx: CanvasRenderingContext2D, l: Layout, word: string, kind?: string): number {
  const font = fonts(l);
  ctx.font = font.word;
  const wordW = ctx.measureText(word).width;
  ctx.font = font.kind;
  const kindW = saysKind(kind, word) ? ctx.measureText(kind).width : 0;
  return Math.max(wordW, kindW) / 2 + l.tile * FONT_TILES * 0.45;
}

/**
 * The room a mark takes on the glass: its window ring at its widest, or its
 * track, and the margin the word keeps from either, in pixels.
 */
export interface MarkRoom {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

/**
 * Where a box beside a mark may go: the mark's own room, which it hangs off,
 * and the rooms of the step's other marks, which it may never cover.
 */
export interface WordRoom {
  readonly own: MarkRoom;
  readonly avoid: readonly MarkRoom[];
}

/**
 * **The word beside a mark**: `x` is the box's near edge and `side` the way
 * it hangs off it, clamped to the glass.
 *
 * **With a margin, and centred outright when it cannot have one.** The clamp
 * put the box hard against the edge, and a frame of THE INSTAR on 20
 * September 2026 showed what that looks like: the longest label in the game,
 * *NAVIGATOR'S*, with its right bracket on the last column of pixels, which
 * reads as a label cut off whether or not it is. `INSET_TILES` is the
 * breathing room. A box too wide even for that is centred, which is the
 * honest picture of a label that does not fit; the old clamp pushed it off
 * the right edge instead, by exactly the amount it did not fit.
 *
 * **Given a `room`, the box goes to the first place that fits the glass and
 * covers no other mark**: its own side, the mark's other side, below the
 * mark, above it. The other side alone was the fix for a box pushed back over
 * its own mark at an edge (24 September 2026), and near an edge that is the
 * side the partner's ring is on: the lash's sweep carries player 1's blade to
 * 270 thousandths with player 2's 240 across, and the flipped box stood on
 * player 2's ring. Below comes before above because above a mark is the body
 * it is on. When nowhere is clear the box stands where it always did.
 */
export function drawInstarWord(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  word: string,
  x: number,
  y: number,
  side: -1 | 1,
  mine: boolean,
  /** The action's grammar, over the verb — one of `boss-cue.ts`'s `CueKind`
   * strings. Left out for a call that names a seat rather than an action. */
  kind?: string,
  room?: WordRoom,
): void {
  const half = halfWidth(ctx, l, word, kind) + l.tile * INSET_TILES;
  const at = (edge: number, way: number): number =>
    half * 2 >= l.width ? l.width / 2 : Math.min(Math.max(edge + way * half, half), l.width - half);
  const here = at(x, side);
  if (room === undefined) {
    paint(ctx, l, word, kind, here, y, mine);
    return;
  }
  const hh = halfHeight(l, word, kind);
  const { own } = room;
  const mid = at((own.left + own.right) / 2, 0);
  const other = side > 0 ? own.left : own.right;
  const places: readonly (readonly [number, number, boolean])[] = [
    [here, y, here === x + side * half],
    [at(other, -side), y, at(other, -side) === other - side * half],
    [mid, own.bottom + hh, own.bottom + hh * 2 <= l.height],
    [mid, own.top - hh, own.top - hh * 2 >= 0],
  ];
  const clear = (cx: number, cy: number): boolean =>
    room.avoid.every(
      (a) => cx + half <= a.left || cx - half >= a.right || cy + hh <= a.top || cy - hh >= a.bottom,
    );
  const place = places.find(([cx, cy, fits]) => fits && clear(cx, cy)) ?? [here, y];
  paint(ctx, l, word, kind, place[0], place[1], mine);
}

/** Half the box's height, one line or two — `paint`'s own box. */
function halfHeight(l: Layout, word: string, kind?: string): number {
  const h = l.tile * FONT_TILES;
  const blockH = saysKind(kind, word) ? l.tile * KIND_TILES + l.tile * KIND_GAP_TILES + h : h;
  return blockH / 2 + h * 0.45 * 0.6;
}

function paint(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  word: string,
  kind: string | undefined,
  cx: number,
  y: number,
  mine: boolean,
): void {
  ctx.save();
  const font = fonts(l);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font.word;
  const wordW = ctx.measureText(word).width;
  const say = saysKind(kind, word);
  ctx.font = font.kind;
  const kindW = say ? ctx.measureText(kind).width : 0;
  const w = Math.max(wordW, kindW);
  const h = l.tile * FONT_TILES;
  const kindH = l.tile * KIND_TILES;
  const gap = l.tile * KIND_GAP_TILES;
  const pad = h * 0.45;
  // Both lines centred on `y`, the way the single line always was — the ring
  // it stands beside does not move when a second line joins it.
  const blockH = say ? kindH + gap + h : h;
  const blockTop = y - blockH / 2;
  const kindY = blockTop + kindH / 2;
  const wordY = blockTop + (say ? kindH + gap : 0) + h / 2;
  const left = cx - w / 2 - pad;
  const right = cx + w / 2 + pad;
  const top = blockTop - pad * 0.6;
  const bottom = wordY + h / 2 + pad * 0.6;
  const tick = h * 0.5;
  // A dark backing, so the word reads over the body's plates.
  ctx.fillStyle = PALETTE.background;
  ctx.globalAlpha = 0.55;
  ctx.fillRect(left, top, right - left, bottom - top);
  ctx.strokeStyle = mine ? PALETTE.redRim : PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.globalAlpha = mine ? 0.9 : 0.45;
  ctx.beginPath();
  for (const [sx, sy] of [
    [left, top],
    [right, top],
    [right, bottom],
    [left, bottom],
  ] as const) {
    const dx = sx === left ? tick : -tick;
    const dy = sy === top ? tick : -tick;
    ctx.moveTo(sx + dx, sy);
    ctx.lineTo(sx, sy);
    ctx.lineTo(sx, sy + dy);
  }
  ctx.stroke();
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.font = font.word;
  ctx.fillText(word, cx, wordY);
  if (say) {
    ctx.globalAlpha = (mine ? 0.9 : 0.45) * 0.8;
    ctx.font = font.kind;
    ctx.fillText(kind, cx, kindY);
  }
  ctx.restore();
}
