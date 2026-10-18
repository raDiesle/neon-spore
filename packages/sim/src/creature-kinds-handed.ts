/**
 * **The body answered by a hand from each seat at once**: THE BALLOON, the
 * only one in the game whose answer needs both people's thumbs on the same
 * tick. THE WEIGHT was the second until 18 October 2026, when two hands held
 * together became a setting on THE BLISTER (`BlisterBy`, `"both"`).
 *
 * Cut out of `creature-kinds.ts` for `creature-kinds-many.ts`' reason. The
 * seam is the one `packages/content` already cuts — `creatures-handed.ts` and
 * `mechanics-handed.ts` hold the same family. Neither control reaches it, so a
 * wave carrying nothing but these owes its panel nothing (`categoryOf` reads
 * that as `special`).
 *
 * One arm of `CreatureKind` and not a type anything switches on by itself:
 * every consumer still walks the whole roster, which is what keeps a new kind a
 * compile error (`creature-roster.ts`, `kind-code.ts`).
 */
export type HandedKind =
  /**
   * The first body that does not come down at all, and the first that
   * neither control can touch. It appears out of nothing one row above the
   * ship, swells into the field, and then **climbs** — a row up and a column
   * across every beat, turning at the side walls — until it reaches the top,
   * where it bursts and the hull pays for it wherever the ship happens to be.
   *
   * Nothing on either panel reaches it. What does is **two hands at once**:
   * the pilot carries the handle on its left leftward, the navigator the one
   * on its right rightward, and while both are taut the skin gives. The
   * first rub splits it into two smaller balloons that climb on again; the
   * second pops each of them for nothing — so what the pair has to say out
   * loud is **which one, now**, the one thing several rising bodies cannot
   * answer for them. `balloon.ts` is the body and `balloon-pull.ts` the two
   * hands; `Creature.balloonSplits`, `balloonBeat`, `balloonDir`,
   * `balloonRise` and the two pulls are the whole of its state.
   */
  "balloon";
