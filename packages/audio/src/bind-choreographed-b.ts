import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { pinballHandCue } from "./bind-pinball-hand.js";
import { pulseHandCue } from "./bind-pulse-hand.js";
import { scoutHandCue } from "./bind-scout-hand.js";
import { snakeBodyCue } from "./bind-snake-body.js";
import { vaneCue } from "./bind-vane.js";
import { wardenHandCue } from "./bind-warden-hand.js";
import { wellCue } from "./bind-well.js";

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
 * Mostly those are the §6.2 hands (`.claude/skills/new-boss` §6.2). A boss
 * whose every event one cue already takes is not named here at all: THE
 * TASTER, THE LEDGER, THE LEAD, THE GAUGE and THE THROAT went to
 * `bind-prefixed.ts` on 29 September 2026, when this page stood a line under
 * its limit, and a boss that gains an event there adds one `case` to its own
 * page and nothing to this one.
 */
export type AddedEvent = Extract<
  SimEvent,
  {
    type: // THE WARDEN's second and third: `wardenDown` and the rope's three are
    // `bind.ts`'s and stay there.
      | "wardenHold"
      | "wardenThrow"
      | "wardenSlam"
      | "wardenRefuse"
      // THE VANE's two hands, which are the boss's only events at all.
      | "vanePin"
      | "vaneSlip"
      | "vaneHaul"
      | "vaneRefuse"
      // And the pin a shot knocks out, which is not a hand but is this boss's.
      | "vaneKnock"
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
      // And THE WELL's four, the first sounds that boss has had at all — it
      // arrived as a projection with no state and nothing to report. None of
      // them names a column, and that is the point rather than an omission:
      // a word for a place on this clock face would be an hour, which
      // `docs/decisions.md` #34 forbids, so the face slipping is watched and
      // the ear only says that it started, that a thumb is holding it, how
      // long that hold has left, and that the seam is home again
      // (`sim/events-well.ts`).
      | "wellRoll"
      | "wellHeld"
      | "wellWound"
      | "wellHome";
  }
>;

/**
 * Every name above as a set, so the page next door asks one question instead
 * of carrying a `case` per event. Three names a boss is three lines there and
 * that file is at its limit; here they are three lines it was going to have
 * anyway.
 */
const ADDED_EVENTS = new Set<string>([
  "wardenHold",
  "wardenThrow",
  "wardenSlam",
  "wardenRefuse",
  "vanePin",
  "vaneSlip",
  "vaneHaul",
  "vaneRefuse",
  "vaneKnock",
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
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
]);

/** Whether this is one of the names above, and not a boss arriving whole. */
export function isAddedEvent(e: { type: string }): e is AddedEvent {
  return ADDED_EVENTS.has(e.type);
}

export function addedCue(e: AddedEvent, cols: number): Cue {
  switch (e.type) {
    // THE WELL's four take no `cols`: nothing this boss reports happened in a
    // column, so there is nothing for a pan to be read off (`bind-well.ts`).
    case "wellRoll":
    case "wellHeld":
    case "wellWound":
    case "wellHome":
      return wellCue(e);
    case "wardenHold":
    case "wardenThrow":
    case "wardenSlam":
    case "wardenRefuse":
      return wardenHandCue(e, cols);
    case "vanePin":
    case "vaneSlip":
    case "vaneHaul":
    case "vaneRefuse":
    case "vaneKnock":
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
    default:
      return pulseHandCue(e);
  }
}
