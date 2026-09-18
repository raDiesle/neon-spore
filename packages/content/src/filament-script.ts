import type { FilamentPath } from "@neon-spore/sim";

/**
 * THE FILAMENT's seven filaments: where each hangs, and the line it makes.
 *
 * A filament is a word — the free end, then `U`, `D`, `L`, `R` a tile each
 * toward the root — walked into tiles at install (`sim/filament.ts`
 * `walkFilament`). The body is over the top of the field, so every root is
 * up and every free end hangs low, and the draw goes *up* the field toward
 * the body: the pilot pulls the line in and the navigator keeps it taut.
 * `test/filament-script.test.ts` refuses a word a hand could not follow — a
 * step off the field, a tile twice.
 *
 * **They get longer and bend more, and that is the whole curve of the
 * wave.** The first is a straight run of five up the middle: the pair learns
 * the pace — one tile a beat, no faster — with nothing else to learn. The
 * second bends once; the third twice, the other way. From the fourth the
 * turns come in pairs, which is where *the next one is left* has to be said
 * before it is taken, because a thumb that guesses the turn wrong is a
 * thumb off the line. The seventh is eleven tiles and turns five times, and
 * with the window at three tiles (`sim/config-filament.ts`) that is a line
 * the navigator cannot see whole from where her thumb is.
 *
 * Nothing about a filament is in the field's middle column except the first,
 * so a pair who learned it on the middle has to say a column on the second.
 */
export const FILAMENT_SCRIPT: readonly FilamentPath[] = [
  { col: 5, row: 8, moves: "UUUU" },
  { col: 3, row: 9, moves: "UURUU" },
  { col: 7, row: 9, moves: "ULUULU" },
  { col: 2, row: 10, moves: "URUURUU" },
  { col: 8, row: 10, moves: "ULULUULU" },
  { col: 4, row: 11, moves: "URRUULUURU" },
  { col: 6, row: 12, moves: "ULLUURRUULU" },
];
