import { resetRun } from "./beat.js";
import { fire } from "./bullets.js";
import { gripsCreature, setGrip } from "./grip.js";
import { mirrorHeard, mirrorHoldsControls } from "./mirror.js";
import { fireStep } from "./simon.js";
import { spanCenterCol, type TimedCommand } from "./types.js";
import type { World } from "./world.js";

/**
 * What a press does to the world. Split out of `world.ts` when the grip
 * arrived: `step` is the shape of a tick and this is the shape of a command,
 * and the two only shared a file for as long as the second one was short.
 */

/**
 * Every command is also a gesture THE MIRROR may be listening for, so each of
 * the four that has a step to its name reports it (`mirrorHeard` ignores it
 * unless a sequence is actually open). The cannon is the one that has to be
 * *derived*: a column is a place, and the step is which way it moved, so the
 * old column is read before the new one is written. Any jump counts once, in
 * the direction it went — a thumb dragged three columns is one gesture, not
 * three, because that is how many things the player did.
 */
export function applyCommand(world: World, timed: TimedCommand): void {
  const c = timed.command;
  if (c.kind === "restart") {
    // The sim clears the run and then asks for a queue. It cannot build one
    // itself: waves live in content/, and content points at sim, not back.
    // Read even while the controls are held, or a run could never be left.
    resetRun(world);
    world.events.push({ type: "needWave", wave: 0 });
    return;
  }
  // Nothing at all reaches the ship while THE MIRROR is presenting.
  if (mirrorHoldsControls(world)) return;

  switch (c.kind) {
    case "cannonCol": {
      const from = world.cannonCol;
      world.cannonCol = clampCol(world, c.col);
      if (world.cannonCol !== from) {
        mirrorHeard(world, world.cannonCol > from ? "cannonRight" : "cannonLeft");
      }
      break;
    }
    case "shieldCol":
      world.shieldCol = clampCol(world, c.col);
      break;
    case "guard":
      world.guardTick = world.tick;
      mirrorHeard(world, "guard");
      break;
    case "intake":
      world.intakeTick = world.tick;
      mirrorHeard(world, "intake");
      break;
    case "fire":
      fire(world, c.color);
      mirrorHeard(world, fireStep(c.color));
      break;
    case "grip": {
      // Either seat may send this one, so it is the player on the command
      // that decides whose hand it is — not the control it arrived beside.
      setGrip(world, timed.player, c.id);
      const held = world.creatures.find((x) => x.id === c.id);
      if (held && gripsCreature(world, timed.player, c.id)) {
        world.events.push({
          type: "grip",
          player: timed.player,
          col: spanCenterCol(held.kind, held.col),
          row: held.row,
        });
      }
      break;
    }
  }
}

function clampCol(world: World, col: number): number {
  return Math.max(0, Math.min(world.cfg.cols - 1, Math.round(col)));
}
