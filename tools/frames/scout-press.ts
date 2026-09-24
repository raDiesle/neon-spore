import { type ControlId, controlPress } from "@neon-spore/content";
import type { PressSpec } from "./spec.js";

/**
 * **THE SCOUT's flying, written on the press line.**
 *
 * Both of that round's handles are gated on what the little ship is
 * **carrying** — `scoutLineGrippable` wants it past `scoutLadenMotes` and
 * `scoutPrimeGrippable` past `scoutHeavyMotes` (`sim/scout-hand.ts`) — and a
 * wave left to itself carries nothing: a probe of it stepped 1600 ticks with
 * `carrying` at 0 throughout, because the ship is flown by hand. So neither
 * ring could be photographed, and neither could the flame, the nose swinging
 * or the mouth open at home. `--hold` was no way round it: a thumb on a ring
 * that is not offered is not a ring. `--boss-json` could not reach it either
 * until 24 September 2026, when a list stopped having to keep its length
 * (`boss-check.ts`); a flight is still the way to a state the play reached.
 *
 * **The pilot's three are a thumb that goes down and comes up**, so a press
 * carries how many ticks it stays down and expands into the two commands the
 * panel itself sends:
 *
 *   --press 246:1:scoutTurnLeft=7      the nose swings left for seven ticks
 *   --press 255:1:scoutBurn=20         then twenty ticks of push
 *   --press 992:2:scoutMaw             and her mouth open at home
 *
 * That is the shape a rehearsal's acts are already written in — `{ tick: 246,
 * control: "scoutTurnLeft", until: 253 }` in `content/src/scenes/the-scout.ts`
 * — so a flight that is known to work can be transcribed rather than searched
 * for again. **A burn is a push that keeps going and a turn does nothing to
 * the drift**, so where the ship is at a tick is the sum of every burn before
 * it; change one number and every leg after it lands somewhere else.
 *
 * **One flight that works, so the next lane does not fly it again.** The first
 * arena, laden — four motes aboard, which is `scoutLadenMotes` passed and the
 * navigator's ring drawn on the ship — photographed at `--ticks 1400 --seat p2`
 * with these presses as one argument, the newlines taken out:
 *
 *   --press 300:1:scoutTurnLeft=6,307:1:scoutBurn=35,477:1:scoutTurnRight=6,
 *           484:1:scoutBurn=40,651:1:scoutTurnRight=9,661:1:scoutBurn=40,
 *           831:1:scoutTurnRight=3,835:1:scoutBurn=18,965:1:scoutTurnRight=8,
 *           974:1:scoutBurn=40,1141:1:scoutTurnRight=3,1145:1:scoutBurn=10
 *
 * It was not written by hand and could not have been: it was **recorded** off a
 * closed-loop autopilot flown in a headless world (`bun run probe`, which points
 * at the nearest mote, burns, coasts and says what it pressed). Play begins at
 * `world.tick` 300 on this wave and the lead before it takes no commands, so the
 * first press is on that tick — a flight recorded one tick early comes back with
 * the ship still sitting at its start and nothing to say why.
 *
 * **`on` and `off` are the two halves said separately**, for the one thing a
 * tick count cannot say: a thumb that is *still down* when the picture is
 * taken. A press lands at most one tick short of the end (`press-plan.ts`
 * clamps rather than refuses), so `scoutBurn=400` on a capture that stops at
 * tick 300 is not a burn held through the frame — it is one lifted on the tick
 * before it, with the flame out and nothing to say why.
 *
 *   --press 255:1:scoutBurn=on         lit, and left lit
 *
 * **The commands are asked for rather than written here.** `controlPress` is
 * where a panel's button says what it sends down and what it sends up, and it
 * is the same call `apps/game/src/keys.ts` and a rehearsal's ghost thumb make;
 * a second copy of `{ kind: "scoutTurn", on: true, dir: -1 }` in a tool is
 * exactly what `purity.test.ts`' table of rules-that-must-be-called exists to
 * stop. The name a press is written under is therefore the **control's**, not
 * the command's: `scoutTurnLeft`, the thing under the thumb, which is how
 * `mawTake`, `crank` and `orreryRing` are already spelled.
 *
 * Her `scoutMaw` is not here. It is a moment rather than a hold — one tap, and
 * the mouth stands open for `scoutMawTicks` by itself — so it is a press with
 * nothing to say about itself and goes through `press-command.ts` with the
 * rest of them. That is the seat split the round draws itself: "the pilot's
 * two are held and this one is a moment" (`sim/scout-round.ts`).
 */

/** The three the pilot holds down. Her tap is a plain press and is not one. */
const HELD: readonly ControlId[] = ["scoutTurnLeft", "scoutTurnRight", "scoutBurn"];

export function isScoutHeld(kind: string): kind is ControlId {
  return (HELD as readonly string[]).includes(kind);
}

/** A press as the control's own `down`, and — unless the thumb is left on —
 * its own `up`, however many ticks later the line asked for. */
export function scoutPresses(
  tick: number,
  player: 1 | 2,
  kind: ControlId,
  argument: string | undefined,
  one: string,
  whole: string,
): PressSpec[] {
  const { down, up } = controlPress(kind);
  if (up === undefined) {
    throw new Error(`--press ${whole}: "${one}" — ${kind} is not a control that is held down`);
  }
  const held = parseHeld(kind, argument, one, whole);
  const press = (at: number, command: typeof down): PressSpec => ({
    tick: at,
    player,
    command: { ...command },
  });
  if (held === "on") return [press(tick, down)];
  if (held === "off") return [press(tick, up)];
  return [press(tick, down), press(tick + held, up)];
}

/** How long the thumb stays down, or which half of it this press is. */
function parseHeld(
  kind: string,
  argument: string | undefined,
  one: string,
  whole: string,
): number | "on" | "off" {
  if (argument === "on" || argument === "off") return argument;
  const ticks = Number(argument);
  if (argument === undefined || !Number.isInteger(ticks) || ticks < 1) {
    throw new Error(
      `--press ${whole}: "${one}" — ${kind} is a thumb that goes down and comes up, so it takes ` +
        `the ticks it stays down, e.g. ${kind}=20 — or on and off to write the two halves ` +
        "yourself, which is the only way to leave it down in the picture",
    );
  }
  return ticks;
}
