import type { Wave } from "../wave-types.js";

/**
 * Act thirteen's second page, opened for THE GOVERNOR on 6 October 2026,
 * when the owner reworked it and a step became a list of marks — `act-13.ts`
 * had no room for the longer script, and the director writes this page whole
 * every time somebody paints on it (`tools/director/src/waves-act-files.ts`).
 *
 * **THE GOVERNOR is a needle both seats tap at once.** A needle runs round a
 * dial mid-hull on its own (§43, `sim/governor.ts`), and every tap step lights
 * a mark for each seat; later steps light more, numbered, to be tapped in
 * order. Then the needle's lit tip is shot through the gap at the bottom of
 * the rim, under THE SLOW, and only then — the taps are played at the beat's
 * own rate. The owner's rework of 6 October 2026 gave it a quicker needle and
 * longer shots; on 7 October he asked for the tip as the target and for more
 * time, counted where it can be seen, so every window is longer now.
 *
 * The script: three steps of a mark each, the shot earned; a red shot; three
 * marks in order; a cyan shot; four in order; the white shot. A lap is a
 * thousand over the pace, in ticks, and a beat is 75; each tap window holds
 * three laps or more of its needle, an ordered step's the longest way round
 * its order with two laps to spare, and each shot two passes of the tip at
 * the gap or more. A shot's needle turns slowly, because the bolt is judged as
 * it meets the tip and the tip must not run far while the bolt climbs.
 */
export const WAVES_ACT_13B: Wave[] = [];
