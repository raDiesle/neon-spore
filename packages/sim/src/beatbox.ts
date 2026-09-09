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
 * counting. What `beatboxLapsed` is asked about, and what render drives the
 * box's own air off — an untouched box idles and one in a run pushes harder
 * (`render/beatbox-air.ts`). */
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
 * **Whether a run that was going is over**, asked of the tick the world is
 * standing on.
 *
 * It used to be asked of a *beat*, with a whole beat of grace after the one a
 * tap was expected on, and the owner's report is the reason it no longer is:
 * *when one beat was skipped I should immediately react, not on the beat
 * after, its too late*. A run that skips a beat is now settled the instant
 * that beat's window shuts — a fifth of a second past the boundary — rather
 * than at the next boundary a whole beat later.
 *
 * The deadline is `beatboxDeadline` below and it is a tick, which is what
 * makes the reaction land inside a beat at all: a beat is the coarsest thing
 * this simulation counts, so anything answered on one can only ever be a beat
 * late. Nothing about the *window* moved — a thumb still has
 * `beatboxWindowTicks` either side of the beat it is reaching for — only the
 * moment the game stops waiting for it.
 *
 * One predicate for the two doors a run can be committed through, and one is
 * exactly why it is a predicate: `step` asks it of every box on every tick,
 * and a tap asks it of the body it landed on. The second is now the rarer
 * path — the tick loop has almost always settled the run before a late thumb
 * arrives — and it is kept because a tap and a settle inside one tick must
 * still resolve in that order.
 */
export function beatboxDeadline(cfg: SimConfig, c: Creature): number | null {
  if (!beatboxRunOpen(c) || c.beatboxTick === undefined) return null;
  const tpb = ticksPerBeat(cfg);
  // **The boundary the last tap answered, recovered from the tick it landed
  // on** — and deliberately not from `beatboxBeat`, which is what the first
  // version of this did.
  //
  // `world.beat` is a *label* rather than a position on the tick line: it is
  // incremented by `beatMetronome` and a run of the game can leave it a whole
  // beat away from `tick / ticksPerBeat` (it does, live, and the offset then
  // stands for the rest of the run). Multiplying it back into ticks was
  // therefore a deadline in the wrong place, and it settled runs a beat early
  // — a mistake nothing in the picture would have explained to a player.
  //
  // Rounding is exact rather than approximate: a tap lands inside
  // `beatboxWindowTicks` of a boundary, and that window is held to under half
  // a beat by the config's own test, so the nearest multiple of `tpb` *is* the
  // boundary it was reaching for, early tap or late.
  const boundary = Math.round(c.beatboxTick / tpb) * tpb;
  // One beat further on, plus the far edge of that beat's window: the last
  // tick a thumb could still have landed on and counted.
  return boundary + tpb + beatboxWindowTicks(cfg);
}

export function beatboxLapsed(world: World, c: Creature): boolean {
  const deadline = beatboxDeadline(world.cfg, c);
  return deadline !== null && world.tick > deadline;
}

/**
 * **Whether one more tap would take this run past what the box asked for.**
 *
 * Asked before a tap is counted rather than after, because an over-count is
 * now answered on the tap itself — the owner asked for *when player hits more
 * than required beats, it should also immediately show red and damages the
 * ship*. Waiting for the run to be committed by stopping would have put a
 * whole beat between the thumb that was wrong and the thing that said so, and
 * on a creature whose entire subject is *when* a press landed that is the one
 * delay it cannot afford.
 *
 * A box asking for nothing overshoots on its first tap, which is the same
 * refusal `beatboxCorrect` makes for the same malformed body: nothing is ever
 * silenced for free.
 */
export function beatboxOvershoots(c: Creature): boolean {
  return beatboxHitsMade(c) + 1 > beatboxWanted(c);
}

/**
 * **Whether a box takes a step down the field on this beat.**
 *
 * A box comes down at half the speed of everything else that falls, and the
 * beats it does not take are beats it simply does not move: the simulation
 * stores integers, so there is no half a tile for it to stand on. THE ECHO's
 * `echoFalls` is the same shape for the same reason, and `slowStep` is where
 * both are spent (`slow-fall.ts`).
 */
export function beatboxFalls(cfg: SimConfig, beat: number): boolean {
  return beat % cfg.beatboxFallBeats === 0;
}

/** Whether the run standing on this box answers what it asked for. A box
 * asking for nothing is never right, which is what keeps a malformed body off
 * the free-kill path (`beatboxWanted`). */
export function beatboxCorrect(c: Creature): boolean {
  const want = beatboxWanted(c);
  return want > 0 && beatboxHitsMade(c) === want;
}

// **The readings only the picture asks for** — how long ago a thumb counted,
// how long ago one missed, how long ago the box came apart, and the run a
// discharge took away — are `beatbox-picture.ts` next door, cut out when the
// counter's four states took this file over its 250-line limit. The seam is
// one the state itself already draws (`creature-state-beatbox.ts`): none of
// the four decides anything, they only say how far through a drawing the body
// is. Re-exported here, so nothing that reached for one had to move.
export {
  beatboxMissAge,
  beatboxSpentRun,
  beatboxTapAge,
  beatboxWaitThrough,
  beatboxWrongAge,
} from "./beatbox-picture.js";

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
