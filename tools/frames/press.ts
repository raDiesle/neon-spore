import { crankPresses, parseTurns } from "./crank.js";
import { commandFor } from "./press-command.js";
import { refuseWrongSeat } from "./press-seats.js";
import { isScoutHeld, scoutPresses } from "./scout-press.js";
import { isSnakeHand, snakePresses } from "./snake-press.js";
import type { PressSpec } from "./spec.js";

/**
 * `--press`: the verbs a held thumb cannot reach.
 *
 * Split off `hold.ts` when the two fleet controls took that file past its
 * 250-line limit, along the seam it already had in it: everything left there
 * is a thumb that stays **down** for the length of a capture, and everything
 * here is a press at a **tick**. They share a command line and nothing else.
 */

/**
 * `--press` on the command line: the verbs `--hold` cannot reach.
 *
 * Every press `--hold` sends is a thumb that stays *down*, and none of them is
 * a shot. So every effect that exists only because a bullet met a body — a
 * shed layer, a shell piece, a clasp opening, a torn veil, a bare core — could
 * not be photographed by the tool `CLAUDE.md` names for showing the owner
 * something, and the lane that wanted one hand-rolled a throwaway playwright
 * script instead. That is the fifth such script `tools/frames/shot.ts` counts
 * in its own header.
 *
 * A shot needs two things `--hold` has no way to say: **which seat**, because
 * the cannon is player 1's and the trigger is player 2's, and **when**,
 * because a shot has to land while the target is on the field. So a press is
 * written as `tick:player:control=value`, ticks counted from the wave's own
 * start — the same axis `--ticks` is on — and several are separated by commas:
 *
 *   --press 60:1:cannonCol=3,64:2:fire=red     put the cannon on column 3, fire red
 *   --press 40:1:guard                          the guard trigger, at tick 40
 *   --press 300:1:pulseStep=up,300:2:pulseStep=up   THE PULSE: both seats, one arrow
 *   --press 0:1:intake,30:2:fire=cyan           the maw open from the start
 *   --press 20:2:aim=left,40:2:aim=up,90:1:salvo   THE FLEET: walk, then lob
 *   --press 60:1:cannonCol=5,90:1:reach,240:2:mawTake   THE CLAW: slide, reach, swallow
 *   --press 60:2:tap=lowest,120:2:tap=lowest   THE BEATBOX: a run, a beat apart
 *   --press 90:1:reach,240:1:crank=2            THE CLAW: send the arm up, wind it home
 *   --press 246:1:scoutTurnLeft=7,255:1:scoutBurn=20   THE SCOUT: swing the nose, then push
 *   --press 600:2:snakeTurn=left,640:1:snakeMaw    SNAKE: turn, then open the mouth
 *
 * **The axis is ticks, and a tick is not a beat times `ticksPerBeat`.** It
 * reads like one — "a run, a beat apart" above is 60 and 120 — and for a wave
 * with an opening it is not: the opening holds the field while the tick counter
 * keeps moving, so a press written on what looks like a boundary lands however
 * many ticks the hold took *past* it. The first capture of a soundbox in the
 * lane that found this came back with no run on it at all. Count from the
 * capture rather than from the score: `tools/frames/opening-hold.ts` says how
 * long the opening stands, and `packages/sim/src/beat-clock.ts` says why
 * `world.beat` cannot be multiplied back.
 *
 * THE FLEET's two are here for the reason the rest are: its shell is now drawn
 * arcing over the chart, its burst and its sinking are pictures nothing else in
 * the game draws, and none of the three can be reached without a thumb. The
 * sights step one square a press and never jump, so a walk across the chart is
 * that many `aim`s — which is the control, not an awkwardness of the tool.
 *
 * The seat is written out rather than inferred, because a shot is the one
 * thing on this field that takes both of them and a reader of the command line
 * should see that. It is still *checked*: `2:cannonCol` is refused here rather
 * than sent, because the round would refuse it too and the frame would come
 * back with nothing in it and no error anywhere.
 *
 * **And the check is the wave's own panel, not a table here.** It was a table
 * here, and it had `intake` down as player 1's — true while the maw was only
 * ever the cannon lobe, and false from the day THE CLAW's panel moved it to
 * the other seat. THE SPLICE's does the same, so a picture of this tool's own
 * boss had to be taken with the press attributed to a seat that never sent it,
 * because `<t>:2:intake` was refused with a message about a round that would
 * have accepted it perfectly well (`sim/commands.ts` seat-checks nothing).
 * Which seat has a button is a fact about the **panel**; `press-seats.ts` asks
 * `CONTROLS` and `controlSetForWave` for it rather than keeping a second copy
 * that can go stale in silence.
 *
 * **A column here is a simulation column, not the one in the wave file.**
 * Waves are authored against seven columns and the field has `cfg.cols` of
 * them — eleven today — and `mapCol` is what carries one to the other. So a
 * creature written at column 3 of a wave is not at column 3 of the field, and
 * aiming `cannonCol` at the authored number puts the shot two lanes off, with
 * the bullet visibly flying up an empty column and nothing to say why. Read
 * the column off the picture, or map it; do not spell `mapCol` out by hand
 * (`purity.test.ts` keeps a list of rules that must be called rather than
 * re-derived, and that is one of them).
 */

