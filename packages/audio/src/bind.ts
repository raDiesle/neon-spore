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
import { chokeCue } from "./bind-choke.js";
import { coilCue } from "./bind-coil.js";
import { crawlerCue } from "./bind-crawler.js";
import { creatureCue } from "./bind-creatures.js";
import type { Cue } from "./bind-cue.js";
import { fenceCue } from "./bind-fence.js";
import { fleetCue } from "./bind-fleet.js";
import { gumCue } from "./bind-gum.js";
import { POD_TAKEN_SOUNDS } from "./bind-lookups.js";
import { mirrorCue } from "./bind-mirror.js";
import { panForCol, pitchForRow } from "./bind-place.js";
import { volleyCue } from "./bind-volley.js";

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
  switch (e.type) {
    case "beat":
      return { id: e.beat % 4 === 0 ? "beat.accent" : "beat.tick" };
    case "waveStart":
      return { id: "ui.waveOpen" };
    case "needWave":
      return null;
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
    // A ring off a crawler shares this exactly. The eye was given a burst of
    // its own because a sac coming apart does not look like a slick going out
    // (`events-crawler.ts`); the ear was not, because it *is* a kill and the
    // pair has spent the whole game learning what one sounds like.
    case "crawlerBreak":
    case "destroy":
      return {
        id: e.color === "red" ? "impact.destroyRed" : "impact.destroyCyan",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "hole":
      return { id: "impact.hole", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
    case "reject":
      return { id: "impact.reject", pan: panForCol(e.col, cols) };
    case "deflect":
      return { id: "impact.deflect", pan: panForCol(e.col, cols) };
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
    case "podLoose":
      return { id: "pod.loose", pan: panForCol(e.col, cols) };
    case "podTaken":
      return { id: POD_TAKEN_SOUNDS[e.kind] ?? "pod.takenMend", pan: panForCol(e.col, cols) };
    case "podLost":
      return { id: "pod.lost", pan: panForCol(e.col, cols) };
    case "breach":
      return breachCue(e, cols);
    case "tether":
      // A rope coming down out of the rim. Both screens hear it, and only one
      // of them has a hand free to answer it.
      return { id: "boss.wardenTether", pan: panForCol(e.col, cols) };
    case "eyeOpen":
      // The one cue written for this boss: a door in something enormous. It
      // fires when the rope comes fully taut, which is the moment player 2 has
      // been waiting on and cannot feel.
      return { id: "boss.warden", pan: panForCol(e.col, cols) };
    case "plate":
      return {
        id: "boss.wardenPlate",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
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
    case "wardenDown":
      return { id: "boss.queenDown", pan: panForCol(e.col, cols) };
    case "petal":
      return { id: "impact.petal", pan: panForCol(e.col, cols) };
    case "queenDown":
      return { id: "boss.queenDown", pan: panForCol(e.col, cols) };
    // THE MIRROR's four and THE MAZE's four, in `bind-mirror.ts`: the two
    // rounds that are a call and an answer rather than a body meeting a shot.
    case "mirrorShow":
    case "mirrorEcho":
    case "mirrorVerdict":
    case "mirrorDown":
    case "mazeCommit":
    case "mazeProbe":
    case "mazeVerdict":
    case "mazeDown":
      return mirrorCue(e, cols);
    // THE FLEET's five, in `bind-fleet.ts`: they carry more of the fight than
    // any other row in the catalogue, and four of the five are held back by
    // the shell's flight rather than sounding where they are bound.
    case "fleetSalvo":
    case "fleetSplash":
    case "fleetHit":
    case "fleetSunk":
    case "fleetDown":
      return fleetCue(e, cols, rows);
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
    case "balloonBurst":
      return balloonCue(e, cols, rows);
    case "gumStick":
    case "gumBlock":
    case "gumFlung":
    case "gumSpread":
      return gumCue(e, cols, rows);
    case "chokeGrip":
    case "chokeTap":
    case "chokeFreed":
      return chokeCue(e, cols);
    case "caromBounce":
    case "caromCrack":
    case "caromEject":
    case "chuteOpen":
    case "chuteCut":
    case "crystalBounce":
    case "crystalDive":
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
      return volleyCue(e, cols, rows);
  }
}
