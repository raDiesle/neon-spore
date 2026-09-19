import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { pinballHandCue } from "./bind-pinball-hand.js";
import { pulseHandCue } from "./bind-pulse-hand.js";
import { scoutHandCue } from "./bind-scout-hand.js";
import { snakeBodyCue } from "./bind-snake-body.js";
import { throatCue } from "./bind-throat.js";
import { vaneCue } from "./bind-vane.js";
import { wardenHandCue } from "./bind-warden-hand.js";

/**
 * **The hands the §6.2 lanes added to bosses that had already shipped**, cut
 * off `bind-choreographed.ts` the day SNAKE's two took that file over its
 * 250-line limit.
 *
 * The seam is not arbitrary. Everything next door is a boss's *own* events,
 * named by prefix because a boss of that page arrives with nine or ten at
 * once; these are the two or three a **shipped** boss gains when the owner's
 * standing brief gives it another gesture (`.claude/skills/new-boss` §6.2), and
 * they have to be named one by one because the rest of that boss's events were
 * bound in `bind.ts` years of commits earlier. One page per kind of arrival,
 * and this one grows by three names per boss the brief reaches.
 */
export type HandEvent = Extract<
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
      // And THE THROAT's two, the gullet handing out a control as it loses one.
      | "throatCinch"
      | "throatSlip"
      | "throatHaul";
  }
>;

/**
 * Every name above as a set, so the page next door asks one question instead
 * of carrying a `case` per event. Three names a boss is three lines there and
 * that file is at its limit; here they are three lines it was going to have
 * anyway.
 */
const HAND_EVENTS = new Set<string>([
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
  "throatCinch",
  "throatSlip",
  "throatHaul",
]);

/** Whether this is one of the hands above, and not a boss's own event. */
export function isHandEvent(e: { type: string }): e is HandEvent {
  return HAND_EVENTS.has(e.type);
}

export function handCue(e: HandEvent, cols: number): Cue {
  switch (e.type) {
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
    case "throatCinch":
    case "throatSlip":
    case "throatHaul":
      return throatCue(e, cols);
    default:
      return pulseHandCue(e);
  }
}
