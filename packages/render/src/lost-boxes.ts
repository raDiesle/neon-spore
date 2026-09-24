import { inside, type NavBox } from "./guide-nav.js";
import type { Layout } from "./layout.js";

/**
 * Where the lost screen's buttons are: the one geometry the picture
 * (`lost-answer.ts`) and the thumb (`apps/game/src/lost.ts`, the director's
 * `stage-opening.ts`) both read.
 *
 * Split out of `lost-answer.ts` on 24 September 2026 when that file went past
 * 250 lines. The cut is the one the header over there already names: a look
 * may not move these boxes, because a look that moved them would move the
 * picture and not the thumb (`lost-look.ts`).
 *
 * **The names `lostHit` returns are command kinds**, not labels, which is why
 * both callers can push what it hands back without a table in between
 * (`sim/command-types.ts`).
 */

const BTN_H = 52;
/**
 * **The face reads GO TO MENU, not QUIT** — the owner's own wording, 20
 * September 2026: pressing it in a real room lands on the room screen, not
 * the app's menu, and "quit" read as ending the session outright. The press
 * itself, the command it sends, and the room's own handling of it
 * (`quit.ts`, `sim/wave-fail.ts`) are unchanged; only the word on the face
 * moved.
 *
 * **QUIT is smaller than RETRY and stands further from it**, asked for by the
 * owner on 17 September 2026: *the "quit" button, we should do less prominent
 * maybe reduce size of button or move it somewhere else, as player might
 * accidently press it.*
 *
 * The two used to be one stack of identical plates eighteen pixels apart, and
 * the only thing telling them apart was the word on the face and a glow —
 * which is nothing to a thumb coming down on a screen that has just been lost.
 * A wave can be left, and leaving it ends the run for **both** phones on one
 * press (`sim/wave-fail.ts`), so the slip is not one a pair can undo.
 *
 * Three things rather than one, because any of them alone is still a plate
 * beside a plate: a bigger gap, so the thumb has to travel; a narrower and
 * shorter body with a smaller word, so the eye reads it as the lesser of the
 * two; and it is drawn dimmer than the one you are meant to press.
 *
 * **Not a confirmation step**, which was the other answer on the table: one
 * press answers for both phones, and a QUIT that asked twice would make that
 * false for the one button where being wrong costs the run. The screen said so
 * in words under the buttons until 22 September 2026, when the owner had every
 * sentence but the wave's own name taken off it (`lost-words.ts`).
 */
const BTN_GAP = 46;
/** QUIT's own body: a share of RETRY's width, and its own height. */
const QUIT_W = 0.56;
const QUIT_H = 36;

/**
 * **TUTORIAL AGAIN**, and the reason the screen has three answers rather than
 * two.
 *
 * The owner, 24 September 2026: *there must be a way to watch tutorial again
 * and then restart wave, like as players entered first time the wave.* RETRY
 * WAVE deliberately drops the guide — a pair who know the wave want the field,
 * not the film they have already watched (`sim/briefing.ts`) — and a pair who
 * lost because one of them never understood the mechanic had no way back to
 * it at all short of leaving the run.
 *
 * **It is RETRY's sibling and not QUIT's**, and the three numbers say so
 * before the words are read: the same width and the same left edge as RETRY,
 * a short gap under it, and only a little shorter. QUIT's own separation —
 * `BTN_GAP` of air, a narrower body, a dimmer paint — is measured from
 * whichever plate is lowest, so it stands as far from this pair as it used to
 * stand from RETRY alone. The one thing the owner asked of that button is that
 * it not be pressed by accident, and a third plate that ate its air would undo
 * it (17 September 2026).
 *
 * **The word is his** — *watch tutorial again* — cut to two so it fits the
 * plate on a 240-wide screen with the arrow beside it. It says *again* and it
 * sits under RETRY WAVE, which is where the rest of the sentence is.
 */
const GUIDE_GAP = 12;
const GUIDE_H = 40;

/**
 * **Where the row starts**, as a share of the play area.
 *
 * It was 0.52 until 24 September 2026, when the owner asked for it: *move all
 * buttons more top. Buttons must be on highest layer, so it's not overlapped
 * and hard readable from game graphics like damage taken focus graphic.* The
 * wound is centred on the hull line near the foot of the phone
 * (`lost-wound.ts`), and with a third plate in the stack QUIT came down far
 * enough to stand in its ring. The words and the seam came up with the row
 * (`lost-words.ts`, `lost-shut.ts`).
 */
const ROW_TOP = 0.36;

export interface LostButtons {
  retry: NavBox;
  /** Null on a wave with no guide to watch: two buttons, exactly as before. */
  guide: NavBox | null;
  quit: NavBox;
}

/**
 * Where the buttons are, for the hand that presses them
 * (`apps/game/src/lost.ts`).
 *
 * `guided` is whether this wave has a guide at all — `waveHasGuide`, asked by
 * the caller because it is a fact about content and this file is handed a
 * stage. Off by default, so a caller that only wants RETRY's box gets the
 * geometry the screen has always had.
 */
export function lostButtons(l: Layout, guided = false): LostButtons {
  const w = Math.min(l.width - 72, 260);
  const x = (l.width - w) / 2;
  const y = l.playHeight * ROW_TOP;
  const guide = guided ? { x, y: y + BTN_H + GUIDE_GAP, w, h: GUIDE_H } : null;
  const foot = guide === null ? y + BTN_H : guide.y + guide.h;
  const qw = Math.round(w * QUIT_W);
  return {
    retry: { x, y, w, h: BTN_H },
    guide,
    // Centred under the pair above rather than sharing their left edge: a
    // narrower plate hung off the same edge reads as a torn-off piece of the
    // one above it.
    quit: { x: x + Math.round((w - qw) / 2), y: foot + BTN_GAP, w: qw, h: QUIT_H },
  };
}

/** Which button a press landed on, **named as the command it sends**. */
export function lostHit(
  l: Layout,
  x: number,
  y: number,
  guided = false,
): "retry" | "retryGuide" | "quit" | null {
  const b = lostButtons(l, guided);
  if (inside(b.retry, x, y)) return "retry";
  if (b.guide !== null && inside(b.guide, x, y)) return "retryGuide";
  if (inside(b.quit, x, y)) return "quit";
  return null;
}
