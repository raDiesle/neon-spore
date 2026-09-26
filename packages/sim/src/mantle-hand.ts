import { midCol } from "./config.js";
import {
  type MantleState,
  mantleBoss,
  mantleBracing,
  mantleFinale,
  mantlePulling,
} from "./mantle.js";
import { glowMantle } from "./mantle-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Three thumbs on THE MANTLE: the two pull handles, and the bared core's
 * alternating tap.
 *
 * **Geometry says whose handle is whose.** `mantleLeft` only ever answers
 * Player 1 and `mantleRight` only ever Player 2 — the wrong seat's thumb does
 * nothing, silently, the same rule THE GIMBAL's two rings and THE INSTAR's
 * marks already use. Depth is read straight off `fromYMilli`, the way THE
 * INSTAR's `pullDown` mark is (`instar-hand.ts`): there is no reference to
 * subtract, because a handle here does not push back — it simply is not
 * sheared yet.
 *
 * **Letting go costs the whole pull, at once.** A handle's depth is nought
 * the instant its thumb lifts; there is no drift to bank progress against,
 * on purpose, since the two-hand rule this boss exists to test only means
 * something if a released handle cannot be quietly walked back up alone.
 *
 * **A thumb on a handle is kept in every phase**, pulling or not, so the
 * brace before the last pair (§23 row 7) is `CHORD` read off the same two
 * drags: both thumbs down counts, and either lifting mid-brace slips it —
 * the shudder worsens and the hold starts over from the glow.
 *
 * **The core's tap is either seat's, and alternates.** Once the shell is
 * split, `mantleCore` answers a tap from whichever seat `heartbeatNext`
 * names; the other seat's tap does nothing, the ordinary silent refusal —
 * there is no event for it, since a wrong-seat tap on this boss costs
 * nothing and teaches itself by being ignored.
 */

export function mantleHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = mantleBoss(world);
  if (s === null) return;
  if (command.target === "mantleLeft" || command.target === "mantleRight") {
    pull(world, s, player, command);
    return;
  }
  if (command.target === "mantleCore") tap(world, s, player, command);
}

function pull(world: World, s: MantleState, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const side: 0 | 1 = command.target === "mantleLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const lifted = s.held[side] && !command.on;
  s.held[side] = command.on;
  if (mantleBracing(s) && lifted) glowMantle(world, s, "mantleSlip");
  if (!mantlePulling(s)) return;
  s.depthMilli[side] = command.on ? Math.max(0, command.fromYMilli ?? 0) : 0;
}

function tap(world: World, s: MantleState, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || !command.on) return;
  if (!mantleFinale(s)) return;
  const wants: 1 | 2 = s.heartbeatNext === 0 ? 1 : 2;
  if (player !== wants) return;
  s.heartbeatNext = s.heartbeatNext === 0 ? 1 : 0;
  s.heartbeatDone += 1;
  const left = Math.max(0, world.cfg.mantleHeartbeatTaps - s.heartbeatDone);
  if (left === 0) {
    s.phase = "dark";
    s.phaseBeat = world.beat;
    world.events.push({ type: "mantleDark", col: midCol(world.cfg) });
    return;
  }
  world.events.push({ type: "mantleBeat", left, col: midCol(world.cfg) });
}
