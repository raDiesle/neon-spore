import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import {
  inside,
  type NavBox,
  type NavButtons,
} from "../../../../../packages/render/src/guide-nav.js";
import { drawPlate } from "../../../../../packages/render/src/guide-plate.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import {
  drawBeads,
  drawNavBody,
  drawNavButton,
} from "../../../../../packages/render/src/nav-button.js";
import { drawNavFeeder } from "../../../../../packages/render/src/nav-feeder.js";
import { slab } from "../../../../../packages/render/src/nav-slab.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatName } from "../../../../../packages/render/src/seat-name.js";
import { type SeatSkin, seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { arrow, dots } from "../word-button.js";

/**
 * RAIL — BACK and NEXT are on the two side walls of the picture, at the
 * height a thumb holds a phone, and the header stands at the foot of the
 * picture instead of the top.
 *
 * **The walls, because that is where the thumbs are.** A phone held in two
 * hands has a thumb resting on each edge about two thirds of the way down;
 * a tall lobe grown out of each wall there, with its name written down it
 * letter by letter and a grown arrow on top, is pressed without looking. The
 * top of the screen is left to the game — it is the one part of the picture
 * the lesson never covers.
 *
 * **The header at the foot, next to what it explains.** TUTORIAL at
 * twenty-four points and the seat's name under it, on the shipped plate,
 * standing on a thin bar that holds REPLAY and the dots — all of it a hand's
 * width from the cannon, where the eye already is on a page of film. A rail
 * in the seat's colour runs down each wall from the top to the plate, so the
 * lobes are fed from something and the picture reads as held in a frame.
 */

export const BAND_FOOT = 0;
export const NAV_HEIGHT = 124;
/** The header plate's share of the foot; the bar is the rest. */
const PLATE_H = 66;
const PLATE_TOP = 4;

const TAG_FONT = '700 24px "Courier New",monospace';
const TITLE_FONT = '700 14px "Courier New",monospace';
const LETTER_FONT = '700 18px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';

export const LOBE_W = 58;
const LOBE_H = 156;
/** Where the lobes' centres are, as a share of the stage's height. */
const THUMB = 0.6;
const REPLAY = 42;
const RAIL = 4;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const hex = skin?.tint ?? PALETTE.pod;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  // The rails: the seat's colour down both walls, to the plate.
  ctx.fillStyle = rgba(hex, 0.55 + 0.4 * flash);
  ctx.fillRect(0, 0, RAIL, l.height + PLATE_TOP);
  ctx.fillRect(l.width - RAIL, 0, RAIL, l.height + PLATE_TOP);
  // The ground under the plate, below the picture: the slab's slate.
  const g = ctx.createLinearGradient(0, l.height, 0, l.height + PLATE_TOP + PLATE_H + 8);
  g.addColorStop(0, "#1B2140");
  g.addColorStop(1, "#0B0E22");
  ctx.fillStyle = g;
  ctx.fillRect(0, l.height, l.width, PLATE_TOP + PLATE_H + 8);
  const box = { x: 10, y: l.height + PLATE_TOP, w: l.width - 20, h: PLATE_H };
  drawPlate(ctx, l, box, hex, flash, p.age ?? 0);
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText("TUTORIAL", cx, box.y + (title === "" ? 41 : 32));
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, box.y + 53);
  }
  ctx.textAlign = "left";
};

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  const barY = top + PLATE_TOP + PLATE_H + 8;
  const ly = Math.round(l.height * THUMB - LOBE_H / 2);
  return {
    bar: { x: 0, y: barY, w: l.width, h: l.height - barY },
    back: { x: 0, y: ly, w: LOBE_W, h: LOBE_H },
    replay: { x: l.width - 14 - REPLAY, y: barY + 2, w: REPLAY, h: REPLAY },
    next: { x: l.width - LOBE_W, y: ly, w: LOBE_W, h: LOBE_H },
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
  // Each lobe is fed from the rail above it, the way the bar's are fed from
  // the bar's rim.
  drawNavFeeder(ctx, b.back.x + 8, b.back.y - 40, b.back.y + 10, PALETTE.hull, age * 1.1);
  drawNavFeeder(
    ctx,
    b.next.x + b.next.w - 8,
    b.next.y - 40,
    b.next.y + 10,
    PALETTE.pod,
    age * 1.1 + 2.1,
  );
  tallButton(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: PALETTE.hull, glow: 0, hover: over(b.back) },
    "BACK",
    -1,
  );
  tallButton(
    ctx,
    { ...b.next, ...paint, live: !last, hex: PALETTE.pod, glow, hover: over(b.next) },
    "NEXT",
    1,
  );
  drawNavFeeder(
    ctx,
    b.replay.x + b.replay.w / 2,
    b.bar.y + 2,
    b.replay.y + 6,
    PALETTE.shieldRim,
    age * 1.1 + 4.2,
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
  dots(ctx, s.page, s.pages, (l.width - REPLAY - 14) / 2, b.bar.y + b.bar.h / 2, 200);
};

interface TallBody extends NavBox {
  live: boolean;
  hex: string;
  glow: number;
  hover: boolean;
  dpr: number;
  lip: SeatSkin["lip"];
}

/** A lobe grown out of the wall, its name written down it and a grown arrow on top. */
function tallButton(ctx: CanvasRenderingContext2D, p: TallBody, word: string, dir: 1 | -1): void {
  // Half of the body is in the wall, so only its inner lobe shows; and the
  // socket is kept to a rim round the body, because out here it sits on the
  // field and not on the slab that hides its square.
  const bx = p.x - (dir < 0 ? 22 : 0);
  const bw = p.w + 22;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(bx + bw / 2, p.y + p.h / 2, bw / 2 + 9, p.h / 2 + 9, 0, 0, Math.PI * 2);
  ctx.clip();
  drawNavBody(ctx, { ...p, x: bx, w: bw });
  ctx.restore();
  const lit = p.live && p.hover;
  ctx.fillStyle = p.live ? (lit || p.glow > 0 ? "#FFF6E4" : p.hex) : "#3A3160";
  const cx = p.x + p.w / 2 + dir * -6;
  const r = 10 * (1 + 0.12 * p.glow);
  arrow(ctx, cx, p.y + 26, r, dir);
  if (p.live) drawBeads(ctx, cx, p.y + 26 + r * 1.05, r);
  ctx.font = LETTER_FONT;
  ctx.textAlign = "center";
  const step = 22;
  const from = p.y + 62;
  for (let i = 0; i < word.length; i++) ctx.fillText(word[i]!, cx, from + i * step);
  ctx.textAlign = "left";
}
