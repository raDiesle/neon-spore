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
 *   --press 0:1:intake,30:2:fire=cyan           the maw open from the start
 *   --press 20:2:aim=left,40:2:aim=up,90:1:salvo   THE FLEET: walk, then lob
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

/** Which seat each control belongs to. `grip` is the one either may send. */
const SEAT_OF: Record<string, 1 | 2 | "either"> = {
  cannonCol: 1,
  guard: 1,
  intake: 1,
  prime: 1,
  // THE FLEET's pair, and the seat check on them is the fight itself: the
  // pilot holds the only trigger and the navigator the only sights, and the
  // round refuses either one from the other chair (`sim/fleet.ts`).
  salvo: 1,
  aim: 2,
  shieldCol: 2,
  fire: 2,
  grip: "either",
};

/** Which way an `aim` steps, as the four words a person would say. */
const AIM_STEPS: Record<string, { dcol: -1 | 0 | 1; drow: -1 | 0 | 1 }> = {
  left: { dcol: -1, drow: 0 },
  right: { dcol: 1, drow: 0 },
  up: { dcol: 0, drow: -1 },
  down: { dcol: 0, drow: 1 },
};

export function parsePress(value: string): PressSpec[] {
  const presses = value
    .split(",")
    .map((one) => one.trim())
    .filter(Boolean)
    .map((one) => parseOnePress(one, value));
  if (presses.length === 0) {
    throw new Error(`--press ${value}: nothing to press. See tools/frames/hold.ts for the shape`);
  }
  // Sorted, so a caller may write them in whatever order reads best and the
  // capture still sends them along one tick line.
  return presses.sort((a, b) => a.tick - b.tick);
}

function parseOnePress(one: string, whole: string): PressSpec {
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

  const seat = SEAT_OF[kind];
  if (seat === undefined) {
    throw new Error(
      `--press ${whole}: "${one}" — unknown control. One of ${Object.keys(SEAT_OF).join(", ")}`,
    );
  }
  if (seat !== "either" && seat !== player) {
    throw new Error(
      `--press ${whole}: "${one}" — ${kind} is player ${seat}'s, and a press from the other seat ` +
        "is one the round refuses, so the frame would come back empty with nothing said",
    );
  }
  return { tick, player, command: commandFor(kind, argument, one, whole) };
}

function commandFor(
  kind: string,
  argument: string | undefined,
  one: string,
  whole: string,
): { kind: string } & Record<string, unknown> {
  const needs = (): string => {
    if (argument === undefined) {
      throw new Error(`--press ${whole}: "${one}" — ${kind} takes a value, as ${kind}=…`);
    }
    return argument;
  };
  const column = (): number => {
    const col = Number(needs());
    if (!Number.isInteger(col) || col < 0) {
      throw new Error(`--press ${whole}: "${one}" — a column is a whole number, from 0`);
    }
    return col;
  };

  switch (kind) {
    case "cannonCol":
      return { kind, col: column() };
    case "shieldCol":
      return { kind, col: column() };
    case "fire": {
      const color = needs();
      if (color !== "red" && color !== "cyan") {
        throw new Error(`--press ${whole}: "${one}" — a shot is red or cyan`);
      }
      return { kind, color };
    }
    case "grip": {
      const id = Number(needs());
      if (!Number.isInteger(id)) {
        throw new Error(`--press ${whole}: "${one}" — grip takes the creature's id`);
      }
      return { kind, id };
    }
    case "prime":
      return { kind, on: true };
    case "aim": {
      const step = AIM_STEPS[needs()];
      if (!step) {
        throw new Error(
          `--press ${whole}: "${one}" — the sights step ${Object.keys(AIM_STEPS).join(", ")}`,
        );
      }
      return { kind, ...step };
    }
    default: {
      // `guard`, `intake` and `salvo`: a press with nothing to say about itself.
      if (argument !== undefined) {
        throw new Error(`--press ${whole}: "${one}" — ${kind} takes no value`);
      }
      return { kind };
    }
  }
}
