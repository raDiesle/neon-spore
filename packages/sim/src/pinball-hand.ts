import type { PinballState } from "./pinball.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **PINBALL's two hands on the table itself**: player 1 winding a spring his
 * own last shot left slack, and player 2 nudging a ball she can do nothing
 * else about (`docs/spec/interludes.md`, PINBALL's *Three shots, three
 * hands*).
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
 * **The nudge is player 2's**, and it is the one thing she has during a
 * flight. The round's own header says it: nothing either of them presses
 * reaches a ball in the air, and the strip is the only control that answers
 * while it falls — which leaves her watching. One nudge a flight shoves the
 * ball `pinballNudgeShoveMilli` the way she carried the table, and a second
 * **tilts** it: her hand is dead for the rest of that flight. That is the
 * arcade's own rule, and it is the reason the nudge is worth having a
 * conversation about — *not yet* is a sentence the pair now has to say.
 *
 * Nothing here can hurt them. A wind too short, a nudge on a shot that is not
 * in flight, a second nudge — each does nothing, and a tilt costs a hand and
 * never the hull (`pinball-round.ts` is where the hull is broken).
 */

/**
 * Whether the spring is offering player 1 a wind, and whether the table is
 * offering player 2 a shove.
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
 * (`pinball-controls.ts`).
 */
export function pinWindable(state: PinballState): boolean {
  return state.slack && state.shot === "power";
}

/** And the shove: a ball actually in the air, on a table not already tilted. */
export function pinNudgeable(state: PinballState): boolean {
  return state.shot === "flight" && !state.tilted;
}

export function pinballDragHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (command.target === "pinPlunger") {
    windHeard(world, state, player, command);
    return;
  }
  if (command.target === "pinTable") nudgeHeard(world, state, player, command);
}

function windHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 1 || !pinWindable(state)) return;
  // The press says nothing; the wind is the lift, and only one that travelled.
  if (command.on) return;
  if (Math.abs(command.fromYMilli ?? 0) < world.cfg.pinballWindMilli) return;
  state.slack = false;
  world.events.push({ type: "pinWind" });
}

function nudgeHeard(
  world: World,
  state: PinballState,
  player: 1 | 2,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (player !== 2 || !pinNudgeable(state)) return;
  if (command.on) return;
  const carried = command.fromMilli;
  if (Math.abs(carried) < world.cfg.pinballNudgeMilli) return;
  if (state.nudges >= world.cfg.pinballNudges) {
    // The one over the line is the tilt, and it is charged rather than
    // ignored: a nudge that did nothing would be a nudge she went on making.
    state.tilted = true;
    world.events.push({ type: "pinTilt" });
    return;
  }
  state.nudges += 1;
  const way = Math.sign(carried);
  state.ball.vxMilli += way * world.cfg.pinballNudgeShoveMilli;
  world.events.push({ type: "pinNudge", way });
}
