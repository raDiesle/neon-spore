import { type RepriseState, repriseEchoing, type World } from "@neon-spore/sim";
import type { BossCue } from "./boss-cue.js";
import { type Layout, tileCX } from "./layout.js";
import { repriseTearCenter } from "./reprise-draw.js";

/**
 * **What THE REPRISE is asking for** — the readings' page `s`, and a page of
 * its own for the reason the last eight have theirs: one boss a page is where
 * these files have been going, and the three pages a reading of this length
 * would otherwise have gone onto are at 229, 187 and 248 lines of their 250
 * (`docs/queue.md`, the line-count entry). The letter rather than a count,
 * because two sibling lanes are writing `r` and `t` the same day and a number
 * written here would be a number about whichever of the three landed first.
 *
 * **This is the only boss in the game whose fight is a field with nothing on
 * it**, and that turns the family's licence test inside out. Everywhere else
 * the question is *which of these two screens is drawn the thing this word
 * implies*; here **neither screen is drawn anything at all**, and the question
 * is what is left that both of them are still shown. The answer is one object:
 * the boss at the top of the field — a sac through a tear, with a lens for an
 * eye (`reprise-draw.ts`) — and it is drawn on both seats with no
 * `showsX` anywhere near it (`boss-draw.ts` calls `drawReprise` unconditionally,
 * `reprise-draw.ts` takes no role). Every word below stands or falls on that
 * one line.
 *
 * **There is no borrowed boss and nothing to say twice.** The queue's brief for
 * this family supposes the last boss replays earlier *fights* — it does not.
 * `sendEcho` reads `world.queue`, which is this wave's own authored arrivals,
 * and sends them back through the same `spawnOne` every ordinary body goes
 * through (`sim/reprise.ts`); `world.boss` is this mechanism for the whole of
 * the wave, so `cuesOf` never sees another kind and no other boss's word can
 * ever be said here. What comes back is seven meteoric bodies and a flag.
 */

