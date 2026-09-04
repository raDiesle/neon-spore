import { blobPath } from "@neon-spore/content";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * BACK, the page number, and NEXT: the bar a guide is turned by.
 *
 * **The pair sets the pace, not a clock.** The owner's instruction was exactly
 * that — *we need some "next" button, which the player can decide when to
 * switch to the next thing to explain; until clicked it repeats the animation
 * and explanation in the current step* — and the page number is here for the
 * same reason a book has one: somebody who has just pressed NEXT four times
 * wants to know whether that was most of it or the start of it.
 *
 * **They are grown, not ruled.** They were two stroked rectangles, which is the
 * one thing the owner named about the panel and then again about these: *make
 * the buttons look attractive like the control set*. So a button here is cut
 * from `blobPath` like every button on the band and every body in the game, it
 * sits over a soft pool of its own light, and the live one carries a halo. No
 * edge on this screen is a made edge any more.
 *
 * **NEXT glows once the page has played.** The owner asked for it by name —
 * *let next glow so it is clear when to press, when the animation finishes the
 * first time* — and it is the one piece of pacing advice the film can give
 * without taking the decision away: the page goes on repeating either way.
 *
 * **The geometry is written down once.** `navButtons` is what the drawing uses
 * and what a thumb is hit-tested against (`apps/game/src/briefing.ts`,
 * `tools/director/src/stage-opening.ts`), so a button cannot be drawn where it
 * is not answered — the rule `bandLobes` already plays by one layer down.
 */

/** How tall the bar under a page is. */
export const NAV_H = 82;
/** How wide BACK and NEXT are, and how tall. */
const BTN_W = 108;
const BTN_H = 50;
const EDGE = 12;
/** The contour every button on this bar is cut from — three lobes, shallow. */
const LOBES = 3;
const DEPTH = 0.05;
const SEED = 2207;

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

export interface NavState {
  /** The page this seat is on, and how many there are in all. */
  page: number;
  pages: number;
  /** Whether BACK answers anything — off once this seat has said READY. */
  back?: boolean;
  /** Whether the page has played through at least once, so NEXT can say so. */
  played?: boolean;
  /** Seconds the page has been up, for anything that breathes. */
  age?: number;
}

/**
 * The bar, with the page this seat is on. `page` and `pages` are the seat's
 * own: the pair reads at their own speeds and one of them being on page two
 * while the other is on page five is the arrangement working, not a fault.
 */
export function drawGuideNav(ctx: CanvasRenderingContext2D, l: Layout, s: NavState): void {
  const b = navButtons(l);
  const age = s.age ?? 0;
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
  button(ctx, b.back, "◀ BACK", canBack, PALETTE.hull, 0);
  // On the last page there is nowhere forward: that page *is* the gate, and its
  // own circles are what end the guide (`ready-page.ts`).
  button(
    ctx,
    b.next,
    s.page >= s.pages - 2 ? "READY ▶" : "NEXT ▶",
    !last,
    PALETTE.pod,
    last || !s.played ? 0 : 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)),
  );

  // The count in the middle, and the pips under it. Two ways of saying the same
  // thing because they answer different questions — "which one is this" and
  // "how much of this is left".
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = '700 13px "Courier New",monospace';
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(`${s.page + 1} / ${s.pages}`, cx, b.bar.y + 32);
  const gap = 9;
  const from = cx - ((s.pages - 1) * gap) / 2;
  for (let i = 0; i < s.pages; i++) {
    ctx.fillStyle = i === s.page ? PALETTE.pod : "#3B3163";
    ctx.beginPath();
    ctx.arc(from + i * gap, b.bar.y + 46, i === s.page ? 3.4 : 2.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textAlign = "left";
}

const paths = new Map<string, Path2D>();

/** The contour, cached: the bar redraws every frame and the shape never moves. */
function blob(w: number, h: number): Path2D {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  const held = paths.get(key);
  if (held) return held;
  if (paths.size > 8) paths.clear();
  const made = new Path2D(blobPath(0, 0, w / 2, h / 2, LOBES, DEPTH, 0.02, 0, SEED, 48));
  paths.set(key, made);
  return made;
}

/**
 * One button. A spent one is still drawn: a gap would move the other, and a
 * thumb that has learned where NEXT is should find it there on every page.
 */
function button(
  ctx: CanvasRenderingContext2D,
  box: NavBox,
  text: string,
  live: boolean,
  hex: string,
  glow: number,
): void {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const path = blob(box.w, box.h);
  if (glow > 0) halo(ctx, cx, cy, box.w * 0.72, hex, 0.3 * glow);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = live ? "rgba(28,20,58,.96)" : "rgba(16,12,32,.66)";
  ctx.fill(path);
  ctx.strokeStyle = live ? hex : "#2A2348";
  ctx.lineWidth = live ? 2 : 1;
  ctx.globalAlpha = live ? 0.55 + 0.45 * glow : 1;
  ctx.stroke(path);
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.textAlign = "center";
  ctx.font = '700 14px "Courier New",monospace';
  ctx.fillStyle = live ? PALETTE.text : PALETTE.dim;
  ctx.fillText(text, cx, cy + 5);
  ctx.textAlign = "left";
}
