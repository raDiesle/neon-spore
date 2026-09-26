import { antiphonHeard, antiphonPulled, stepAntiphonTurn } from "./antiphon-hand.js";
import { batonHeard } from "./baton-hand.js";
import { curtainHemHeard } from "./curtain-hand.js";
import { filamentHeard } from "./filament-hand.js";
import { fleetHandsHeard } from "./fleet-hand.js";
import { gimbalHeard } from "./gimbal-hand.js";
import { gorgeHeard } from "./gorge-hand.js";
import { haspHeard } from "./hasp-hand.js";
import { hiveHeard } from "./hive-hand.js";
import { instarHeard } from "./instar-hand.js";
import { keelHeard } from "./keel-hand.js";
import { leadHeard } from "./lead-hand.js";
import { ledgerHandsHeard } from "./ledger-hand.js";
import { mantleHeard } from "./mantle-hand.js";
import { mazeHeartHeard } from "./maze-hand.js";
import { mirrorLobeHeard } from "./mirror-hand.js";
import { oculusHeard } from "./oculus-hand.js";
import { queenHeard } from "./queen-hand.js";
import { ratchetHeard } from "./ratchet-hand.js";
import { rimeGuarded } from "./rime-guard.js";
import { rimeHeard } from "./rime-hand.js";
import { scuttleHeard } from "./scuttle-hand.js";
import { seamGuarded } from "./seam-guard.js";
import { spoolHeard } from "./spool-hand.js";
import { stareLidHeard } from "./stare-hand.js";
import { surgeHeard } from "./surge-hand.js";
import { tasterHandsHeard } from "./taster-hand.js";
import { throatHeard } from "./throat-hand.js";
import type { TimedCommand } from "./types.js";
import { undertowHandsHeard } from "./undertow-hand.js";
import { valveHeard } from "./valve-hand.js";
import { viseHeard } from "./vise-hand.js";
import { wellHeard } from "./well-hand.js";
import type { World } from "./world.js";

/**
 * **The choreographed bosses' hands, read on the tick** — the second page
 * of what `step.ts` does with a command before the clock moves.
 *
 * Cut out of `step.ts` when one more boss's hand would have put it over its
 * 250-line limit, at the seam that file's own comments had drawn seven times
 * running: each of these is one boss's thumb, heard off the wire on the
 * tick for a reason of its own that is written beside it, and none of them
 * is the field's. The field's hands — the maze string, the rope, the cord,
 * the grip, the crank, the ring, the arrows, the balloons, the sinew — went
 * to a page of their own after it (`field-hands.ts`), which calls this one
 * after THE SINEW and before THE WEIGHT's clock, exactly where the block was.
 *
 * The order between them does not matter — one boss is installed at a time —
 * and it is kept as the bosses were built.
 */
