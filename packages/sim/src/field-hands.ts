import { balloonHeard } from "./balloon-pull.js";
import { rubBalloons } from "./balloon-rub.js";
import { bossHandsHeard } from "./boss-hands.js";
import { stepChoirFuse } from "./choir.js";
import { choirArrowHeard, stepChoirWindow } from "./choir-gesture.js";
import { crankHeard } from "./crank.js";
import { fleetHeard } from "./fleet.js";
import { gripPushHeard } from "./grip-push.js";
import { lidHeard } from "./lid.js";
import { mazeStringHeard, stepMazeTurn } from "./maze-controls.js";
import { orreryRingHeard } from "./orrery-hand.js";
import { sinewHeard } from "./sinew-hand.js";
import type { TimedCommand } from "./types.js";
import { vaneHeard } from "./vane-hand.js";
import { wardenHeard } from "./warden-hand.js";
import { stepWeights } from "./weight.js";
import type { World } from "./world.js";

/**
 * **Every hand on the field, read on the tick** — what `step.ts` does with a
 * command after `applyCommand` and before the clock moves.
 *
 * Cut out of `step.ts` at the seam `boss-hands.ts` was cut at, read once
 * more, so what stays there is the loop and the order of it: each of these
 * is a thumb heard off the wire on the tick rather than on the beat, for a
 * reason of its own written beside it. The order is the one they were built
 * in, and the choreographed bosses' page, THE WEIGHT's clock and THE FLEET
 * run where they always ran — between THE SINEW and the end.
 */
export function fieldHandsHeard(world: World, commands: readonly TimedCommand[]): void {
  // THE MAZE's string, and the wheel it turns. Read here rather than in
  // `applyCommand` for the reason THE GAUGE's needle is stepped here: the
  // wheel answers a held thumb on the *tick*, and `stepBoss` runs on the beat
  // (`maze-round.ts`). `valve` is deliberately the same command THE GAUGE
  // turns with — one held verb, one seat, one vocabulary.
  for (const c of commands) mazeStringHeard(world, c.player, c.command);
  stepMazeTurn(world);
  // THE WARDEN's three hands, read on the tick for the same reason: how far
  // the hand has carried the handle is how far the hatch stands open, and a
  // gate that only answered on the beat would feel like a queue (`warden.ts`).
  for (const c of commands) wardenHeard(world, c.player, c.command);
  // THE VANE's arm and housing, on the tick for the same reason: a thumb on a
  // sweeping arm has to stop it where the pair saw it stop, and an arm that
  // answered on the beat would have moved on by the time it did (`vane-hand.ts`).
  for (const c of commands) vaneHeard(world, c.player, c.command);
  // THE LID's cord, on the tick for the same reason and one step further: the
  // plates part in proportion to the pull and shut the instant the hand lifts,
  // so a gate answered on the beat would open after the moment the pair had
  // just counted themselves into (`lid.ts`).
  for (const c of commands) lidHeard(world, c.player, c.command);
  // And the hand on a body itself, which is the grip carried sideways. Read on
  // the tick with the rest of them so the distance the finger has come is
  // never stale — what it *does* with that distance is on the beat, in
  // `carryGrips`, because a body may only ever stand on a tile centre
  // (`grip-push.ts`).
  for (const c of commands) gripPushHeard(world, c.player, c.command);
  // THE CLAW's crank, read on the tick with the hands on the field and for
  // their reason: what winds the rope is the step from one bearing to the
  // next, and a turn answered on the beat would come down in seventy-five-tick
  // lurches under a finger that is going round smoothly (`crank.ts`). It is
  // the one `drag` in the game that is a hand on a *control* rather than on
  // something the field is carrying.
  for (const c of commands) crankHeard(world, c.player, c.command);
  // THE ORRERY's outermost unbroken ring, which is that same bearing put back
  // on the field — and read here for the crank's reason with a second one of
  // its own: what the hand writes is the ring's *anchor*, and the beat is
  // where every other thing about this boss is decided, so a turn answered
  // there would move a gap in the same instant the pair was counting itself
  // into (`orrery-hand.ts`).
  for (const c of commands) orreryRingHeard(world, c.player, c.command);
  // THE CHOIR's two arrows, read on the tick with the other four hands for
  // their reason: how far the pilot has carried one is never stale, and the
  // window between the two of them is counted in ticks (`choir-gesture.ts`).
  for (const c of commands) choirArrowHeard(world, c.player, c.command);
  stepChoirWindow(world);
  // And a membrane that has finished drawing together, which is where the
  // colour arrives and the body becomes something a shot can reach. On the
  // tick with the window above, because both are lengths counted in ticks and
  // a beat's granularity would let a bolt through a film still closing.
  stepChoirFuse(world);
  // THE BALLOON's two handles, read on the tick with the other five hands and
  // for their reason with the most riding on it: the pair counts itself into
  // the instant both of them pull, and an instant answered on the next beat
  // would land up to a whole beat after the one they said out loud
  // (`balloon-pull.ts`). `rubBalloons` is the answer, straight after the
  // reading, so a body both hands reached is given on the tick they reached
  // it rather than on the tick after.
  for (const c of commands) balloonHeard(world, c.player, c.command);
  rubBalloons(world);
  // THE SINEW's two handles, read on the tick for the balloon's reason with
  // the other half of it: the sum of the two pulls is player 2's only readout
  // of a thumb on another phone, and a depth that waited for the beat would
  // be a number said out loud a beat late (`sinew-hand.ts`).
  for (const c of commands) sinewHeard(world, c.player, c.command);
  // The choreographed bosses' hands — THE STARE's lid, THE SURGE's lift,
  // THE ANTIPHON's organ, THE INSTAR's marks, THE FILAMENT's thumbs, THE
  // GIMBAL's rings, THE BULB QUEEN's marks, THE DIASTOLE's clamp — on the tick with the
  // rest, each for its own reason, on a page of their own (`boss-hands.ts`).
  bossHandsHeard(world, commands);
  // And the two hands on THE WEIGHT, which is not a command at all: the press
  // is the ordinary `grip` and `applyCommand` has already recorded it, so what
  // runs here is the clock over it. On the tick with the balloon's rub above
  // and for the same reason, at its strongest: the pair counts itself into the
  // instant both thumbs land, and an instant answered on the next beat would
  // land up to a whole beat after the one they said out loud (`weight.ts`).
  stepWeights(world);
  // THE FLEET's sights and its salvo, read on the tick for the third time and
  // the same reason: a square the pair just named out loud is answered now,
  // not on the next beat. Its clock is the one thing about it that is on the
  // beat, and that runs in `stepBoss` (`fleet.ts`).
  for (const c of commands) fleetHeard(world, c.player, c.command);
}
