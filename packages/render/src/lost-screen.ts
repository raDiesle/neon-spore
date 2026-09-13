import type { World } from "@neon-spore/sim";
import { inside, type NavBox } from "./guide-nav.js";
import type { Layout } from "./layout.js";
import { drawBeads, drawNavBody } from "./nav-button.js";
import { PALETTE } from "./palette.js";
import { type SeatSkin, seatSkin } from "./seat-skin.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * A lost wave stops on a friendly screen: RETRY WAVE or QUIT.
 *
 * The owner asked for it by name, 13 September 2026, in place of the hold
 * that used to open the same wave again by itself. The field stays under it,
 * greyed, with the breach still where it was seen — the point of the pause was
 * that the pair look at where it got through, and a screen that hid it would
 * be a screen that took that away. Over it, in the introduction's own type:
 * which wave and which try, the two words, and one line for the two of them.
 * Then two buttons, the guide bar's own grown bodies with a word on the face
 * instead of a sign, because these two are the one place in the game where a
 * sign would not do: a wave can be *left*, and the word for that has to be
 * read, not guessed.
 *
 * **One press answers for both phones.** Either seat's RETRY opens the wave
 * again on both; either seat's QUIT ends the run on both, and the other phone
 * is told who it was (`sim/wave-fail.ts`). The line under the buttons says so,
 * because the thing the screen must not do is have two people each waiting
 * for the other to press.
 *
 * The words fall in the way the introduction's do (`text-drop.ts`), off the
 * opening's clock: `openingKey` names this screen as a page of its own, so
 * the drop replays every time the wave is lost and never while it is held.
 */

/** One line for the pair, chosen by how many times they have gone again so
 * that both phones say the same one, and a second loss does not repeat it. */
const LINES = [
  "Each of you saw a different half of that. Swap notes, then go again.",
  "It got through once. Say where, and it will not get through twice.",
  "Same wave, same two of you. Talk it over first, then press.",
  "What one of you missed, the other one saw. That is the whole game.",
] as const;

const BTN_H = 52;
const BTN_GAP = 18;
const WORD = '700 15px "Courier New",monospace';
const BODY = '13px "Courier New",monospace';

export interface LostButtons {
  retry: NavBox;
  quit: NavBox;
}

/** Where the two buttons are, for the hand that presses them (`apps/game/src/lost.ts`). */
export function lostButtons(l: Layout): LostButtons {
  const w = Math.min(l.width - 72, 260);
  const x = (l.width - w) / 2;
  const y = l.playHeight * 0.52;
  return {
    retry: { x, y, w, h: BTN_H },
    quit: { x, y: y + BTN_H + BTN_GAP, w, h: BTN_H },
  };
}

export function lostHit(l: Layout, x: number, y: number): "retry" | "quit" | null {
  const b = lostButtons(l);
  if (inside(b.retry, x, y)) return "retry";
  if (inside(b.quit, x, y)) return "quit";
  return null;
}

export interface LostView {
  /** Seconds the screen has been up; the words fall in over the first of them. */
  age: number;
  /** Where a mouse is resting, in stage coordinates. Absent on a phone. */
  pointer?: { x: number; y: number };
}

export function drawLostScreen(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  v: LostView,
): void {
  // Cold and grey rather than the pause's own violet: the field under it is
  // not resting, it is *over*, and the one thing still in colour on it should
  // be the breach that ended it.
  ctx.fillStyle = "rgba(18,20,30,.64)";
  ctx.fillRect(0, 0, l.width, l.height);

  const mid = l.width / 2;
  ctx.textAlign = "center";
  let y = l.playHeight * 0.24;
  drop(ctx, mid, y, v.age, 0, 0, () => {
    ctx.font = '600 11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${world.wave + 1} · TRY ${Math.max(1, world.waveTries)}`, 0, 0);
  });
  y += 30;
  drop(ctx, mid, y, v.age, 1, 0, () => {
    ctx.font = '700 21px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 28;
  ctx.font = BODY;
  const line = LINES[(world.retries - 1 + LINES.length) % LINES.length] ?? LINES[0];
  for (const text of wrapText(ctx, line, l.width - 64)) {
    drop(ctx, mid, y, v.age, 2, 0, () => {
      ctx.font = BODY;
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(text, 0, 0);
    });
    y += 18;
  }

  // The buttons arrive after the words, and not by falling: a thing to be
  // pressed should be still by the time a thumb reaches it.
  const shown = Math.max(0, Math.min(1, (v.age - 0.55) / 0.3));
  if (shown > 0) {
    const b = lostButtons(l);
    const skin = seatSkin(l.role);
    const over = (box: NavBox): boolean =>
      v.pointer !== undefined && inside(box, v.pointer.x, v.pointer.y);
    ctx.globalAlpha = shown;
    wordButton(ctx, b.retry, "RETRY WAVE", {
      hex: PALETTE.pod,
      glow: 0.45 + 0.35 * Math.abs(Math.sin(v.age * 2.2)),
      hover: over(b.retry),
      dpr: l.dpr,
      lip: skin.lip,
    });
    wordButton(ctx, b.quit, "QUIT", {
      hex: PALETTE.hull,
      glow: 0,
      hover: over(b.quit),
      dpr: l.dpr,
      lip: skin.lip,
    });
    ctx.globalAlpha = shown * 0.72;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("One press answers for both phones.", mid, b.quit.y + b.quit.h + 26);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = "left";
}

interface WordPaint {
  hex: string;
  glow: number;
  hover: boolean;
  dpr: number;
  lip: SeatSkin["lip"];
}

/** The bar's button with a word on its face, and the bead the sign would have had. */
function wordButton(ctx: CanvasRenderingContext2D, box: NavBox, word: string, p: WordPaint): void {
  drawNavBody(ctx, { ...box, ...p, live: true });
  const lit = p.hover || p.glow > 0;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  ctx.font = WORD;
  ctx.fillStyle = lit ? "#F4ECFF" : p.hex;
  ctx.textBaseline = "middle";
  ctx.fillText(word, cx, cy);
  ctx.textBaseline = "alphabetic";
  const w = ctx.measureText(word).width;
  drawBeads(ctx, cx + w / 2 + 5, cy + 7, 10);
}
