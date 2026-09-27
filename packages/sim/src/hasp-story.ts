import { bossStrikesHull } from "./boss-strike.js";
import { midCol } from "./config.js";
import { type HaspPhase, type HaspState, haspHeld } from "./hasp.js";
import { closeSlow, openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE HASP's story between the hasps** (`docs/spec/bosses-choreographed.md`
 * §20, S1–S4): four states that turn three openings of one door into a door
 * that answers each one. Each is its own SLOW window, each is answered with a
 * hand the boss already has — the latch and the wheel — and **none costs a
 * hasp back**.
 *
 * - **The rattle**, after the first hasp swings. He keeps the latch gripped
 *   `haspRattleBeats` beats in a row and the hinge quiets; the next latch
 *   lights after it.
 * - **The backspin**, after the second. The wheel spins back on its spring
 *   and she winds it `haspWindTravelMilli` inside `haspBackspinBeats`,
 *   **with no gate**: nothing he holds is asked for, and the latch is dark.
 * - **The rust**, straight after the backspin, on the last hasp. He holds the
 *   latch while she rocks the wheel, `haspRustRocks` reversals inside
 *   `haspRustBeats`, and a rock turned with the latch let go counts nothing —
 *   the gate again. Broken, the last hasp is worked the ordinary way.
 * - **The sway**, after the third. Both hold, the latch gripped and her hand
 *   on the wheel moving no more than `haspStillMilli` a beat, for
 *   `haspSwayBeats` beats in a row, and the row swings clear. Run out, a
 *   door slams on the hull and the row swings clear anyway — the fight's end
 *   is not taken away, only its price.
 *
 * A state run out is the door's own blow at the hull, named for the state,
 * and the state starts again.
 *
 * **No grip in the story burns.** The fuse is the working hasp's clock and
 * the rattle *is* keeping hold, so a burn inside it would be the fight
 * refusing its own answer; the heat reads nought (`haspHeatMilli`).
 *
 * The rust opens mid-beat, on the tick the spring caught, so every window
 * closes once `since` is *past* its beats and THE SLOW is opened one beat
 * longer — THE VALVE's rule (`valve-story.ts`), kept for all four so no
 * state is a beat shorter than another.
 */

type StoryPhase = Extract<HaspPhase, "rattle" | "backspin" | "rust" | "sway">;

/** What each state says as it opens, is answered, and runs out. */
const SAID: Record<
  StoryPhase,
  {
    opens: "haspRattle" | "haspBackspin" | "haspRust" | "haspSway";
    answered: "haspHush" | "haspCatch" | "haspCrack" | "haspSteady";
    missed: "haspSlam" | "haspSpoke" | "haspBurst" | "haspRough";
  }
> = {
  rattle: { opens: "haspRattle", answered: "haspHush", missed: "haspSlam" },
  backspin: { opens: "haspBackspin", answered: "haspCatch", missed: "haspSpoke" },
  rust: { opens: "haspRust", answered: "haspCrack", missed: "haspBurst" },
  sway: { opens: "haspSway", answered: "haspSteady", missed: "haspRough" },
};

/** The state a hasp's swing ends in, with `hasps` left sealed. */
export function haspStoryAfter(hasps: number): StoryPhase {
  if (hasps === 2) return "rattle";
  if (hasps === 1) return "backspin";
  return "sway";
}

/** The beats a state has before it runs out. */
function windowOf(world: World, phase: StoryPhase): number {
  const cfg = world.cfg;
  if (phase === "backspin") return cfg.haspBackspinBeats;
  if (phase === "rust") return cfg.haspRustBeats;
  return cfg.haspStoryBeats;
}

/** A state opened, from this beat, every count afresh and its window slowed. */
export function openStory(world: World, s: HaspState, phase: StoryPhase): void {
  s.phase = phase;
  s.phaseBeat = world.beat;
  s.runBeats = 0;
  s.travelMilli = 0;
  s.rocks = 0;
  s.rockDir = 0;
  s.sweepMilli = 0;
  openSlow(world, windowOf(world, phase) + 1, "ask");
  world.events.push({ type: SAID[phase].opens, col: midCol(world.cfg) });
}

/** The state answered: THE SLOW shut and the answer said. */
function answered(world: World, phase: StoryPhase): void {
  closeSlow(world);
  world.events.push({ type: SAID[phase].answered, col: midCol(world.cfg) });
}

/**
 * **A beat of the story**: the holds counted, then the window judged. The
 * two winding states are answered on the tick instead (`haspStoryTurned`),
 * so here they can only run out. `lightLatch` and `clearRow` are the step's
 * own, handed in so this page does not reach back into `hasp-step.ts`.
 */
export function stepStory(
  world: World,
  s: HaspState,
  lightLatch: () => void,
  clearRow: () => void,
): void {
  const phase = s.phase as StoryPhase;
  const cfg = world.cfg;
  if (phase === "rattle" || phase === "sway") {
    const still = phase === "rattle" || (s.handMilli >= 0 && s.travelMilli <= cfg.haspStillMilli);
    s.runBeats = haspHeld(s, cfg) && still ? s.runBeats + 1 : 0;
    s.travelMilli = 0;
    const need = phase === "rattle" ? cfg.haspRattleBeats : cfg.haspSwayBeats;
    if (s.runBeats >= need) {
      answered(world, phase);
      if (phase === "rattle") lightLatch();
      else clearRow();
      return;
    }
  }
  if (world.beat - s.phaseBeat <= windowOf(world, phase)) return;
  const mid = midCol(cfg);
  world.events.push({ type: SAID[phase].missed, col: mid });
  bossStrikesHull(world, "hasp", mid, 0, phase);
  if (phase === "sway") {
    closeSlow(world);
    clearRow();
  } else openStory(world, s, phase);
}

/**
 * **Her wheel turned in the story**, `turned` thousandths signed, on the
 * tick (`hasp-hand.ts`). The backspin counts it either way round, the rust
 * counts its reversals while he holds, and the sway only counts it as a
 * stir. `lightLatch` is the step's, for the rust broken.
 */
export function haspStoryTurned(
  world: World,
  s: HaspState,
  turned: number,
  lightLatch: () => void,
): void {
  const cfg = world.cfg;
  if (s.phase === "sway") {
    s.travelMilli += Math.abs(turned);
    return;
  }
  if (s.phase === "backspin") {
    s.travelMilli += Math.abs(turned);
    if (s.travelMilli < cfg.haspWindTravelMilli) return;
    answered(world, "backspin");
    openStory(world, s, "rust");
    return;
  }
  if (s.phase !== "rust" || !haspHeld(s, cfg)) return;
  rock(s, turned, cfg.haspRockMilli);
  if (s.rocks < cfg.haspRustRocks) return;
  answered(world, "rust");
  lightLatch();
}

/**
 * One step of the rock: the same way round lengthens the sweep, and turning
 * back is a reversal only once the sweep before it had gone `rockMilli` —
 * shorter than that it is a tremble, and the sweep starts again the new way.
 */
function rock(s: HaspState, turned: number, rockMilli: number): void {
  const dir = turned > 0 ? 1 : -1;
  if (dir === s.rockDir) {
    s.sweepMilli += Math.abs(turned);
    return;
  }
  if (s.rockDir !== 0 && s.sweepMilli >= rockMilli) s.rocks += 1;
  s.rockDir = dir;
  s.sweepMilli = Math.abs(turned);
}
