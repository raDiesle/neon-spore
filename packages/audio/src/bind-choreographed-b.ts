import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { pinballHandCue } from "./bind-pinball-hand.js";
import { pulseHandCue } from "./bind-pulse-hand.js";
import { scoutHandCue } from "./bind-scout-hand.js";
import { snakeBodyCue } from "./bind-snake-body.js";
import { tasterCue } from "./bind-taster.js";
import { throatCue } from "./bind-throat.js";
import { vaneCue } from "./bind-vane.js";
import { wardenHandCue } from "./bind-warden-hand.js";

/**
 * **The events added to bosses that had already shipped**, cut off
 * `bind-choreographed.ts` the day SNAKE's two took that file over its
 * 250-line limit.
 *
 * The seam is not arbitrary. Everything next door is a boss arriving whole,
 * named by prefix because a boss of that page brings nine or ten events at
 * once; these are the two or three a **shipped** boss gains afterwards, and
 * they have to be named one by one because the rest of that boss's events were
 * bound in `bind.ts` years of commits earlier. One page per kind of arrival,
 * and this one grows by a handful of names per boss the briefs reach.
 *
 * Mostly those are the §6.2 hands — a gesture the owner's standing brief gave
 * a boss that did not have one (`.claude/skills/new-boss` §6.2) — which is why
 * this page was called the hands until THE THROAT's clock arrived here too:
 * four moments that were always in that boss and were always silent, added on
 * exactly the same terms and for exactly the same reason the hands are here.
 */
export type AddedEvent = Extract<
  SimEvent,
  {
    type: // THE WARDEN's second and third: `wardenDown` and the rope's three are
    // `bind.ts`'s and stay there.
      | "wardenHold"
      | "wardenThrow"
      | "wardenSlam"
      // THE VANE's two hands, which are the boss's only events at all.
      | "vanePin"
      | "vaneSlip"
      | "vaneHaul"
      // And SNAKE's two, the first a *round* has had.
      | "snakePrise"
      | "snakeLift"
      | "snakeDrop"
      // And PINBALL's two, the second round to get a hand on its picture.
      | "pinWind"
      | "pinNudge"
      | "pinTilt"
      // And THE SCOUT's two, the third round to get a hand on its picture.
      | "scoutReel"
      | "scoutSlip"
      | "scoutPrime"
      // And THE PULSE's one, on the only object the pair owns together.
      | "pulseBrace"
      | "pulseSlip"
      | "pulseArrest"
      // And THE THROAT's two, the gullet handing out a control as it loses one,
      // with the four of its own clock that shipped silent beside them.
      | `throat${string}`
      // And THE TASTER's three, one per movement of its fight — the first boss
      // to arrive here three at a time, and the reason the brief is worth
      // answering in one lane rather than three (`sim/taster-hand.ts`).
      | "tasterPin"
      | "tasterWipe"
      | "tasterPry";
  }
>;

/**
 * Every name above as a set, so the page next door asks one question instead
 * of carrying a `case` per event. Three names a boss is three lines there and
 * that file is at its limit; here they are three lines it was going to have
 * anyway. THE THROAT is a prefix rather than a list because it is the one boss
 * on this page whose events *all* arrive here, so there is nothing next door
 * for the prefix to collide with.
 */
const THROAT = "throat";

const ADDED_EVENTS = new Set<string>([
  "wardenHold",
  "wardenThrow",
  "wardenSlam",
  "vanePin",
  "vaneSlip",
  "vaneHaul",
  "snakePrise",
  "snakeLift",
  "snakeDrop",
  "pinWind",
  "pinNudge",
  "pinTilt",
  "scoutReel",
  "scoutSlip",
  "scoutPrime",
  "pulseBrace",
  "pulseSlip",
  "pulseArrest",
  "tasterPin",
  "tasterWipe",
  "tasterPry",
]);

/** Whether this is one of the names above, and not a boss arriving whole. */
export function isAddedEvent(e: { type: string }): e is AddedEvent {
  return ADDED_EVENTS.has(e.type) || e.type.startsWith(THROAT);
}

export function addedCue(e: AddedEvent, cols: number): Cue {
  switch (e.type) {
    // THE TASTER's three go back to its own page: the other twelve are bound
    // there and a second file panning this boss would be two answers to which
    // column a blade stands over (`bind-taster.ts`).
    case "tasterPin":
    case "tasterWipe":
    case "tasterPry":
      return tasterCue(e, cols);
    case "wardenHold":
    case "wardenThrow":
    case "wardenSlam":
      return wardenHandCue(e, cols);
    case "vanePin":
    case "vaneSlip":
    case "vaneHaul":
      return vaneCue(e, cols);
    case "snakePrise":
    case "snakeLift":
    case "snakeDrop":
      return snakeBodyCue(e, cols);
    case "pinWind":
    case "pinNudge":
    case "pinTilt":
      return pinballHandCue(e, cols);
    case "scoutReel":
    case "scoutSlip":
    case "scoutPrime":
      return scoutHandCue(e);
    // Named one by one although the union above is a prefix, because the
    // narrowing is what makes a throat event added tomorrow a type error here
    // rather than a silence: `throatCue` takes the prefix, so a `default` arm
    // would swallow it and the set below would still have let it through.
    case "throatCinch":
    case "throatSlip":
    case "throatHaul":
    case "throatInhale":
    case "throatChoke":
    case "throatSwallow":
    case "throatEvert":
      return throatCue(e, cols);
    default:
      return pulseHandCue(e);
  }
}