/** THE CHOIR's frame, in tiles: the size of this mark, doubled for the tear. */
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
 * THE REPRISE. **Two words, one per seat, and they stand for exactly as long
 * as the echo plays and not one beat longer.**
 *
 * `CARRY` / `MOVE` on the cannon where it stands, the pilot's; `PRESS` / `FIRE`
 * on the lens, the navigator's. Between them they are the whole of
 * what this fight is answered with, and the reading said nothing at all before
 * 19 September 2026 — it fell through `cuesOf`'s default on the one wave where
 * the pair is asked to shoot at **an empty screen**. That is the failure a word
 * is for: a field with no body on it asks for nothing by its own picture, and a
 * pair whose instinct is to wait until they can see something loses the wave
 * for it. One body on the hull fails the whole wave (`wave-fail.ts`), and the
 * film's last page is a pair watching exactly that happen
 * (`scenes/the-reprise.ts`, `content/test/scene-reprise.test.ts` — *waveFailed
 * @33*).
 *
 * **The gate is `repriseEchoing` and nothing else, and that is the licence.**
 * An echo running is a fact **both** screens already hold and hold in the same
 * picture: the lens shows the red dot while the stretch runs seen, and the
 * triangle and the beam down the field while it is sent again, so the boss
 * alone says whether the field in front of the pair is one they can see
 * (`reprise-lens.ts`). A word that appears with it says nothing that is not
 * already on the glass, and — the half of the test that catches more lanes
 * than the first — its **absence** says nothing either, because the red dot
 * has already said it.
 * Nothing here reads `left`, `cursor`, `from` or `held`.
 *
 * **`MOVE` is not suppressed when he is already in the right column**, and on
 * this boss that is not a nicety. BULB QUEEN's `MOVE` stands for the whole of a
 * bloom because *a word that vanished once he was under the real mark would
 * answer it by disappearing* (`boss-cue-read.ts`); here the column he would be
 * under is an **unseen** body's, so a word that went out on it would be the one
 * thing `unseen.ts` exists to make impossible — a mark put where a body neither
 * screen may draw is standing, made out of its own absence. The word is the
 * same word in every column, and a case asserts it in all eleven.
 *
 * **The seats are the panel's and not the picture's.** Only `cannon` picks the
 * column a bolt goes up and it is **player 1's** strip; only `fireRed` and
 * `fireCyan` fire and they are **player 2's** lobes, up whichever column player
 * 1 is standing in (`content/src/controls.ts`). So the carry is his and the
 * press is hers, and neither seat can do the other's half — which is the wave,
 * and which is what its briefing had backwards until this lane (the guide gave
 * both seats the plate, and nothing in this wave can be warded at all).
 *
 * **Five silences, and every one of them is the fight.**
 *
 * - **The column.** The mark for the press stands on the lens, which hangs on
 *   `midCol` and *does not move sideways for anything* — the same picture
 *   whichever column the body it has just sent is falling down. A frame that
 *   followed an echoed body would be the answer in the purest form this game
 *   has, and #34 forbids a column outright. The pilot's mark is on his own
 *   cannon, which is where his thumb already is.
 * - **The colour.** `FIRE`, never `RED` or `CYAN`. Half of what the pair had to
 *   remember is which of the two buttons each body takes, and the word is the
 *   verb alone — THE VANE's rule on a boss with nothing to read it off
 *   (`boss-cue-read-b.ts`).
 * - **The count.** The boss already draws it, as a ring of eggs and never a
 *   digit, on both screens (`reprise-brood.ts`). A cue that carried it would be #34's *reconsider
 *   if* clause arriving by the front door, and a second picture for one idea
 *   (`target-lock.ts`).
 * - **The beat.** Nothing here is timed to an arrival. The swallow already says
 *   *one has just gone*, on both screens, so a word that arrived with it would
 *   leak nothing — and it would still be wrong twice over: it would say *now*
 *   on the beat a body enters the field rather than the beat it comes into
 *   reach, and it would turn the one thing this boss is made of into a reaction.
 * - **The lance.** `fireRed` and `fireCyan` held fill the cannon lobe and burn
 *   a whole column at once (`sim/lance.ts`), and the family says `HOLD` / `BURN`
 *   wherever a column holds several — THE LEAD's and THE SCUTTLE's word. Here
 *   whether a column holds more than one is *the answer*, so the choice between
 *   the tap and the hold is the pair's and the field says `FIRE` for both.
 *
 * **And the sixth, which is the one a later lane will want to take away.**
 * `closeEcho` runs on the beat the echo's **last body is sent**, not on the
 * beat it lands (`sim/reprise.ts`), so the triangle goes out and these two
 * words with it while bodies nothing drew are still falling — fifteen beats of
 * it in the rehearsal, and the one that lands is the wave. Since 25 September
 * 2026 the boss counts those bodies itself, as dashed shells in the egg ring
 * (the owner: *as well with the remaining enemies on the screen, some kind of
 * count*) — how many, never where. A word here would still be a second picture
 * for that count, and one that implied an order to act on it; the film's last
 * three pages are the cost of saying nothing. So the field stops asking the moment it
 * stops counting. `render/test/boss-cue-reprise.test.ts` holds it to that.
 *
 * Nothing for the plate, and it is not an oversight: a word for the trigger
 * would have to be gated on a body the shield could turn, and every body this
 * fight is about is one neither screen may be told exists. It happens that
 * nothing in the wave as authored is wardable at all — seven entries, every one
 * of them a colour, so every one a `slick` or a `bulb`, and `isWardable` is the
 * meteor kinds and `volley` (`sim/kinds.ts`, `sim/hull.ts`: *the shield has
 * nothing to say to a slick*) — but the licence is the reason and the wave is
 * only the demonstration.
 */
export function repriseCues(l: Layout, world: World, _s: RepriseState): readonly BossCue[] {
  // The sim's own name for it, called rather than re-derived from `at`
  // (`CLAUDE.md`, the rules that are tests).
  if (!repriseEchoing(world)) return [];
  const tear = repriseTearCenter(l, world.cfg);
  return [
    // His, on the cannon at the hull — the house's spelling of this mark, and
    // the only strip in the game that picks a column. It is the fourth cue to
    // stand on `hullY` and so the fourth to inherit the verb drawn under the
    // plating (`docs/queue.md`, *a cue standing on the hull line*): the fix is
    // one line in `frame-field.ts` or a floor in `boss-cue-text.ts`, and it is
    // that entry's to make for all four at once rather than a fourth constant
    // here.
    markAt(1, "CARRY", "MOVE", tileCX(l, world.cannonCol), l.hullY, l, 97),
    // Hers, on the lens and wide, THE CURTAIN's arrangement for a mark that is
    // a whole body rather than a tile. There is nowhere else honest for it to
    // stand: every other thing on this field is a body neither screen may draw.
    markAt(2, "PRESS", "FIRE", tear.x, tear.y, l, 98, 2),
  ];
}
