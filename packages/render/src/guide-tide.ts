import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import { inside, type NavBox, type NavButtons } from "./guide-nav.js";
import { membrane } from "./guide-tide-membrane.js";
import { CORNER, plate, wordPlate } from "./guide-tide-plate.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { drawNavFeeder } from "./nav-feeder.js";
import { slab } from "./nav-slab.js";
import { PALETTE } from "./palette.js";
import { seatName } from "./seat-name.js";
import { seatSkin } from "./seat-skin.js";

/**
 * TIDE — CONSOLE's arrangement, cut from a square body, under a living top.
 *
 * **It is three of the owner's answers in one candidate**, written down on 16
 * September 2026 after he read the five that were already standing:
 *
 * - CONSOLE's *positions and the additional dotted yellow line* are kept
 *   whole: NEXT the width of the phone at the foot, BACK and REPLAY up in the
 *   top bezel out of the thumb's way, and the dashed amber ring turning on the
 *   subject (`caption.ts`). What is fixed is the one thing he named as wrong
 *   with it — *can we make the remaining steps more visible, because black on
 *   black is not so visible*. CONSOLE drew the pages it had not reached in
 *   `#332B57` on a near-black bezel, which is a mark nobody can count.
 * - RIBBON's top moved, and he liked that *the top has some fancy animation*
 *   while asking for one that *should look more alien living creature fluid
 *   like*: the diagonal tape is gone and `membrane.ts` is in its place.
 * - RIBBON's box of words is the shape of every button here, because he asked
 *   for exactly that — *the rounded buttons i like to replace with this
 *   shape*. `plate.ts` is the shape; nothing on this page is a blob.
 *
 * **How it can lose.** It is the busiest chrome of the six: a surface moving
 * at the top of every page of a tutorial is a second thing to look at while
 * reading, and a guide's whole job is to point at one thing. The lobes under
 * the sheets are the part to watch — they move on their own clock, and a
 * reader who tracks one has stopped reading.
 */

export const BAND_FOOT = 104;
export const NAV_HEIGHT = 96;
const BEZEL_H = 96;

const TAG_FONT = '700 24px "Courier New",monospace';
const TITLE_FONT = '700 14px "Courier New",monospace';
const WORD_FONT = '700 20px "Courier New",monospace';
const SMALL_FONT = '700 13px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';

const SMALL_W = 78;
const SMALL_H = 42;
const NEXT_H = 58;
const GAP = 12;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const hex = skin?.tint ?? PALETTE.pod;
  const age = p.age ?? 0;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;

  membrane(ctx, { x: 0, y: 0, w: l.width, h: BEZEL_H }, hex, PALETTE.pod, age);
  if (flash > 0) halo(ctx, l.width / 2, BEZEL_H / 2, l.width * 0.6, hex, 0.5 * flash);

  // The badge is the same plate the buttons are, so the top of the page and
  // the foot of it are visibly one kit rather than two ideas.
  const w = Math.min(l.width - 2 * (GAP + SMALL_W) - 24, 220);
  const badge = { x: (l.width - w) / 2, y: 18, w, h: BEZEL_H - 40 };
  plate(ctx, badge, { hex: PALETTE.pod, glow: flash * 0.6, live: true, hover: false });
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText("TUTORIAL", cx, badge.y + (title === "" ? 40 : 36));
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, badge.y + 53);
  }
  ctx.textAlign = "left";
  corners(ctx, l, BEZEL_H + 6, l.height - NAV_HEIGHT - 6, hex);
};

/**
 * The viewfinder's corner marks, kept from CONSOLE — they are half of why a
 * page of a guide cannot be taken for the live field, and the other half is
 * the ring the caption turns on its subject.
 */
function corners(ctx: CanvasRenderingContext2D, l: Layout, top: number, foot: number, hex: string) {
  const r = 14;
  ctx.strokeStyle = rgba(hex, 0.55);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (const [x, dx] of [
    [8, 1],
    [l.width - 8, -1],
  ] as const) {
    ctx.moveTo(x, top + r);
    ctx.lineTo(x, top);
    ctx.lineTo(x + dx * r, top);
    ctx.moveTo(x, foot - r);
    ctx.lineTo(x, foot);
    ctx.lineTo(x + dx * r, foot);
  }
  ctx.stroke();
}

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
  steps(ctx, s.page, s.pages, l.width / 2, b.bar.y + 14);
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
function steps(
  ctx: CanvasRenderingContext2D,
  page: number,
  pages: number,
  mid: number,
  cy: number,
): void {
  const gap = 5;
  const w = Math.min(30, Math.max(9, (210 - gap * (pages - 1)) / Math.max(1, pages)));
  const from = mid - (pages * w + (pages - 1) * gap) / 2;
  for (let i = 0; i < pages; i++) {
    const x = from + i * (w + gap);
    const here = i === page;
    const h = here ? 7 : 5;
    const y = cy - h / 2;
    if (here) halo(ctx, x + w / 2, cy, w * 1.4, PALETTE.pod, 0.45);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, Math.min(3, CORNER));
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
