import { halo } from "./glow.js";
import type { GuideLook } from "./guide-look.js";
import type { NavBox } from "./guide-nav.js";
import { NAV_HEIGHT } from "./guide-tide-bar.js";
import { membrane } from "./guide-tide-membrane.js";
import { plate } from "./guide-tide-plate.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
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
const BEZEL_H = 96;

const TAG_FONT = '700 24px "Courier New",monospace';
const TITLE_FONT = '700 14px "Courier New",monospace';
/**
 * Where the badge's two rows sit inside it, as baselines off its top.
 *
 * **Both came up on 16 September 2026**, from 36 and 53, because the owner read
 * the shipped page and said so: *it looks strange that "PLAYER 1 · SCREEN" text
 * is too near the bottom of the button, and maybe we can move text in the
 * button a little bit more to top.* He was right about the number — the name's
 * baseline was three pixels off the badge's own foot, so its descenders were
 * sitting on the rim.
 *
 * The room to move up came from the crest, which lost three pixels of height in
 * the same turn (`guide-tide-plate.ts`). What is left is five clear above
 * TUTORIAL's capitals, five between the rows and six under the name's
 * descenders — even, rather than all of the slack at the top the way a box that
 * had never been measured has it.
 */
const TAG_BASE = 32;
const TITLE_BASE = 47;
export const CAPTION_FONT = '700 16px "Courier New",monospace';

const SMALL_W = 78;
const GAP = 12;

/**
 * Where the badge is: the same plate the buttons are, so the top of the page
 * and the foot of it are visibly one kit rather than two ideas.
 *
 * Exported because the two rows written on it are measured against its foot and
 * `test/guide-tide.test.ts` holds that — the owner asked for the words off the
 * bottom of it by name, and a box only the drawing knows about is a box a later
 * edit can quietly shrink.
 */
export function badgeBox(l: Layout): NavBox {
  const w = Math.min(l.width - 2 * (GAP + SMALL_W) - 24, 220);
  return { x: (l.width - w) / 2, y: 18, w, h: BEZEL_H - 40 };
}

export const band: GuideLook["band"] = (ctx, l, p) => {
  const skin = p.seat === undefined ? null : seatSkin(p.seat === 1 ? "p1" : "p2");
  const flash = Math.max(0, Math.min(1, p.flash ?? 0));
  const hex = skin?.tint ?? PALETTE.pod;
  const age = p.age ?? 0;
  const title = p.seat === undefined ? "" : `${seatName(p.seat, p.names)} · SCREEN`;

  membrane(ctx, { x: 0, y: 0, w: l.width, h: BEZEL_H }, hex, PALETTE.pod, age);
  if (flash > 0) halo(ctx, l.width / 2, BEZEL_H / 2, l.width * 0.6, hex, 0.5 * flash);

  const badge = badgeBox(l);
  plate(ctx, badge, { hex: PALETTE.pod, glow: flash * 0.6, live: true, hover: false });
  const cx = l.width / 2;
  ctx.textAlign = "center";
  ctx.font = TAG_FONT;
  ctx.fillStyle = PALETTE.pod;
  ctx.fillText("TUTORIAL", cx, badge.y + (title === "" ? 38 : TAG_BASE));
  if (title !== "" && skin) {
    ctx.font = TITLE_FONT;
    ctx.fillStyle = flash > 0.05 ? PALETTE.text : skin.rim;
    ctx.fillText(title, cx, badge.y + TITLE_BASE);
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
