import { antiphonStruck } from "./antiphon-shot.js";
import { batonBeadAlong, batonShotSpends, batonStruck } from "./baton-press.js";
import { resolve } from "./bullet-hit.js";
import { hullRow } from "./config.js";
import { curtainStruck } from "./curtain-shot.js";
import { gimbalStruck } from "./gimbal-shot.js";
import { gorgeStruck } from "./gorge-step.js";
import { haspStruck } from "./hasp-shot.js";
import { hiveStruck } from "./hive-shot.js";
import { keelStruck } from "./keel-shot.js";
import { beamTicks, lanceReady, primeColor, spendPrime } from "./lance.js";
import { leadStruck } from "./lead-shot.js";
import { ledgerBills, ledgerStruck } from "./ledger-shot.js";
import { mantleStruck } from "./mantle-shot.js";
import { bulletMilli, creatureMilli } from "./mid-beat.js";
import { oculusStruck } from "./oculus-shot.js";
import { firstPodAlong, freePod } from "./pods.js";
import { ratchetStruck } from "./ratchet-shot.js";
import { scuttleStruck } from "./scuttle-shot.js";
import { seamStruck } from "./seam-shot.js";
import { firstAlong } from "./shot-reach.js";
import { spendShot } from "./spend.js";
import { tasterStruck } from "./taster-shot.js";
import type { Bullet, Color } from "./types.js";
import { undertowBurned } from "./undertow-press.js";
import { valveStruck } from "./valve-shot.js";
import { vaneStruck } from "./vane.js";
import { viseStruck } from "./vise-shot.js";
import type { World } from "./world.js";

/**
 * **THE LANCE going off**: the lobe coming full, and the column burning on
 * that tick.
 *
 * Its own file beside `bullets.ts` since the owner made the beam the weapon on
 * 7 September 2026, on the seam that change put there. Next door is a shot
 * that *travels* — a thing with a position, stepped once a tick until it meets
 * something — and this is a thing with no position at all: it resolves a whole
 * column in one call and leaves a picture with a countdown on it behind
 * (`LanceBeam` in `lance.ts`).
 */

/**
 * The lobe full, and the column burning on that very tick.
 *
 * **It fires itself.** There is no press to spend it — the owner's answer on
 * 7 September 2026 was that the hold is the whole gesture, so it goes the
 * instant the fill reaches the top and the thumb resting on the button
 * afterwards does nothing at all (`Prime.spent`).
 *
 * **And nothing leaves the ship.** The lance used to be a slow bolt that
 * travelled up the column through three bodies; the owner watched the fill and
 * said the beam itself is the weapon. So the whole column is resolved here, on
 * this tick, and what is left behind is a picture with a countdown on it
 * (`LanceBeam`) rather than an object with a position.
 *
 * `lanceFull` still goes out beside the `fire` event, and it is not a
 * duplicate: it is the one row of the information split that is not split at
 * all (docs/spec/systems.md 5.2), and audio/ has bound the moment since the
 * day the lance had a button of its own.
 */
export function releaseLance(world: World): void {
  if (world.over || !lanceReady(world)) return;
  const color = primeColor(world);
  if (color === null) return;
  spendPrime(world);
  world.lastFireTick = world.tick;
  const col = world.cannonCol;
  // The beam is spending too, and it spends once: the lobe is one colour
  // held and one column burnt, however many bodies are standing in it
  // (`spend.ts`).
  spendShot(world, color);
  // And THE LEDGER's bill for it, beside the count: a beam is one shot the
  // cannon took, so the cord charges one return for it (`ledger-shot.ts`).
  ledgerBills(world);
  world.events.push({ type: "lanceFull", col });
  world.events.push({ type: "fire", col, color, lance: true });
  // And THE BATON's turn: the beam is the navigator's act as much as a bolt
  // is, and it spends her turn the same way (`baton-press.ts`).
  batonShotSpends(world);
  world.beam = { col, color, left: beamTicks(world.cfg), topMilli: burnColumn(world, col, color) };
  // And the floor of the column, which nothing else reaches: the only answer
  // to THE UNDERTOW's tall lobes. A no-op unless that boss is installed.
  undertowBurned(world, col);
}

