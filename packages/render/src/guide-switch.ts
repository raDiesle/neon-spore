import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawLobeGloss, drawLobeSocket } from "./lobe-shell.js";
import { drawNavFeeder, navBlob } from "./nav-button.js";
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
 * Where the corner plate sits and how much room it takes, so a caption can keep
 * clear of it (`guide-caption.ts`). It starts below the HUD's own top row —
 * the score on the left, the hull bar on the right — rather than over it.
 */
export const BANNER_TOP = 24;
export const BANNER_H = 46;
/** Left edge, and how far in from it the type starts: a grown contour narrows
 * towards its ends, so words set against the box's own edge would run out. */
const EDGE = 8;
const INSET = 16;

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
  /** Seconds the page has been up, for the slime. Non-finite reads as 0: the
   * written pages hand this an infinite age (`briefing.ts`). */
  age?: number;
}

/** What this screen is, in the corner of it, for as long as the guide is up. */
export function drawGuideCorner(ctx: CanvasRenderingContext2D, l: Layout, p: CornerPlate): void {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const age = Number.isFinite(p.age) ? (p.age as number) : 0;
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
  ctx.textAlign = "left";
  ctx.font = '700 18px "Courier New",monospace';
  const named = title === "" ? 0 : ctx.measureText(title).width;
  ctx.font = '700 10px "Courier New",monospace';
  const room = Math.max(named, ctx.measureText("TUTORIAL").width + 14) + INSET * 2;
  const w = Math.min(l.width - EDGE * 2, room);
  const h = title === "" ? 26 : BANNER_H;

  plate(ctx, l, { x: EDGE, y: BANNER_TOP, w, h }, skin?.tint ?? PALETTE.pod, flash, age);

  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.arc(EDGE + INSET - 7, BANNER_TOP + 13, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '700 10px "Courier New",monospace';
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.72;
  ctx.fillText("TUTORIAL", EDGE + INSET, BANNER_TOP + 16);
  ctx.globalAlpha = 1;
  if (title === "" || !skin) return;
  ctx.font = '700 18px "Courier New",monospace';
  ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
  ctx.fillText(title, EDGE + INSET, BANNER_TOP + 39);
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The body under the words: the panel's button, stretched to a plate.
 *
 * Every line of it is the recipe a control on the band is drawn by — the round
 * socket and the round gloss become the long ones inside a horizontal stretch,
 * which is the same bargain `nav-button.ts` makes and the reason neither has to
 * bake a second set of sprites.
 */
function plate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  box: Box,
  hex: string,
  flash: number,
  age: number,
): void {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const r = box.h / 2;

  if (flash > 0) halo(ctx, cx, cy, box.w * 0.8, hex, 0.5 * flash);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(box.w / box.h, 1);
  drawLobeSocket(ctx, 0, 0, r, l.dpr, undefined, false);
  const body = ctx.createLinearGradient(0, -r, 0, r);
  body.addColorStop(0, tint(hex, 0.24 + 0.4 * flash));
  body.addColorStop(0.55, tint(hex, 0.1 + 0.24 * flash));
  body.addColorStop(1, "rgba(8,5,20,.96)");
  ctx.fillStyle = body;
  const path = navBlob(box.h, box.h);
  ctx.fill(path);
  ctx.strokeStyle = hex;
  ctx.lineWidth = 1.6 + 1.6 * flash;
  ctx.globalAlpha = 0.55 + 0.45 * flash;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  drawLobeGloss(ctx, 0, 0, r, l.dpr);
  ctx.restore();

  // Fed from underneath rather than from above: nothing hangs over the top of
  // the screen, and a plate in this game is still not a thing that simply sits
  // where it was put (`band-slime.ts`).
  const foot = box.y + box.h;
  for (const [i, at] of [0.3, 0.68].entries()) {
    drawNavFeeder(ctx, box.x + box.w * at, foot - 2, foot + 11, hex, age * 1.1 + i * 2.3);
  }
}

/** `#RRGGBB` at an alpha, for a gradient that has to carry the seat's colour. */
function tint(hex: string, alpha: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
