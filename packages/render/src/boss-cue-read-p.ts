import type { AntiphonState, World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import type { Layout } from "./layout.js";

/**
 * **What THE ANTIPHON is asking for** — page sixteen of the readings, and its
 * own page because page three is at 229 lines of its 250 with three fights on
 * it, and because one boss a page is where these files have been going since
 * pages eleven and twelve (`docs/queue.md`, the line-count entry).
 *
 * **It already said two words, and neither of them is on this page.** `TURN`
 * has stood on the organ's grip mark since the handle shipped
 * (`antiphon-grip.ts`) and `PULL` stands under the rail beside it
 * (`antiphon-rail-grip.ts`) — a handle boss builds its cue in its own drawing,
 * so a search of the readings finds an absence that is not there, which is the
 * third entry in this family to carry that mistake and the reason the entry
 * exists. Each word is its kind, so the screen says one thing
 * (`boss-cue-text.ts`), and each belongs to the seat its handle is drawn to:
 * `TURN` to the explainer, because the organ hangs on their screen alone
 * (`showsAntiphonOrgan`), and `PULL` to the chooser, because the rail hangs
 * on theirs (`showsAntiphonRail`) — the seats swapping every level.
 *
 * **`PULL` leaks nothing, by the rule the rest of this page is written to.**
 * It says the verb and never the answer: one word under the middle of the
 * rail rather than one per candidate, so it names none of them, and every
 * candidate keeps its ring.
 *
 * **Nothing on this boss is shot since the redesign of 5 October 2026**, so
 * there is no `MOVE` and no `FIRE`, and there must not be: a word over the
 * cannon would send a pair looking for something to shoot, which is what the
 * owner took the colours off the organs to stop. The chooser is told *when*
 * by the candidates reaching full size as `antiphonGrowBeats` runs out and by
 * the standard slow meter opening.
 *
 * **And no `STILL` on the four beats it stands still, since 25 September
 * 2026.** At `antiphonPits` the body stops breathing, rims bright and stands
 * there for `antiphonStillBeats`. A word stood on it for those beats until
 * the owner took it off: *for the player it is clear to wait*. The stilling
 * is drawn to **both** screens (`antiphon-draw.ts`), so the picture already
 * says it, and the frame and its word were only in the way. The rest between
 * levels (`antiphonRestBeats`) and the grow beats are silent for the same
 * reason: an empty rail, and a rail growing to size, say so themselves.
 */

/**
 * THE ANTIPHON. **No word on this page**; the two it says are drawn where the
 * handles are (`antiphon-grip.ts`, `antiphon-rail-grip.ts`), and the rest of
 * this fight is a conversation the field must not join.
 */
export function antiphonCues(_l: Layout, _world: World, _s: AntiphonState): readonly BossCue[] {
  return [];
}
