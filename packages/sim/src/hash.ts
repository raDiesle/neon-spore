import { bossHashParts } from "./hash-boss.js";
import { creatureHashParts } from "./hash-creature.js";
import { faultHashParts } from "./hash-faults.js";
import { podHashParts } from "./hash-pods.js";
import { scarHashParts } from "./hull-types.js";
import { spendHashParts } from "./spend.js";
import type { World } from "./world.js";

/**
 * A cheap, stable fingerprint of the whole world. Two devices running lockstep
 * must produce the same value on every tick; a replay test pins it down.
 * FNV-1a over a canonical field order — never over JSON.stringify, whose key
 * order is an implementation detail.
 *
 * Three fields of `World` are deliberately outside it, and only three.
 * `cfg` is agreed before beat zero and never mutated mid-run, so hashing it
 * every tick would only restate the handshake. `queue` and `podQueue` are the
 * wave's script, handed in from `content/` the same way — they are read by
 * index and never rewritten, and `spawned`/`podSpawned` below carry how far
 * that reading has got. `events` is cleared every tick and derived from the
 * step that just ran, so it is a consequence of the state and not part of it.
 * Everything else is here, in this file or in the two it hands off to:
 * `hash-creature.ts` folds one body and `hash-boss.ts` one installed
 * mechanism, both as flat lists this file pushes, so what is left below is the
 * shape of the world rather than the contents of its longest lists. A field
 * outside the hash is a field that can desync two devices silently
 * (docs/architecture.md).
 */
