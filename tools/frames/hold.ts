import type { PressSpec } from "./spec.js";

/**
 * `--hold` on the command line: the one thing this tool could not photograph.
 *
 * Four mechanics are a thumb that is down — THE LID's cord, THE WARDEN's rope,
 * THE MAZE's wheel and THE LANCE's lobe — and released they show nothing of
 * what they are. Each is named here by the `Command` it actually sends, so
 * what a capture presses is the same thing a finger presses:
 *
 *   --hold prime                    THE LANCE, thumb down, lobe filling
 *   --hold wardenTether=900         THE WARDEN's rope, 0.9 of a tile out
 *   --hold wardenTether=0,y=7000    the same rope, carried straight down
 *   --hold mazeString=1400          THE MAZE's wheel, most of a turn
 *   --hold lidString=800,id=3       THE LID: which cord, and how far
 *
 * The distance is in **thousandths of a tile**, which is what a `drag` carries
 * on the wire — two phones of different widths share no pixel and do share a
 * tile. Omitted it is one whole tile, which is a hand that has plainly pulled.
 * `id` names which body a cord hangs off, and only `lidString` has one: a wave
 * may send three lids down at once, where a boss's rope is the only one of its
 * kind on the field.
 *
 * **`y` is the other half of the pull, and the warden's rope needs it.** The
 * field is eleven columns wide and a boss stands in the middle of it, so a
 * sideways pull is cut short by the edge long before it is taut
 * (`clampPull` keeps a handle on the field); down, there is always room. It is
 * the direction `frame-budget.test.ts` holds that rope in for the same reason.
 *
 * **A drag is two commands, not one.** The first `drag` a handle hears is the
 * *grab* — it takes the origin the distance will be measured from and moves
 * nothing (`sim/warden-rope.ts`) — so one command carrying a distance opened
 * the warden's hatch by exactly nothing, and every warden capture ever taken
 * with this flag was a picture of a shut eye with a number beside it saying
 * otherwise. So a grab at zero goes in first and the pull follows it. THE LID
 * reads its distance straight off the wire and does not need the grab, and a
 * leading zero costs it nothing.
 *
 * Player 1 always, and not a flag: every handle on this field is the pilot's
 * (`maze-string.ts`), and `prime` is the pilot's too. A seat argument here
 * would be a way to send a press the round would refuse.
 */
export function parseHold(value: string): { player: 1 | 2; command: Record<string, unknown> }[] {
  const parts = value.split(",");
  const [name = "", ...rest] = parts;
  const [target = "", milliText] = name.split("=");

  let id: number | undefined;
  let yMilli: number | undefined;
  for (const extra of rest) {
    const [key, raw] = extra.split("=");
    if (key === "y") {
      yMilli = Number(raw);
      if (!Number.isFinite(yMilli)) {
        throw new Error(`--hold ${value}: y is thousandths of a tile, as a number`);
      }
      continue;
    }
    if (key !== "id") throw new Error(`--hold ${value}: unknown part "${extra}" — only id=N, y=N`);
    id = Number(raw);
    if (!Number.isInteger(id)) throw new Error(`--hold ${value}: id must be a whole number`);
  }

  if (target === "prime") {
    if (milliText !== undefined || id !== undefined || yMilli !== undefined) {
      throw new Error("--hold prime: a thumb on the lance takes no distance and no id");
    }
    return [{ player: 1, command: { kind: "prime", on: true } }];
  }

  const DRAGS = ["mazeString", "wardenTether", "lidString"];
  if (!DRAGS.includes(target)) {
    throw new Error(`--hold ${value}: unknown control. One of prime, ${DRAGS.join(", ")}`);
  }
  const fromMilli = milliText === undefined ? 1000 : Number(milliText);
  if (!Number.isFinite(fromMilli)) {
    throw new Error(`--hold ${value}: the distance is thousandths of a tile, as a number`);
  }
  if (target === "lidString" && id === undefined) {
    throw new Error(
      "--hold lidString: say which cord with id=N — a wave may have three lids on it at once",
    );
  }
  if (target !== "lidString" && id !== undefined) {
    throw new Error(`--hold ${value}: only lidString takes an id; there is one of every other`);
  }
  const grab: Record<string, unknown> = { kind: "drag", target, on: true, fromMilli: 0 };
  const command: Record<string, unknown> = { kind: "drag", target, on: true, fromMilli };
  if (yMilli !== undefined) {
    grab.fromYMilli = 0;
    command.fromYMilli = yMilli;
  }
  if (id !== undefined) {
    grab.id = id;
    command.id = id;
  }
  return [
    { player: 1, command: grab },
    { player: 1, command },
  ];
}

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
  shieldCol: 2,
  fire: 2,
  grip: "either",
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
    default: {
      // `guard` and `intake`: a press with nothing to say about itself.
      if (argument !== undefined) {
        throw new Error(`--press ${whole}: "${one}" — ${kind} takes no value`);
      }
      return { kind };
    }
  }
}
