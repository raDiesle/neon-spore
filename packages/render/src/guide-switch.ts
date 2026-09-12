import { type Box, drawPlate } from "./guide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatNames, seatName } from "./seat-name.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The move from one player's screen to the other, and the corner that says
 * what this screen is.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * The announcement itself has been through four answers. It grew into a word
 * across the middle of the picture that arrived with the slide and left a
 * second later; then the timing came out of it — *do not fade in or fade out
 * "Player 2 screen", show it immediately and keep it showing all the time* —
 * because a label that comes and goes is only true while it is on screen. Then
 * TUTORIAL joined it, and the line saying which of the two screens you were
 * holding went.
 *
 * **And then the plate itself was wrong.** It was a filled rectangle with a
 * coloured bar down one side, on a screen where everything a finger or an eye
 * goes to is grown: *make the box again so that it looks more aligned to other
 * design graphic elements.* So it is the panel's own body now — a contour out
 * of `blobPath`, standing in a wet socket, under a film of gloss, with slime
 * hanging off its underside — the four statements every button in this game is
 * made of (`nav-button.ts`, `lobe-shell.ts`, `band-slime.ts`).
 *
 * **It flares when the screen changes.** *When it is switching from player 1
 * top left to player 2 and the other way around, make some effect to indicate
 * it changes.* The slide already says a screen moved; the corner is what says
 * *whose*, and it is the one part of the picture worth looking at twice at that
 * moment. So it blooms in the arriving seat's colour and settles — driven by
 * the page's own tick, so a page replayed flares again and nothing is stored
 * between frames.
 *
 * The plate is drawn on every page of a guide. On a page with no film there is
 * no seat to name, so it says TUTORIAL and stops: the word is the half that is
 * true of the written pages and the gate as well.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where the corner plate sits: below the HUD's own top row — the score on the
 * left, the hull bar on the right — rather than over it.
 */
export const BANNER_TOP = 24;
/** How far in from the screen's edge it sits. */
const EDGE = 8;

/**
 * The two rows, and the distance between their baselines.
 *
 * Smaller than they were, by a third: at eighteen points the name's row made
 * a plate two thirds of a phone across, and on wave after wave it stood over
 * the very body the page was about — the owner, 12 September 2026: *the round
 * box which says "tutorial" often overlaps what is being explained, so you
 * can't see what is explained; move it top left and have it more compact, but
 * still visible.* The corner is the same corner; what changed is that the
 * plate now ends where the HUD's own rows begin, and a body under the caption
 * has the middle of the screen to itself.
 */
const TITLE_FONT = '700 12px "Courier New",monospace';
const TAG_FONT = '700 8px "Courier New",monospace';
const ROW_GAP = 14;
/** What the tag's own row takes, top to bottom; the name's row is `ROW_GAP`. */
const TAG_ROW = 12;
/** Where the tag's baseline sits under the middle of its row. */
const TAG_BASE = 3;
/** Room for the dot in front of TUTORIAL, and how far in front it sits. */
const DOT_R = 2.5;
const DOT_GAP = 7;

/**
 * How much bigger the plate is than the words it carries, across and down.
 *
 * **A grown contour is an ellipse, near enough, and an ellipse does not hold
 * the rectangle it is drawn around** — its corners are outside the curve. The
 * plate used to be sized as though it did: a box sixteen points wider than the
 * longest line, with two rows of type filling it from top to bottom, so the
 * ends of the screen's name hung over the edge of the body and the descenders
 * sat where the contour had already closed. The owner's answer was that *the
 * content is bigger than the button*.
 *
 * Half again in both directions is what a rectangle needs to sit inside an
 * ellipse with its corners clear. Both are applied to the type rather than to
 * a number somebody wrote down, so a longer name, a wider font or a second row
 * all move the plate with them.
 */
const FIT_X = 1.36;
const FIT_Y = 1.5;

/**
 * And so the height, which a caption keeps clear of (`guide-caption.ts`). It is
 * the taller of the two: a page with no seat to name carries the tag alone.
 */
