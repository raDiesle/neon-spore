import type { Layout } from "./layout.js";
import { drawNavButton, drawNavFeeder, navBlob } from "./nav-button.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The bar a guide is turned by: BACK, REPLAY and NEXT, the step this seat is
 * on, and the word that says none of this is the game yet.
 *
 * **The pair sets the pace, not a clock.** The owner's instruction was exactly
 * that — *we need some "next" button, which the player can decide when to
 * switch to the next thing to explain* — and the step count is here for the
 * same reason a book has a page number: somebody who has just pressed NEXT four
 * times wants to know whether that was most of it or the start of it.
 *
 * **REPLAY is the middle button, and it replaced a loop.** The film used to
 * start itself over every couple of seconds; *the automatic repeat is ugly,
 * remove it — instead give the user a button to repeat the current step.* So a
 * page plays once, stands on its last frame, and plays again when it is asked
 * to (`guide-play.ts`). It is drawn spent on a page with no film — the sixteen
 * written guides, and the gate — because there a press would answer nothing.
 *
 * **NEXT glows once the page has played.** The owner asked for it by name —
 * *let next glow so it is clear when to press, when the animation finishes the
 * first time* — and it is the one piece of pacing advice the film can give
 * without taking the decision away.
 *
 * **The badge says TUTORIAL.** His words: *can we make it visible, maybe with
 * some graphic top left or text, or better near the navigation buttons of
 * tutorial, that it is tutorial mode and not game.* Near the buttons is the
 * right half of that choice — the picture above them is the game's own screen,
 * pixel for pixel, and this bar is the only part of the stage that is not
 * pretending to be it. Whose screen is being shown is a separate question and
 * answered separately, in the corner of the picture (`guide-switch.ts`).
 *
 * **The geometry is written down once.** `navButtons` is what the drawing uses
 * and what a thumb is hit-tested against (`apps/game/src/briefing.ts`,
 * `tools/director/src/stage-opening.ts`), so a button cannot be drawn where it
 * is not answered — the rule `bandLobes` already plays by one layer down.
 */

/** How tall the bar under a page is: a row of type, then a row of buttons. */
export const NAV_H = 104;
/** How wide one of the three is, at most, and how tall. */
const BTN_W = 112;
const BTN_H = 50;
const EDGE = 12;
/** The row of type above the buttons: where its middle sits inside the bar. */
const ROW_Y = 19;
const BADGE_FONT = '700 10px "Courier New",monospace';

export interface NavBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NavButtons {
  back: NavBox;
  replay: NavBox;
  next: NavBox;
  /** The bar itself, so a press on it never falls through to the field. */
  bar: NavBox;
}

/** Where the three are, from the stage alone. Drawn and hit-tested from this. */
export function navButtons(l: Layout): NavButtons {
  const top = l.height - NAV_H;
  const w = Math.min(BTN_W, Math.max(46, (l.width - EDGE * 4) / 3));
  const y = top + NAV_H - BTN_H - 14;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_H },
    back: { x: EDGE, y, w, h: BTN_H },
    replay: { x: l.width / 2 - w / 2, y, w, h: BTN_H },
    next: { x: l.width - EDGE - w, y, w, h: BTN_H },
  };
}

/** Which of them a point is on, or null. `null` on a point outside the bar. */
export function navHit(l: Layout, x: number, y: number): "back" | "replay" | "next" | null {
  const b = navButtons(l);
  if (inside(b.back, x, y)) return "back";
  if (inside(b.replay, x, y)) return "replay";
  if (inside(b.next, x, y)) return "next";
  return null;
}

/** Whether a point is on the bar at all — a press there is not a press on the field. */
export function onNavBar(l: Layout, y: number): boolean {
  return y >= l.height - NAV_H;
}

export function inside(box: NavBox, x: number, y: number): boolean {
  return x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h;
}

export interface NavState {
  /** The page this seat is on, and how many there are in all. */
  page: number;
  pages: number;
  /** Whether BACK answers anything — off once this seat has said READY. */
  back?: boolean;
  /** Whether there is a film on this page for REPLAY to play again. */
  replay?: boolean;
  /** Whether the page has played through at least once, so NEXT can say so. */
  played?: boolean;
  /** Seconds the page has been up, for anything that breathes. */
  age?: number;
}

/**
 * The bar, with the step this seat is on. `page` and `pages` are the seat's
 * own: the pair reads at their own speeds and one of them being on step two
 * while the other is on step five is the arrangement working, not a fault.
 */
