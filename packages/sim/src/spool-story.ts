import { bossStrikesHull } from "./boss-strike.js";
import { closeSlow, openSlow } from "./slow.js";
import {
  SPOOL_STORY,
  type SpoolState,
  type SpoolStoryPhase,
  spoolCol,
  spoolDepthMilli,
  spoolHeld,
} from "./spool.js";
import type { World } from "./world.js";

/**
 * **THE SPOOL's story between the ribs** (§21 rows S1–S3): three states that
 * turn four ribs eased by four held depths into four different pictures, each
 * answered on the one brake the pilot already holds and read off its depth as
 * a level, a beat at a time, the way the line always is.
 *
 * - **The snag.** After the first rib the line catches on the casing and stops
 *   dead. The pilot lets the brake right off for `spoolSnagBeats` in a row and
 *   grips it again, and the snag slips free — the boss's own question in
 *   miniature, because letting go is the answer. Held through, or never let
 *   go of, by `spoolSnagWindowBeats`, the line snaps taut against the hull
 *   and snags again.
 * - **The whip.** After the second the freed line whips in a loop. The brake
 *   held at full depth (`spoolWhipDeepMilli`) for `spoolWhipBeats` in a row
 *   damps it flat; still thrown by `spoolWhipWindowBeats`, it lashes the hull
 *   and is thrown again.
 * - **The fray.** After the third the line frays. The brake held featherlight
 *   — a hand on it, no deeper than `spoolFrayLightMilli` — for
 *   `spoolFrayBeats` in a row holds the fray, and the last movement opens; run
 *   out by `spoolFrayWindowBeats`, a strand snaps against the hull and the
 *   line frays again. How light is hers to say: the pilot feels a grip, not a
 *   number.
 *
 * **No state costs a rib back.** A state run out is the spool's own blow at
 * the hull (`bossStrikesHull`) and the same state from its head. Every state
 * opens on the beat the ease ends, so each runs out once `since` has *reached*
 * its window and THE SLOW spans exactly that — THE VALVE's windows open
 * mid-beat and add one, and these do not need to.
 */

/** Which state follows the rib just eased, by how many ribs are gone; none after the last. */
export function spoolStoryAfter(gone: number): SpoolStoryPhase | null {
  return SPOOL_STORY[gone - 1] ?? null;
}

/** A story state up from this beat, its run counted afresh, under THE SLOW. */
export function openSpoolStory(world: World, s: SpoolState, phase: SpoolStoryPhase): void {
  const cfg = world.cfg;
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.runBeats = 0;
  openSlow(world, windowOf(world, phase), "ask");
  const col = spoolCol(cfg);
  if (phase === "snag") world.events.push({ type: "spoolSnag", col });
  else if (phase === "whip") world.events.push({ type: "spoolWhip", col });
  else world.events.push({ type: "spoolFray", col });
}

/**
 * A beat of whichever state is up: the brake read as a level, answered,
 * run out, or neither. Answered, `resume` opens the next movement
 * (`spool-step.ts`).
 */
export function stepSpoolStory(world: World, s: SpoolState, resume: () => void): void {
  const phase = s.phase;
  if (phase !== "snag" && phase !== "whip" && phase !== "fray") return;
  if (answered(world, s, phase)) {
    closeSlow(world);
    const col = spoolCol(world.cfg);
    if (phase === "snag") world.events.push({ type: "spoolFree", col });
    else if (phase === "whip") world.events.push({ type: "spoolDamp", col });
    else world.events.push({ type: "spoolFeather", col });
    resume();
    return;
  }
  if (world.beat - s.phaseBeat < windowOf(world, phase)) return;
  runOut(world, s, phase);
}

/**
 * Whether this beat's brake answers the state, the run counted as it goes.
 *
 * The snag counts beats **off** the brake and is freed by the first beat a
 * hand is back on it once the count is made — a grip too soon starts the count
 * again. The whip and the fray count beats **held** at their depth, and any
 * other beat, a hand off it included, starts them again.
 */
function answered(world: World, s: SpoolState, phase: SpoolStoryPhase): boolean {
  const cfg = world.cfg;
  if (phase === "snag") {
    if (!spoolHeld(s)) {
      s.runBeats += 1;
      return false;
    }
    if (s.runBeats >= cfg.spoolSnagBeats) return true;
    s.runBeats = 0;
    return false;
  }
  const depth = spoolDepthMilli(s);
  const right =
    spoolHeld(s) &&
    (phase === "whip" ? depth >= cfg.spoolWhipDeepMilli : depth <= cfg.spoolFrayLightMilli);
  s.runBeats = right ? s.runBeats + 1 : 0;
  return s.runBeats >= (phase === "whip" ? cfg.spoolWhipBeats : cfg.spoolFrayBeats);
}

/** The state run out: the spool's own blow at the hull, and the state from its head. */
function runOut(world: World, s: SpoolState, phase: SpoolStoryPhase): void {
  const col = spoolCol(world.cfg);
  if (phase === "snag") world.events.push({ type: "spoolSnap", col });
  else if (phase === "whip") world.events.push({ type: "spoolLash", col });
  else world.events.push({ type: "spoolStrand", col });
  bossStrikesHull(world, "spool", col, 0, phase);
  openSpoolStory(world, s, phase);
}

function windowOf(world: World, phase: SpoolStoryPhase): number {
  const cfg = world.cfg;
  if (phase === "snag") return cfg.spoolSnagWindowBeats;
  if (phase === "whip") return cfg.spoolWhipWindowBeats;
  return cfg.spoolFrayWindowBeats;
}