/**
 * Everything of one colour standing in one column, burnt at once — and how far
 * up the beam got before something stopped it, in thousandths from the top.
 *
 * **The shot it resolves through is a real `Bullet` that never enters the
 * world.** That is not a trick, it is the point: a beam meets a rock, a wrong
 * colour, a veil, a queen's petal and a worm's armoured segment in exactly the
 * ways a bolt does, and every one of those answers is already written down
 * once, in `resolve` (`bullet-hit.ts`). A second copy of them for the beam
 * would be a second copy of the whole bestiary's relationship with the cannon.
 * `lance` on it is what tells `resolve` the shot does not stop at the first
 * body it kills.
 *
 * The segment is the whole column at once — hull to the top of the field —
 * where an ordinary shot sweeps `bulletTilesPerBeat` of it per tick. Each turn
 * of the loop either ends the beam or removes a body from the field, so it
 * cannot run forever.
 */
function burnColumn(world: World, col: number, color: Color): number {
  const b: Bullet = {
    id: world.nextId++,
    col,
    row: hullRow(world.cfg) - 1,
    subMilli: 0,
    color,
    lance: true,
    driftMilli: 0,
    aimMilli: 0,
  };
  let from = bulletMilli(b);
  for (;;) {
    const hit = firstAlong(world, b, from, 0);
    const pod = firstPodAlong(world, b.col, from, 0);
    // All three can be standing in the beam — a body, a pod, THE BATON's
    // bead in flight. It reaches whichever is lower in the column first,
    // exactly as a bolt sweeping the same segment would (`bullets.ts`), and
    // the bead stops it the way a pod does: struck or rejected, the beam
    // ends there.
    const bead = batonBeadAlong(world, b, from, 0);
    if (
      bead >= 0 &&
      (!hit || bead >= creatureMilli(world, hit)) &&
      (!pod || bead >= pod.rowMilli)
    ) {
      batonStruck(world, b, bead);
      return bead;
    }
    if (pod && (!hit || pod.rowMilli > creatureMilli(world, hit))) {
      freePod(world, pod);
      return pod.rowMilli;
    }
    if (!hit) break;
    const met = creatureMilli(world, hit);
    if (!resolve(world, b, hit)) return met;
    from = met;
  }
  // Nothing left in the column, so it reaches the top of the field — where THE
  // VANE's bearing hangs and the other bosses above the grid.
  vaneStruck(world, b);
  // And THE GORGE, where the beam in the mouth is what ends the fight
  // (`gorge-step.ts`).
  gorgeStruck(world, b);
  curtainStruck(world, b);
  // And THE TASTER, where the beam in the colour the pair has spent least of
  // is the one thing that opens the closed fan (`taster-shot.ts`).
  tasterStruck(world, b);
  // And THE LEDGER's seam, which the beam widens like a bolt would.
  ledgerStruck(world, b);
  // And THE LEAD's last pass, which only a beam standing in its column ends
  // (`lead-shot.ts`).
  leadStruck(world, b);
  // And THE SCUTTLE's wind-up, which only a beam standing in the last part's
  // column ends (`scuttle-shot.ts`).
  scuttleStruck(world, b);
  // And THE ANTIPHON, to which a beam is nothing — said there, once
  // (`antiphon-shot.ts`).
  antiphonStruck(world, b);
  // And THE HIVE's breach, which the beam seals like a bolt held there
  // (`hive-shot.ts`).
  // And THE GIMBAL's leaking seam, the one thing in that whole fight a
  // cannon has to do, and either colour does it (`gimbal-shot.ts`).
  gimbalStruck(world, b);
  // And THE MANTLE's bared-core spark, the same shape and the same either
  // colour (`mantle-shot.ts`).
  mantleStruck(world, b);
  // And THE KEEL's socket and rock, the socket in its own colour (`keel-shot.ts`).
  keelStruck(world, b);
  // And THE VALVE's spark, in either colour (`valve-shot.ts`).
  valveStruck(world, b);
  // And THE SEAM's lit point or rock (`seam-shot.ts`).
  seamStruck(world, b);
  // And THE OCULUS's open socket (`oculus-shot.ts`).
  oculusStruck(world, b);
  // And THE VISE's bared kernel (`vise-shot.ts`).
  viseStruck(world, b);
  // And THE HASP's loose bolt, the same shape and the same either colour
  // (`hasp-shot.ts`).
  haspStruck(world, b);
  // And THE RATCHET's, the same again (`ratchet-shot.ts`).
  ratchetStruck(world, b);
  hiveStruck(world, b);
  return 0;
}