export function hashWorld(world: World): number {
  let h = 0x811c9dc5;
  const push = (n: number): void => {
    h ^= n | 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  };

  push(world.tick);
  push(world.beat);
  push(world.over ? 1 : 0);
  push(world.cannonCol);
  push(world.shieldCol);
  push(world.shieldSinceTick);
  push(world.gripP1);
  push(world.gripP2);
  // And what each of those hands has carried. Two devices that disagreed about
  // either number would disagree about which column a rock is about to step
  // into — and so about whether the shield is standing in front of it, which
  // is the loudest desync a field can have (`grip-push.ts`). Nought and
  // nothing are two states: a hand may be holding a body and have carried it
  // nowhere, which is not the same as a hand carrying nothing at all.
  push(world.pushP1 === null ? 0 : 1);
  push(world.pushP1?.milli ?? 0);
  push(world.pushP1?.cols ?? 0);
  push(world.pushP2 === null ? 0 : 1);
  push(world.pushP2?.milli ?? 0);
  push(world.pushP2?.cols ?? 0);
  // The thumb on a colour. All three parts: two devices that disagreed about
  // when the fill started, about which colour is in it, or about whether the
  // lance has already left, would disagree about a shot that clears a whole
  // column (`lance.ts`).
  const held = world.prime;
  push(held === null ? -1 : held.tick);
  push(held === null ? 0 : held.color === "red" ? 1 : 2);
  push(held?.spent ? 1 : 0);
  // The four ticks the hull remembers. Cosmetic while nothing branched on
  // them, and not cosmetic any more: a call whose `need` is `guard` or
  // `fire(color)` is released by reading them, so a device that disagrees
  // about `guardTick` disagrees about whether the field advanced — a desync
  // that reads like a network bug. `wardUntilTick` was already here, further
  // down, for its own half of the same argument (a ward pod arms the shield
  // with no command, so two devices could run the same inputs and the same
  // tick count and still disagree about whether a rock is deflected); it
  // moves up so the four read as the one group they are, in the order
  // `World` declares them.
  push(world.guardTick);
  push(world.intakeTick);
  // THE CLAW's arm. Two devices that disagree about where it is are two
  // devices about to close it on different things.
  push(world.reachDir);
  push(world.reachCol);
  push(world.reachMilli);
  push(world.reachHeld);
  // And the hand on the crank. It is only a reference bearing, but the *step*
  // to the next one is rope, so two devices that disagree about where the
  // finger last was disagree about how far the arm came down for the sample
  // after it (`crank.ts`).
  push(world.crankAtMilli);
  // THE CHOIR's half-made gesture. Two devices that disagree about which
  // arrow is out, or about the tick its window shuts on, disagree about
  // whether the next pull merges a body or makes it sing — and therefore about
  // what the hull is worth a beat later (`choir-gesture.ts`).
  push(world.choirArm);
  push(world.choirArmTick);
  push(world.wardUntilTick);
  push(world.lastFireTick);
  // The wave's faults, with their rows and whatever each kind carries of its
  // own (`hash-faults.ts`).
  for (const n of faultHashParts(world.faults)) push(n);
  // And whether this wave's panel fills the lobe at all. Script like the fault
  // and hashed like it: two devices that disagree about it disagree about
  // whether a column burns (`lance.ts`).
  push(world.hasLance ? 1 : 0);
  // And how still each control has stood under a harpoon. Two devices that
  // disagree about it are two devices one beat apart on losing the round
  // (`harpoon.ts`).
  push(world.leechStillTicks);
  push(world.limpetStillTicks);
  push(world.leechHarpoonId);
  push(world.limpetHarpoonId);
  // The shot that has been pressed and has not left yet. In for the reason a
  // bullet is: two devices that disagree about whether a shot exists have
  // desynced, and a charge is a shot that exists everywhere except on the
  // field. Its colour only when there is one, the same way a boss's fields are
  // pushed only when there is one.
  const shot = world.charge;
  push(shot === null ? -1 : shot.left);
  // A shot THE MAZE swallowed on the press is 3 or 4, so every charge that
  // was not keeps the value it always hashed to.
  if (shot !== null) push((shot.color === "red" ? 1 : 2) + (shot.swallowed ? 2 : 0));
  // The beam standing in a column after THE LANCE has burnt it. Nothing about
  // it is decided after the tick it is lit, but two devices that disagree
  // about where it is or how long it has left are two devices drawing
  // different fields (`lance.ts`).
  const beam = world.beam;
  push(beam === null ? -1 : beam.col);
  if (beam !== null) {
    push(beam.color === "red" ? 1 : 2);
    push(beam.left);
    push(beam.topMilli);
  }
  // **THE SLOW's boundaries**, and they are the whole of the owner's condition
  // that a window *start and end at the same time for both players*: two
  // devices agree about which beats are played slowly because they agree about
  // these two integers. Nothing about the simulation reads them — what they
  // decide is how many milliseconds of wall clock a tick is worth in
  // `apps/game/src/loop.ts` — and they are in here for that reason rather than
  // in spite of it (`slow.ts`, `docs/decisions.md` #33).
  push(world.slowFromBeat);
  push(world.slowToBeat);
  // What the pair has spent, beat by beat (`spend.ts`). Two devices that
  // disagree about the tally disagree about the colour THE TASTER's next blade
  // grows in, and therefore about which colour breaks it.
  for (const n of spendHashParts(world.spend)) push(n);
  push(world.rng.state);
  push(world.guard.tries);
  push(world.guard.deflected);
  push(world.guard.mistimed);
  push(world.balance.podsFreed);
  push(world.balance.podsTaken);
  push(world.balance.podsLost);
  push(world.balance.husksRefused);
  push(world.balance.husksSwallowed);
  push(world.balance.colorHits);
  push(world.balance.colorMisses);
  push(world.balance.streak);
  push(world.balance.bestStreak);
  push(world.balance.wavesCleared);
  // The ready gate at the end of a guide. How full each circle is decides when
  // the wave starts, so two devices that disagree about a tick of it disagree
  // about whether the wave has begun (`briefing.ts`). The holds go in beside
  // the fills: a thumb lifting is what empties a circle that is not full yet.
  push(world.brief.fillP1);
  push(world.brief.fillP2);
  push(world.brief.holdP1 ? 1 : 0);
  push(world.brief.holdP2 ? 1 : 0);

  // Where the wave is. `beat` does not cover this: THE GAUGE holds
  // `waveBeat` still while `beat` keeps counting, and a warden's clamp, a
  // vane's opening and a queen's tell are all read off `waveBeat` — so two
  // devices agreeing about `beat` and not about `waveBeat` play different
  // bosses. `spawned` and `podSpawned` are how much of the script has been
  // read, `restBeat` is when the next wave gets asked for, and `nextId` is
  // the name the next creature will be given.
  push(world.wave);
  push(world.waveBeat);
  push(world.spawned);
  push(world.podSpawned);
  push(world.restBeat);
  // A hit's hold and the run's two figures: two devices that disagree about
  // whether the field is held after a hit, or about how many times the pair
  // has gone again, are not playing one run (`wave-fail.ts`).
  push(world.failTick);
  // And the tick the picture froze on: two devices that disagree about it draw
  // the struck field at two different points of one glide (`wave-fail.ts`).
  push(world.heldTick);
  push(world.retries);
  push(world.playTicks);
  push(world.waveTries);
  push(world.runTries);
  push(world.nextId);

  // The wave's opening. It is in the fingerprint because it decides whether
  // the world ticks at all: a device that thinks the introduction or the guide
  // is still up is a device holding a wave the other one is already playing,
  // and that is a desync whichever way it is spelled.
  push(world.brief.phase);
  push(world.brief.guide ? 1 : 0);
  push(world.brief.ack);
  // And how far each seat has read. A stepped guide only lets a seat hold the
  // gate from its last page, so two devices that disagree about a cursor
  // disagree about whether that seat may start the wave (`guide-steps.ts`).
  push(world.brief.steps);
  push(world.brief.stepP1);
  push(world.brief.stepP2);

  push(world.creatures.length);
  for (const c of world.creatures) {
    for (const n of creatureHashParts(c)) push(n);
  }

  push(world.bullets.length);
  for (const b of world.bullets) {
    push(b.id);
    push(b.col);
    push(b.row);
    push(b.subMilli);
    // What it kills. `bullet-hit.ts` decides kill from miss by comparing this
    // against the body it meets, so a shot that is red on one device and cyan
    // on the other clears the field on one screen and bounces off on the
    // other. The charge's colour was already hashed above; this is the same
    // shot one tick later.
    push(b.color === "red" ? 1 : 2);
    // And what it is *drawn* as, which is not the same question. THE CODEX
    // makes a bolt mean the other colour and look like the one that was
    // pressed, so two devices that disagree about `shown` draw two different
    // screens over one world — and one of the two players is reading a key off
    // the one that is wrong. 0 for the ordinary shot, where the two agree.
    push(b.shown === undefined ? 0 : b.shown === "red" ? 1 : 2);
    push(b.lance ? 1 : 0);
    // Where it is across its column and which way it is going. Both are the
    // steering THE LOCK does (`lock.ts`), and neither is decoration: the drift
    // decides which lane the next tick's sweep tests, so two devices that
    // disagree about it kill different bodies.
    push(b.driftMilli);
    push(b.aimMilli);
  }

  // The pods, and whether each is what it says it is (`hash-pods.ts`).
  for (const n of podHashParts(world.pods)) push(n);

  push(world.scars.length);
  // Where it broke, when, and what colour made it — the last so two devices
  // cannot remember one hit in two colours (`hull-types.ts`).
  for (const s of world.scars) for (const n of scarHashParts(s)) push(n);

  for (const n of bossHashParts(world.boss)) push(n);

  return h >>> 0;
}