export function drawGuideNav(ctx: CanvasRenderingContext2D, l: Layout, s: NavState): void {
  const b = navButtons(l);
  // A page drawn with no clock behind it reports an infinite age, and every
  // breathing thing on this bar is a sine of it — which is NaN, which is a
  // `moveTo` a real canvas refuses (`test/frame.test.ts`).
  const age = Number.isFinite(s.age) ? (s.age as number) : 0;
  ctx.fillStyle = "#0A0818";
  ctx.fillRect(b.bar.x, b.bar.y, b.bar.w, b.bar.h);
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, b.bar.y + 0.5);
  ctx.lineTo(l.width, b.bar.y + 0.5);
  ctx.stroke();

  const canBack = (s.back ?? true) && s.page > 0;
  const last = s.page >= s.pages - 1;
  const skin = seatSkin(l.role);
  // The three necks first, under the buttons they feed: slime out of the edge
  // above, reaching down into each socket (`nav-button.ts`).
  const boxes = [b.back, b.replay, b.next] as const;
  const hues = [PALETTE.hull, PALETTE.shieldRim, PALETTE.pod] as const;
  boxes.forEach((box, i) => {
    drawNavFeeder(ctx, box.x + box.w / 2, b.bar.y + 1, box.y + 6, hues[i]!, age * 1.1 + i * 2.1);
  });
  const paint = { dpr: l.dpr, lip: skin.lip };
  drawNavButton(ctx, { ...b.back, ...paint, text: "BACK", live: canBack, hex: hues[0], glow: 0 });
  drawNavButton(ctx, {
    ...b.replay,
    ...paint,
    text: "REPLAY",
    live: s.replay ?? false,
    hex: hues[1],
    glow: 0,
    loop: true,
  });
  // On the last page there is nowhere forward: that page *is* the gate, and its
  // own circles are what end the guide (`ready-page.ts`). It stays NEXT to the
  // end all the same — the owner asked for that in one line, and he is right
  // that a button which renames itself on the second-to-last step is a button
  // the thumb has to read again every time.
  drawNavButton(ctx, {
    ...b.next,
    ...paint,
    text: "NEXT",
    live: !last,
    hex: hues[2],
    glow: last || !s.played ? 0 : 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)),
  });

  const cy = b.bar.y + ROW_Y;
  const left = badge(ctx, EDGE, cy);
  ctx.font = '700 11px "Courier New",monospace';
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "right";
  const count = `STEP ${s.page + 1} / ${s.pages}`;
  ctx.fillText(count, l.width - EDGE, cy + 4);
  ctx.textAlign = "left";
  pips(ctx, s, left + 12, l.width - EDGE - ctx.measureText(count).width - 12, cy);
}

/**
 * The word that says this is not the game yet, cut from the same contour the
 * buttons under it are. Answers with its own right edge, so the pips beside it
 * know where they may start.
 */
function badge(ctx: CanvasRenderingContext2D, x: number, cy: number): number {
  ctx.font = BADGE_FONT;
  const w = ctx.measureText("TUTORIAL").width + 30;
  const path = navBlob(w, 20);
  ctx.save();
  ctx.translate(x + w / 2, cy);
  ctx.fillStyle = "rgba(255,86,168,.13)";
  ctx.fill(path);
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 1.4;
  ctx.stroke(path);
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.arc(x + 13, cy, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = BADGE_FONT;
  ctx.fillText("TUTORIAL", x + 21, cy + 3.5);
  return x + w;
}

/**
 * One dot per step, the one this seat is on lit. The count beside it says which
 * step; these say how much of it is left, which is the other half of the same
 * question. Skipped when the room between the badge and the count is too narrow
 * to hold them — a row of dots overlapping a word is worse than no dots.
 */
function pips(
  ctx: CanvasRenderingContext2D,
  s: NavState,
  from: number,
  to: number,
  cy: number,
): void {
  const gap = Math.min(9, (to - from) / Math.max(1, s.pages));
  if (gap < 5) return;
  const start = (from + to) / 2 - ((s.pages - 1) * gap) / 2;
  for (let i = 0; i < s.pages; i++) {
    ctx.fillStyle = i === s.page ? PALETTE.pod : "#3B3163";
    ctx.beginPath();
    ctx.arc(start + i * gap, cy, i === s.page ? 3.4 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
}
