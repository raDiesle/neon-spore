import { type LeadState, leadPassing, leadStill, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { leadRidgeY } from "./lead-shape.js";
import { leadWord } from "./lead-word.js";

/**
 * **What THE LEAD is asking for** — page three of the readings, its page
 * alone since 19 September 2026. THE THROAT and one more boss left it for
 * pages eleven and twelve, THE LEDGER for page fifteen, and the finding that
 * reserved this page (`docs/queue.md`) said the seam it had drawn — the
 * older half of the choreographed page against the newer — was gone with
 * them: the three left, THE LEAD, THE SCUTTLE and one more, were all about
 * **a count nobody may be given**, so the split left to make was one page a
 * boss. THE SCUTTLE went to the readings' page `t` — a letter rather than a
 * number, page `s`'s own reason: a sibling lane is writing another page the
 * same day, and a number here would describe whichever page lands first
 * rather than this one.
 *
 * The rule that decided almost every line here decides it alone now: #34's
 * third, **it says the verb and never the answer.** THE LEAD is the
 * quietest boss in the game for it, silent for the whole of the fight it is
 * named for — `leadCues`' own doc comment has the rest.
 */

/** THE CHOIR's frame, in tiles, and the lift a mark takes over a hull line. */
const HALF_W = 0.72;
const HALF_H = 0.66;

function markAt(
  seat: BossCue["seat"],
  kind: BossCue["kind"],
  word: string,
  x: number,
  y: number,
  l: Layout,
  seed: number,
  wide = 1,
): BossCue {
  return { seat, kind, word, x, y, halfW: l.tile * HALF_W * wide, halfH: l.tile * HALF_H, seed };
}

/**
 * THE LEAD. **Silent for the whole of the fight it is named for**, and both of
 * its words are about the last movement.
 *
 * *Where it will be* is a number the pair computes out of her column and his
 * lean, and a cue anywhere near it would be the arithmetic done for them. This
 * boss's split is the strictest in the game: the pilot is shown the lean and
 * **never** the column, the navigator the column and never the lean
 * (`showsLeadLean`, `showsLeadCol`). So there is no `MOVE` here and there
 * cannot be one — the word four of these readings give the pilot goes out the
 * beat he arrives, and on this boss its *absence* would tell him the column he
 * is not shown. Every other reading's `MOVE` stands on a column the game is
 * already drawing him.
 *
 * What is left is the last movement, where the trigger **stops working**, and
 * every word of it is hers, because the presses are hers
 * (`content/src/controls.ts`).
 *
 * - **The still, which is a gesture rather than a state.** At one segment the
 *   body stops where it was hit for `leadStillBeats`, the shots in the air are
 *   thrown away, and from then until the pass *nothing touches it at all*:
 *   `leadStruck` refuses a bolt and a beam up any column is the plating's
 *   answer (`sim/lead-shot.ts`). `STILL` stood through all four of those beats
 *   until 19 September 2026 and said only the verb the picture already drew;
 *   the stalk is a handle there now, so the word is `HOLD` while it may be
 *   taken, `BURN` while she has it, and **nothing** once the still is spent.
 *   The whole argument, and the silence, is `lead-word.ts`.
 * - **`BURN`, on the pass.** It runs for the farther wall at `leadPassCols` a
 *   beat and **only the beam standing in its column** ends it; a pass that
 *   reaches the wall is another still and a pass back. The same word the hold
 *   carries, and deliberately: what her hand buys in the still is this beam.
 *
 * **The mark stands on the body, and only she is shown the body.** The stalk's
 * foot is drawn at `s.col` on her screen and at the middle of the field on his
 * (`lead-shape.ts`), so a seat-2 cue at `tileCX(l, s.col)` names the thing she
 * is already looking at and `cueSeen` keeps it off his glass.
 *
 * **What the pilot is shown in there is still his**: the stalk leans the way
 * the pass will go, from the beat she takes it and on the last beat of a still
 * nobody took (`settleLean`, `leadPassDir`, `lead-shape.ts`).
 */
export function leadCues(l: Layout, _world: World, s: LeadState): readonly BossCue[] {
  if (leadPassing(s)) {
    return [markAt(2, "HOLD", "BURN", tileCX(l, s.col), leadRidgeY(l).mid, l, 54)];
  }
  if (!leadStill(s)) return [];
  const say = leadWord(s);
  if (say === null) return [];
  return [markAt(2, say.kind, say.word, tileCX(l, s.col), leadRidgeY(l).mid, l, 95)];
}
