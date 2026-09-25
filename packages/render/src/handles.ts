import { antiphonOrganUnder } from "./antiphon-grip.js";
import { antiphonRailUnder } from "./antiphon-rail-grip.js";
import { batonSocketUnder } from "./baton-grip.js";
import { curtainHemUnder } from "./curtain-grip.js";
import { filamentGrabUnder } from "./filament-grip.js";
import { fleetGripUnder } from "./fleet-grip.js";
import { gaugeGripUnder } from "./gauge-grip.js";
import { gimbalRingUnder } from "./gimbal-grip.js";
import { gorgeGripUnder } from "./gorge-grip.js";
import { lidCordUnder, mazeStringUnder, wardenRopeUnder } from "./handles-cords.js";
import { balloonHandleUnder, choirArrowUnder } from "./handles-pairs.js";
import { haspHandleUnder, haspRimUnder } from "./hasp-grip.js";
import { hiveLobeUnder } from "./hive-grip.js";
import { instarMarkUnder } from "./instar-mark-grip.js";
import type { Layout } from "./layout.js";
import { leadStalkUnder } from "./lead-grip.js";
import { ledgerGripUnder } from "./ledger-grip.js";
import { ledgerPullUnder } from "./ledger-pull.js";
import { mazeHeartUnder } from "./maze-grip.js";
import { mirrorLobeUnder } from "./mirror-grip.js";
import { pinballGripUnder } from "./pinball-grip.js";
import { pulseMeterUnder } from "./pulse-grip.js";
import { queenMarkUnder } from "./queen-grip.js";
import { ratchetCatchUnder, ratchetPawlUnder } from "./ratchet-grip.js";
import { scoutGripUnder } from "./scout-grip.js";
import { scuttlePartUnder } from "./scuttle-grip.js";
import { sinewHandleUnder } from "./sinew-handles.js";
import { snakeGripUnder } from "./snake-grip.js";
import { spoolBrakeUnder } from "./spool-grip.js";
import { stareLidUnder } from "./stare-lid.js";
import { surgeBulbUnder } from "./surge-grip.js";
import { tasterGripUnder } from "./taster-grip.js";
import { throatGripUnder } from "./throat-grip.js";
import type { Field, Touch } from "./touch.js";
import { undertowGripUnder } from "./undertow-grip.js";
import { vaneGripUnder } from "./vane-grip.js";
import { wardenGripUnder } from "./warden-grip.js";

/**
 * The handles: the things drawn **on the field** that a hand takes hold of and
 * carries, as opposed to the strips and lobes below the band.
 *
 * THE SINEW's pair lives with its drawing in `sinew-handles.ts`: the rest a
 * thumb is answered at is the rest the ring is drawn from, and one file keeps
 * them one fact.
 * THE SURGE's bulb is the first taken by both seats at once, in
 * `surge-grip.ts` for the same reason. THE ANTIPHON's organ is next, on
 * the one screen that shows it, in `antiphon-grip.ts`.
 *
 * There were three of them here — THE MAZE's string, THE WARDEN's rope and THE
 * LID's cord, now in `handles-cords.ts` — and that is why they were here rather than in `touch.ts` next
 * door: each answers the same shape of question (is this seat allowed, is this
 * round running, is the press inside the resting circle) and none is a
 * creature, so the file that owns the decision table for the whole control
 * scheme was carrying three copies of one idea and had reached its length
 * limit doing it. **The two that come in pairs** — THE CHOIR's arrows and THE
 * BALLOON's handles — went next door to `handles-pairs.ts` when THE BATON's
 * socket took this file over the same limit again; nothing about the order
 * they are asked in moved with them.
 *
 * **Asked before anything else on the field**, because a handle hangs over the
 * field the creatures fall through and a hand on it is not a hand on whatever
 * is behind it.
 *
 * Every circle here is the **resting** one, never where the handle has swung
 * to. By the time it has swung, the pointer is captured and nothing is
 * hit-tested again — and a circle that moved under the finger would be a
 * control you could only grab while it was doing nothing.
 *
 * It imports its types from `touch.ts` and `touch.ts` imports this function
 * back. The types are erased, so there is no cycle at runtime: what is left is
 * one direction, the decision table calling the handles.
 */
