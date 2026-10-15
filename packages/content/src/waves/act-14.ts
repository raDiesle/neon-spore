import type { Wave } from "../wave-types.js";

/**
 * Act fourteen, opened for THE LAMPREY on 1 October 2026 — `act-13.ts` had
 * six lines left under the 250-line ceiling, which is less than one wave with
 * its argument written above it (`waves.ts`).
 *
 * **THE LAMPREY is the first boss that leaps about the field.** An eel that
 * jumps from tile to tile and bites into each, every leap a tile longer than
 * the last (`docs/spec/bosses-choreographed.md` §41, `sim/lamprey.ts`, the
 * owner's rework of 5 October 2026). One seat holds the tail and the other
 * frees the head — pulled up, or its lit tooth tapped out twice — or the two
 * pull it apart at once; a stay the fuse runs out on bites through to the
 * hull. Then the gullet rears on its tile and is shot in its colour.
 *
 * **It arrives hungry and crawls between levels** (the owner, 6 October
 * 2026, `sim/lamprey-roam.ts`): it crawls in and eats two rocks, a slick and
 * a bulb as they fall — each caught on its own row, the gaps between them
 * uneven and the head after them at one, two or three tiles a beat (the
 * owner, 9 October 2026, `sim/lamprey-meal.ts`) — **comes down the middle
 * of the field at the ship, and both seats pull it back off**, the head
 * along a curve, the eel losing its temper two thirds of the way (the owner,
 * 9 October 2026, `sim/lamprey-tow.ts`) — and then leaps through three levels of three, four and five stays, every leap in a
 * level a tile longer than the last and each level ended on a gullet. Before
 * the second and third it crawls the field side to side like a worm, eats
 * what falls for it and drops dung the shield has to turn. A lit tooth takes
 * three taps, and four in the third level. Each stay's window is THE SLOW.
 * **In the fourth level it bites into the ship** (the owner, 10 October
 * 2026, `sim/lamprey-plug.ts`): twice down the middle into the hull, its
 * teeth pulling a button out of a panel — the pilot's SUCK, then the
 * navigator's RED — which that seat presses back in before the other pulls
 * the tail.
 */
export const WAVES_ACT_14: Wave[] = [];
