import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * BACK, the page number, and NEXT: the bar a stepped guide is turned by.
 *
 * **The pair sets the pace, not a clock.** The owner's instruction was exactly
 * that — *we need some "next" button, which the player can decide when to
 * switch to the next thing to explain; until clicked it repeats the animation
 * and explanation in the current step* — and the page number is here for the
 * same reason a book has one: somebody who has just pressed NEXT four times
 * wants to know whether that was most of it or the start of it.
 *
 * **The geometry is written down once.** `navButtons` is what the drawing uses
 * and what a thumb is hit-tested against (`apps/game/src/briefing.ts`,
 * `tools/director/src/stage-touch.ts`), so a button cannot be drawn where it is
 * not answered — the rule `bandLobes` already plays by one layer down.
 *
 * The whole screen used to be the guide's button. It cannot be any more: there
 * are three things to press here, and a press anywhere that meant NEXT would
 * make BACK unreachable on the half of the screen it was not on.
 *
 * BACK goes dark once the seat has said READY. That is not a style choice: the
 * simulation refuses to move a cursor a latched circle belongs to
 * (`sim/guide-steps.ts`), and a button drawn live that answers nothing is the
 * one thing worse than a button that is plainly spent.
 */

/** How tall the bar under a page of film is. */
export const NAV_H = 78;
/** How wide BACK and NEXT are, and how tall. */
const BTN_W = 104;
const BTN_H = 46;
const EDGE = 12;

export interface NavBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface NavButtons {
  back: NavBox;
  next: NavBox;
  /** The bar itself, so a press on it never falls through to the field. */
  bar: NavBox;
}

/** Where the three are, from the stage alone. Drawn and hit-tested from this. */
export function navButtons(l: Layout): NavButtons {
  const top = l.height - NAV_H;
  const w = Math.min(BTN_W, Math.max(58, (l.width - EDGE * 3) / 2));
  const y = top + (NAV_H - BTN_H) / 2;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_H },
    back: { x: EDGE, y, w, h: BTN_H },
    next: { x: l.width - EDGE - w, y, w, h: BTN_H },
  };
}

/** Which of them a point is on, or null. `null` on a point outside the bar. */
export function navHit(l: Layout, x: number, y: number): "back" | "next" | null {
  const b = navButtons(l);
  if (inside(b.back, x, y)) return "back";
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

/**
 * The bar, with the page this seat is on. `page` and `pages` are the seat's
 * own: the pair reads at their own speeds and one of them being on page two
 * while the other is on page five is the arrangement working, not a fault.
 */
export function drawGuideNav(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  page: number,
  pages: number,
  back = true,
): void {
  const b = navButtons(l);
  ctx.fillStyle = "#0A0818";
  ctx.fillRect(b.bar.x, b.bar.y, b.bar.w, b.bar.h);
  ctx.strokeStyle = PALETTE.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, b.bar.y + 0.5);
  ctx.lineTo(l.width, b.bar.y + 0.5);
  ctx.stroke();

  button(ctx, b.back, "\u25C0 BACK", back && page > 0);
  // On the last page there is nowhere forward: that page *is* the gate, and its
  // own button is what ends the guide (`ready-page.ts`).
  button(ctx, b.next, page >= pages - 2 ? "READY \u25B6" : "NEXT \u25B6", page < pages - 1);

  // The count in the middle, and the pips under it. Two ways of saying the same
  // thing because they answer different questions — "which one is this" and
  // "how much of this is left".
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = '700 13px "Courier New",monospace';
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(`${page + 1} / ${pages}`, cx, b.bar.y + 30);
  const gap = 9;
  const from = cx - ((pages - 1) * gap) / 2;
  for (let i = 0; i < pages; i++) {
    ctx.fillStyle = i === page ? PALETTE.pod : "#3B3163";
    ctx.beginPath();
    ctx.arc(from + i * gap, b.bar.y + 44, i === page ? 3.4 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = "left";
}

/** One button. A disabled one is still drawn: a gap would move the other. */
function button(ctx: CanvasRenderingContext2D, box: NavBox, text: string, live: boolean): void {
  ctx.fillStyle = live ? "rgba(28,20,58,.96)" : "rgba(16,12,32,.7)";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = live ? PALETTE.pod : "#2A2348";
  ctx.lineWidth = live ? 2 : 1;
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  ctx.textAlign = "center";
  ctx.font = '700 14px "Courier New",monospace';
  ctx.fillStyle = live ? PALETTE.text : PALETTE.dim;
  ctx.fillText(text, box.x + box.w / 2, box.y + box.h / 2 + 5);
  ctx.textAlign = "left";
}
