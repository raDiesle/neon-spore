import type { HoldSpec } from "./spec.js";

/**
 * `--hold` on the command line: the one thing this tool could not photograph.
 *
 * Four mechanics are a thumb that is down — THE LID's cord, THE WARDEN's rope,
 * THE MAZE's wheel and THE LANCE's lobe — and released they show nothing of
 * what they are. Each is named here by the `Command` it actually sends, so
 * what a capture presses is the same thing a finger presses:
 *
 *   --hold prime=red                THE LANCE: a thumb on red, lobe filling
 *   --hold prime=cyan               the same on cyan
 *   --hold wardenTether=900         THE WARDEN's rope, 0.9 of a tile out
 *   --hold wardenTether=0,y=7000    the same rope, carried straight down
 *   --hold mazeString=1400          THE MAZE's wheel, most of a turn
 *   --hold lidString=800,id=3       THE LID: which cord, and how far
 *   --hold choirLeft=-2000          THE CHOIR: the left arrow carried outward
 *   --hold balloonLeft=-1600,id=1   THE BALLOON: the pilot's hand on body 1
 *   --hold balloonRight=1600,id=1   and the navigator's on the same one
 *   --hold gum=-600,id=1            THE GUM: player 2's thumb on a stuck one
 *   --hold choke=0,id=3@1700        THE CHOKE: player 1's thumb down on the dead strip
 *   --hold choke=up,id=3@1704       and lifted — a tap is the two, and the count needs the lift
 *
 * THE CHOIR's two are the only handles here whose **sign** is the whole of the
 * gesture rather than a direction the picture happens to take: the left arrow
 * counts only when it is carried left, so a negative distance is the correct
 * one and a positive one makes the thing sing (`sim/choir-gesture.ts`).
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
 * Player 1 for every handle on this field (`maze-string.ts`), and player 2 for
 * `prime`, which is a thumb resting on one of the two colours (`sim/lance.ts`).
 * Neither is a flag: a seat argument here would be a way to send a press the
 * round would refuse.
 */
export function parseHold(value: string): HoldSpec[] {
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
    if (id !== undefined || yMilli !== undefined) {
      throw new Error("--hold prime: a thumb on a colour takes no distance and no id");
    }
    // Which lobe. It is the whole of what a hold on a colour says, and the
    // lance leaves in it (`sim/lance.ts`), so there is no sensible default and
    // an omitted one is red rather than a guess dressed up as a choice.
    const color = milliText ?? "red";
    if (color !== "red" && color !== "cyan") {
      throw new Error("--hold prime: a thumb is on red or on cyan");
    }
    return [{ player: 2, command: { kind: "prime", on: true, color } }];
  }

  // THE BALLOON's two are the first here that are **not both the pilot's**:
  // the left handle is player 1's and the right is player 2's, which is the
  // whole of that creature's coupling (`sim/balloon-pull.ts`). So a hold
  // carries the seat as well as the target, and a capture can stand a frame
  // with one hand on a body or with both.
  const SEAT: Record<string, 1 | 2> = { balloonRight: 2, gum: 2 };
  // And they take an `id` for THE LID's reason: a wave puts several on the
  // field at once on purpose.
  const NEEDS_ID = ["lidString", "balloonLeft", "balloonRight", "gum", "choke"];
  const DRAGS = [
    "mazeString",
    "wardenTether",
    "lidString",
    "choirLeft",
    "choirRight",
    "balloonLeft",
    "balloonRight",
    "gum",
    "choke",
  ];
  if (!DRAGS.includes(target)) {
    throw new Error(`--hold ${value}: unknown control. One of prime=red|cyan, ${DRAGS.join(", ")}`);
  }
  // THE CHOKE's is a tap and not a pull: the count moves on a fresh press, so
  // a capture of the count needs the thumb *up* between two of them, and `up`
  // is the one value here that sends a lift rather than a hold (`sim/choke.ts`).
  if (target === "choke" && milliText === "up") {
    if (id === undefined) throw new Error("--hold choke=up: say which one with id=N");
    return [{ player: 1, command: { kind: "drag", target, on: false, fromMilli: 0, id } }];
  }
  const fromMilli = milliText === undefined ? 1000 : Number(milliText);
  if (!Number.isFinite(fromMilli)) {
    throw new Error(`--hold ${value}: the distance is thousandths of a tile, as a number`);
  }
  if (NEEDS_ID.includes(target) && id === undefined) {
    throw new Error(
      `--hold ${target}: say which one with id=N — a wave may have three on it at once`,
    );
  }
  if (!NEEDS_ID.includes(target) && id !== undefined) {
    throw new Error(`--hold ${value}: only a handle that hangs off a body takes an id`);
  }
  const grab: HoldSpec["command"] = { kind: "drag", target, on: true, fromMilli: 0 };
  const command: HoldSpec["command"] = { kind: "drag", target, on: true, fromMilli };
  if (yMilli !== undefined) {
    grab.fromYMilli = 0;
    command.fromYMilli = yMilli;
  }
  if (id !== undefined) {
    grab.id = id;
    command.id = id;
  }
  const player = SEAT[target] ?? 1;
  return [
    { player, command: grab },
    { player, command },
  ];
}

/**
 * One `--hold` value, and **when** the thumb goes on.
 *
 * `--hold` used to mean one thing only: after the wave's own ticks, with
 * `holdTicks` of its own to show in. That is right for a picture *of* a hold
 * and wrong for every gesture that is two verbs in order — answering THE MAZE
 * is the pilot turning the wheel until a way in clicks onto a column and only
 * *then* the navigator firing at it, and with the hold pinned to the end of
 * the run a shot could only ever be fired at a wheel that had not turned.
 *
 * So a hold may name a tick with `@`, and one that does joins the same sorted
 * tick line `--press` walks (`press-plan.ts`) instead of getting a second one:
 *
 *   --hold mazeString=1400@240 --press 300:2:fire=cyan
 *
 * The bare form keeps its old meaning exactly, because it is the right one for
 * the four handles this flag was written for and every existing caller writes
 * it. The `@` is read off the end of the whole value rather than off the
 * target, so it sits after the parts a handle takes: `wardenTether=0,y=7000@60`.
 */
export function parseHoldFlag(value: string): { tick?: number; commands: HoldSpec[] } {
  const at = value.lastIndexOf("@");
  if (at === -1) return { commands: parseHold(value) };
  const tick = Number(value.slice(at + 1));
  if (!Number.isInteger(tick) || tick < 0) {
    throw new Error(`--hold ${value}: the tick after @ is a whole number of ticks, from 0`);
  }
  return { tick, commands: parseHold(value.slice(0, at)) };
}
