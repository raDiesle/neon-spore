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
 * **GO TO MENU stands beside TUTORIAL AGAIN, under RETRY WAVE**, the two
 * halves of one row as wide as RETRY — the owner, 19 October 2026: *have go to
 * menu in same line as "tutorial" again. both buttons should have same width
 * then "retry wave"*. It stood alone under the pair, `46` pixels further down
 * and narrower, from 17 September 2026 — *the "quit" button, we should do less
 * prominent … as player might accidently press it* — and that third row is
 * what pushed the retries' count down into the wound's ring
 * (`lost-retries.ts`, `lost-wound.ts`).
 *
 * What is left of that ask is the paint, not the place: QUIT's word is smaller
 * and its plate dimmer than its neighbour's (`lost-answer.ts`), and it is on
 * the left, under its own back arrow, away from the thumb's run from RETRY
 * WAVE to TUTORIAL AGAIN on the right.
 *
 * **Not a confirmation step**, which was the other answer on the table: one
 * press answers for both phones (`sim/wave-fail.ts`), and a QUIT that asked
 * twice would make that false for the one button where being wrong costs the
 * run.
 */

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
 * **The word is his** — *watch tutorial again* — cut to two, and drawn as
 * small as it has to be to fit its half of the row (`lost-answer.ts`).
 */
const ROW_GAP = 12;
/** The gap between the two halves of the row under RETRY. */
const PAIR_GAP = 10;
const PAIR_H = 40;

/**
 * **Where the row starts**, as a share of the play area.
 *
 * It was 0.52 until 24 September 2026, when the owner asked for it: *move all
 * buttons more top. Buttons must be on highest layer, so it's not overlapped
 * and hard readable from game graphics like damage taken focus graphic.* The
 * wound is centred on the hull line near the foot of the phone
 * (`lost-wound.ts`), and with a third plate in the stack QUIT came down far
 * enough to stand in its ring. The words and the seam came up with the row
 * (`lost-words.ts`, `lost-shut.ts`). 0.36 until 19 October 2026, when the
 * owner asked again for the same reason, with the retries' count under it.
 */
const ROW_TOP = 0.33;

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
  const half = Math.floor((w - PAIR_GAP) / 2);
  const row = y + BTN_H + ROW_GAP;
  return {
    retry: { x, y, w, h: BTN_H },
    guide: guided ? { x: x + w - half, y: row, w: half, h: PAIR_H } : null,
    // Centred under RETRY when it is alone in its row: a half-width plate
    // hung off RETRY's left edge reads as a torn-off piece of the one above.
    quit: { x: guided ? x : x + Math.round((w - half) / 2), y: row, w: half, h: PAIR_H },
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
