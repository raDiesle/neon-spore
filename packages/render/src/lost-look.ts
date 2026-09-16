import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drop } from "./text-drop.js";
import { wrapText } from "./wrap-text.js";

/**
 * THE ONE RECORD A CANDIDATE **LOST SCREEN** PATCHES.
 *
 * `guide-look.ts`'s kind and its precedent exactly: the chrome over a held
 * field, offered as whole paint functions rather than as numbers, because
 * every answer to "what does this screen look like" redraws the screen rather
 * than retuning it.
 *
 * **What ships here is what shipped before it, to the pixel.** This record was
 * cut out of `lost-screen.ts` and nothing in it was changed on the way: the
 * flat cold veil, the wave and the try, WAVE LOST, and one line for the pair.
 * The owner asked on 16 September 2026 for a full-screen statement that the
 * wave is to be played again — *like a game over visual* — and asked to be
 * shown several before one goes on the field, so `lost:screen` is where the
 * answers are and the field's answer is still the card.
 *
 * **The tension every answer in this slot has to resolve** is the one
 * `lost-screen.ts`'s own header states: the field stays under this screen,
 * greyed, *with the breach still where it was seen*, because the point of the
 * pause is that the pair look at where it got through. A full-screen statement
 * that covers that is a full-screen statement that takes the lesson away. So
 * the paint is told where the breach is, and an answer is expected to be a
 * treatment the breach column is a hole in rather than a card over it.
 *
 * **The buttons are not in this record.** RETRY WAVE and QUIT are drawn by
 * `lost-screen.ts` at boxes `lostButtons` hands out, and `apps/game/src/lost.ts`
 * hit-tests the same boxes — a candidate that moved them would move the
 * picture and not the thumb. What an answer owns is everything above them.
 */
export interface LostPaint {
  readonly l: Layout;
  /** Seconds the screen has been up; the words fall in over the first of them. */
  readonly age: number;
  /** Which wave, 1-based, and which try. */
  readonly wave: number;
  readonly tries: number;
  /** How many times the pair has gone again in this run — which line they get. */
  readonly retries: number;
  /**
   * Where the hull was broken, in pixels, or null when nothing scarred it — a
   * wall earths through the dome and leaves no mark on the skin at all
   * (`breachUnscarred`). An answer that cuts a hole in itself has nowhere to
   * cut one on those waves and has to say something else.
   */
  readonly breachX: number | null;
  /** The hull's own line, so a hole can be cut around the place rather than
   * around the column. */
  readonly hullY: number;
  /** The top of whatever is drawn under the answer: the buttons' own box. An
   * answer must leave this alone (`lost-screen.ts`). */
  readonly buttonsY: number;
}

export interface LostLook {
  /** What covers the held field. */
  readonly veil: (ctx: CanvasRenderingContext2D, p: LostPaint) => void;
  /** What it says, above the buttons. */
  readonly words: (ctx: CanvasRenderingContext2D, p: LostPaint) => void;
}

/** One line for the pair, chosen by how many times they have gone again so
 * far — the count is up only once a retry is taken (`sim/wave-start.ts`) —
 * so that both phones say the same one, and a second loss does not repeat it. */
const LINES = [
  "Each of you saw a different half of that. Swap notes, then go again.",
  "It got through once. Say where, and it will not get through twice.",
  "Same wave, same two of you. Talk it over first, then press.",
  "What one of you missed, the other one saw. That is the whole game.",
] as const;

const BODY = '13px "Courier New",monospace';

/** Cold and grey rather than the pause's own violet: the field under it is
 * not resting, it is *over*, and the one thing still in colour on it should
 * be the breach that ended it. */
function veil(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  ctx.fillStyle = "rgba(18,20,30,.64)";
  ctx.fillRect(0, 0, p.l.width, p.l.height);
}

function words(ctx: CanvasRenderingContext2D, p: LostPaint): void {
  const mid = p.l.width / 2;
  ctx.textAlign = "center";
  let y = p.l.playHeight * 0.24;
  drop(ctx, mid, y, p.age, 0, 0, () => {
    ctx.font = '600 11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAVE ${p.wave} · TRY ${p.tries}`, 0, 0);
  });
  y += 30;
  drop(ctx, mid, y, p.age, 1, 0, () => {
    ctx.font = '700 21px "Courier New",monospace';
    ctx.fillStyle = PALETTE.red;
    ctx.fillText("WAVE LOST", 0, 0);
  });
  y += 28;
  ctx.font = BODY;
  const line = LINES[p.retries % LINES.length] ?? LINES[0];
  for (const text of wrapText(ctx, line, p.l.width - 64)) {
    drop(ctx, mid, y, p.age, 2, 0, () => {
      ctx.font = BODY;
      ctx.fillStyle = PALETTE.text;
      ctx.fillText(text, 0, 0);
    });
    y += 18;
  }
  ctx.textAlign = "left";
}

export const LOST_LOOK: LostLook = { veil, words };
