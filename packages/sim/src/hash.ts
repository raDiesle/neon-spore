import { bossHashParts } from "./hash-boss.js";
import { creatureHashParts } from "./hash-creature.js";
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
