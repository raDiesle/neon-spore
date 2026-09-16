import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import {
  inside,
  type NavBox,
  type NavButtons,
} from "../../../../../packages/render/src/guide-nav.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawNavButton } from "../../../../../packages/render/src/nav-button.js";
import { drawNavFeeder } from "../../../../../packages/render/src/nav-feeder.js";
import { slab } from "../../../../../packages/render/src/nav-slab.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatName } from "../../../../../packages/render/src/seat-name.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { wordButton } from "../word-button.js";

/**
 * CONSOLE — the phone becomes a viewer: a slate bezel across the top holding
 * the header and the two small buttons, a slate bezel across the foot holding
 * one wide NEXT, and the game running in the window between.
 *
 * **The buttons are split by how often they are pressed.** NEXT is pressed on
 * every page, so it is the whole foot of the screen — one lobe the width of
 * the phone, the pod's colour, its name at twenty points, lit once the page
 * has played. BACK and REPLAY are pressed now and then, so they go up into
 * the top bezel, either side of the header, out of the thumb's way.
 *
 * **The bezel is the slab, top and bottom.** Cold slate rather than the
 * ship's warm violet, the same material as the shipped bar, closing the
 * picture in at both ends; TUTORIAL is stamped across the top in the pod's
 * colour at twenty-four points, with the page count as a row of segments
 * under it rather than dots. A window in a case is not the field; it is
 * something being shown.
 */

export const BAND_FOOT = 100;
export const NAV_HEIGHT = 92;
const BEZEL_H = 92;

const TAG_FONT = '700 24px "Courier New",monospace';
const TITLE_FONT = '700 14px "Courier New",monospace';
const WORD_FONT = '700 20px "Courier New",monospace';
const SMALL_FONT = '700 13px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';

const SMALL_W = 74;
const SMALL_H = 40;
const NEXT_H = 58;
const GAP = 12;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

/** The case's ground: the slab's slate, with a lit rim on the edge it shows the picture. */
function bezel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  h: number,
  rimAt: "top" | "foot",
): void {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, rimAt === "top" ? "#1B2140" : "#05070F");
  g.addColorStop(1, rimAt === "top" ? "#05070F" : "#1B2140");
  ctx.fillStyle = g;
  ctx.fillRect(0, y, l.width, h);
  ctx.fillStyle = PALETTE.pod;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(0, rimAt === "top" ? y : y + h - 2, l.width, 2);
  ctx.globalAlpha = 1;
}

/** The marks a viewfinder puts in its corners. */
function corners(ctx: CanvasRenderingContext2D, l: Layout, top: number, foot: number): void {
  const r = 14;
  ctx.strokeStyle = rgba(PALETTE.pod, 0.8);
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

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  bezel(ctx, l, 0, BEZEL_H, "foot");
  if (flash > 0)
    halo(ctx, l.width / 2, BEZEL_H / 2, l.width * 0.6, skin?.tint ?? PALETTE.pod, 0.5 * flash);
  corners(ctx, l, BEZEL_H + 6, l.height - 6);
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText("TUTORIAL", cx, title === "" ? 56 : 46);
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, 68);
  }
  ctx.textAlign = "left";
};

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    back: { x: GAP, y: 26, w: SMALL_W, h: SMALL_H },
    replay: { x: l.width - GAP - SMALL_W, y: 26, w: SMALL_W, h: SMALL_H },
    next: { x: GAP + 8, y: top + 22, w: l.width - GAP * 2 - 16, h: NEXT_H },
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
  // The two small ones hang off the top bezel's rim, the way the bar's hang
  // off its own.
  drawNavFeeder(ctx, b.back.x + b.back.w / 2, 2, b.back.y + 6, PALETTE.hull, age * 1.1);
  drawNavFeeder(
    ctx,
    b.replay.x + b.replay.w / 2,
    2,
    b.replay.y + 6,
    PALETTE.shieldRim,
    age * 1.1 + 2.1,
  );
  wordButton(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: PALETTE.hull, glow: 0, hover: over(b.back) },
    "BACK",
    -1,
    SMALL_FONT,
    7,
  );
  drawNavButton(ctx, {
    ...b.replay,
    ...paint,
    sign: "replay",
    live: s.replay ?? false,
    hex: PALETTE.shieldRim,
    glow: 0,
    hover: over(b.replay),
  });
  drawNavFeeder(ctx, l.width / 2, b.bar.y + 2, b.next.y + 8, PALETTE.pod, age * 1.1 + 4.2);
  wordButton(
    ctx,
    { ...b.next, ...paint, live: !last, hex: PALETTE.pod, glow, hover: over(b.next) },
    "NEXT",
    1,
    WORD_FONT,
    11,
  );
  segments(ctx, s.page, s.pages, l.width / 2, b.bar.y + 12);
};

/** The pages as a row of segments: the ones read lit, the rest dark. */
function segments(
  ctx: CanvasRenderingContext2D,
  page: number,
  pages: number,
  mid: number,
  cy: number,
): void {
  const gap = 4;
  const w = Math.min(34, Math.max(10, (200 - gap * (pages - 1)) / Math.max(1, pages)));
  const from = mid - (pages * w + (pages - 1) * gap) / 2;
  for (let i = 0; i < pages; i++) {
    const x = from + i * (w + gap);
    if (i === page) halo(ctx, x + w / 2, cy, w, PALETTE.pod, 0.4);
    ctx.fillStyle = i <= page ? PALETTE.pod : "#332B57";
    ctx.beginPath();
    ctx.roundRect(x, cy - 2, w, 4, 2);
    ctx.fill();
  }
}
