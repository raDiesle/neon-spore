import { beatPhase } from "./beat-clock.js";
import type { TimedCommand } from "./command-types.js";
import { ticksPerBeat } from "./config-derived.js";
import { endRun } from "./run.js";
import type { World } from "./world.js";

/**
 * A hit fails the wave, and the wave is played again.
 *
 * The owner's rule, 12 September 2026: *every hull damage fails the wave*,
 * and a wave is passed only when everything it sent has been destroyed,
 * evaded, sucked in or shielded — each by its own mechanic. What the run
 * keeps is not a hull and a score but **how long the pair took and how many
 * times they went again**, across every wave until the last one is cleared.
 * The hull's points, the bar that showed them and the game over they ended in
 * are on their way out (`docs/spec/structure.md`).
 *
 * **The moment of the hit is the moment the wave stops.** `failWave` is what
 * `applyHullDamage` does now: it marks the tick and says so in an event. From
 * then on `step` holds the field the way an opening does —
 * nothing falls, nothing fires, the tick still counts — for `waveFailBeats`,
 * so the breach is seen where it happened; then the pair is asked, on a
 * screen over the held field (`render/lost-screen.ts`). Either seat's press
 * answers for both, first one wins — decided by the owner on 13 September
 * 2026. A retry asks the host for the same wave (`needWave` with `retry`) and
 * the field stays held until it answers; a quit ends the run for both, says who
 * quit, and the room stays. Two devices agree about all of it because every
 * part is the world's: `failTick`, `retries` and `playTicks` are in
 * `hashWorld`, and the answer is a command in lockstep.
 *
 * **There is a third answer, and it is a retry with the guide put back.** The
 * owner, 24 September 2026: *there must be a way to watch tutorial again and
 * then restart wave, like as players entered first time the wave.* A plain
 * retry deliberately skips the guide — the pair has read it, what they need is
 * the field — and that is exactly wrong for the pair who lost *because* they
 * had not understood it. So `retryGuide` asks for the same wave with `guide`
 * on the event, and `apps/game/src/waves.ts` opens it the way a first entry
 * opens: the film, the gate, then the field. It still counts as a retry,
 * because it is one, and it is only offered on a wave that has a guide to
 * watch (`content/waves.ts`, `waveHasGuide`).
 *
 * **A retry is counted when it is taken, not when it is asked for.** The
 * count goes up in `wave-start.ts`, on the tick the failed wave opens again,
 * beside the try it becomes. Counted on the hit, the lost screen's own frame
 * read `1 RETRY` under a QUIT button, and a pair that quit was recorded with
 * a retry they never took (13 September 2026).
 *
 * **What the clock counts is play.** A tick goes on `playTicks` when the wave
 * is live — not while its opening or guide holds the field, not in the pause
 * after a hit, not in the rest after a clear, not once the run is over. The
 * time a lost wave cost is in it, because that time was played.
 */

/** `failTick` while no hit has failed this opening of the wave. */
export const NOT_FAILED = -1;
/** `failTick` while the screen is up: the pause is spent, the pair is asked. */
const ASKED = -2;
/** `failTick` once a seat asked for the wave again, with the guide or without:
 * the host is asked, the field held until it answers. */
const ANSWERED = -3;

/** The hull took damage: the wave is lost, from this tick. */
export function failWave(world: World): void {
  if (world.cfg.hullInvulnerable || world.over) return;
  if (world.failTick !== NOT_FAILED) return;
  world.failTick = world.tick;
  world.heldTick = world.tick;
  world.events.push({ type: "waveFailed", wave: world.wave });
}

/**
 * The phase of the beat a frame of this world is drawn at — and the whole of
 * what makes the held field *look* held.
 *
 * `step` already returns early under `failHolds`: nothing falls, nothing
 * fires, nothing spawns. The picture went on moving anyway, because the tick
 * still counts and `drawnRow` eases a body from `fromRow` to `row` across the
 * phase of the beat. So every body finished the step it was halfway through
 * after the hull was struck, and a rock caught mid-fall slid on down its
 * column under a screen saying the wave was lost. The owner, 17 September
 * 2026: *everything on the game area should stay at their current position in
 * the moment hull took damage, and neither disappear nor continue falling.*
 *
 * Asked here rather than by each caller, because the answer is a fact about
 * the world and there are eight places that draw one. Own-motion — a sway, a
 * wobble, a shimmer — runs off the renderer's own `time` and is deliberately
 * not frozen: it is per device already, it moves nothing anywhere, and a field
 * that stopped breathing as well would read as a dropped frame.
 */
export function framePhase(world: World): number {
  return beatPhase(world.cfg, failHolds(world) ? world.heldTick : world.tick);
}

/** Whether a hit is holding the field — the pause, and the wait for the host after it. */
export function failHolds(world: World): boolean {
  return world.failTick !== NOT_FAILED;
}

/** Whether the lost screen is up and waiting for a press from either seat. */
export function lostAsks(world: World): boolean {
  return world.failTick === ASKED && !world.over;
}

/**
 * One tick of the hold. The pause spends itself into the question; the
 * question is answered by the first `retry`, `retryGuide` or `quit` to arrive,
 * from either seat — the same wave asked for once, with or without its guide,
 * or the run ended for both. `restart` is not read here: it is the balance
 * sheet's word, and the sheet is not up.
 */
export function stepFailHold(world: World, commands: readonly TimedCommand[]): void {
  if (world.failTick >= 0) {
    if (world.tick - world.failTick < world.cfg.waveFailBeats * ticksPerBeat(world.cfg)) return;
    world.failTick = ASKED;
    return;
  }
  if (!lostAsks(world)) return;
  for (const c of commands) {
    if (c.command.kind === "retry" || c.command.kind === "retryGuide") {
      world.failTick = ANSWERED;
      world.events.push({
        type: "needWave",
        wave: world.wave,
        retry: true,
        // Only when it is asked for, so a plain retry's event is the object it
        // always was: `retry: true` and nothing else.
        ...(c.command.kind === "retryGuide" ? { guide: true as const } : {}),
      });
      return;
    }
    if (c.command.kind === "quit") {
      endRun(world);
      world.events.push({ type: "quit", player: c.player });
      return;
    }
  }
}

/** One tick on the run's clock, if the wave is live. */
export function countPlay(world: World): void {
  if (world.over || world.restBeat !== 0) return;
  world.playTicks += 1;
}

/** The run's clock in whole seconds. */
export function playSeconds(world: World): number {
  return Math.floor(world.playTicks / world.cfg.tickHz);
}

/** Seconds as the clock reads them, `3:42`. One format for the HUD's corner,
 * the balance sheet, the menu's line and the room's greeting. */
export function clockText(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** A count of retries as a phrase: `NO RETRIES`, `1 RETRY`, `2 RETRIES`. */
export function retriesText(retries: number): string {
  if (retries === 0) return "NO RETRIES";
  return `${retries} ${retries === 1 ? "RETRY" : "RETRIES"}`;
}
