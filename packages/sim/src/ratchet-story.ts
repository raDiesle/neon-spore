import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { NO_CATCH, type RatchetState, ratchetHeld } from "./ratchet.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE RATCHET's story between the teeth** (`docs/spec/bosses-choreographed.md`
 * §22): one state after each of the first four clean teeth, each its own
 * SLOW window, each answered with a hand the boss already has. **None takes
 * a tooth back** — every state is the rack threatening to undo a step, and
 * the pair stopping it.
 *
 * - **The slip**, after the first. She sets the catch and keeps it set for
 *   `ratchetSlipBeats` beats in a row.
 * - **The kick**, after the second. He keeps the pawl down for
 *   `ratchetKickBeats` beats in a row. The bolt is loose while it is on.
 * - **The bind**, after the third. Both hold, catch set and pawl down, for
 *   `ratchetBindBeats` beats in a row.
 * - **The wind**, after the fourth. She sets the catch `ratchetWindSets`
 *   times, lifting it between, inside `ratchetWindBeats`.
 *
 * Held beats are counted on the beat, a beat off breaking the run. The
 * first three run out after `ratchetStoryBeats`, the wind after its own
 * window; a state run out is the rack's own blow at the hull, and the state
 * runs again. A state won is a climb, and the next pawl lights after it.
 *
 * **A state her catch answered spends it**, as a clean tooth does: `SET` is
 * said again for the tooth after, never carried over from the story.
 *
 * Every state opens mid-beat, on the tick the press landed, so each runs out
 * once `since` is *past* its beats and THE SLOW is opened one beat longer —
 * THE VALVE's rule (`valve-story.ts`).
 */

type StoryPhase = "slip" | "kick" | "bind" | "wind";

/** The state after this many clean teeth, or null after the fifth and before the first. */
export function ratchetStoryAfter(clean: number): StoryPhase | null {
  if (clean === 1) return "slip";
  if (clean === 2) return "kick";
  if (clean === 3) return "bind";
  if (clean === 4) return "wind";
  return null;
}

/** The beats a state has before it runs out. */
function windowOf(world: World, phase: StoryPhase): number {
  return phase === "wind" ? world.cfg.ratchetWindBeats : world.cfg.ratchetStoryBeats;
}

/** The beats in a row a held state asks for; the wind counts sets instead. */
function heldFor(world: World, phase: StoryPhase): number {
  const cfg = world.cfg;
  if (phase === "slip") return cfg.ratchetSlipBeats;
  if (phase === "kick") return cfg.ratchetKickBeats;
  return cfg.ratchetBindBeats;
}

const OPENS = {
  slip: "ratchetSlip",
  kick: "ratchetKick",
  bind: "ratchetBind",
  wind: "ratchetWind",
} as const;
const WON = {
  slip: "ratchetBite",
  kick: "ratchetSeat",
  bind: "ratchetMesh",
  wind: "ratchetWound",
} as const;
const MISSED = {
  slip: "ratchetDrop",
  kick: "ratchetFly",
  bind: "ratchetShake",
  wind: "ratchetUnwind",
} as const;

/** A story state from this beat, its counts afresh and THE SLOW open for it. */
export function openStory(world: World, s: RatchetState, phase: StoryPhase): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.holdBeats = 0;
  s.windSets = 0;
  openSlow(world, windowOf(world, phase) + 1, "ask");
  world.events.push({ type: OPENS[phase], col: midCol(world.cfg) });
}

/** Whether the hand this state asks for is on it this beat. */
function holding(world: World, s: RatchetState, phase: StoryPhase): boolean {
  const caught = ratchetHeld(s, world.cfg);
  if (phase === "slip") return caught;
  if (phase === "kick") return s.pawlDown;
  return caught && s.pawlDown;
}

/** A beat of a story state: the hold counted, then won, run out, or neither. */
export function stepStory(world: World, s: RatchetState, since: number): void {
  const phase = s.phase;
  if (phase !== "slip" && phase !== "kick" && phase !== "bind" && phase !== "wind") return;
  if (phase !== "wind") {
    s.holdBeats = holding(world, s, phase) ? s.holdBeats + 1 : 0;
    if (s.holdBeats >= heldFor(world, phase)) {
      won(world, s, phase);
      return;
    }
  }
  if (since <= windowOf(world, phase)) return;
  const mid = midCol(world.cfg);
  world.events.push({ type: MISSED[phase], col: mid });
  bossStrikesHull(world, "ratchet", mid, 0, phase);
  openStory(world, s, phase);
}

/** Her catch set once more while the spring is wound: enough and it is tight. */
export function ratchetPumped(world: World, s: RatchetState): void {
  if (s.phase !== "wind") return;
  s.windSets += 1;
  if (s.windSets >= world.cfg.ratchetWindSets) won(world, s, "wind");
}

function won(world: World, s: RatchetState, phase: StoryPhase): void {
  closeSlow(world);
  world.events.push({ type: WON[phase], col: midCol(world.cfg) });
  if (phase !== "kick") {
    s.catchMilli = NO_CATCH;
    s.catchSpent = true;
  }
  s.phase = "climb";
  s.phaseBeat = world.beat;
  s.holdBeats = 0;
  s.windSets = 0;
}
