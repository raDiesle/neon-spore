import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import {
  inside,
  type NavBox,
  type NavButtons,
} from "../../../../../packages/render/src/guide-nav.js";
import { drawPlate } from "../../../../../packages/render/src/guide-plate.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawNavButton } from "../../../../../packages/render/src/nav-button.js";
import { drawNavFeeder } from "../../../../../packages/render/src/nav-feeder.js";
import { slab } from "../../../../../packages/render/src/nav-slab.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatName } from "../../../../../packages/render/src/seat-name.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dots, wordButton } from "../word-button.js";

/**
 * RIBBON — a striped tape across the top of the screen, the way a practice
 * range or a test track is marked off: diagonal stripes in the seat's colour
 * with a badge in the middle saying TUTORIAL as the largest word on the phone.
 *
 * **The stripes are the signal.** Nothing in the game is striped. A band the
 * seat's colour could be the ship's; a band cut with diagonal tape cannot be
 * anything but a marking laid over it. The same tape runs along the top edge
 * of the bar and the top edge of the box of words, so the three pieces of
 * chrome are one kit and the picture between them is what is real.
 *
 * **BACK and NEXT are the two corners.** Tall word lobes, each a third of the
 * screen wide, the far left and the far right of the bar where a thumb rests
 * anyway; REPLAY is the small round one between them. The words are nineteen
 * points, NEXT in the pod's colour and lit once the page has played.
 */

const BAND_TOP = 18;
const BAND_H = 76;
export const BAND_FOOT = BAND_TOP + BAND_H + 8;
export const NAV_HEIGHT = 104;

const TAG_FONT = '700 26px "Courier New",monospace';
const TITLE_FONT = '700 14px "Courier New",monospace';
const WORD_FONT = '700 19px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';

const BTN_H = 60;
const WORD_W = 124;
const REPLAY = 48;
const GAP = 10;
const FOOT = 12;
const DOTS_Y = 14;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

/** Diagonal tape across a box: the seat's colour on near-black, at 45°. */
export function stripes(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; w: number; h: number },
  hex: string,
  alpha: number,
  drift: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w, box.h);
  ctx.clip();
  ctx.fillStyle = "rgba(9,7,20,.94)";
  ctx.fillRect(box.x, box.y, box.w, box.h);
  ctx.strokeStyle = rgba(hex, alpha);
  ctx.lineWidth = 12;
  const step = 30;
  const off = (drift * 18) % step;
  ctx.beginPath();
  for (let x = box.x - box.h - step + off; x < box.x + box.w + box.h; x += step) {
    ctx.moveTo(x, box.y + box.h + 2);
    ctx.lineTo(x + box.h + 4, box.y - 2);
  }
  ctx.stroke();
  ctx.restore();
}

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const hex = skin?.tint ?? PALETTE.pod;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  const tape = { x: 0, y: BAND_TOP, w: l.width, h: BAND_H };
  stripes(ctx, tape, hex, 0.5 + 0.4 * flash, p.age ?? 0);
  ctx.fillStyle = hex;
  ctx.fillRect(0, tape.y, l.width, 2);
  ctx.fillRect(0, tape.y + tape.h - 2, l.width, 2);

  // The badge: the shipped plate, narrower and taller, on the tape.
  const w = Math.min(l.width - 40, 262);
  const badge = { x: (l.width - w) / 2, y: tape.y + 6, w, h: tape.h - 12 };
  drawPlate(ctx, l, badge, hex, flash, p.age ?? 0);
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText("TUTORIAL", cx, badge.y + (title === "" ? 40 : 34));
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, badge.y + 54);
  }
  ctx.textAlign = "left";
};

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  const y = top + NAV_HEIGHT - BTN_H - FOOT;
  const w = Math.min(WORD_W, (l.width - GAP * 4 - REPLAY) / 2);
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    back: { x: GAP, y, w, h: BTN_H },
    replay: { x: (l.width - REPLAY) / 2, y: y + (BTN_H - REPLAY) / 2, w: REPLAY, h: REPLAY },
    next: { x: l.width - GAP - w, y, w, h: BTN_H },
  };
}

export const nav: GuideLook["nav"] = (ctx, l, s) => {
  const b = buttons(l);
  const age = s.age ?? 0;
  const nudge = s.nudge === undefined ? 0 : Math.max(0, 1 - s.nudge / NUDGE_S);
  slab(ctx, l, b.bar, age, nudge);
  const skin = seatSkin(l.role);
  stripes(ctx, { x: 0, y: b.bar.y, w: l.width, h: 7 }, skin.tint, 0.55 + 0.4 * nudge, age);
  const canBack = (s.back ?? true) && s.page > 0;
  const last = s.page >= s.pages - 1;
  const hues = [PALETTE.hull, PALETTE.shieldRim, PALETTE.pod] as const;
  const boxes = [b.back, b.replay, b.next] as const;
  boxes.forEach((box, i) => {
    drawNavFeeder(ctx, box.x + box.w / 2, b.bar.y + 7, box.y + 8, hues[i]!, age * 1.1 + i * 2.1);
  });
  const over = (box: NavBox): boolean =>
    s.pointer !== undefined && inside(box, s.pointer.x, s.pointer.y);
  const paint = { dpr: l.dpr, lip: skin.lip };
  const glow = last
    ? 0
    : Math.max(nudge, s.played ? 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)) : 0);
  wordButton(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: hues[0], glow: 0, hover: over(b.back) },
    "BACK",
    -1,
    WORD_FONT,
    9,
  );
  drawNavButton(ctx, {
    ...b.replay,
    ...paint,
    sign: "replay",
    live: s.replay ?? false,
    hex: hues[1],
    glow: 0,
    hover: over(b.replay),
  });
  wordButton(
    ctx,
    { ...b.next, ...paint, live: !last, hex: hues[2], glow, hover: over(b.next) },
    "NEXT",
    1,
    WORD_FONT,
    9,
  );
  dots(ctx, s.page, s.pages, l.width / 2, b.bar.y + DOTS_Y + 7);
};
