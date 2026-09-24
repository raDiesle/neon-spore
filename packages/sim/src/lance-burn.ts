import { antiphonStruck } from "./antiphon-shot.js";
import { batonBeadAlong, batonShotSpends, batonStruck } from "./baton-press.js";
import { isBeatTick } from "./beat-clock.js";
import { resolve } from "./bullet-hit.js";
import { candleStruck } from "./candle-step.js";
import { hullRow } from "./config.js";
import { curtainStruck } from "./curtain-shot.js";
import { diastoleStruck } from "./diastole-step.js";
import { gimbalStruck } from "./gimbal-shot.js";
import { gorgeStruck } from "./gorge-step.js";
import { haspStruck } from "./hasp-shot.js";
import { hiveStruck } from "./hive-shot.js";
import { beamTicks, lanceReady, primeColor, spendPrime } from "./lance.js";
import { leadStruck } from "./lead-shot.js";
import { ledgerBills, ledgerStruck } from "./ledger-shot.js";
import { bulletMilli, creatureMilli } from "./mid-beat.js";
import { orreryStruck } from "./orrery-shot.js";
import { firstPodAlong, freePod } from "./pods.js";
import { ratchetStruck } from "./ratchet-shot.js";
import { scuttleStruck } from "./scuttle-shot.js";
import { firstAlong } from "./shot-reach.js";
import { spendShot } from "./spend.js";
import { tasterStruck } from "./taster-shot.js";
import type { Bullet, Color } from "./types.js";
import { undertowBurned } from "./undertow-press.js";
import { vaneStruck } from "./vane.js";
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
/**
 * **The beat the beam goes off on**, which is not always `world.beat`.
 *
 * `releaseLance` runs *before* `onBeat` in `step.ts`, deliberately — the lobe
 * fills on the tick counter, so the tick it comes full on is that one whatever
 * else happens next. The cost of that order is here: a fill that tops out on a
 * boundary tick burns its column while the counter still reads the beat that
 * has just ended, and a pair who started the fill exactly `lancePrimeBeats`
 * before a beat they had counted to would be judged one beat early. Nothing
 * could tell until THE DIASTOLE, which is the first thing in the game to read
 * the *beat* off a beam rather than only the column (`diastole-step.ts`).
 *
 * Not `beat-clock.ts`'s forbidden arithmetic, and the difference matters: that
 * file refuses to turn a beat back into a tick, because `world.beat` is a label
 * and a label multiplied is silently a different moment. This does the legal
 * direction — it reads the label and adds the beat `step` is about to count
 * three lines further down.
 */
export function beamBeat(world: World): number {
  return world.beat + (isBeatTick(world.cfg, world.tick) ? 1 : 0);
}

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
  // VANE's bearing hangs and THE DIASTOLE's twin lobe, the two things above the
  // grid at all. The beam is the only shot that reaches a chamber once both are
  // beating, and `b.lance` is how `diastoleStruck` knows it is one
  // (`diastole-step.ts`).
  vaneStruck(world, b);
  diastoleStruck(world, b, beamBeat(world));
  // And THE ORRERY, where the beam is the only thing that finishes the fight:
  // a naked core takes the lance and nothing else (`orrery-shot.ts`).
  orreryStruck(world, b, beamBeat(world));
  // And THE CANDLE, which the beam dims like a shot would (`candle-step.ts`).
  candleStruck(world, b);
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
  // And THE HASP's loose bolt, the same shape and the same either colour
  // (`hasp-shot.ts`).
  haspStruck(world, b);
  // And THE RATCHET's, the same again (`ratchet-shot.ts`).
  ratchetStruck(world, b);
  hiveStruck(world, b);
  return 0;
}
