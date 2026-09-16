import { halo } from "../../../../../packages/render/src/glow.js";
import type { GuideLook } from "../../../../../packages/render/src/guide-look.js";
import {
  inside,
  type NavBox,
  type NavButtons,
} from "../../../../../packages/render/src/guide-nav.js";
import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawNavBody, drawNavButton } from "../../../../../packages/render/src/nav-button.js";
import { drawNavFeeder } from "../../../../../packages/render/src/nav-feeder.js";
import { slab } from "../../../../../packages/render/src/nav-slab.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { seatName } from "../../../../../packages/render/src/seat-name.js";
import { type SeatSkin, seatSkin } from "../../../../../packages/render/src/seat-skin.js";
import { dots, wordButton } from "../word-button.js";

/**
 * COACH — the way Clash Royale and its kind teach: a character in the corner
 * who is doing the talking, a speech bubble beside it, and one big button.
 *
 * **The coach is a spore.** A grown body at the top left in a mint neither
 * ship wears, with a pulse of light in it, is the one who says TUTORIAL — at
 * thirty points, in its colour, in a speech bubble with a tail back to it. A
 * face in the corner is what every mobile game's training mode has and the
 * live game never has, so the picture cannot be taken for play. The words on
 * the field are the same coach still talking: a bubble in its colour, with a
 * tail to the thing it is about, and everything that is not the thing goes
 * dark under a scrim — the owner asked for more of the dark, not less.
 *
 * **The bar is two rows.** NEXT is the whole width of the phone, and the
 * brightest thing on the screen once the page has played; under it, small,
 * BACK as a word, the dots, and REPLAY — the way a game puts Skip under
 * Continue. A thumb that wants to go on cannot miss.
 */

/**
 * The coach's colour: the mint nothing on either ship wears — player one is
 * purple, player two amber — so the header cannot be read as part of the hull.
 */
export const COACH = PALETTE.good;

const BAND_TOP = 30;
const FACE = 74;
const BAND_H = FACE;
export const BAND_FOOT = BAND_TOP + BAND_H + 10;
export const NAV_HEIGHT = 124;

const TAG_FONT = '700 30px "Courier New",monospace';
const TITLE_FONT = '700 15px "Courier New",monospace';
const NEXT_FONT = '700 21px "Courier New",monospace';
const BACK_FONT = '700 14px "Courier New",monospace';
export const CAPTION_FONT = '700 16px "Courier New",monospace';
const EDGE = 12;

const NEXT_H = 56;
const ROW_GAP = 10;
const BACK_H = 34;
const REPLAY = 38;
/** Seconds the bar stays lit after a press on the picture (`guide-nav.ts`). */
const NUDGE_S = 0.6;

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const age = p.age ?? 0;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;
  const fx = EDGE;
  const fy = BAND_TOP;
  coach(ctx, fx, fy, FACE, age, l.dpr, seatSkin(l.role).lip);

  // The coach's bubble, tail back to it.
  const bx = fx + FACE + 14;
  const bw = l.width - EDGE - bx;
  const bh = title === "" ? 52 : BAND_H;
  const by = fy + (BAND_H - bh) / 2;
  const hex = flash > 0.05 ? PALETTE.text : COACH;
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.strokeStyle = hex;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bx + 3, by + bh * 0.42);
  ctx.quadraticCurveTo(bx - 4, by + bh * 0.5, fx + FACE + 2, by + bh * 0.52);
  ctx.quadraticCurveTo(bx - 4, by + bh * 0.6, bx + 3, by + bh * 0.66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 16);
  ctx.fill();
  ctx.stroke();
  halo(ctx, bx + bw / 2, by + bh / 2, bw * 0.5, COACH, 0.1 + 0.06 * flash);

  const cx = bx + bw / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = flash > 0.05 ? PALETTE.text : COACH;
  ctx.fillText("TUTORIAL", cx, title === "" ? by + bh / 2 + 10 : by + 34);
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, by + 58);
  }
  ctx.textAlign = "left";
};

/** The coach: a grown body in the pod's colour with a pulse of light in it. */
function coach(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  age: number,
  dpr: number,
  lip: SeatSkin["lip"],
): void {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const pulse = 0.5 + 0.5 * Math.sin(age * 2.2);
  halo(ctx, cx, cy, size * 0.9, COACH, 0.18 + 0.1 * pulse);
  // The socket sprite is square and made for a slab; clipped round, only the
  // wet pool round the body is left of it.
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2 + 7, 0, Math.PI * 2);
  ctx.clip();
  drawNavBody(ctx, {
    x,
    y,
    w: size,
    h: size,
    live: true,
    hex: COACH,
    glow: 0.4 + 0.6 * pulse,
    dpr,
    lip,
  });
  ctx.restore();
  // Its light: a core that breathes, off centre, the way a spore's is.
  const core = size * (0.16 + 0.03 * pulse);
  const g = ctx.createRadialGradient(cx - 4, cy - 5, 0, cx - 4, cy - 5, core * 2.2);
  g.addColorStop(0, "rgba(236,255,244,.95)");
  g.addColorStop(0.35, "rgba(59,255,158,.7)");
  g.addColorStop(1, "rgba(59,255,158,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx - 4, cy - 5, core * 2.2, 0, Math.PI * 2);
  ctx.fill();
}

export function buttons(l: Layout): NavButtons {
  const top = l.height - NAV_HEIGHT;
  const nextY = top + 14;
  const rowY = nextY + NEXT_H + ROW_GAP;
  return {
    bar: { x: 0, y: top, w: l.width, h: NAV_HEIGHT },
    next: { x: EDGE, y: nextY, w: l.width - EDGE * 2, h: NEXT_H },
    back: { x: EDGE, y: rowY, w: 96, h: BACK_H },
    replay: { x: l.width - EDGE - REPLAY, y: rowY - (REPLAY - BACK_H) / 2, w: REPLAY, h: REPLAY },
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
  // Three feeders into the wide NEXT, one each into the small ones.
  for (let i = 0; i < 3; i++) {
    const x = b.next.x + (b.next.w * (i + 1)) / 4;
    drawNavFeeder(ctx, x, b.bar.y + 2, b.next.y + 8, PALETTE.pod, age * 1.1 + i * 2.1);
  }
  const over = (box: NavBox): boolean =>
    s.pointer !== undefined && inside(box, s.pointer.x, s.pointer.y);
  const paint = { dpr: l.dpr, lip: skin.lip };
  const glow = last
    ? 0
    : Math.max(nudge, s.played ? 0.55 + 0.45 * Math.abs(Math.sin(age * 2.4)) : 0);
  wordButton(
    ctx,
    { ...b.next, ...paint, live: !last, hex: PALETTE.pod, glow, hover: over(b.next) },
    "NEXT",
    1,
    NEXT_FONT,
    11,
  );
  wordButton(
    ctx,
    { ...b.back, ...paint, live: canBack, hex: PALETTE.hull, glow: 0, hover: over(b.back) },
    "BACK",
    -1,
    BACK_FONT,
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
  dots(ctx, s.page, s.pages, l.width / 2, b.back.y + b.back.h / 2, 160);
};
