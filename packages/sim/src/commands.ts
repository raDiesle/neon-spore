import { batonLaunch } from "./baton-press.js";
import { beatboxTapped } from "./beatbox-round.js";
import { fire } from "./bullets.js";
import { choirShaken } from "./choir-gesture.js";
import { leaveHeard } from "./command-leave.js";
import { pressRefused } from "./command-locks.js";
import { clampCol } from "./config-derived.js";
import { lightTile } from "./dark.js";
import { gripsCreature, setGrip } from "./grip.js";
import { armShield } from "./hull-guard.js";
import { endPrime, primeChargeMilli, priming, spillPrime, startPrime } from "./lance.js";
import { mazeHeard } from "./maze-controls.js";
import { mineTapped } from "./mine.js";
import { mirrorHeard } from "./mirror.js";
import { reachHeard, reachOut } from "./reach.js";
import { sceneGuard, sceneSuck } from "./scene-panel.js";
import { fireStep } from "./simon.js";
import { spliceHeard } from "./splice-round.js";
import { bodyCenterCol, type Color, type TimedCommand } from "./types.js";
import { undertowIntake } from "./undertow-press.js";
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
  // The two presses that leave a run, above every lock, in their own file
  // (`command-leave.ts`): what each of them puts down before it goes is a
  // longer argument than what any press here does to a wave.
  if (leaveHeard(world, timed)) return;
  // Every lock a boss or a fault puts on a press, asked once, above the
  // switch: a door into a command that one of them forgot would be a control
  // that works from the wire and not the lobe (`command-locks.ts`).
  if (pressRefused(world, timed)) return;

  switch (c.kind) {
    case "cannonCol": {
      // **The strip is dead while THE CLAW's arm is out.** The arm holds its
      // own column whatever the strip does (`reach.ts`), so a strip that still
      // slid would draw the ship's swelling away from the hand hanging off it
      // — the owner reported exactly that. Refusing the command rather than
      // letting it move something invisible is the honest half: the press does
      // nothing because there is nothing it could do until the arm is home.
      if (reachOut(world)) break;
      const from = world.cannonCol;
      world.cannonCol = clampCol(world.cfg, c.col);
      if (world.cannonCol !== from) {
        mirrorHeard(world, world.cannonCol > from ? "cannonRight" : "cannonLeft", "panel");
        // The mark is on a column. A cannon that leaves the column it was
        // filling in has nothing left to have marked, so the fill drops to
        // nothing and starts again — which is the whole reason a fill costs
        // anything, and the half of the coupling player 1 holds.
        //
        // Reset and not cleared: the thumb is player 2's now, and a slide that
        // silently ate the shot she was owed would make the trigger unusable
        // on every wave where the cannon moves, which is all of them
        // (`spillPrime` in `lance.ts`).
        if (spillPrime(world)) world.events.push({ type: "lanceSpilled", col: from });
      }
      break;
    }
    case "shieldCol": {
      const to = clampCol(world.cfg, c.col);
      // Only when it really moves. The control is held, not tapped, so a seat
      // pressing a column it is already in — or leaning against the wall the
      // clamp stops them at — would otherwise reset the standing clock every
      // tick and the dome would never count as settled anywhere (`World`).
      if (to !== world.shieldCol) {
        world.shieldCol = to;
        world.shieldSinceTick = world.tick;
      }
      break;
    }
    case "guard":
      mirrorHeard(world, "guard", "panel");
      // And THE BATON's launch, which is this trigger while the bead sits;
      // the dome still comes up. A no-op unless that boss is installed.
      batonLaunch(world);
      // Everything the dome coming up means is one call, because a shield
      // malfunction arms it on the beat with nobody pressing anything and the
      // two paths must not drift (`armShield` in `hull-guard.ts`).
      armShield(world);
      // And a SHIELD mark on a scene's body over the dome (`scene-panel.ts`).
      sceneGuard(world);
      break;
    case "shake":
      // THE CHOIR, and the only command in the game that is not a thumb on
      // anything. It reaches every membrane on the field at once, because a
      // shake has no column to be in (`choir-gesture.ts`).
      choirShaken(world);
      break;
    case "reach":
      // The arm, on THE CLAW's panel. It is an ordinary ship control and not a
      // round's own verb, which is the whole of what the panel is: the field
      // under it is the field (`reach.ts`).
      reachHeard(world);
      break;
    case "intake":
      world.intakeTick = world.tick;
      mirrorHeard(world, "intake", "panel");
      // And THE UNDERTOW, whose lobes the maw takes: after `intakeTick`, so
      // `mawOpen` reads true for it. A no-op unless that boss is installed.
      undertowIntake(world);
      // And THE SPLICE, whose whole fight is this one press: the entrance
      // under the cannon, if there is one, and the number at the far end of
      // its straw on its way down (`splice-round.ts`).
      spliceHeard(world);
      // And a SUCK mark on a scene's body over the cannon (`scene-panel.ts`).
      sceneSuck(world);
      // The maw *is* the cannon lobe, turned inside out (docs/spec/systems.md
      // 5.7). Whatever was filling it goes out of the same opening — and, like
      // a cannon that slid, it empties the fill without taking the shot the
      // thumb is owed.
      if (spillPrime(world)) world.events.push({ type: "lanceSpilled", col: world.cannonCol });
      break;
    case "prime": {
      // **A thumb on a colour**, which is the whole of the trigger now: the
      // press starts the fill and says nothing, and the lift is the shot.
      //
      // A tap is therefore an ordinary bolt fired a few hundredths of a second
      // after the finger landed rather than on the instant it did, and that is
      // the one thing this costs. It buys the hold: a press that fired
      // immediately would put a wasted bolt at the front of every lance, and
      // the lesson the pair is being taught is that **one** shot takes the
      // column (`lance.ts`).
      if (c.on) {
        startPrime(world, c.color);
        break;
      }
      // The lift. A lobe that never came full owes the ordinary shot, in the
      // colour that was held — and what was in it is lost, which is the spill
      // the lance has always reported. One that has already fired owes nothing.
      const held = world.prime;
      const owed = priming(world) && held !== null;
      const spill = owed && primeChargeMilli(world) > 0;
      endPrime(world);
      if (owed && held !== null) {
        firePress(world, held.color);
        if (spill) world.events.push({ type: "lanceSpilled", col: world.cannonCol });
      }
      break;
    }
    case "fire":
      // The swipe on the muzzle, and every caller with no thumbs — a
      // rehearsal, a replay, the director's loop. The lobes send `prime` and
      // arrive here through its lift.
      firePress(world, c.color);
      break;
    case "tap":
      // Player 2's thumb on a soundbox, and the one command in this game that
      // is a press on a body. Which seat may send it is `beatbox-round.ts`'s
      // rule and not this file's, on `valve`'s terms: the command is what was
      // pressed, and whose press counts belongs to the creature.
      beatboxTapped(world, timed.player, c.id);
      break;
    case "tapTile":
      // A blind finger on a square of the field, and the one press in this
      // game that names a place nobody on the sending device can see anything
      // at (`mine.ts`). Whose press counts is the creature's rule, exactly as
      // the soundbox's is one case up.
      mineTapped(world, timed.player, c.col, c.row);
      break;
    case "light":
      // Either seat's finger on the dark. Nothing on the field hears it; it
      // only says what both screens may see (`dark.ts`).
      lightTile(world, c.col, c.row);
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
          col: bodyCenterCol(held, held.col),
          row: held.row,
        });
      }
      break;
    }
  }
}

