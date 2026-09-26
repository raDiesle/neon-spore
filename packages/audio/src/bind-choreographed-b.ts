import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { gaugeCue } from "./bind-gauge.js";
import { leadCue } from "./bind-lead.js";
import { ledgerCue } from "./bind-ledger.js";
import { pinballHandCue } from "./bind-pinball-hand.js";
import { pulseHandCue } from "./bind-pulse-hand.js";
import { scoutHandCue } from "./bind-scout-hand.js";
import { snakeBodyCue } from "./bind-snake-body.js";
import { tasterCue } from "./bind-taster.js";
import { throatCue } from "./bind-throat.js";
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
      // And THE THROAT's two, the gullet handing out a control as it loses one,
      // with the four of its own clock that shipped silent beside them.
      | `throat${string}`
      // And THE TASTER's three, one per movement of its fight — the first boss
      // to arrive here three at a time, and the reason the brief is worth
      // answering in one lane rather than three (`sim/taster-hand.ts`).
      | "tasterPin"
      | "tasterWipe"
      | "tasterPry"
      // And THE LEDGER's five, which are four hands: the foot, the plug, the
      // bill the plug rolls over, the return hauled down and the cord hauled
      // out (`sim/ledger-hand.ts`). The first boss to arrive here with a
      // gesture in every movement of its fight.
      | "ledgerFoot"
      | "ledgerPlug"
      | "ledgerRoll"
      | "ledgerPull"
      | "ledgerHaul"
      // And THE LEAD's three, which are one hand held down: taken, let go of,
      // and torn out of the thumb that was holding it (`sim/lead-hand.ts`).
      // The first boss to arrive here with a gesture that is a *length of
      // time* rather than a moment, which is why all three are needed to say
      // what one thumb did.
      | "leadGrip"
      | "leadRelease"
      | "leadTear"
      // And THE GAUGE's four, the first sounds this round has had at all: a
      // call's two answers, and what each can cost the seat not making it
      // (`sim/events-gauge.ts`).
      | "gaugeMark"
      | "gaugeMiss"
      | "gaugeJam"
      | "gaugeBind"
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
  "tasterPin",
  "tasterWipe",
  "tasterPry",
  "ledgerFoot",
  "ledgerPlug",
  "ledgerRoll",
  "ledgerPull",
  "ledgerHaul",
  "leadGrip",
  "leadRelease",
  "leadTear",
  "gaugeMark",
  "gaugeMiss",
  "gaugeJam",
  "gaugeBind",
  "wellRoll",
  "wellHeld",
  "wellWound",
  "wellHome",
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
    // And THE LEDGER's five, for that reason said about a socket: the eleven
    // next door are all panned to the column they happened in, and a second
    // file answering *where* for this boss would be the one fight in the game
    // whose ear could disagree with itself (`bind-ledger.ts`).
    case "ledgerFoot":
    case "ledgerPlug":
    case "ledgerRoll":
    case "ledgerPull":
    case "ledgerHaul":
      return ledgerCue(e, cols);
    // And THE LEAD's three, for the reason said twice above: the fourteen next
    // door are panned to the column the body was in when it happened, and this
    // is the one fight where a second file answering *where* would be an ear
    // disagreeing with the bet the pair just made (`bind-lead.ts`).
    case "leadGrip":
    case "leadRelease":
    case "leadTear":
      return leadCue(e, cols);
    case "gaugeMark":
    case "gaugeMiss":
    case "gaugeJam":
    case "gaugeBind":
      return gaugeCue(e);
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
      return wardenHandCue(e, cols);
    case "vanePin":
    case "vaneSlip":
    case "vaneHaul":
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
