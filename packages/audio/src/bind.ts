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
import { balloonCue } from "./bind-balloon.js";
import { beatboxCue } from "./bind-beatbox.js";
import { breachCue } from "./bind-breach.js";
import { caromCue } from "./bind-carom.js";
import { choirCue } from "./bind-choir.js";
import { choreographedCue } from "./bind-choreographed.js";
import { clingCue } from "./bind-cling.js";
import { coilCue } from "./bind-coil.js";
import { crawlerCue } from "./bind-crawler.js";
import { creatureCue } from "./bind-creatures.js";
import type { Cue } from "./bind-cue.js";
import { fenceCue } from "./bind-fence.js";
import { fleetCue, isFleetEvent } from "./bind-fleet.js";
import { gumCue } from "./bind-gum.js";
import { handedCue } from "./bind-handed.js";
import { impactCue } from "./bind-impact.js";
import { mirrorCue } from "./bind-mirror.js";
import { panForCol, pitchForRow } from "./bind-place.js";
import { podCue } from "./bind-pod.js";
import { spliceCue } from "./bind-splice.js";
import { stareCue } from "./bind-stare.js";
import { volleyCue } from "./bind-volley.js";
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
  switch (e.type) {
    case "beat":
      return { id: e.beat % 4 === 0 ? "beat.accent" : "beat.tick" };
    case "waveStart":
      return { id: "ui.waveOpen" };
    case "needWave":
      return null;
    case "waveFailed":
      // The alarm that used to repeat while the hull was low. A hit is the
      // wave lost now (`sim/wave-fail.ts`), and that is what it says.
      return { id: "hull.alarm" };
    case "quit":
      // Leaving, in the menu's own word for it: the run is being walked out
      // of, on both phones, and the other one hears the door.
      return { id: "ui.menuBack" };
    case "fire":
      // A lance is a different sound, not a louder one: the pair spent three
      // beats of held thumb and a silence on it, and it has to be audible that
      // what left the lobe was the thing they were waiting for.
      if (e.lance) return { id: "signal.markHit", pan: panForCol(e.col, cols) };
      return {
        id: e.color === "red" ? "ship.fireRed" : "ship.fireCyan",
        pan: panForCol(e.col, cols),
      };
    case "lanceFull":
      return { id: "signal.markSet", pan: panForCol(e.col, cols) };
    case "lanceSpilled":
      return { id: "signal.markMissed", pan: panForCol(e.col, cols) };
    case "shotOut":
      // The bolt was heard leaving; what it flies on into is sky, and a boss
      // that took it up there says so in its own event.
      return null;
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
    case "grip":
      return { id: "ship.gripTake", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
    // THE PUSH, the same hand's second gesture. Deliberately not another
    // `ship.gripTake`: the pair has already heard the grab, and a carry that
    // sounded like one would say a hand had landed on something new. What the
    // seat without the thumb on it needs is the *column*, which the pan says —
    // and the direction, which lifts or drops it about a semitone on top of
    // the row's own pitch. Neither is visible to an eye on the other half of
    // the screen, and both are what the pair is about to say aloud.
    case "carry":
      return {
        id: "ship.gripCarry",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows) * (e.dir === 1 ? 1.06 : 0.94),
      };
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
    // THE STARE's catch and its lid, none of them panned (`bind-stare.ts`).
    case "stareCaught":
    case "stareShut":
    case "stareOpen":
      return stareCue(e);
    // THE BULB QUEEN's two, with THE WARDEN's in `bind-warden.ts`.
    case "queenDown":
    case "queenFlinch":
      return wardenCue(e, cols, rows);
    // THE MIRROR's five and THE MAZE's five, in `bind-mirror.ts`: the two rounds that are a call and an answer rather than a body meeting a shot.
    case "mirrorShow":
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    case "mirrorGrip":
    case "mazeCommit":
    case "mazeProbe":
    case "mazeVerdict":
    case "mazeDown":
    case "mazeGrip":
      return mirrorCue(e, cols);
    case "spliceFeed":
    case "spliceFed":
    case "spliceWrong":
    case "spliceDown":
      return spliceCue(e, cols);
    // What a covering did — armour chipping, a membrane coming off, a cage
    // buckling, a crust cracking, a body turning at a wall — and, below it,
    // what a body one of them cannot see did: a disguise going, a cloud
    // shutting or opening, a tile expiring. `bind-creatures.ts` next door,
    // listed case by case rather than reached through a `default`: a default
    // would have taken the exhaustiveness of this switch with it, and the
    // exhaustiveness is what makes a new event a compile error here instead of
    // a silence nobody hears.
    case "shellBreak":
    case "shellBare":
    case "rindShed":
    case "recoilBounce":
    case "claspBreak":
    case "veilMorph":
    case "veilRebuff":
    case "veilTorn":
    case "lureHit":
    case "lureSeen":
    case "lureVanished":
    case "wispHop":
    case "ghostRelease":
    case "ghostTurn":
    case "ghostCharge":
    case "strandBead":
    case "strandSwell":
    case "magnetPlate":
    // A bolt spent on a body the cannon cannot answer, which sounds like the
    // one spent on a magnet's plate and for the same reason (`bind-creatures.ts`).
    case "bounce":
    case "magnetBreak":
      return creatureCue(e, cols, rows);
    // Each group below lives in its own `bind-*.ts`, cut out the way its
    // events were cut out of `events-creature.ts`, and **named here rather
    // than reached through a default** — a new event is a compile error.
    case "coilBreak":
    case "coilJump":
      return coilCue(e, cols, rows);
    case "choirArm":
    case "choirMerge":
    case "choirOpen":
    case "choirSing":
      return choirCue(e, cols, rows);
    case "balloonSplit":
    case "balloonPop":
    case "balloonTopped":
      return balloonCue(e, cols, rows);
    case "gumFlung":
      return gumCue(e, cols, rows);
    case "clingGrip":
    case "clingFreed":
    case "clingBlast":
      return clingCue(e, cols);
    // The four a hand answers, in `bind-handed.ts` — about a thumb, not a shot.
    case "weightCrushed":
    case "cairnPulled":
    case "cairnShed":
    case "cairnHeld":
      return handedCue(e, cols, rows);
    case "caromBounce":
    case "caromCrack":
    case "caromEject":
    case "chuteOpen":
    case "chuteCut":
    case "crystalBounce":
    case "crystalCatch":
    case "crystalSplit":
      return caromCue(e, cols, rows);
    // THE BEATBOX's three, in `bind-beatbox.ts` — about a rhythm, not a shot.
    case "beatboxTap":
    case "beatboxWave":
    case "beatboxSilent":
      return beatboxCue(e, cols, rows);
    case "fencePass":
    case "fenceBurn":
      return fenceCue(e, cols, rows);
    case "volleyReturn":
    case "volleyHatch":
    case "shieldPush":
      return volleyCue(e, cols, rows);
    // THE BATON's seven and THE UNDERTOW's nine, in `bind-choreographed.ts`:
    // the branch is narrowed by every case above it, so an event this switch
    // does not name and that file does not take fails to type.
    default:
      return choreographedCue(e, cols);
  }
}
