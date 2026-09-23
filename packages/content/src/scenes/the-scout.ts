import type { GuideScene } from "../scene-types.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";

/**
 * THE SCOUT's rehearsal: one of them flies blind and the other reads the map.
 *
 * The field is gone. Player 1's screen has the nose and the burn and nothing
 * else; player 2's has the arena — the motes hanging still, the hazard sweeping
 * its row — and the maw. The film is the first arena flown whole, four motes
 * in a loop and the run home, then the second arena opening and its first trip:
 * three motes up the column, a turn, and home again with the maw open.
 *
 * **The flight was generated, not reasoned about.** A burn is a push that keeps
 * going, and a turn does nothing to the drift, so where the little one is at
 * a tick is the sum of every burn before it. The acts below came out of a
 * search that re-ran the film after every leg — a delay, a turn, a burn of so
 * many ticks — and kept the first leg that reached its mote and did not drift
 * into a hazard afterwards. Change one number and every leg after it lands
 * somewhere else; regenerate rather than edit.
 *
 * **The maw is tapped when the hull is touched, not before.** A mote comes off
 * only while the maw is open at home, and the maw opens for a moment after the
 * tap, so a tap on the way in is a tap wasted; the film taps it at the tick the
 * home radius is reached and the mote comes off on the next beat.
 *
 * Player 1 has three controls and cannot see where any of it is; player 2 has
 * one and cannot fly. The captions say which seat does what and never where the
 * motes are — that is the sentence the pair has to say to each other.
 *
 * **Seven pages still, and the maw's changed on 18 September 2026.** The field
 * now says `OPEN` on the mouth at the moment the little ship reaches it, so the
 * page that named her verb carries the rule underneath it instead
 * (`docs/spec/briefings.md`).
 */
export const THE_SCOUT: GuideScene = {
  ticks: 1700,
  bpm: 120,
  seed: 1,
  entries: [],
  boss: { kind: "scout", arenas: SCOUT_ARENAS },
  acts: [
    // Arena one: near-left, far-left, far-right, near-right, home.
    { tick: 246, control: "scoutTurnLeft", until: 253 },
    { tick: 255, control: "scoutBurn", until: 275 },
    { tick: 373, control: "scoutTurnRight", until: 380 },
    { tick: 382, control: "scoutBurn", until: 418 },
    { tick: 581, control: "scoutTurnRight", until: 591 },
    { tick: 593, control: "scoutBurn", until: 629 },
    { tick: 751, control: "scoutTurnRight", until: 761 },
    { tick: 763, control: "scoutBurn", until: 795 },
    { tick: 869, control: "scoutTurnRight", until: 873 },
    { tick: 875, control: "scoutBurn", until: 907 },
    { tick: 992, control: "scoutMaw" },
    // Arena two: three short burns up the column, about, and home.
    { tick: 998, control: "scoutBurn", until: 1006 },
    { tick: 1036, control: "scoutBurn", until: 1048 },
    { tick: 1205, control: "scoutBurn", until: 1224 },
    { tick: 1340, control: "scoutTurnRight", until: 1360 },
    { tick: 1362, control: "scoutBurn", until: 1405 },
    { tick: 1578, control: "scoutMaw" },
  ],
  steps: [
    { tick: 0, seat: 2, text: "THE SHIP OPENS. ONE GOES OUT", anchor: { at: "boss" } },
    {
      tick: 240,
      seat: 1,
      text: "PLAYER 1 SWINGS THE NOSE",
      anchor: { at: "control", control: "scoutTurnLeft" },
    },
    {
      tick: 580,
      seat: 1,
      text: "BURN, LET GO. IT KEEPS GOING",
      anchor: { at: "control", control: "scoutBurn" },
    },
    {
      tick: 760,
      seat: 2,
      text: "PLAYER 2 SEES WHAT CROSSES",
      anchor: { at: "boss", part: "hazard" },
    },
    // AT HOME, PLAYER 2 OPENS MAW stood here and is the cue's now: the field
    // writes `PRESS` / `OPEN` on the mother ship's mouth, on her screen alone,
    // for as long as the little ship stands on it with the mouth shut
    // (`decisions.md` #34, `render/boss-cue-read-h.ts`). The page could not
    // simply come out — the tap at 992 is the first arena's last act — so it
    // carries the rule underneath her thumb that no picture on either screen
    // states: flying over a mote is not having it.
    {
      tick: 960,
      seat: 2,
      text: "ONLY THE MAW TAKES A MOTE",
      anchor: { at: "control", control: "scoutMaw" },
    },
    {
      tick: 1140,
      seat: 2,
      text: "A SECOND ARENA. TWO CROSS",
      anchor: { at: "boss", part: "hazard" },
    },
    {
      tick: 1340,
      seat: 1,
      text: "TURN ABOUT, BURN FOR HOME",
      anchor: { at: "control", control: "scoutTurnRight" },
    },
  ],
};
