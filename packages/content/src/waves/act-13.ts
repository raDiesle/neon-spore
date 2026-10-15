import type { Wave } from "../wave-types.js";

/**
 * Act thirteen, opened for THE DAVIT on 26 September 2026 — `act-12.ts` had
 * fourteen lines left under the 250-line ceiling, which is less than one
 * wave with its argument written above it (`waves.ts`). THE DAVIT itself
 * left the game on 8 October 2026: the owner did not like it, and it was
 * short to play (`docs/spec/bosses.md` §11.52).
 *
 * **THE CAPSTAN is the first boss one seat turns for the other to work.** A
 * rusted drum on a cradle: one seat drags the drum to rock a face toward the
 * pair, the other wipes that face's band bright, and only the bared face
 * wears (§37, `sim/capstan.ts`). The left mark is the pilot's pull and the
 * right the navigator's; after the bare, a hold takes either way round. Three
 * shots at the core, the last one white.
 *
 * **THE GALL is the first boss the pair throw to each other.** A small
 * alien sits on one seat's half of the hull: that seat taps it until it is
 * charged and pulls it up, and it leaps to a point on the other half, where
 * the clock starts again (§38, `sim/gall.ts`, the owner's rework of 8
 * October 2026). Three levels, each more taps on a shorter clock, each ended
 * by a shot at the alien where it landed: red, cyan, then either.
 *
 * **THE TRAPEZE is the first boss the pair swings up.** An alien sits on a
 * swing hung from long ropes over the middle; the pair push it as it comes
 * back toward the middle until it is high enough to kick the gong (§39,
 * `sim/trapeze.ts`, the owner's rework of 7 October 2026). Four levels, one
 * new thing each: P1 left and P2 right; who pushes a side called by chance;
 * shots from below; the pilot's tap locking the cannon for a shot from the
 * side. Every gong a little higher than the last.
 *
 * **THE FLUE is the first boss only one seat can see.** An ember runs along
 * a flue across the top of the field, end to end and back, over the cannon
 * held still under the middle (§11.57, `sim/flue.ts`). The pilot sees it and
 * the navigator does not, so the pilot says when, early by the shot's own
 * delay: a bolt climbs for most of a beat, a beam fills for three. Six
 * levels, each one weapon in one colour, the ember at its own speed and THE
 * SLOW at its own strength; three shots a level, and the third one missed is
 * the wave. The levels climb from a slow bolt to a fast beam, and the slow
 * comes in as the ember speeds up.
 *
 * **Every shot in this act waits six beats**, 3.75 seconds at 96 bpm. It was
 * three, which left little over a second once the cannon was under the core
 * and the bolt had climbed, and a shot run out is the wave; the owner, 7
 * October 2026: *when in boss sequences player needs to shoot cannon, we must
 * give players more time to shoot and hit.*
 */
export const WAVES_ACT_13: Wave[] = [];
