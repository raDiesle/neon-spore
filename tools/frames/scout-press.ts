import { type ControlId, controlPress } from "@neon-spore/content";
import type { PressSpec } from "./spec.js";

/**
 * **THE SCOUT's flying, written on the press line.**
 *
 * The ship is flown by hand, so a wave left to itself never leaves the
 * cannon: the flame, the nose stepped round, a mote aboard and the mouth
 * drawing the ship home are all states only a flight reaches. `--hold` is no
 * way round it — a thumb on a ring that is not offered is not a ring — and
 * `--boss-json` writes a state rather than flying to it. (The two rings
 * themselves, `scoutLineGrippable` and `scoutPrimeGrippable`, want more
 * aboard than `scoutCarryMax` lets a ship hold, so THE SCOUT never reaches
 * them; THE HAUL's holds do, `scout-haul-arenas.ts`.)
 *
 * **The pilot's three are a thumb that goes down and comes up**, so a press
 * carries how many ticks it stays down and expands into the two commands the
 * panel itself sends:
 *
 *   --press 246:1:scoutTurnLeft=7      the nose steps 45° left
 *   --press 255:1:scoutBurn=20         then twenty ticks of push
 *   --press 992:2:scoutMaw             and her mouth open at home
 *
 * That is the shape a rehearsal's acts are already written in — `{ tick: 246,
 * control: "scoutTurnLeft", until: 253 }` in `content/src/scenes/the-scout.ts`
 * — so a flight that is known to work can be transcribed rather than searched
 * for again. **A turn is a step, not a swing**: the press turns the nose 45° at
 * once and a thumb left down steps it again every `scoutTurnRepeatTicks`, so
 * `=7` is one step and the `=90` below is four — half a turn, the way home.
 * **A burn adds to the travel and drag takes it away**, so where the ship is
 * at a tick is the sum of every burn before it; change one number and every
 * leg after it lands somewhere else.
 *
 * **One flight that works, so the next lane does not fly it again.** The first
 * arena's one mote fetched and banked: out, four steps round at the top, home,
 * and the mouth opened as the ship comes inside `scoutSuckRadiusMilli` — banked
 * on tick 616, and the second arena stood up on 617. As one argument, the
 * newlines taken out, photographed at `--ticks 330 --seat p2` with the presses
 * after it left off (the ship at the top, the mote aboard, turned for home) and
 * at `--ticks 608 --seat p1` whole (in the mouth):
 *
 *   --press 19:1:scoutBurn=24,90:1:scoutBurn=17,153:1:scoutBurn=17,
 *           216:1:scoutBurn=17,238:1:scoutTurnRight=90,328:1:scoutBurn=25,
 *           399:1:scoutBurn=17,462:1:scoutBurn=17,525:1:scoutBurn=17,
 *           571:2:scoutMaw
 *
 * It was not written by hand and could not have been: it was **recorded** off a
 * closed-loop autopilot flown in a headless world (`bun run probe`, the one in
 * `content/test/scout-flight.test.ts` with a look ahead at the hazards and a
 * coast band on the burn, saying what it pressed). **A headless `startWave` and
 * the browser do not start on the same tick**: headless play begins on tick 1,
 * and `bun run frames` jumps to this wave with `world.tick` already at 18, so
 * play begins on 19 and the recording was moved on by eighteen. A line left on
 * the headless axis comes back with its first burn unheard and the ship still
 * sitting at its start — the run's `unheard:` line says so.
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
 * `mawTake` and `crank` are already spelled.
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
