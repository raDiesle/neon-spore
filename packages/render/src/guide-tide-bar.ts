import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import { inside, type NavBox, type NavButtons } from "./guide-nav.js";
import { arrow, CORNER, CREST_H, plate, wordPlate } from "./guide-tide-plate.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawBeads, loopSign } from "./nav-button.js";
import { drawNavFeeder } from "./nav-feeder.js";
import { slab } from "./nav-slab.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * TIDE's bar, and the row of three a guide is turned by.
 *
 * Out of `guide-tide.ts` on line count on 16 September 2026, when the badge's
 * rows were measured and the file went past 250. The seam is the one the page
 * already has: the band across the top is what a page *is*, and this is what a
 * page is turned by. They share nothing but the plate and the numbers below.
 *
 * **All three are on the bar, in one row, and only NEXT carries a word.** They
 * were not: BACK and REPLAY hung in the top bezel, which is CONSOLE's
 * arrangement, and all three said their names. The owner asked for the row on
 * 24 September 2026 — *the "retry" button navigation I suggest to have left
 * next to "Next" button, as well the prev button, but much less wide with icon
 * only both* — and the reading behind it is the one the bezel was meant to
 * serve: a page is turned with one thumb at the foot of the phone, so the two
 * that turn it the other way should be under that thumb too, not an inch from
 * the notch. They are `SMALL_W` wide against NEXT's remainder, which is what
 * keeps the press a pair makes on every page the easy one to find.
 *
 * **A sign on the two, the word on NEXT.** A word costs width and there is
 * none left at this size, and the two signs are the bar's own from before TIDE
 * (`nav-button.ts`): the grown arrow and the loop with a head on its line.
 * NEXT keeps its word, which is the owner's one standing ask of this bar —
 * *NEXT must say "Next" in text also, to be easier to find and to click* — and
 * it is the button that had the room.
 *
 * **The pages are drawn to be counted.** CONSOLE filled the ones already read
 * in amber and the rest in `#332B57` on a near-black bezel — *can we make the
 * remaining steps more visible, because black on black is not so visible.* So
 * a step still to come is a cut plate outlined at full strength over a lit
 * ground, and the row is countable before the first page is turned.
 */

/** How tall the bar under a page is; the film is laid out above it. */
export const NAV_HEIGHT = 96;

const WORD_FONT = '700 20px "Courier New",monospace';

/**
 * How wide an icon-only button is, and the floor it shrinks to.
 *
 * A share of the stage rather than a fixed number, because the row has to hold
 * on a 240-wide screen as well as on a tablet: two of these and NEXT's word
 * share one width, and a pair of plates that stayed 54 wide would leave NEXT
 * too narrow to read at the bottom of that range.
 */
const SMALL_W = 54;
const SMALL_MIN = 38;
const NEXT_H = 58;
const GAP = 12;
/** Between the two small ones and NEXT: closer than the bar's own margin, so
 * the three read as one row rather than as a pair and a button. */
const ROW_GAP = 10;
/** How big a sign on an icon-only plate is. NEXT's own arrow is eleven, and
 * the three read as one kit only while they are the same size. */
const SIGN_R = 11;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  const edge = GAP + 8;
  const small = Math.max(SMALL_MIN, Math.min(SMALL_W, Math.round(l.width * 0.14)));
  const y = top + 26;
  const step = small + ROW_GAP;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    back: { x: edge, y, w: small, h: NEXT_H },
    replay: { x: edge + step, y, w: small, h: NEXT_H },
    next: { x: edge + step * 2, y, w: l.width - edge * 2 - step * 2, h: NEXT_H },
  };
}

export const nav: GuideLook["nav"] = (ctx, l, s) => {
  const b = buttons(l);
  const age = s.age ?? 0;
  const nudge = s.nudge === undefined ? 0 : Math.max(0, 1 - s.nudge / NUDGE_S);
  slab(ctx, l, b.bar, age, nudge);
  const skin = seatSkin(l.role);
  const canBack = (s.back ?? true) && s.page > 0;
  const last = s.page >= s.pages - 1;
  const over = (box: NavBox): boolean =>
    s.pointer !== undefined && inside(box, s.pointer.x, s.pointer.y);
  const paint = { dpr: l.dpr, lip: skin.lip };
  const glow = last
    ? 0
    : Math.max(nudge, s.played ? 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)) : 0);

  // All three hang off the bar's own membrane, each on its own clock: nothing
  // on this page simply sits where it was put.
  drawNavFeeder(ctx, b.back.x + b.back.w / 2, b.bar.y + 2, b.back.y + 8, PALETTE.hull, age * 1.1);
  drawNavFeeder(
    ctx,
    b.replay.x + b.replay.w / 2,
    b.bar.y + 2,
    b.replay.y + 8,
    PALETTE.shieldRim,
    age * 1.1 + 2.1,
  );
  drawNavFeeder(
    ctx,
    b.next.x + b.next.w / 2,
    b.bar.y + 2,
    b.next.y + 8,
    PALETTE.pod,
    age * 1.1 + 4.2,
  );
  signPlate(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: PALETTE.hull, glow: 0, hover: over(b.back) },
    "back",
  );
  signPlate(
    ctx,
    {
      ...b.replay,
      ...paint,
      live: s.replay ?? false,
      hex: PALETTE.shieldRim,
      glow: 0,
      hover: over(b.replay),
    },
    "replay",
  );
  wordPlate(
    ctx,
    { ...b.next, ...paint, live: !last, hex: PALETTE.pod, glow, hover: over(b.next) },
    "NEXT",
    1,
    WORD_FONT,
    11,
  );
  steps(ctx, l, s.page, s.pages);
};