/**
 * One ordinary shot, and everything else that is listening for one.
 *
 * Two commands reach it — the muzzle swipe's `fire` and the lift of a hold on
 * a colour — and both have to be heard by THE MIRROR and by THE MAZE. Written
 * once, because a sequence that counted one of them and not the other would be
 * a sequence a pair could not finish.
 */
function firePress(world: World, color: Color): void {
  // The ids this press is about to hand out, so a shot the drum swallows
  // can be told from one that was already in the air up the same column.
  const before = world.nextId;
  const laid = world.charge;
  fire(world, color);
  mirrorHeard(world, fireStep(color), "panel");
  // And THE MAZE hears it too. When a gap is standing on the cannon's
  // column the drum *takes* the shot: the bullet this press produced is
  // dropped, and from there the whole journey — up the field, in through
  // the gap and round the corridors — is the maze's own picture of it
  // (`maze-controls.ts`). Everything else about the press already
  // happened, so the cooldown and the lobe are spent either way.
  // On a shot grid the press made no bullet yet, only a charge: that is
  // marked instead, and dropped when it goes out (`releaseShot`).
  if (mazeHeard(world, color)) {
    world.bullets = world.bullets.filter((b) => b.id < before);
    if (world.charge !== null && world.charge !== laid) world.charge.swallowed = true;
  }
}
