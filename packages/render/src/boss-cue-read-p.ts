import type { AntiphonState, World } from "@neon-spore/sim";
import { antiphonCentre, antiphonStill } from "./antiphon-shape.js";
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
 * `TURN` to the pilot, because the organ hangs on his screen alone
 * (`showsAntiphonOrgan`), and `PULL` to the navigator, because the rail hangs
 * on hers (`showsAntiphonRail`).
 *
 * **`PULL` leaks nothing, by the rule the rest of this page is written to.**
 * It says the verb and never the answer: one word under the middle of the rail
 * rather than one per candidate, so it names no column and no colour, and the
 * thing it offers her is a candidate *she* has already ruled out by listening
 * to him. Every candidate still in keeps its ring and the crossed ones take a
 * stroke, so the rail says what she has said and nothing the boss knows. It is
 * drawn only on the screen the rail is on, and the sound the crossing makes is
 * seated to that phone for the same reason (`audio/bind-antiphon.ts`): a pan
 * on his would hand him a column she had eliminated without either of them
 * saying it, which is the whole of what this boss is for.
 *
 * **What no word may ever say here is the column, and this is the boss the rule
 * was written for.** The organ's shape is his and its colour and column are
 * hers: she has to find the one he is describing on the rail and fire its colour
 * into its column, and he has to put the cannon there, *which he cannot see
 * either* (`antiphon.ts`). The whole encounter is two descriptions crossing. A
 * `MOVE` on his hull would be her rail read out on his screen, and — THE LEAD's
 * finding, `boss-cue-read-c.ts` — its silence would be the same leak by
 * subtraction, since a word that went out the beat he arrived would say he had
 * arrived. So there is no `MOVE` on this boss and there cannot be one.
 *
 * **And no `FIRE` either, for a different reason: she is already told *when*,
 * twice, on her own screen.** The rail is laid the beat the growth begins, and
 * the candidates on it are drawn at `RAIL_R * grow` — they reach full size
 * exactly as `antiphonGrowBeats` runs out, which is the beat a bolt stops being
 * a guess (`antiphon-draw.ts`, `antiphonGrowPhase`, and `antiphonStruck`'s
 * `standing`). The window gauge beside them sits full until that beat and falls
 * from it (`antiphonWindowLeft`). A press she is already shown the moment for,
 * on a thing she alone chooses, leaves the field nothing to add: *which* is the
 * question, and #34's third rule is that it says the verb and never the answer.
 *
 * **The one word missing was the still.** At `antiphonPits` the body stops
 * breathing, rims bright and stands there for `antiphonStillBeats` with nothing
 * out of it at all — `antiphonStruck` refuses every bolt while no organ stands
 * — and then grows the last organ, which is their own ship among ships subtly
 * wrong. Four beats of a trigger that has quietly stopped working, on the beat
 * before this boss asks its hardest question, and neither screen said so. It is
 * safe because the stilling is drawn to **both**: `drawBody` takes `still`
 * whatever the role, and the breath goes to nought and the rim to seven tenths
 * on every screen (`antiphon-draw.ts`). So the word adds the verb and no
 * reading, which is `sinewEnter`'s licence a third time.
 *
 * It is hers because the press is hers (`content/src/controls.ts`), and there is
 * nothing to him: the organs are gone, so `drawAntiphonGrip`'s loop runs over
 * none and `TURN` goes quiet by itself. Turning nothing is not a thing to ask
 * for.
 *
 * **Three more silences.**
 *
 * - **The rest between cycles** (`antiphonRestBeats`), where a bolt is refused
 *   for the same reason. Her rail is empty then and an empty rail says it
 *   itself, which the still does not: a still body is a body, and the last one
 *   this fight draws.
 * - **The grow beats**, argued above. The rail growing to size is the clock.
 * - **A spilled candidate and a fired organ** (`antiphonSpillPits`,
 *   `antiphonFirePits`). Both arrive as ordinary bodies down ordinary columns,
 *   and a word on one would be the field narrating the wave rather than the
 *   boss — THE SURGE's gums, and THE SCUTTLE's thrown parts.
 */

/** THE CHOIR's frame, in tiles: the size of this mark. */
const HALF_W = 0.72;
const HALF_H = 0.66;

/**
 * THE ANTIPHON. **One word on this page, and it is the four beats the trigger
 * stops working**; the two on the handles are drawn where the handles are
 * (`antiphon-grip.ts`, `antiphon-rail-grip.ts`), and the rest of this fight is
 * a conversation the field must not join.
 */
export function antiphonCues(l: Layout, world: World, s: AntiphonState): readonly BossCue[] {
  if (!antiphonStill(s)) return [];
  const at = antiphonCentre(l, world.cfg);
  return [
    {
      seat: 2,
      kind: "STILL",
      word: "STILL",
      x: at.x,
      y: at.y,
      halfW: l.tile * HALF_W,
      halfH: l.tile * HALF_H,
      seed: 93,
    },
  ];
}
