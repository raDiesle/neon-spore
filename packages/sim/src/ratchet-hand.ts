import { midCol } from "./config.js";
import {
  NO_CATCH,
  type RatchetState,
  ratchetBoss,
  ratchetHeld,
  ratchetWorking,
} from "./ratchet.js";
import { advanceRatchet } from "./ratchet-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * **The two hands on THE RATCHET**, off the wire, on the tick — and the gate
 * between them, which is the whole boss.
 *
 * `ratchetCatch` is the navigator's and `ratchetPawl` the pilot's, always, so
 * the seat is checked against the target's own name here (`hasp-hand.ts`'
 * rule). The wrong seat's message does nothing, silently.
 *
 * **The gate is one line** (§22, *Cost*): when his press lands, `ratchetHeld`
 * is asked of her hand on the same tick, and the answer is whether the tooth
 * is clean. `SequentialAction` is not needed: a press is never refused, only
 * judged, so there is no step to hold closed.
 */

export function ratchetHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = ratchetBoss(world);
  if (s === null) return;
  if (command.target === "ratchetCatch") {
    if (player === 2) catchHeard(world, s, command);
    return;
  }
  if (command.target === "ratchetPawl" && player === 1) pawlHeard(world, s, command);
}

/**
 * The navigator's hand on the catch, read by depth and judged as a **level**,
 * HASP's latch again. The one addition is the spent catch: after a clean
 * advance her hand holds nothing until it has come back up past the grip, so
 * `SET` is said once per tooth and meant each time.
 */
function catchHeard(
  world: World,
  s: RatchetState,
  command: Extract<Command, { kind: "drag" }>,
): void {
  const cfg = world.cfg;
  const mid = midCol(cfg);
  if (!command.on) {
    const was = ratchetHeld(s, cfg);
    s.catchMilli = NO_CATCH;
    s.catchSpent = false;
    if (was) world.events.push({ type: "ratchetLet", col: mid });
    return;
  }
  if (s.phase === "open" || s.phase === "jam") return;
  const depth = Math.max(0, Math.min(cfg.ratchetReachMilli, Math.round(command.fromYMilli ?? 0)));
  if (s.catchSpent) {
    if (depth >= cfg.ratchetGripMilli) return;
    s.catchSpent = false;
  }
  const was = ratchetHeld(s, cfg);
  s.catchMilli = depth;
  const now = ratchetHeld(s, cfg);
  if (now === was) return;
  world.events.push({ type: now ? "ratchetSet" : "ratchetLet", col: mid });
}

/**
 * The pilot's thumb on the pawl, read as a **press**: an edge, the tick it
 * goes down, so a thumb left on the glass is one press and not a tooth a
 * sample. Outside a lit window it does nothing — the rack only spends a
 * tooth while one is waiting.
 */
function pawlHeard(
  world: World,
  s: RatchetState,
  command: Extract<Command, { kind: "drag" }>,
): void {
  if (!command.on) {
    s.pawlDown = false;
    return;
  }
  if (s.pawlDown) return;
  s.pawlDown = true;
  if (!ratchetWorking(s)) return;
  advanceRatchet(world, s, ratchetHeld(s, world.cfg), false);
}