/**
 * An icon-only plate: TIDE's cut body with one of the bar's own signs on the
 * face of it, centred, and a bead hanging off the sign the way NEXT's arrow
 * has one.
 *
 * **The signs are `nav-button.ts`'s**, not new ones. That file drew the whole
 * bar before TIDE and its two shapes — the grown arrow with the concave back,
 * the loop with a head tangent to its own line — were each argued out with the
 * owner. A second pair drawn here would be the same two shapes disagreeing.
 */
function signPlate(
  ctx: CanvasRenderingContext2D,
  p: NavBox & { live: boolean; hex: string; glow: number; hover: boolean },
  sign: "back" | "replay",
): void {
  plate(ctx, p, p);
  const lit = p.live && (p.hover || p.glow > 0);
  const size = SIGN_R * (1 + 0.12 * p.glow);
  ctx.fillStyle = p.live ? (lit ? "#FFF6E4" : p.hex) : "#3A3160";
  ctx.strokeStyle = ctx.fillStyle;
  // On the middle of the body below the crest, the way a word is: the crest
  // takes the top of the plate and a sign centred on the box rides high.
  const cy = p.y + (p.h + CREST_H) / 2;
  const cx = p.x + p.w / 2;
  if (sign === "replay") loopSign(ctx, cx, cy, size);
  else arrow(ctx, cx, cy, size, -1);
  if (p.live) drawBeads(ctx, cx + size * 0.1, cy + size * 1.05, size);
}

/**
 * Where each step's mark is, from the stage and the count alone.
 *
 * **Exported for the reason the three buttons are** (`guide-look.ts`): a mark
 * is now a thing a thumb can press — the owner, 20 September 2026, asked for
 * *clicking on the golden lines indicating the current step* to be a way
 * through a guide beside the buttons — and geometry a thumb is tested against
 * has to be the geometry the row is drawn from, or a candidate that moves the
 * row moves the marks away from where they answer.
 *
 * These are the plates themselves, five and seven pixels tall. What a thumb
 * gets is this row opened out (`navStepHit`): nobody hits a five-pixel line,
 * and nothing else in the bar's top strip is pressable.
 */
export function stepBoxes(l: Layout, pages: number): NavBox[] {
  const cy = l.height - NAV_HEIGHT + STEP_Y;
  const gap = 5;
  const w = Math.min(30, Math.max(9, (210 - gap * (pages - 1)) / Math.max(1, pages)));
  const from = l.width / 2 - (pages * w + (pages - 1) * gap) / 2;
  const boxes: NavBox[] = [];
  for (let i = 0; i < pages; i++) {
    const h = STEP_H;
    boxes.push({ x: from + i * (w + gap), y: cy - h / 2, w, h });
  }
  return boxes;
}

/** How far down the bar the row of marks sits, and how tall a mark is. The
 * one being read is drawn a third taller and on the same middle. */
const STEP_Y = 14;
const STEP_H = 5;

/**
 * The pages, and the owner's own correction to CONSOLE: **a step not yet read
 * has to be visible.**
 *
 * CONSOLE filled the ones already read in amber and the rest in `#332B57` on a
 * bezel that is nearly black, so the row said how far in you were and not how
 * far there was to go. Here every step is a cut plate of the same size: read
 * ones filled, the one being read filled and haloed and a third taller, and
 * the ones to come **outlined in amber over a lit ground**. The row is
 * countable from across the room before the first page is turned, which is the
 * only thing it is for.
 */
function steps(ctx: CanvasRenderingContext2D, l: Layout, page: number, pages: number): void {
  for (const [i, box] of stepBoxes(l, pages).entries()) {
    const here = i === page;
    const cy = box.y + box.h / 2;
    const h = here ? box.h * 1.4 : box.h;
    const y = cy - h / 2;
    if (here) halo(ctx, box.x + box.w / 2, cy, box.w * 1.4, PALETTE.pod, 0.45);
    ctx.beginPath();
    ctx.roundRect(box.x, y, box.w, h, Math.min(3, CORNER));
    if (i <= page) {
      ctx.fillStyle = PALETTE.pod;
      ctx.fill();
    } else {
      // Lit ground under a full-strength rim: the mark the owner could not see.
      ctx.fillStyle = rgba(PALETTE.pod, 0.22);
      ctx.fill();
      ctx.strokeStyle = rgba(PALETTE.pod, 0.85);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }
  }
}