export const BANNER_H = Math.round((TAG_ROW + ROW_GAP) * FIT_Y);
const TAG_ONLY_H = Math.round(TAG_ROW * FIT_Y);

/** The join between the outgoing and incoming screens, lit as it travels. */
export function drawSwitchSeam(ctx: CanvasRenderingContext2D, l: Layout, x: number): void {
  const g = ctx.createLinearGradient(x - SEAM, 0, x + SEAM, 0);
  g.addColorStop(0, "rgba(255,86,168,0)");
  g.addColorStop(0.5, "rgba(255,86,168,.42)");
  g.addColorStop(1, "rgba(255,86,168,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - SEAM, 0, SEAM * 2, l.height);
}

export interface CornerPlate {
  /** Whose screen is on show, when a film is playing one. */
  seat?: 1 | 2;
  names?: SeatNames;
  /**
   * 1 the instant this screen arrived, falling to 0 — the switch said a second
   * time, in the one place that names the seat. 0 on a page that did not change
   * seat, and on every page of a guide made of words.
   */
  flash?: number;
  /** Seconds the page has been up, for the slime. */
  age?: number;
}

/** What this screen is, in the corner of it, for as long as the guide is up. */
export function drawGuideCorner(ctx: CanvasRenderingContext2D, l: Layout, p: CornerPlate): void {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const age = p.age ?? 0;
  if (skin) {
    // The edges are the quiet half: a player who looked away and back reads the
    // colour before they read anything at all. They swell with the flare, so
    // the whole frame of the picture says a screen has changed.
    ctx.globalAlpha = 0.55 + 0.45 * flash;
    ctx.fillStyle = skin.tint;
    const rule = 4 + 6 * flash;
    ctx.fillRect(0, 0, rule, l.height);
    ctx.fillRect(l.width - rule, 0, rule, l.height);
    ctx.globalAlpha = 1;
  }

  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  const box = plateBox(ctx, l, title);
  drawPlate(ctx, l, box, skin?.tint ?? PALETTE.pod, flash, age);

  // Centred on the plate rather than set against its left edge, for the same
  // reason the plate is bigger than the words: a contour is widest through its
  // middle, so that is the one line every row can use the whole of.
  const cx = box.x + box.w / 2;
  const rows = title === "" ? 1 : 2;
  const tagY = box.y + box.h / 2 + (rows === 1 ? TAG_BASE : TAG_BASE - ROW_GAP / 2);
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  const tagW = ctx.measureText("TUTORIAL").width;
  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.arc(cx - tagW / 2 - DOT_GAP, tagY - TAG_BASE, DOT_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.72;
  ctx.fillText("TUTORIAL", cx + DOT_GAP / 2, tagY);
  ctx.globalAlpha = 1;
  if (title === "" || !skin) {
    ctx.textAlign = "left";
    return;
  }
  ctx.font = TITLE_FONT;
  ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
  ctx.fillText(title, cx, tagY + ROW_GAP);
  ctx.textAlign = "left";
}

/**
 * The plate itself: as wide and as tall as the words need, plus the room an
 * ellipse costs them (`FIT_X`, `FIT_Y`).
 *
 * It is measured every frame rather than cached, and that is cheap and correct:
 * the room knows what the two people are called (`seat-name.ts`), so the
 * longest line changes when a name arrives, and a plate sized once at the wrong
 * moment is a plate the name hangs out of for the rest of the guide.
 */
function plateBox(ctx: CanvasRenderingContext2D, l: Layout, title: string): Box {
  ctx.font = TITLE_FONT;
  const titleW = title === "" ? 0 : ctx.measureText(title).width;
  ctx.font = TAG_FONT;
  const tagW = ctx.measureText("TUTORIAL").width + DOT_GAP + DOT_R * 2;
  const words = Math.max(titleW, tagW);
  return {
    x: EDGE,
    y: BANNER_TOP,
    w: Math.min(l.width - EDGE * 2, Math.round(words * FIT_X) + 10),
    h: title === "" ? TAG_ONLY_H : BANNER_H,
  };
}