export function handleUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  return (
    mazeStringUnder(l, x, y, field) ??
    wardenRopeUnder(l, x, y, field) ??
    wardenGripUnder(l, x, y, field) ?? // THE WARDEN's eye under NARROW and GLARE (`warden-grip.ts`).
    lidCordUnder(l, x, y, field) ??
    balloonHandleUnder(l, x, y, field) ??
    choirArrowUnder(l, x, y, field) ??
    sinewHandleUnder(l, x, y, field) ??
    surgeBulbUnder(l, x, y, field) ??
    antiphonOrganUnder(l, x, y, field) ??
    // THE GIMBAL's rim, and the only handle in the game **both** seats have one
    // of at once: the outer ring is the pilot's and the inner the navigator's,
    // and geometry is what says so (`gimbal-grip.ts`).
    gimbalRingUnder(l, x, y, field) ??
    instarMarkUnder(l, x, y, field) ??
    filamentGrabUnder(l, x, y, field) ??
    stareLidUnder(l, x, y, field) ??
    queenMarkUnder(l, x, y, field) ?? // THE BULB QUEEN's marks, under BROOD and SCREAM (`queen-grip.ts`).
    mirrorLobeUnder(l, x, y, field) ?? // THE MIRROR's two lobes, its last round and its pin (`mirror-grip.ts`).
    gorgeGripUnder(l, x, y, field) ?? // THE GORGE's pinch and pry, the full intakes and the mouth (`gorge-grip.ts`).
    mazeHeartUnder(l, x, y, field) ?? // THE MAZE's heart under `grip`, the navigator's tear (`maze-grip.ts`).
    gaugeGripUnder(l, x, y, field) ?? // THE GAUGE's jammed needle and wound band (`gauge-grip.ts`).
    batonSocketUnder(l, x, y, field) ?? // THE BATON's swelling socket and its two beads (`baton-grip.ts`).
    fleetGripUnder(l, x, y, field) ?? // THE FLEET's wound, under `flood` and `wreck` (`fleet-grip.ts`).
    curtainHemUnder(l, x, y, field) ?? // THE CURTAIN's hem, while a hit has jammed the rail (`curtain-grip.ts`).
    leadStalkUnder(l, x, y, field) ?? // THE LEAD's stalk, while the body stands still (`lead-grip.ts`).
    scuttlePartUnder(l, x, y, field) ?? // THE SCUTTLE's hanging parts, while one may still be carried (`scuttle-grip.ts`).
    hiveLobeUnder(l, x, y, field) ?? // THE HIVE's clenched underside, or a swelling lobe (`hive-grip.ts`).
    pulseMeterUnder(l, x, y, field) ?? // THE PULSE's own bar, while it is not steady (`pulse-grip.ts`).
    vaneGripUnder(l, x, y, field) ?? // THE VANE's swinging arm and the housing under its hub (`vane-grip.ts`).
    throatGripUnder(l, x, y, field) ?? // THE THROAT's slack ring and the tube under its mouth (`throat-grip.ts`).
    snakeGripUnder(l, x, y, field) ?? // SNAKE's stuck jaws and dragging tail, on the body itself (`snake-grip.ts`).
    undertowGripUnder(l, x, y, field) ?? // THE UNDERTOW's pin on a standing lobe and the free over the stuck pilot (`undertow-grip.ts`).
    scoutGripUnder(l, x, y, field) ?? // THE SCOUT's line on a laden ship and the prime off a heavy one's stern (`scout-grip.ts`).
    pinballGripUnder(l, x, y, field) ?? // PINBALL's plunger on a slack spring and the shove on a table in flight (`pinball-grip.ts`).
    // THE TASTER's pin on a blade that has not decided, wipe across a gap a
    // blade is gone from, and pry on the closed interlock — one per movement,
    // so no two of the three are ever offered together (`taster-grip.ts`).
    tasterGripUnder(l, x, y, field) ??
    // THE LEDGER's one ring on the root of its cord, the navigator's both
    // times: the foot of the cord while it is still `rooting`, her thumb in
    // the socket from `paying` on (`ledger-grip.ts`).
    ledgerGripUnder(l, x, y, field) ??
    ledgerPullUnder(l, x, y, field) ?? // And the pilot's two on the cord above it (`ledger-pull.ts`).
    antiphonRailUnder(l, x, y, field) ?? // THE ANTIPHON's rail, the navigator's crossings-off (`antiphon-rail-grip.ts`).
    haspHandleUnder(l, x, y, field) ?? // THE HASP's latch, the pilot's, while a clasp is lit and his hand not burnt (`hasp-grip.ts`).
    haspRimUnder(l, x, y, field) ?? // And its wheel, the navigator's, turned about the hub (`hasp-grip.ts`).
    spoolBrakeUnder(l, x, y, field) ?? // THE SPOOL's brake, the pilot's, until the casing goes slack (`spool-grip.ts`).
    ratchetCatchUnder(l, x, y, field) ?? // THE RATCHET's catch, the navigator's, carried down its rail (`ratchet-grip.ts`).
    ratchetPawlUnder(l, x, y, field) // And its pawl, the pilot's, pressed on her SET (`ratchet-grip.ts`).
  );
}

// **Where a handle is standing**, as against where a finger may grab one, is
// `handle-place.ts` next door — cut out when THE BALLOON's two took this file
// over its limit, along the seam the header above already draws. Re-exported
// here so nothing that reached for `handleCircle` through this file had to
// move.
export { handleCircle } from "./handle-place.js";
