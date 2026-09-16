import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import {
  inside,
  type NavBox,
  type NavButtons,
} from "../../../../../packages/render/src/guide-nav.js";
import { drawPlate } from "../../../../../packages/render/src/guide-plate.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawNavButton } from "../../../../../packages/render/src/nav-button.js";
import { drawNavFeeder } from "../../../../../packages/render/src/nav-feeder.js";
import { slab } from "../../../../../packages/render/src/nav-slab.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatName } from "../../../../../packages/render/src/seat-name.js";
import { seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dots, wordButton } from "../word-button.js";

/**
 * SPOTLIGHT — the way a mobile game shows its first screen: everything that is
 * not the subject goes dark, the subject stands in a pool of light, and the
 * words are a speech bubble with a tail on it.
 *
 * **The dark is what says tutorial.** A page of film is the real screen at
 * full size, and the shipped band and slab are the only things telling a
 * thumb the picture is not live. Under a scrim the picture cannot be mistaken
 * for play — nothing in the game ever dims the field — and the one hole in it
 * is the thing the page is about, so the eye goes there before it reads.
 *
 * **The band is half again as tall and the words are twice as big.** TUTORIAL
 * at twenty-two points, the seat's name under it at fifteen in the seat's
 * own rim; the plate is the shipped one, grown.
 *
 * **The bar carries words.** BACK and NEXT say so, in type, on the panel's own
 * grown bodies; NEXT is the widest thing on the bar and the only one in the
 * pod's colour, so it is the one a thumb finds first. REPLAY keeps its loop.
 */

const BAND_TOP = 24;
const BAND_H = 66;
export const BAND_FOOT = BAND_TOP + BAND_H + 8;
export const NAV_HEIGHT = 100;

const TAG_FONT = '700 22px "Courier New",monospace';
const TITLE_FONT = '700 15px "Courier New",monospace';
const WORD_FONT = '700 17px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';
const EDGE = 8;

const BTN_H = 56;
const FOOT = 12;
const DOTS_Y = 16;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const hex = skin?.tint ?? PALETTE.pod;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  const h = title === "" ? 44 : BAND_H;
  const box = { x: EDGE, y: BAND_TOP, w: l.width - EDGE * 2, h };
  drawPlate(ctx, l, box, hex, flash, p.age ?? 0);

  const cx = box.x + box.w / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  const tagY = title === "" ? box.y + h / 2 + 8 : box.y + 30;
  const tagW = ctx.measureText("TUTORIAL").width;
  ctx.fillStyle = PALETTE.pod;
  ctx.beginPath();
  ctx.arc(cx - tagW / 2 - 14, tagY - 8, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.fillText("TUTORIAL", cx + 5, tagY);
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, tagY + 22);
  }
  ctx.textAlign = "left";
};

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  const y = top + NAV_HEIGHT - BTN_H - FOOT;
  const gap = 10;
  const replayW = BTN_H;
  const room = l.width - gap * 4 - replayW;
  const nextW = Math.round(room * 0.58);
  const backW = room - nextW;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    back: { x: gap, y, w: backW, h: BTN_H },
    replay: { x: gap * 2 + backW, y, w: replayW, h: BTN_H },
    next: { x: l.width - gap - nextW, y, w: nextW, h: BTN_H },
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
  const hues = [PALETTE.hull, PALETTE.shieldRim, PALETTE.pod] as const;
  const boxes = [b.back, b.replay, b.next] as const;
  boxes.forEach((box, i) => {
    drawNavFeeder(ctx, box.x + box.w / 2, b.bar.y + 2, box.y + 8, hues[i]!, age * 1.1 + i * 2.1);
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
  dots(ctx, s.page, s.pages, l.width / 2, b.bar.y + DOTS_Y);
};