/**
 * Every control `--press` accepts, which is the list an unknown one is
 * reported against.
 *
 * Listed rather than derived from the panels, and deliberately: a press is a
 * thing a person types, and several are named for the thing under the thumb
 * rather than for the command it sends — `mawTake` and `crank` for a button,
 * THE SCOUT's two arrows for the two
 * buttons that send one `scoutTurn` between them. A reader who has just been
 * told `mawTake` is unknown, because the wave they picked has no maw, has been
 * told the wrong thing.
 */
const PRESS_KINDS = [
  "cannonCol",
  "guard",
  "intake",
  "prime",
  "salvo",
  "aim",
  "reach",
  "mawTake",
  "shieldCol",
  "fire",
  "grip",
  "tap",
  "shake",
  "pulseStep",
  "latch",
  "launch",
  "crank",
  "snakeTurn",
  "snakeFire",
  "snakeMaw",
  "snakeJaws",
  "snakeTail",
  "scoutTurnLeft",
  "scoutTurnRight",
  "scoutBurn",
  "scoutMaw",
  "valve",
  "call",
];

export const PICKS: Record<string, "first" | "lowest"> = { first: "first", lowest: "lowest" };

export function parsePress(value: string, wave: number): PressSpec[] {
  const presses = value
    .split(",")
    .map((one) => one.trim())
    .filter(Boolean)
    .flatMap((one) => parseOnePress(one, value, wave));
  if (presses.length === 0) {
    throw new Error(`--press ${value}: nothing to press. See tools/frames/hold.ts for the shape`);
  }
  // Sorted, so a caller may write them in whatever order reads best and the
  // capture still sends them along one tick line.
  return presses.sort((a, b) => a.tick - b.tick);
}

function parseOnePress(one: string, whole: string, wave: number): PressSpec[] {
  const [tickText = "", playerText = "", rest = ""] = one.split(":");
  const tick = Number(tickText);
  if (!Number.isInteger(tick) || tick < 0) {
    throw new Error(`--press ${whole}: "${one}" — the tick is a whole number of ticks, from 0`);
  }
  if (playerText !== "1" && playerText !== "2") {
    throw new Error(`--press ${whole}: "${one}" — the seat is 1 or 2`);
  }
  const player: 1 | 2 = playerText === "1" ? 1 : 2;
  const [kind = "", argument] = rest.split("=");

  if (!PRESS_KINDS.includes(kind)) {
    throw new Error(
      `--press ${whole}: "${one}" — unknown control. One of ${PRESS_KINDS.join(", ")}`,
    );
  }
  refuseWrongSeat(kind, player, wave, one, whole);
  // The control that is a stream rather than a command, and the one place
  // this function answers with more than one press: it is turned and says a
  // *bearing*, and what a turn is worth is the mechanism's (`crank.ts`).
  if (kind === "crank") return crankPresses(tick, player, parseTurns(argument, one, whole));
  // The pilot's three on THE SCOUT, which are a thumb down and a thumb up and
  // so are two commands from one press (`scout-press.ts`). Her tap is not one
  // of them and falls through with the rest.
  if (isScoutHeld(kind)) return scoutPresses(tick, player, kind, argument, one, whole);
  // SNAKE's two hands on the body: a prise and a held tail (`snake-press.ts`).
  if (isSnakeHand(kind)) return snakePresses(tick, player, kind, argument, one, whole);
  const pick =
    (kind === "grip" || kind === "tap") && argument !== undefined ? PICKS[argument] : undefined;
  // The id is filled in by the page, so the command carries a placeholder here
  // rather than a number anybody could mistake for a choice.
  if (pick) return [{ tick, player, command: { kind, id: 0 }, pick }];
  return [{ tick, player, command: commandFor(kind, argument, one, whole) }];
}
