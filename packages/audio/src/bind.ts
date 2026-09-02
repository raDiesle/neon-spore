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
import { creatureCue } from "./bind-creatures.js";

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

const MIRROR_STEP_SOUNDS: Record<string, string> = {
  fireRed: "mirror.showFireRed",
  fireCyan: "mirror.showFireCyan",
  guard: "mirror.showGuard",
  intake: "mirror.showIntake",
  cannonLeft: "mirror.showCannonLeft",
  cannonRight: "mirror.showCannonRight",
};

const POD_TAKEN_SOUNDS: Record<string, string> = {
  mend: "pod.takenMend",
  purge: "pod.takenPurge",
  ward: "pod.takenWard",
};

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
      // The split is by what it cost, not by what hit: the pair needs to know
      // how bad it was before it needs to know what did it.
      return {
        id: e.damage >= 8000 ? "hull.breachHeavy" : "hull.breachLight",
        pan: panForCol(e.col, cols),
      };
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
    case "gyreBroke":
      // A mechanism letting go rather than a body dying, and the one cue in
      // the catalogue written for exactly that — "something structural
      // failing over a second and a half". It was spare, kept for a boss
      // coming apart after it is already dead, which is what a wheel with
      // nothing left on its rim is.
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
    // THE FLEET's chart. Every one of them is panned to its column and pitched
    // to its row, which is the only place in the game where that pairing is
    // load-bearing rather than decoration: the seat holding the sights is
    // shown no ships at all, so where a salvo landed is a thing they hear
    // before they see it (`fleet-hulls.ts`).
    case "fleetSplash":
      return {
        id: "boss.fleetSplash",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "fleetHit":
      return {
        id: "boss.fleetHit",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "fleetSunk":
      return { id: "boss.fleetSunk", pan: panForCol(e.col, cols) };
    case "fleetDown":
      return { id: "boss.fleetDown", pan: panForCol(e.col, cols) };
    // Everything one body did — armour chipping, a covering coming off, a
    // disguise going, a cloud shutting or opening. `bind-creatures.ts` next
    // door, listed case by case rather than reached through a `default`: a
    // default would have taken the exhaustiveness of this switch with it, and
    // the exhaustiveness is what makes a new event a compile error here
    // instead of a silence nobody hears.
    case "shellBreak":
    case "shellBare":
    case "rindShed":
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
      return creatureCue(e, cols, rows);
  }
}
