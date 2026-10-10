import type { PinballState } from "./pinball.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **PINBALL's two hands on the table itself**: player 1 winding a spring his
 * own last shot left slack, and either of them nudging a ball in the air
 * (`docs/spec/interludes.md`, PINBALL's *Three shots, three hands*).
 *
 * Both are entered by the pair's **own last answer**, which is the shape THE
 * GAUGE's two states took for the same brief: the round is never in a state
 * the two of them did not just put it in.
 *
 * **The wind is player 1's**, and it is the price of the shot they just took.
 * A launch above `pinballHardMilli` is the one that reaches the far corner of
 * the board, and it leaves the spring slack — the power bar does not run at
 * all on the next shot, so player 2 has nothing to launch on until he has
 * carried the plunger back (`pinballWindMilli`). It costs the seat that owns
 * *where from* a gesture, on the shot after the one it bought, which is the
 * only kind of cost this round can charge without touching the hull.
 *
 * **The nudge is either seat's**, from one count the two of them share. A
 * press of ◀ or ▶ carries the ball `pinballNudgeShoveMilli` that way, and the
 * one after `pinballNudges` **tilts** the table: it is dead to both hands for
 * the rest of that flight. It was player 2's alone, one a flight, until the
 * owner asked on 1 October 2026 that *any player can bump the ball to lead the
 * direction a little while flying*; and it was a thumb carried across the
 * table until he asked on 10 October 2026 for a press on both sides of both
 * panels, there all the time and lit while it answers. Shared rather than
 * one count each, because two counts are two players shoving without a word
 * between them; one count is a thing they have to spend together, and *not
 * yet — mine* is a sentence the pair now has to say.
 *
 * Nothing here can hurt them. A wind too short, a nudge on a shot that is not
 * in flight, a second nudge — each does nothing, and a tilt costs a hand and
 * never the hull (`pinball-round.ts` is where the hull is broken).
 */

/**
 * Whether the spring is offering player 1 a wind, and whether the table is
 * offering either of them a shove.
 *
 * **Two predicates rather than two conditions inside the two functions below**,
 * because the picture has to ask exactly the same questions: a ring drawn on a
 * gate that was written out a second time in `render/pinball-grip.ts` is a
 * handle that keeps working after somebody changes one of the two copies. Both
 * are called from `windHeard`/`nudgeHeard` themselves, so there is one reading
 * and the drawing and the rule cannot drift.
 *
 * Neither says anything about the seat: whose hand it is belongs with the
 * command, next to every other seat check in this round
 * (`pinball-controls.ts`). The shove's is asked by the four ◀ ▶ buttons, which
 * are lit exactly while it answers (`render/pinball-button.ts`).
 */
export function pinWindable(state: PinballState): boolean {
  return state.slack && state.shot === "power";
}

/** And the shove: a ball actually in the air, on a table not already tilted. */
export function pinNudgeable(state: PinballState): boolean {
  return state.shot === "flight" && !state.tilted;
}

/**
 * Whether each part asks for a hand this tick: the round in its play, and the
 * part offering (`render/pinball-marks.ts` haloes the plunger when asked).
 * `pinWindable` is true through a verdict reached on a slack spring, so the
 * play is asked here too.
 */
export function pinPlungerAsks(state: PinballState): boolean {
  return state.phase === "play" && pinWindable(state);
}

export function pinTableAsks(state: PinballState): boolean {
  return state.phase === "play" && pinNudgeable(state);
}

export function pinballDragHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (command.target === "pinPlunger") windHeard(world, state, player, command);
}

function windHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 1) {
    if (command.on && pinPlungerAsks(state)) refuse(world, "plunger", player);
    return;
  }
  if (!pinWindable(state)) return;
  // The press says nothing; the wind is the lift, and only one that travelled.
  if (command.on) return;
  if (Math.abs(command.fromYMilli ?? 0) < world.cfg.pinballWindMilli) return;
  state.slack = false;
  world.events.push({ type: "pinWind" });
}

/**
 * A ◀ or ▶ press, from either seat: whose thumb it was is not asked, because
 * the table is both of theirs. A press outside a flight says nothing — the
 * buttons are dark then, and a dark button that answered would be lying.
 */
export function pinballNudgeHeard(world: World, state: PinballState, way: -1 | 1): void {
  if (!pinNudgeable(state)) return;
  if (state.nudges >= world.cfg.pinballNudges) {
    // The one over the line is the tilt, and it is charged rather than
    // ignored: a nudge that did nothing would be a nudge they went on making.
    state.tilted = true;
    world.events.push({ type: "pinTilt" });
    return;
  }
  state.nudges += 1;
  state.ball.vxMilli += way * world.cfg.pinballNudgeShoveMilli;
  world.events.push({ type: "pinNudge", way });
}

/**
 * A press from the seat the part is not asked of, said once — the press and
 * never its lift. The plunger's ring is drawn on both screens
 * (`render/pinball-grip.ts`), so a thumb can land on it from the wrong seat,
 * and every mark's *not yours* is said.
 */
function refuse(world: World, part: "plunger", player: 1 | 2): void {
  world.events.push({ type: "pinRefuse", part, player });
}
