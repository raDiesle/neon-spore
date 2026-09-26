import { keelBoss, keelLit, keelLoose, keelSeat, keelSegCol, NO_JOINT } from "./keel.js";
import { closeSlow } from "./slow.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * THE KEEL's one thumb: a tap on the lit joint, from the seat whose half of
 * the screen it sits over.
 *
 * **Geometry says whose tap it is, and it moves.** `keelJoint` answers the
 * seat `keelSeat` names for where the joint is right now, and the other
 * seat's tap does nothing, silently — the ordinary refusal, with no event,
 * because a pair find out whose joint it was by watching whose tap counted.
 * Nothing refuses the same seat twice: two joints in a row on one half are
 * one thumb twice, which is what makes this not THE BATON.
 *
 * A landed tap locks the segment, shuts THE SLOW on the spot (the owner's
 * rule, `slow.ts` `closeSlow`), and leaves the spine resting until the next
 * beat lights what comes after (`keel-step.ts`).
 */
export function keelHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag" || command.target !== "keelJoint" || !command.on) return;
  const s = keelBoss(world);
  if (s === null || !keelLit(s)) return;
  const cols = world.cfg.cols;
  const wants = keelSeat(s, cols);
  if (wants !== null && player !== wants) return;
  const seg = s.joint;
  s.locked[seg] = true;
  if (s.movement === 3 && s.repriseCursor < s.reprise.length) s.repriseCursor += 1;
  s.phase = "rest";
  s.phaseBeat = world.beat;
  s.joint = NO_JOINT;
  closeSlow(world);
  const col = keelSegCol(seg, s.locked.length, cols);
  world.events.push({ type: "keelLock", seg, loose: keelLoose(s), col });
}
