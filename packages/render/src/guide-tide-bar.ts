import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import { inside, type NavBox, type NavButtons } from "./guide-nav.js";
import { CORNER, plate, wordPlate } from "./guide-tide-plate.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawNavFeeder } from "./nav-feeder.js";
import { slab } from "./nav-slab.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

/**
 * TIDE's bar, and the two of its three that are not on it.
 *
 * Out of `guide-tide.ts` on line count on 16 September 2026, when the badge's
 * rows were measured and the file went past 250. The seam is the one the page
 * already has: the band across the top is what a page *is*, and this is what a
 * page is turned by. They share nothing but the plate and the numbers below.
 *
 * **BACK and REPLAY are up in the top bezel**, which is CONSOLE's arrangement
 * and the owner's own reading of it — the thumb's reach at the foot of a phone
 * belongs to the one button that is pressed on every page, so NEXT gets the
 * whole width and the two that are pressed rarely get out of its way. All
 * three say their names: *NEXT must say "Next" in text also, to be easier to
 * find and to click*, and a bar where one of three carries a word and two
 * carry signs is a bar with two kits in it.
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
const SMALL_FONT = '700 13px "Courier New",monospace';

const SMALL_W = 78;
const SMALL_H = 42;
const NEXT_H = 58;
const GAP = 12;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    back: { x: GAP, y: 26, w: SMALL_W, h: SMALL_H },
    replay: { x: l.width - GAP - SMALL_W, y: 26, w: SMALL_W, h: SMALL_H },
    next: { x: GAP + 8, y: top + 26, w: l.width - GAP * 2 - 16, h: NEXT_H },
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

  // The two small ones hang off the top bezel the way the bar's hang off the
  // bar: nothing on this page simply sits where it was put.
  drawNavFeeder(ctx, b.back.x + b.back.w / 2, 2, b.back.y + 6, PALETTE.hull, age * 1.1);
  drawNavFeeder(
    ctx,
    b.replay.x + b.replay.w / 2,
    2,
    b.replay.y + 6,
    PALETTE.shieldRim,
    age * 1.1 + 2.1,
  );
  wordPlate(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: PALETTE.hull, glow: 0, hover: over(b.back) },
    "BACK",
    -1,
    SMALL_FONT,
    7,
  );
  // REPLAY says its name too. The shipped bar puts a loop sign here, and the
  // owner's ask was that a button be easier to find and to click — which is
  // the argument for the word, and it makes all three one shape.
  replayPlate(ctx, {
    ...b.replay,
    ...paint,
    live: s.replay ?? false,
    hex: PALETTE.shieldRim,
    glow: 0,
    hover: over(b.replay),
  });
  drawNavFeeder(ctx, l.width / 2, b.bar.y + 2, b.next.y + 8, PALETTE.pod, age * 1.1 + 4.2);
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

/** REPLAY: the plate with its name centred on it and no arrow either side. */
function replayPlate(
  ctx: CanvasRenderingContext2D,
  p: NavBox & { live: boolean; hex: string; glow: number; hover: boolean },
): void {
  plate(ctx, p, p);
  ctx.font = SMALL_FONT;
  ctx.fillStyle = p.live ? (p.hover ? "#FFF6E4" : p.hex) : "#3A3160";
  ctx.textAlign = "center";
  ctx.fillText("REPLAY", p.x + p.w / 2, p.y + p.h / 2 + 10);
  ctx.textAlign = "left";
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
