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
import { caromCue } from "./bind-carom.js";
import { crawlerCue } from "./bind-crawler.js";
import { creatureCue } from "./bind-creatures.js";
import { fleetCue } from "./bind-fleet.js";
import { MIRROR_STEP_SOUNDS, POD_TAKEN_SOUNDS } from "./bind-lookups.js";
import { volleyCue } from "./bind-volley.js";

export interface Cue {
  id: string;
  /** -1..1 across the field, or undefined for something with no column. */
  pan?: number;
  /** Multiplies every frequency — how a row becomes a pitch. */
  pitch?: number;
  gain?: number;
  /**
   * The one seat this cue belongs to, or absent for the overwhelming majority
   * that belong to both. Both players hear everything (`docs/spec/systems.md`
   * 5.3) and that is still the rule — this is the exception THE LURE forced,
   * and it exists because the two of them are in one room: a sound made on
   * both phones is a sound the player who is not supposed to have it hears
   * anyway. `Mixer` drops a seated cue unless it has been told which seat it
   * is, so a device that was never told stays silent rather than leaking.
   */
  seat?: 1 | 2;
  /**
   * Beats to hold this cue back by, or absent for the overwhelming majority
   * that sound the moment they are bound.
   *
   * THE FLEET is the only thing that uses it, and it uses it because its shot
   * is no longer resolved where it is heard: the salvo is decided on the tick
   * the thumb lands, and the shell is drawn arcing over the water for
   * `FLEET_SHELL_BEATS` before it reaches the square. A splash that sounded on
   * the press would close the water over a shell still climbing. In beats
   * rather than seconds because the tempo is the game's clock and only the
   * mixer knows it (`Mixer.frame`).
   */
  delayBeats?: number;
}

/** A column as a stereo position. The edges stop short of hard left and right. */
export function panForCol(col: number, cols: number): number {
  if (cols <= 1) return 0;
  return ((col / (cols - 1)) * 2 - 1) * 0.75;
}

/**
 * Higher up the field is higher in pitch — the same mapping the radar makes
 * with length. It is a small range on purpose: a fifth across the whole field,
 * so a sound is still recognisably itself wherever it happens.
 */
export function pitchForRow(row: number, rows: number): number {
  if (rows <= 1) return 1;
  const t = 1 - Math.min(1, Math.max(0, row / (rows - 1)));
  return 1 + t * 0.5;
}

// The two id-to-id lookups this file reads are `bind-lookups.ts` next door,
// cut out when THE CRAWLER took this one over its limit: they are data, and
// everything here is an argument about which sound a moment deserves.

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
    case "mirrorShow":
      return { id: MIRROR_STEP_SOUNDS[e.step] ?? "mirror.handover", pan: panForCol(e.col, cols) };
    case "mirrorEcho":
      // Each step answered sits a little higher than the one before it, so a
      // long round is heard to be going well without anyone saying so.
      return { id: "mirror.echo", pitch: 1 + (e.index - 1) * 0.06 };
    case "mirrorVerdict":
      if (e.right) return { id: "mirror.verdictRight", pan: panForCol(e.col, cols) };
      return {
        id:
          e.reason === "bait"
            ? "mirror.bait"
            : e.reason === "silence"
              ? "mirror.silence"
              : "mirror.verdictWrong",
        pan: panForCol(e.col, cols),
      };
    case "mirrorDown":
      return { id: "mirror.down", pan: panForCol(e.col, cols) };
    case "mazeCommit":
      // The shot going into a mouth. `mirror.handover` is the cue written for
      // "your turn is over, the answer is out of your hands now", which is
      // exactly what committing to a mouth is.
      return { id: "mirror.handover", pan: panForCol(e.col, cols) };
    case "mazeProbe":
      // One cell further in, and a step higher each time, so a shot still
      // travelling is heard to be getting somewhere without anyone saying so.
      return { id: "mirror.echo", pitch: 1 + e.ring * 0.06 };
    case "mazeVerdict":
      if (e.right) return { id: "mirror.verdictRight", pan: panForCol(e.col, cols) };
      return {
        id: e.reason === "silence" ? "mirror.silence" : "mirror.verdictWrong",
        pan: panForCol(e.col, cols),
      };
    case "mazeDown":
      return { id: "mirror.down", pan: panForCol(e.col, cols) };
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
    // shutting or opening, a tile expiring. `bind-armour.ts` and
    // `bind-creatures.ts` next door, listed case by case rather than reached
    // through a `default`: a default would have taken the exhaustiveness of
    // this switch with it, and the exhaustiveness is what makes a new event a
    // compile error here instead of a silence nobody hears.
    case "shellBreak":
    case "shellBare":
    case "rindShed":
    case "recoilBounce":
    case "claspBreak":
    case "lureHit":
    case "lureSeen":
    case "lureVanished":
    case "veilMorph":
    case "veilRebuff":
    case "veilTorn":
    case "wispHop":
    case "ghostRelease":
    case "ghostTurn":
    case "ghostCharge":
    case "strandBead":
    case "strandSwell":
      return creatureCue(e, cols, rows);
    // THE CAROM's four, in `bind-carom.ts` — one arrival taken apart, cut out
    // of `bind-creatures.ts` the way `events-carom.ts` is cut out of
    // `events-creature.ts`. Named here rather than reached through a default,
    // for the reason every other case in this switch is: the exhaustiveness is
    // what makes a new event a compile error instead of a silence.
    case "caromBounce":
    case "caromCrack":
    case "caromEject":
    case "chuteOpen":
    case "chuteCut":
      return caromCue(e, cols, rows);
    // THE VOLLEY's two, on exactly the same terms and in `bind-volley.ts`.
    case "volleyReturn":
    case "volleyHatch":
      return volleyCue(e, cols, rows);
  }
}