export function bossHandsHeard(world: World, commands: readonly TimedCommand[]): void {
  // THE STARE's lid, on the tick because the instant it shuts is the instant
  // the watched seat is free, and *go* is said on a tick (`stare-hand.ts`).
  for (const c of commands) stareLidHeard(world, c.player, c.command);
  // THE SURGE's one handle, on the tick because the fight is two lifts
  // inside one beat of each other, and the tick is what a lift is timed by
  // (`surge-hand.ts`).
  for (const c of commands) surgeHeard(world, c.player, c.command);
  // THE LEAD's stalk under the navigator's thumb, on the tick because *up* is
  // said on a tick, and a release answered on the next beat would be a beat of
  // pass nobody asked for (`lead-hand.ts`). What the hold is worth is counted
  // on the beat, in `lead-step.ts`, with the still it stops running out.
  for (const c of commands) leadHeard(world, c.player, c.command);
  // THE ANTIPHON's thumb on the organ, on the tick because what it does is
  // turn a shape a finger is watching (`antiphon-hand.ts`).
  for (const c of commands) antiphonHeard(world, c.player, c.command);
  stepAntiphonTurn(world);
  // Her pull on the rail, on the tick for `scuttle-hand.ts`' reason: the carry
  // is where the thumb is now, and a pull answered on the next beat could be
  // answered after the bolt it was meant to make safe (`antiphon-hand.ts`).
  for (const c of commands) antiphonPulled(world, c.player, c.command);
  // THE HIVE's two thumbs on the underside, on the tick because a haul is
  // where the thumb is now and a hold of two beats cannot afford a beat of
  // rounding (`hive-hand.ts`). The cannon and the trigger stay where they
  // are: this is the boss's second and third gestures, not its first.
  for (const c of commands) hiveHeard(world, c.player, c.command);
  // THE INSTAR's marks, on the tick because a tap is a tap when it lands and
  // a pull is where the thumb is now (`instar-hand.ts`).
  for (const c of commands) instarHeard(world, c.player, c.command);
  // THE FILAMENT's two thumbs, on the tick: a tile is lit when the thumb
  // reaches it, and the beat only says whether that was too soon (`filament-hand.ts`).
  for (const c of commands) filamentHeard(world, c.player, c.command);
  // THE GIMBAL's two rings, on the tick because a ring is where the hand has
  // turned it to now: a bearing answered on the next beat would put the rim
  // behind the finger on it, THE WELL's reason with the whole fight resting
  // on it (`gimbal-hand.ts`). Whether it sits true, and for how long, is the
  // beat's and nothing else is.
  for (const c of commands) gimbalHeard(world, c.player, c.command);
  // THE MANTLE's two handles and its bared core's tap, on the tick because a
  // handle's depth is where the thumb is now and a released handle has to
  // reach nought before the next beat judges the sum (`mantle-hand.ts`).
  for (const c of commands) mantleHeard(world, c.player, c.command);
  // THE KEEL's joint, on the tick because a tap is an edge and the window
  // it lands in is judged against the beat it lit on (`keel-hand.ts`).
  for (const c of commands) keelHeard(world, c.player, c.command);
  // THE VALVE's wheel and pin, on the tick because a turn is a bearing and
  // the freeze an edge (`valve-hand.ts`).
  for (const c of commands) valveHeard(world, c.player, c.command);
  // THE SEAM's shield, once a tick after the commands: no handle of its
  // own, only the guard and the plate read against its lit step (`seam-guard.ts`).
  seamGuarded(world);
  // THE OCULUS's two leaves, on the tick because a slip is the instant a
  // thumb lifts; the beats held are counted on the beat (`oculus-hand.ts`).
  for (const c of commands) oculusHeard(world, c.player, c.command);
  // THE VISE's two gaps, on the tick for the same reason: a slip is the
  // instant a gap widens back past shut (`vise-hand.ts`).
  for (const c of commands) viseHeard(world, c.player, c.command);
  // THE RIME's two wipes, on the tick because a half wiped to nought is
  // answered then, before the beat's regrowth could undo it (`rime-hand.ts`);
  // and its shield, THE SEAM's once a tick after the commands (`rime-guard.ts`).
  for (const c of commands) rimeHeard(world, c.player, c.command);
  rimeGuarded(world);
  // THE SPOOL's brake, on the tick because where the thumb has it is what the
  // line pays out at on the next beat — nothing about it is judged here and
  // the depth is the whole of what the wire carries (`spool-hand.ts`).
  for (const c of commands) spoolHeard(world, c.player, c.command);
  // THE HASP's latch and wheel, on the tick because the gate between them is
  // read on the tick: a wheel judged on the beat would keep turning after the
  // latch let go, which is the one lie this boss may not tell (`hasp-hand.ts`).
  for (const c of commands) haspHeard(world, c.player, c.command);
  // THE RATCHET's catch and pawl, on the tick because a press is judged
  // against her hand the instant it lands (`ratchet-hand.ts`).
  for (const c of commands) ratchetHeard(world, c.player, c.command);
  // THE BULB QUEEN's marks under player 1's thumb, on the tick because a pry
  // is a press when it lands and a hold is where the thumb is now (`queen-hand.ts`).
  for (const c of commands) queenHeard(world, c.player, c.command);
  // THE MIRROR's lobes under both thumbs, on the tick because a step given
  // back on its ship lands when the thumb lifts, and the pin is where both
  // thumbs are now (`mirror-hand.ts`).
  for (const c of commands) mirrorLobeHeard(world, c.player, c.command);
  // THE GORGE's pinch and pry, on the tick because a vent is on the beat and
  // a pinch that waited for it would land on a column already torched
  // (`gorge-hand.ts`).
  for (const c of commands) gorgeHeard(world, c.player, c.command);
  // THE MAZE's heart under the navigator's thumb, on the tick because the
  // tear is where the thumb is now, judged against where the pilot's hand
  // is now (`maze-hand.ts`). The string itself stays in `step.ts` with the
  // field's other handles; this is the round's second gesture, not its first.
  for (const c of commands) mazeHeartHeard(world, c.player, c.command);
  // THE FLEET's three thumbs on the chart, on the tick because a rake is
  // where the thumb is now and the pull sinks the wreck the tick it reaches
  // (`fleet-hand.ts`). The arrows and the trigger stay in `step.ts`.
  for (const c of commands) fleetHandsHeard(world, c.player, c.command);
  // THE BATON's thumb on its own arm, on the tick because the seat that may
  // strip is the seat the *beat* locked out, and a strip that waited for the
  // next beat would be answered against a lock that had already moved
  // (`baton-hand.ts`). The trigger and the shot stay where they were.
  for (const c of commands) batonHeard(world, c.player, c.command);
  // THE UNDERTOW's two thumbs on the hull, on the tick because a pin is a
  // plate and the plate it stands beside is read where the press is — the maw
  // asks `undertowPinned` on the same tick it asks `world.shieldCol`
  // (`undertow-hand.ts`). What either came to over the beat is counted there.
  for (const c of commands) undertowHandsHeard(world, c.player, c.command);
  // THE THROAT's cinch and haul, on the tick because a thumb is down when it
  // lands and the beat only ever asks whether it was down (`throat-hand.ts`).
  // Both are *spent* on the beat, by `throatBreathes` and `throatHaul`, which
  // is this fight's own promise: every change lands on a count somebody said.
  for (const c of commands) throatHeard(world, c.player, c.command);
  // THE CURTAIN's lift on the hem, on the tick because the gap over the core
  // is open only while the thumb is at the top, and a lift answered on the
  // next beat would be a gap the pilot had already let go of
  // (`curtain-hand.ts`). The shove itself stays on the beat, with the carry.
  for (const c of commands) curtainHemHeard(world, c.player, c.command);
  // THE TASTER's three thumbs on its own fan, on the tick because a pin is
  // down when it lands, the cut a carry makes is where the thumb is now, and
  // the tick the interlock comes apart is the tick her beam starts being
  // worth something (`taster-hand.ts`). What a pin came to over the beat is
  // counted in `taster-step.ts`, with the fan's own clock.
  for (const c of commands) tasterHandsHeard(world, c.player, c.command);
  // THE LEDGER's four thumbs on its own cord, on the tick because the foot is
  // where the thumb is now, a plug is in the socket when it lands, and the tick
  // the cord comes out of the plating is the tick the wave is over
  // (`ledger-hand.ts`). What a plug came to over the beat is counted in
  // `ledger-step.ts`, with the cord's own clock.
  for (const c of commands) ledgerHandsHeard(world, c.player, c.command);
  // THE SCUTTLE's one thumb on a part already hanging, on the tick because
  // the carry is where the thumb is now and a swing answered on the next
  // beat could arrive after the throw it was meant to move (`scuttle-hand.ts`).
  // What the swing is worth is spent on the beat, in `scuttle-step.ts`, where
  // the part goes down the column it was put in.
  for (const c of commands) scuttleHeard(world, c.player, c.command);
  // THE WELL's one thumb on the seam of its clock face, on the tick because
  // the carry is where the thumb is now: a turn answered on the next beat
  // would put the seam a quarter of a sector behind the finger that is
  // holding it, on a picture whose whole point is that it agrees with the
  // hand (`well-hand.ts`). The slip it holds still is spent on the beat, in
  // `well-step.ts`.
  for (const c of commands) wellHeard(world, c.player, c.command);
}
