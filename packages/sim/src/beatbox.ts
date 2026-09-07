import { msToTicks, type SimConfig, ticksPerBeat } from "./config.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * THE BEATBOX: a soundbox that swells on every beat, and the first body in
 * this game answered by **when** a finger lands rather than by what is under
 * it.
 *
 * Everything else on the field is answered by a place plus a moment. A rock
 * wants the dome in its column at the instant it arrives; a slick wants the
 * cannon in its lane with the right colour loaded. Both are one press, and the
 * pair spends the fall agreeing where to put it. This one wants a *run*: the
 * navigator taps the body itself, once a beat, on the beat, as many times as
 * the box is asking for — and the number it is asking for is written on the
 * pilot's screen and on nobody else's.
 *
 * So what crosses the room is the plainest sentence in the game after THE
 * GHOST's column: **a number**. The pilot reads it and says it; the navigator
 * counts it out with a thumb and then takes the thumb away, because stopping
 * is how the run is committed. Miss the count and the box discharges at the
 * hull; get it and it is silenced where it stands.
 *
 * **The rules that happen to a box are `beatbox-round.ts` next door**, and the
 * seam is the one `choir.ts` and `choir-gesture.ts` already cut: this is what
 * a box *is* and what can be read off one — a count, a run, the beat a tap
 * belongs to — and that is what a tap and a lapsed run *do*. This half is
 * finished; the half next door is the half that grows.
 */

/** Whether this body is a soundbox. One call rather than `c.kind ===` at each
 * site, on `choirIsDots`' terms: the kind is the whole of the state, and the
 * day a box wears something the sites that spelled it out are the ones that
 * miss it. */
export function beatboxIsBox(c: Creature): boolean {
  return c.kind === "beatbox";
}

/**
 * How many beats this box is asking for. `beatboxWant` through here and never
 * directly, so the number player 1 is shown and the count the lock-in is
 * judged against cannot come apart.
 *
 * Nought for a body that is not a box, which is a count no live box carries —
 * `beatboxOnSpawn` writes the config's own figure for a wave that named none.
 * It matters because it is the one value `beatboxCorrect` refuses outright: a
 * malformed box asking for nothing is never silenced for free.
 */
export function beatboxWanted(c: Creature): number {
  return c.beatboxWant ?? 0;
}

/** How many taps have landed on the beat so far. Absent and nought are one
 * state — a box standing there untouched — so the fallback is spelled here
 * and nowhere else. */
export function beatboxHitsMade(c: Creature): number {
  return c.beatboxHits ?? 0;
}

/** Whether a run is under way at all: one tap has landed and the box is now
 * counting. What `beatboxLapsed` is asked about, and what render draws a
 * tally for. */
export function beatboxRunOpen(c: Creature): boolean {
  return beatboxHitsMade(c) > 0;
}

/** Ticks either side of a beat a tap still counts in, from `beatboxWindowMs`
 * at this tick rate. */
export function beatboxWindowTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.beatboxWindowMs);
}

/**
 * **Which beat this tick's tap is for**, or null for a thumb that landed
 * between two of them.
 *
 * A tap inside the window *after* a beat is late for that beat; one inside the
 * window *before* the next boundary is early for the beat it is reaching for,
 * not late for the one behind it. That is the whole of why this is a function
 * and not `world.beat`: a player counting a run out loud presses slightly
 * ahead as often as slightly behind, and crediting the early ones backwards
 * would break every run at its second tap.
 *
 * The two windows cannot overlap, because the window is under half a beat and
 * `packages/sim/test/beatbox.test.ts` holds the config to that — so the answer
 * here is one beat or none, never two.
 */
export function beatboxBeatFor(world: World): number | null {
  const tpb = ticksPerBeat(world.cfg);
  const edge = beatboxWindowTicks(world.cfg);
  const phase = world.tick % tpb;
  if (phase <= edge) return world.beat;
  if (tpb - phase <= edge) return world.beat + 1;
  return null;
}

/**
 * **Whether a run that was going is over**, asked about a given beat.
 *
 * One predicate for the two doors a run can be committed through, and one is
 * exactly why it is a predicate: the beat loop asks it of the beat that has
 * just begun, and a tap asks it of the beat the tap is for. A run that skipped
 * a beat and was then tapped again would otherwise sail past the loop's check,
 * because by the time the loop looks the body already carries the *newer*
 * beat.
 *
 * `+ 1` and not `+ 0` is a whole beat of grace, and it has to be: the window
 * around beat `b` closes `beatboxWindowTicks` *after* the boundary, so a check
 * at beat `b` itself would commit the run while the thumb still had a real
 * chance to land. At `b + 1` the window has certainly shut.
 */
export function beatboxLapsed(c: Creature, beat: number): boolean {
  return beatboxRunOpen(c) && beat > (c.beatboxBeat ?? beat) + 1;
}

/** Whether the run standing on this box answers what it asked for. A box
 * asking for nothing is never right, which is what keeps a malformed body off
 * the free-kill path (`beatboxWanted`). */
export function beatboxCorrect(c: Creature): boolean {
  const want = beatboxWanted(c);
  return want > 0 && beatboxHitsMade(c) === want;
}

/**
 * What a box is born with: the count the wave authored, or the config's own.
 *
 * Authored and never rolled, for `SpawnEntry.wears`' reason with the most
 * riding on it of any of them — the count **is** the sentence one player says
 * to the other, and a wave cannot be composed against a sentence its author
 * does not know. The clamp is here rather than at the wave, so a count typed
 * as nought or as a number no fall is long enough to hold cannot reach the
 * field: a box asking for more beats than it has left is a body the pair is
 * shown and cannot answer.
 */
export function beatboxOnSpawn(cfg: SimConfig, beats?: number): { beatboxWant: number } {
  const want = beats ?? cfg.beatboxBeats;
  return { beatboxWant: Math.max(1, Math.min(cfg.rows - 2, Math.round(want))) };
}
