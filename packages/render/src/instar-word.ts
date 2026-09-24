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
 * once.
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
  const kindW = kind !== undefined && kind !== word ? ctx.measureText(kind).width : 0;
  return Math.max(wordW, kindW) / 2 + l.tile * FONT_TILES * 0.45;
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
): void {
  const half = halfWidth(ctx, l, word, kind) + l.tile * INSET_TILES;
  const cx =
    half * 2 >= l.width ? l.width / 2 : Math.min(Math.max(x + side * half, half), l.width - half);
  paint(ctx, l, word, kind, cx, y, mine);
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
  const say = kind !== undefined && kind !== word;
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
