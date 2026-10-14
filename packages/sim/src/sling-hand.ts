import { midCol } from "./config.js";
import { type Pull, pullHeard } from "./pull.js";
import { type SlingState, slingAsks, slingBoss, slingLitStep } from "./sling.js";
import { slingStirred } from "./sling-cool.js";
import { slingLoosed } from "./sling-step.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/**
 * Two draws on THE SLING, one arm each.
 *
 * **Geometry says whose arm is whose**, THE MANTLE's rule
 * (`mantle-hand.ts`): `slingDrawLeft` answers only Player 1 and
 * `slingDrawRight` only Player 2, and the wrong seat's hold does nothing,
 * silently.
 *
 * **A draw is a hold, then a pull in its place** — the owner, 13 October
 * 2026, carrying THE COMBO LAB's HOLD, THEN PULL into the game in place of
 * the swipe on the lift (`DrawRelease`). Two stages, each whole on its own:
 *
 * - **The hold**: `on: true` is the finger down, and the beats it stays down
 *   are counted on the beat (`sling-step.ts`). Lifted before the step's
 *   `beats`, the arm springs slack, the count gone and the step still lit;
 *   once they are held the hold has counted (`held`), and its lift costs
 *   nothing. A thumb still down from the hold moves nothing.
 * - **The pull**: a fresh press takes the cord, and `fromMilli` carried
 *   `slingPullMilli` toward the step's `aim` is the one generic PULL
 *   (`pull.ts`), counted the moment it gets there — a true loose. Let go
 *   short of it, it is said (`pullShort`) and waits to be taken again.
 *
 * A lift outside an asking step only lets go. **A finger put down while the
 * spent yoke cools** is the reflex the cool asks the pair not to make
 * (`sling-cool.ts`); its lift costs nothing.
 */
export function slingHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  if (command.target !== "slingDrawLeft" && command.target !== "slingDrawRight") return;
  const s = slingBoss(world);
  if (s === null) return;
  const side: 0 | 1 = command.target === "slingDrawLeft" ? 0 : 1;
  const wants: 1 | 2 = side === 0 ? 1 : 2;
  if (player !== wants) return;
  const along = Number.isInteger(command.fromMilli) ? command.fromMilli : 0;
  if (command.on) {
    if (s.holding[side]) {
      if (s.pullMilli[side] >= 0) pulled(world, s, side, true, along);
      return;
    }
    s.holding[side] = true;
    slingStirred(world, s, side);
    if (s.held[side] && slingAsks(s, side)) s.pullMilli[side] = 0;
    return;
  }
  if (!s.holding[side]) return;
  s.holding[side] = false;
  if (s.pullMilli[side] >= 0) {
    pulled(world, s, side, false, along);
    return;
  }
  const step = slingLitStep(s);
  if (s.held[side] || !slingAsks(s, side) || step === null) return;
  s.drawnBeats[side] = 0;
  world.events.push({ type: "slingSlack", side, col: midCol(world.cfg) });
}

/** One move or the lift of a pull on the cord, read as the one generic PULL toward the aim. */
function pulled(world: World, s: SlingState, side: 0 | 1, on: boolean, along: number): void {
  const step = slingLitStep(s);
  if (step === null || !slingAsks(s, side)) {
    s.pullMilli[side] = -1;
    return;
  }
  const way: Pull = {
    way: "signed",
    sign: step.aim === "left" ? -1 : 1,
    reachMilli: world.cfg.slingPullMilli,
  };
  const { travelMilli, heard } = pullHeard(way, false, on, along);
  s.pullMilli[side] = on && heard === "held" ? travelMilli : -1;
  if (heard === "counted") slingLoosed(world, s, side);
  else if (heard === "short") {
    world.events.push({ type: "pullShort", col: midCol(world.cfg), player: side === 0 ? 1 : 2 });
  }
}
