import { type Box, drawPlate } from "./guide-plate.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { type SeatNames, seatName } from "./seat-name.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The move from one player's screen to the other, and the band that says what
 * this screen is.
 *
 * The owner's first instruction was that the switch must be something a pair
 * can *follow* — a cut between two screens that look alike is a screen that
 * seems to have changed by itself, and the whole lesson of the tutorial is that
 * there are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide) and a lit seam travels with the join.
 *
 * The announcement itself has been through five answers. It grew into a word
 * across the middle of the picture that arrived with the slide and left a
 * second later; then the timing came out of it — *do not fade in or fade out
 * "Player 2 screen", show it immediately and keep it showing all the time* —
 * because a label that comes and goes is only true while it is on screen. Then
 * TUTORIAL joined it, and the line saying which of the two screens you were
 * holding went.
 *
 * **Then the plate itself was wrong.** It was a filled rectangle with a
 * coloured bar down one side, on a screen where everything a finger or an eye
 * goes to is grown: *make the box again so that it looks more aligned to other
 * design graphic elements.* So it is the panel's own body now — a contour out
 * of `blobPath`, standing in a wet socket, under a film of gloss, with slime
 * hanging off its underside — the four statements every button in this game is
 * made of (`nav-button.ts`, `lobe-shell.ts`, `band-slime.ts`).
 *
 * **It flares when the screen changes.** *When it is switching from player 1
 * top left to player 2 and the other way around, make some effect to indicate
 * it changes.* The slide already says a screen moved; the band is what says
 * *whose*, and it is the one part of the picture worth looking at twice at that
 * moment. So it blooms in the arriving seat's colour and settles — driven by
 * the page's own tick, so a page replayed flares again and nothing is stored
 * between frames.
 *
 * **And since 14 September 2026 it is a band across the whole screen**, in
 * the seat's own colour, with the picture under it framed by a rim in that
 * colour from the band down to the bar. Two days earlier it had been made
 * *smaller* — a lobe in the corner, so it stopped standing over the body being
 * explained — and the owner's next answer was that a tutorial has to say so
 * loudly: a page of film is the real screen at full size, so nothing but this
 * plate and the bar's slab tells a thumb the picture is not live. The band is
 * the way to be loud without covering. It takes the strip the plate already
 * stood in, on the same row under the HUD's top row, and nothing else: a
 * caption keeps clear of it (`guide-caption.ts`) and a round's header drops
 * under it (`round-header.ts`), both by `BANNER_H`, so a wider plate covers no
 * more of the field than the narrow one did.
 *
 * The plate is drawn on every page of a guide. On a page with no film there is
 * no seat to name, so it says TUTORIAL and stops: the word is the half that is
 * true of the written pages and the gate as well.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/**
 * Where the band sits: below the HUD's own top row — the score on the left,
 * the hull bar on the right — rather than over it.
 */
export const BANNER_TOP = 24;
/** How far in from the screen's edge it sits. */
const EDGE = 8;

/**
 * The two rows, and the distance between their baselines.
 *
 * They were cut by a third on 12 September 2026, when the plate was a lobe in
 * the corner: at eighteen points the name's row made a plate two thirds of a
 * phone across, and on wave after wave it stood over the very body the page
 * was about — *the round box which says "tutorial" often overlaps what is
 * being explained*. Now that the plate is a band, width costs nothing and
 * height is the whole budget: the name's row is sixteen points, which is as
 * tall as the band can go before its foot reaches the field's first row of
 * bodies.
 */
const TITLE_FONT = '700 16px "Courier New",monospace';
const TAG_FONT = '700 10px "Courier New",monospace';
const ROW_GAP = 18;
/** What the tag's own row takes, top to bottom; the name's row is `ROW_GAP`. */
const TAG_ROW = 12;
/** Where the tag's baseline sits under the middle of its row. */
const TAG_BASE = 3;
/** Room for the dot in front of TUTORIAL, and how far in front it sits. */
const DOT_R = 2.5;
const DOT_GAP = 7;

/**
 * How much taller the plate is than the rows it carries.
 *
 * **A grown contour is an ellipse, near enough, and an ellipse does not hold
 * the rectangle it is drawn around** — its corners are outside the curve. The
 * plate used to be sized as though it did, with two rows of type filling it
 * from top to bottom, so the descenders sat where the contour had already
 * closed; the owner's answer was that *the content is bigger than the button*.
 * Half again is what a rectangle needs to sit inside an ellipse with its
 * corners clear, and it is applied to the type rather than to a number
 * somebody wrote down, so a second row moves the plate with it. Across, the
 * band is the screen's width and the words are centred in it, which puts them
 * on the one line a contour is widest through.
 */
const FIT_Y = 1.5;

/**
 * And so the height, which a caption keeps clear of (`guide-caption.ts`). It is
 * the taller of the two: a page with no seat to name carries the tag alone.
 */
export const BANNER_H = Math.round((TAG_ROW + ROW_GAP) * FIT_Y);
const TAG_ONLY_H = Math.round(TAG_ROW * FIT_Y);

/** How thick the rim round the picture is at rest, and how far it swells. */
const RIM = 4;
const RIM_FLARE = 6;

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

/** What this screen is, across the top of it, for as long as the guide is up. */
export function drawGuideCorner(ctx: CanvasRenderingContext2D, l: Layout, p: CornerPlate): void {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const age = p.age ?? 0;
  if (skin) drawFrameRim(ctx, l, skin.tint, flash);

  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  const box = plateBox(l, title);
  drawPlate(ctx, l, box, skin?.tint ?? PALETTE.pod, flash, age);

  // Centred on the plate rather than set against its left edge, for the same
  // reason the plate is taller than the words: a contour is widest through its
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
  ctx.globalAlpha = 0.82;
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
 * The rim round the picture, from the top of the screen to the bar: the seat's
 * colour on all four sides, in the same place on every page.
 *
 * It is the quiet half of the announcement. A player who looked away and back
 * reads the colour before they read anything at all, and a picture with a lit
 * edge all the way round is a picture in a window — the bar's slab carries a
 * rim of its own along its top for the same reason, and this one runs down to
 * meet it. It swells with the flare, so the whole frame says a screen has
 * changed.
 */
function drawFrameRim(ctx: CanvasRenderingContext2D, l: Layout, hex: string, flash: number): void {
  ctx.globalAlpha = 0.6 + 0.4 * flash;
  ctx.fillStyle = hex;
  const rule = RIM + RIM_FLARE * flash;
  ctx.fillRect(0, 0, rule, l.height);
  ctx.fillRect(l.width - rule, 0, rule, l.height);
  ctx.fillRect(0, 0, l.width, rule);
  ctx.fillRect(0, l.height - rule, l.width, rule);
  ctx.globalAlpha = 1;
}

/**
 * The plate itself: the screen's width less an edge, and as tall as its rows
 * need plus the room an ellipse costs them (`FIT_Y`). Nothing here is measured
 * from the words any more, so a name arriving from the room (`seat-name.ts`)
 * changes what is written on the band and never its shape.
 */
function plateBox(l: Layout, title: string): Box {
  return {
    x: EDGE,
    y: BANNER_TOP,
    w: l.width - EDGE * 2,
    h: title === "" ? TAG_ONLY_H : BANNER_H,
  };
}
