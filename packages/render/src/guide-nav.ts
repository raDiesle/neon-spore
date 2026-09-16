import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { drawNavButton } from "./nav-button.js";
import { drawNavFeeder } from "./nav-feeder.js";
import { slab } from "./nav-slab.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * The bar a guide is turned by: BACK, REPLAY and NEXT, and the dots that say
 * how far through this seat has got.
 *
 * **The pair sets the pace, not a clock.** The owner's instruction was exactly
 * that — *we need some "next" button, which the player can decide when to
 * switch to the next thing to explain* — and the dots are here for the same
 * reason a book has a page number: somebody who has just pressed NEXT twice
 * wants to know whether that was most of it or the start of it. They used to
 * have `STEP 2 / 5` beside them, which he cut: *it is duplicated with dots we
 * already have; remove the numbered step and keep the dots.*
 *
 * **REPLAY is the middle button, and it replaced a loop.** The film used to
 * start itself over every couple of seconds; *the automatic repeat is ugly,
 * remove it — instead give the user a button to repeat the current step.* So a
 * page plays once, stands on its last frame, and plays again when it is asked
 * to (`guide-play.ts`). It is drawn spent on a page with no film — the sixteen
 * written guides, and the gate — because there a press would answer nothing.
 *
 * **NEXT is loud once the page has played.** He asked for the glow by name, and
 * then for more of it: *when the animation is finished for a step, the next must
 * raise more attention.* So it is a halo that breathes, a thicker rim, a body
 * that carries its colour and a sign that grows with the pulse — the one piece
 * of pacing advice the film can give without taking the decision away.
 *
 * **This bar is not part of the ship, and it says so.** *The area of tutorial
 * navigation must look much more distinguished than the game control set above
 * it, because it doesn't actually belong to the game — it should be a layer on
 * top.* So it is a slab of a different colour from the panel's violet tissue,
 * taller than it was, with its own lit rim, a shadow it casts up onto the game,
 * and slime running out of that rim into the sockets. It reads as something
 * laid over the phone rather than a fourth row of the control panel.
 *
 * **The geometry is written down once.** `navButtons` is what the drawing uses
 * and what a thumb is hit-tested against (`navHit` in `guide-look.ts`, read by
 * `apps/game/src/briefing.ts` and `tools/director/src/stage-opening.ts`), so a
 * button cannot be drawn where it is not answered — the rule `bandLobes`
 * already plays by one layer down. Both sit on `GUIDE_LOOK`, so a candidate
 * bar patched in for a VERSUS pair carries its own hit boxes with it.
 */

/** How tall the bar under a page is: a row of dots, then a row of buttons.
 * 118 until 12 September 2026, when the owner asked for it shorter. */
export const NAV_H = 86;
/** How far the bar's shadow reaches up over the game it is lying on. */
export const LIFT = 16;
/** How wide one of the three is, at most, and how tall. */
const BTN_W = 96;
const BTN_H = 46;
const EDGE = 12;
/** Where the row of dots sits inside the bar, and the buttons' clearance
 * under it. */
const DOTS_Y = 17;
const FOOT = 11;
/**
 * Seconds the bar stays lit after a press on the picture.
 *
 * **A press on a film page is answered, and the answer is this bar.** The
 * picture is the real screen at full size, so a thumb that has not read the
 * plate presses the cannon and nothing happens — which is the one thing in
 * the game that behaves like a broken control. The owner, 14 September 2026:
 * *it must be plain the picture is not live and the bar is the only way on.*
 * So the press is dropped where it lands (`apps/game/src/briefing.ts`) and
 * the slab's rim and NEXT flash for a moment, saying *here, not there*.
 */
export const NUDGE_S = 0.6;

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
  const y = top + NAV_H - BTN_H - FOOT;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_H },
    back: { x: EDGE, y, w, h: BTN_H },
    replay: { x: l.width / 2 - w / 2, y, w, h: BTN_H },
    next: { x: l.width - EDGE - w, y, w, h: BTN_H },
  };
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
  /** Where a mouse is resting, in stage coordinates. Absent on a phone. */
  pointer?: { x: number; y: number };
  /** Seconds since a press on the picture rather than on the bar, or absent:
   * the bar flashes for `NUDGE_S` after one. */
  nudge?: number;
}

/**
 * The bar, with the step this seat is on. `page` and `pages` are the seat's
 * own: the pair reads at their own speeds and one of them being on step two
 * while the other is on the gate is the arrangement working, not a fault.
 */
export function drawGuideNav(ctx: CanvasRenderingContext2D, l: Layout, s: NavState): void {
  const b = navButtons(l);
  // A page drawn with no clock behind it is drawn at `SETTLED_AGE`, which is
  // finite on purpose: everything breathing here is a sine of this number
  // (`opening-fx.ts`).
  const age = s.age ?? 0;
  const nudge = s.nudge === undefined ? 0 : Math.max(0, 1 - s.nudge / NUDGE_S);
  slab(ctx, l, b.bar, age, nudge);

  const canBack = (s.back ?? true) && s.page > 0;
  const last = s.page >= s.pages - 1;
  const skin = seatSkin(l.role);
  const boxes = [b.back, b.replay, b.next] as const;
  const hues = [PALETTE.hull, PALETTE.shieldRim, PALETTE.pod] as const;
  // The necks first, under the buttons they feed, and two more between them so
  // the rim is dripping along its whole length rather than in three places.
  boxes.forEach((box, i) => {
    drawNavFeeder(ctx, box.x + box.w / 2, b.bar.y + 2, box.y + 8, hues[i]!, age * 1.1 + i * 2.1);
  });
  for (const [i, at] of [0.28, 0.72].entries()) {
    drawNavFeeder(ctx, l.width * at, b.bar.y + 2, b.bar.y + 26, PALETTE.hull, age * 0.8 + i * 3.7);
  }

  const over = (box: NavBox): boolean =>
    s.pointer !== undefined && inside(box, s.pointer.x, s.pointer.y);
  const paint = { dpr: l.dpr, lip: skin.lip };
  drawNavButton(ctx, {
    ...b.back,
    ...paint,
    sign: "back",
    live: canBack,
    hex: hues[0],
    glow: 0,
    hover: over(b.back),
  });
  drawNavButton(ctx, {
    ...b.replay,
    ...paint,
    sign: "replay",
    live: s.replay ?? false,
    hex: hues[1],
    glow: 0,
    hover: over(b.replay),
  });
  // On the last page there is nowhere forward: that page *is* the gate, and its
  // own circles are what end the guide (`ready-page.ts`).
  drawNavButton(ctx, {
    ...b.next,
    ...paint,
    sign: "next",
    live: !last,
    hex: hues[2],
    glow: last ? 0 : Math.max(nudge, s.played ? 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)) : 0),
    hover: over(b.next),
  });

  dots(ctx, s, l.width / 2, b.bar.y + DOTS_Y);
}

/**
 * One dot per step, the one this seat is on lit. The only readout left on this
 * bar: the numbers beside them said the same thing twice.
 */
function dots(ctx: CanvasRenderingContext2D, s: NavState, mid: number, cy: number): void {
  const gap = Math.min(16, Math.max(8, 200 / Math.max(1, s.pages)));
  const from = mid - ((s.pages - 1) * gap) / 2;
  for (let i = 0; i < s.pages; i++) {
    const here = i === s.page;
    if (here) halo(ctx, from + i * gap, cy, 9, PALETTE.pod, 0.5);
    ctx.fillStyle = here ? PALETTE.pod : "#332B57";
    ctx.beginPath();
    ctx.arc(from + i * gap, cy, here ? 4.2 : 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}
