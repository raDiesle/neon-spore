import { kindCode } from "./creature-kinds.js";
import { bossHashParts } from "./hash-boss.js";
import { spanOf } from "./span.js";
import { POD_KINDS } from "./types.js";
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
 * Everything else is here. A field outside the hash is a field that can
 * desync two devices silently (docs/architecture.md).
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
  push(world.score);
  push(world.cannonCol);
  push(world.shieldCol);
  push(world.gripP1);
  push(world.gripP2);
  push(world.primeTick);
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
  push(world.wardUntilTick);
  push(world.lastFireTick);
  // The shot that has been pressed and has not left yet. In for the reason a
  // bullet is: two devices that disagree about whether a shot exists have
  // desynced, and a charge is a shot that exists everywhere except on the
  // field. Its colour and its lance only when there is one, the same way an
  // boss's fields are pushed only when there is one.
  const shot = world.charge;
  push(shot === null ? -1 : shot.left);
  if (shot !== null) {
    push(shot.color === "red" ? 1 : 2);
    push(shot.lance ? 1 : 0);
  }
  push(world.hullMilli);
  push(world.rng.state);
  push(world.guard.tries);
  push(world.guard.deflected);
  push(world.guard.mistimed);
  push(world.balance.podsFreed);
  push(world.balance.podsTaken);
  push(world.balance.podsLost);
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
  push(world.nextId);

  // The wave's opening. It is in the fingerprint because it decides whether
  // the world ticks at all: a device that thinks the introduction or the guide
  // is still up is a device holding a wave the other one is already playing,
  // and that is a desync whichever way it is spelled.
  push(world.brief.phase);
  push(world.brief.guide ? 1 : 0);
  push(world.brief.ack);

  push(world.creatures.length);
  for (const c of world.creatures) {
    push(c.id);
    // Which body this is. Not needed while every creature died the kind it
    // was born: the wave's queue fixed that on both devices. THE CLASP turns
    // into a slick or a bulb mid-fall, on a trigger (`clasp.ts`), so two
    // devices can now hold one body at one row in one colour and disagree
    // about whether its shield is still on. Without this the fingerprints
    // would match while one player shoots what the other cannot hit.
    push(kindCode(c.kind));
    push(c.col);
    // How wide it is. A rock's width is authored rather than fixed by its
    // kind now (`RockSize`), so two devices can hold one body at one column
    // and disagree about which columns the shield has to cover — a desync
    // that shows up as a deflection on one screen and a hull breach on the
    // other. `spanOf` rather than `c.span`, so an unsized body is hashed as
    // the width it actually has.
    push(spanOf(c));
    push(c.row);
    push(c.color === null ? 0 : c.color === "red" ? 1 : 2);
    push(c.holes);
    push(c.petals);
    push(c.dragMilli);
    push(c.throbOpen ? 1 : 0);
    // Which pieces of THE SHELL are still on. In for the plainest possible
    // version of the rule above: two devices that disagree about a piece
    // disagree about whether the next shot chips armour or has to carry a
    // colour, and one of them is playing a body the other one has already
    // opened. The colour underneath needs no field of its own — it is drawn
    // into `c.color` at the break, and `rng.state` a few lines up is what
    // makes both devices draw the same one.
    push(c.shell);
    // Which way the dart goes next, and whether the next beat is the one it
    // goes on. Both decide where the body will be, so two devices that
    // disagree about either are two devices playing different fields — and
    // one of them has player 1 standing in a column nothing arrives in.
    // `fromCol` beside them is deliberately out, for `fromRow`'s reason: where
    // a body came from is a fact about the picture and not about the world.
    push(c.dartDir ?? 0);
    push(c.dartFloat ? 1 : 0);
    // And the side after that one, which is rolled a beat early and is
    // therefore already a fact about the world rather than a guess about it.
    push(c.dartNext ?? 0);
    // When a veil was last struck in the wrong colour. It decides whether the
    // next shot reaches the body at all (`veilIsArmoured`), so two devices
    // that disagree about it disagree about whether a kill happened — and the
    // body inside needs no field of its own, being `c.color` a few lines up,
    // which is what the morph turns over.
    push(c.veilStruckTick ?? 0);
    // Which way a crossing ghost is walking, and how many walls it has turned
    // at. Both decide where the body will be on the next beat — and the lap
    // count decides more than that: at `ghostChargeLaps` it stops walking and
    // comes down at the hull, so two devices that disagree about it disagree
    // about whether the ship is about to be hit. `-2` for a ghost that falls,
    // which is a value no direction can take, so "no path" and "going left"
    // are never the same number in the fingerprint.
    push(c.ghostDir ?? -2);
    push(c.ghostLaps ?? 0);
    // How many divisions THE ECHO has left. It decides whether this body is
    // two bodies on the next beat, how far apart they stand, and what a shot
    // at it pays — so two devices that disagree about it disagree about how
    // many things are on the field a beat later, which is the loudest desync
    // there is. `-1` for a kind that never divides, which is a value no count
    // can take, so "not an echo" and "done dividing" are never the same
    // number in the fingerprint.
    push(c.echoSplits ?? -1);
    // And the beat it started waiting from, which with the count above decides
    // *when* it divides. Two devices that agree about how many divisions are
    // left and disagree about the moment hold the same field a beat apart, and
    // a beat apart is one screen with four bodies on it and one with eight.
    push(c.echoBeat ?? -1);
    // THE GYRE's four. The hub's turn and its age decide where all six bodies
    // on its rim stand on the next beat, how fast the rim is going and how far
    // the diamond has sunk — so two devices that disagree about either are two
    // devices firing at different columns. The mount's two are the attachment
    // itself: `carryMounts` moves whatever names a hub, and `breakSpentGyres`
    // counts the same field to decide whether the wheel is still there.
    //
    // `-1` for a body that carries none, which is a value none of the four can
    // take, so "not a wheel" and "upright, brand new, riding slot zero" are
    // never the same number in the fingerprint.
    push(c.gyreTurnMilli ?? -1);
    push(c.gyreStep ?? -1);
    push(c.gyreId ?? -1);
    push(c.gyreSlot ?? -1);
    // The body a lure wears. Authored rather than rolled, so it is in here for
    // the reason the maze's wheel is: the assumption that both devices were
    // handed the same wave is exactly the one worth checking, and a disguise
    // that differed would put player 1 in front of a body player 2 cannot see.
    // How many layers THE RIND still wears. It decides whether the next
    // matching shot takes a layer or the body, so two devices that disagree
    // about it disagree about whether the thing is still on the field — one
    // screen with a column to keep and one with a column to leave. `-1` for a
    // kind that never sheds, which is a value no count can take, so "not a
    // rind" and "cut down to size" are never the same number in the
    // fingerprint.
    push(c.rindLayers ?? -1);
    push(c.wears === undefined ? 0 : kindCode(c.wears) + 1);
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
    push(b.lance ? 1 : 0);
    push(b.pierced);
  }

  push(world.pods.length);
  for (const p of world.pods) {
    push(p.id);
    push(p.colMilli);
    push(p.rowMilli);
    push(p.driftMilli);
    push(p.loose ? 1 : 0);
    // What it gives when it is swallowed — `pods.ts` switches on it for hull,
    // for a swept field or for an armed shield, so two devices that disagree
    // here disagree about the state of the ship a beat later.
    push(POD_KINDS.indexOf(p.kind) + 1);
  }

  push(world.scars.length);
  for (const s of world.scars) {
    push(s.col);
    push(s.beat);
  }

  for (const n of bossHashParts(world.boss)) push(n);

  return h >>> 0;
}
