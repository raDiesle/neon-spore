import { WAVES } from "@neon-spore/content";
import type { World } from "@neon-spore/sim";
import { drawGuideNav } from "./guide-nav.js";
import type { Layout, ViewRole } from "./layout.js";
import { type OpeningFx, SETTLED_AGE } from "./opening-fx.js";
import { PALETTE } from "./palette.js";
import { hasSeatName, type SeatNames, seatName } from "./seat-name.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * A guide with no rehearsal, read a page at a time on the game's own screen.
 *
 * **There is no card any more.** These sixteen guides used to be a bordered
 * panel over a scrim, with the whole screen as its button; the owner's
 * instruction ended that — *I don't want to show old cards any longer* — and it
 * is the same instruction that made the tutorial the real screen at full size
 * in the first place. So this is plain type on the field the pair is about to
 * play, in the same shape the wave's own introduction has had since the panel
 * around *it* went: no frame, nothing to press, and the words arriving rather
 * than appearing (`text-drop.ts`).
 *
 * Two pages, and the split is why there are two rather than one.
 *
 * - **BOTH OF YOU** — the line both screens carry, whole.
 * - **the split** — this seat's half in words, and the other's as blocks: word
 *   shaped, so it looks like a sentence somebody is holding rather than like
 *   something missing. A guide that showed both halves would teach a pair, in
 *   the first ten seconds, that they never have to say anything to each other.
 *
 * In `test` — one person at a desk holding both seats — nothing is redacted and
 * the two halves are named by seat. That used to be a tap cycling a `cardStep`
 * through three renderings of one card; the pages are that mechanism, so the
 * director does not need its own any more. Where the room knows what the two
 * people are called, the halves are named after them instead (`seat-name.ts`).
 *
 * The gate after them is `ready-page.ts`, and it is the same gate a rehearsal
 * ends on.
 */

/** How far down the play area the block starts. Above the ship, always. */
const TOP = 0.24;
const LINE = 19;
const BODY = '13px "Courier New",monospace';
const LABEL = '700 11px "Courier New",monospace';

export interface ProseView {
  role: ViewRole;
  /** The page this seat is on, and how many its guide has in all. */
  page: number;
  pages: number;
  fx?: OpeningFx;
  /** What the two are called, by seat, when the room has said. */
  names?: SeatNames;
  /** Where a mouse is resting, for the bar's own hover. */
  pointer?: { x: number; y: number };
}

export function drawProsePage(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  view: ProseView,
): void {
  const { role, page, pages, fx, names } = view;
  const guide = WAVES[world.wave]?.guide;
  if (!guide) return;
  const both = role === "test";
  const age = fx?.age ?? SETTLED_AGE;

  // Dark enough to read against the ship and the band, light enough that the
  // screen the words are about is plainly still there.
  ctx.fillStyle = "rgba(5,4,11,.72)";
  ctx.fillRect(0, 0, l.width, l.height);

  ctx.textAlign = "center";
  const mid = l.width / 2;
  const width = l.width - 56;
  let y = l.playHeight * TOP;
  let line = 0;

  if (page <= 0) {
    y = block(ctx, mid, y, age, line, "BOTH OF YOU", PALETTE.pod);
    ctx.font = BODY;
    for (const text of wrapText(ctx, guide.both, width)) {
      drop(ctx, mid, y, age, line, 0, () => body(ctx, text, PALETTE.text));
      y += LINE;
    }
  } else {
    const mineSeat: 1 | 2 = role === "p2" ? 2 : 1;
    const otherSeat: 1 | 2 = mineSeat === 1 ? 2 : 1;
    y = block(ctx, mid, y, age, line, half(mineSeat, both, true, names), PALETTE.shieldRim);
    ctx.font = BODY;
    for (const text of wrapText(ctx, both || role !== "p2" ? guide.p1 : guide.p2, width)) {
      drop(ctx, mid, y, age, line, 0, () => body(ctx, text, PALETTE.text));
      y += LINE;
    }
    y += 14;
    line = 1;
    y = block(
      ctx,
      mid,
      y,
      age,
      line,
      half(otherSeat, both, false, names),
      both ? PALETTE.shieldRim : PALETTE.dim,
    );
    ctx.font = BODY;
    for (const text of wrapText(ctx, both || role !== "p2" ? guide.p2 : guide.p1, width)) {
      drop(ctx, mid, y, age, line, 0, () => {
        if (both) body(ctx, text, PALETTE.text);
        else redact(ctx, text);
      });
      y += LINE;
    }
  }

  ctx.textAlign = "left";
  // No glow on NEXT here, and REPLAY is spent: a page of type has nothing to
  // finish and nothing to play again (`guide-nav.ts`).
  drawGuideNav(ctx, l, { page, pages, age, pointer: view.pointer });
}

/**
 * What to head a half with: the person's name where the room knows one, and
 * otherwise the seat at a desk holding both, or which screen it is on a phone.
 */
function half(seat: 1 | 2, both: boolean, mine: boolean, names?: SeatNames): string {
  if (hasSeatName(seat, names)) return seatName(seat, names);
  if (both) return seatName(seat);
  return mine ? "YOURS" : "THE OTHER SCREEN";
}

/** A section's name, and the y its first line of type sits on. */
function block(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  age: number,
  line: number,
  label: string,
  hex: string,
): number {
  drop(ctx, x, y, age, line, 0, () => {
    ctx.font = LABEL;
    ctx.fillStyle = hex;
    ctx.fillText(label, 0, 0);
  });
  return y + 24;
}

function body(ctx: CanvasRenderingContext2D, text: string, hex: string): void {
  ctx.font = BODY;
  ctx.fillStyle = hex;
  ctx.fillText(text, 0, 0);
}

/**
 * The other player's line, as blocks: one per word, the width of the word. It
 * has to *look* like a sentence — a single grey bar says "something is hidden",
 * a row of word-shaped bars says "they are holding a sentence you need", which
 * is the thing that makes somebody read theirs out loud.
 */
function redact(ctx: CanvasRenderingContext2D, line: string): void {
  ctx.font = BODY;
  ctx.fillStyle = "rgba(122,111,168,.34)";
  const space = ctx.measureText(" ").width;
  const total = ctx.measureText(line).width;
  let cx = -total / 2;
  for (const word of line.split(" ")) {
    const w = ctx.measureText(word).width;
    if (w > 0) ctx.fillRect(cx, -9, w, 9);
    cx += w + space;
  }
}
