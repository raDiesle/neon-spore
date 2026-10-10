/**
 * What the simulation reported, as a sound.
 *
 * This is the only file in the package that knows what a `SimEvent` is, and it
 * is pure — it returns ids and pan positions, and plays nothing. `mixer.ts`
 * does the playing, and the tests read this file directly, which is how the
 * catalogue can be checked for gaps without a browser.
 *
 * The pan is the column something happened in. Both players hear everything
 * (`docs/spec/systems.md` 5.3), so the ear is the fastest way to know *where* —
 * faster than the eye finding a tile, and much faster than a sentence.
 */

import type { SimEvent } from "@neon-spore/sim";
import { breachCue } from "./bind-breach.js";
import { choreographedCue } from "./bind-choreographed.js";
import { crawlerCue } from "./bind-crawler.js";
import { creatureCue, isCreatureEvent } from "./bind-creatures.js";
import type { Cue } from "./bind-cue.js";
import { fieldCue, isFieldEvent } from "./bind-field.js";
import { fleetCue, isFleetEvent } from "./bind-fleet.js";
import { impactCue } from "./bind-impact.js";
import { mirrorCue } from "./bind-mirror.js";
import { panForCol } from "./bind-place.js";
import { podCue } from "./bind-pod.js";
import { isShipEvent, shipCue } from "./bind-ship.js";
import { spliceCue } from "./bind-splice.js";
import { stareCue } from "./bind-stare.js";
import { wardenCue } from "./bind-warden.js";

// **What a cue is** is `bind-cue.ts` and **where a sound is** is
// `bind-place.ts`, re-exported here for every `bind-*.ts` file.
export type { Cue } from "./bind-cue.js";
export { panForCol, pitchForRow } from "./bind-place.js";

/**
 * One event, one cue, or none. `needWave` is bookkeeping between the host and
 * the sim rather than something that happened on the field, so it is silent by
 * design — the wave it leads to says so itself with `ui.waveOpen`.
 */
export function cueFor(e: SimEvent, cols: number, rows: number): Cue | null {
  // THE FLEET's ten, read by their guard rather than as ten cases here: the
  // family carries more of the fight than any other and `bind-fleet.ts` is it.
  if (isFleetEvent(e)) return fleetCue(e, cols, rows);
  // The ship's own six and one body's twenty, each family behind its guard in
  // `bind-ship.ts` and `bind-creatures.ts`. A guard narrows the rest of the
  // switch as a case does, so a new event is still a compile error below.
  if (isShipEvent(e)) return shipCue(e, cols, rows);
  if (isCreatureEvent(e)) return creatureCue(e, cols, rows);
  // The creatures with a `bind-*.ts` each — the coil to the volley — behind
  // one guard in `bind-field.ts`, where the next one's cue goes.
  if (isFieldEvent(e)) return fieldCue(e, cols, rows);
  switch (e.type) {
    case "beat":
      return { id: e.beat % 4 === 0 ? "beat.accent" : "beat.tick" };
    case "waveStart":
      return { id: "ui.waveOpen" };
    case "needWave":
      return null;
    case "pinRefuse":
      // The wrong seat's thumb on PINBALL's plunger or table, panned to the
      // end of the band the ring stands at (`pinball-grip.ts`).
      return { id: "boss.instarRefuse", pan: panForCol(e.part === "plunger" ? cols - 1 : 0, cols) };
    case "scoutRefuse":
      // The wrong seat's thumb on THE SCOUT's line or prime, with no pan for
      // `bind-scout-hand.ts`' reason: the ship is a point, not a lane.
      return { id: "boss.instarRefuse", pan: 0 };
    case "waveFailed":
      // The alarm that used to repeat while the hull was low. A hit is the
      // wave lost now (`sim/wave-fail.ts`), and that is what it says.
      return { id: "hull.alarm" };
    case "quit":
      // Leaving, in the menu's own word for it: the run is being walked out
      // of, on both phones, and the other one hears the door.
      return { id: "ui.menuBack" };
    // The ship's own, in `bind-ship.ts`: a bolt leaving, a lance filling or
    // spilling, and the grip's two gestures.
    // The six a shot meeting a body makes, in `bind-impact.ts` — the most
    // played group in the catalogue, and the one `bind.ts` had the least room
    // left to explain.
    case "crawlerBreak":
    case "destroy":
    case "hole":
    case "reject":
    case "deflect":
    case "petal":
      return impactCue(e, cols, rows);
    // The maw, in `bind-pod.ts`: a pod freed, taken or broken, and the husk
    // that is the same arrival paying the other way.
    case "podLoose":
    case "podTaken":
    case "podLost":
    case "huskRefused":
    case "huskSwallowed":
      return podCue(e, cols);
    case "breach":
      return breachCue(e, cols);
    // THE WARDEN's four, in `bind-warden.ts`: a rope, a door, a plate, and
    // the last plate.
    case "tether":
    case "eyeOpen":
    case "plate":
    case "wardenDown":
      return wardenCue(e, cols, rows);
    // THE CRAWLER's two endings, in `bind-crawler.ts`, on the same terms.
    case "crawlerBeam":
    case "crawlerBurrow":
      return crawlerCue(e, cols);
    case "gyreBroke":
    case "strandBroke":
      // A mechanism letting go rather than a body dying, and the one cue in
      // the catalogue written for exactly that — "something structural
      // failing over a second and a half". A wheel with nothing left on its
      // rim is one; so is a thread with nothing alive left on it, which is why
      // the two share a case rather than each naming the same sound.
      return { id: "ruin.collapse", pan: panForCol(e.col, cols) };
    // THE STARE's beats, its catch, its charge, its lashes and its climb, none of them
    // panned (`bind-stare.ts`).
    case "stareBeat":
    case "stareCaught":
    case "stareRise":
    case "stareCharge":
    case "stareLash":
    case "stareDeflect":
    case "stareVent":
    case "stareBlast":
    case "stareOut":
      return stareCue(e);
    // THE BULB QUEEN's five, with THE WARDEN's in `bind-warden.ts`.
    case "queenDown":
    case "queenFlinch":
    case "queenPry":
    case "queenHold":
    case "queenRefuse":
      return wardenCue(e, cols, rows);
    // THE MIRROR's seven and THE MAZE's six, in `bind-mirror.ts`: the two rounds that are a call and an answer rather than a body meeting a shot.
    case "mirrorShow":
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    case "mirrorGrip":
    case "mirrorTouch":
    case "mirrorRefuse":
    case "mazeCommit":
    case "mazeProbe":
    case "mazeVerdict":
    case "mazeDown":
    case "mazeGrip":
    case "mazeRefuse":
      return mirrorCue(e, cols);
    case "spliceFeed":
    case "spliceFed":
    case "spliceWrong":
    case "spliceDown":
      return spliceCue(e, cols);
    // THE BATON's seven and THE UNDERTOW's nine, in `bind-choreographed.ts`:
    // the branch is narrowed by every case above it, so an event this switch
    // does not name and that file does not take fails to type.
    default:
      return choreographedCue(e, cols);
  }
}
