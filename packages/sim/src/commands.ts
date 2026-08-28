import { fire } from "./bullets.js";
import { closeFork, forkFire } from "./fork.js";
import { closeGauge } from "./gauge-round.js";
import { gripsCreature, setGrip } from "./grip.js";
import { endPrime, startPrime } from "./lance.js";
import { mazeHeard } from "./maze-round.js";
import { mirrorHeard, mirrorHoldsControls } from "./mirror.js";
import { resetRun } from "./run.js";
import { endCharge } from "./shot-charge.js";
import { fireStep } from "./simon.js";
import { spanCenterCol, type TimedCommand } from "./types.js";
import { wardenClamp, wardenRefusesGrip } from "./warden.js";
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
    // A run that is being left takes the lobe with it. Nothing else clears a
    // fill, so one left standing would arm the first shot of the next run.
    endPrime(world);
    // And the shot already pressed and not yet out, for the same reason one
    // step further on: a run being left is not a run that owes anybody a bolt,
    // and the host does not answer `needWave` on the same tick it is asked, so
    // there are ticks in between for a charge to go out into (`shot-charge.ts`).
    endCharge(world);
    // And it takes THE FORK with it. A run being left is not a run waiting to
    // be continued, and a fork still open would be one asking two people for
    // permission to start the wave they just asked for (`fork.ts`).
    closeFork(world);
    // And THE GAUGE, for the third time the same argument: a run being left is
    // not a run standing at a dial. Only that one — every other boss goes when
    // `startWave` installs the next wave's, and none of the others holds the
    // whole of `step` in the ticks before it gets there.
    closeGauge(world);
    world.events.push({ type: "needWave", wave: 0 });
    return;
  }
  // Nothing at all reaches the ship while THE MIRROR is presenting.
  if (mirrorHoldsControls(world)) return;

  switch (c.kind) {
    case "cannonCol": {
      // A clamped control takes no column, and the command is *dropped* rather
      // than queued: a release that teleported the cannon to wherever a thumb
      // had wandered in the meantime would undo the whole point of being held.
      if (wardenClamp(world) === "cannon") break;
      const from = world.cannonCol;
      world.cannonCol = clampCol(world, c.col);
      if (world.cannonCol !== from) {
        mirrorHeard(world, world.cannonCol > from ? "cannonRight" : "cannonLeft");
        // The mark is on a column. A cannon that leaves the column it was
        // filling in has nothing left to have marked, so the lobe empties —
        // which is the whole reason priming costs anything (`lance.ts`).
        endPrime(world);
      }
      break;
    }
    case "shieldCol":
      if (wardenClamp(world) === "shield") break;
      world.shieldCol = clampCol(world, c.col);
      break;
    case "guard":
      world.guardTick = world.tick;
      mirrorHeard(world, "guard");
      break;
    case "intake":
      world.intakeTick = world.tick;
      mirrorHeard(world, "intake");
      // The maw *is* the cannon lobe, turned inside out (docs/spec/systems.md
      // 5.7). Whatever was filling it goes out of the same opening.
      endPrime(world);
      break;
    case "prime":
      // The hold itself. THE MIRROR is not listening for it — the lance is not
      // in its vocabulary (`simon.ts`), and a sequence cannot ask for one.
      if (c.on) startPrime(world);
      else endPrime(world);
      break;
    case "fire":
      // At THE FORK a colour is not a shot: it is player 2's half of "go", and
      // it is answered by the wave starting or by nothing at all. Asked first,
      // because there is no field to fire into between waves (`fork.ts`).
      if (forkFire(world)) break;
      fire(world, c.color);
      mirrorHeard(world, fireStep(c.color));
      // And THE MAZE hears it too. The shot itself is an ordinary one and goes
      // up an empty field; what the boss takes from it is the column, which is
      // which of its three mouths the pair just chose (`maze-round.ts`).
      mazeHeard(world);
      break;
    case "grip": {
      // Either seat may send this one, so it is the player on the command
      // that decides whose hand it is — not the control it arrived beside.
      // Except on your own tether, which you get no leverage on (`warden.ts`).
      if (wardenRefusesGrip(world, timed.player, c.id)) break;
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
