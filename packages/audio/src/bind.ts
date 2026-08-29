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

export interface Cue {
  id: string;
  /** -1..1 across the field, or undefined for something with no column. */
  pan?: number;
  /** Multiplies every frequency — how a row becomes a pitch. */
  pitch?: number;
  gain?: number;
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
      // The rim taking a control. Named by what it costs rather than by which
      // control, because both screens hear it and only one of them is held.
      return { id: "boss.wardenTether", pan: panForCol(e.col, cols) };
    case "tetherTorn":
      return { id: "ship.gripTake", pan: panForCol(e.col, cols), pitch: pitchForRow(e.row, rows) };
    case "eyeOpen":
      // The one cue written for this boss and unspent until now: a door in
      // something enormous, opening once and shutting once.
      return { id: "boss.warden", pan: panForCol(e.col, cols) };
    case "vent":
      // The same rock leaving the same kind of socket. It is the queen's cue
      // because it is the queen's event: something large pushing a rock out.
      return { id: "boss.torchDrop", pan: panForCol(e.col, cols) };
    case "plate":
      return {
        id: "boss.wardenPlate",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
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
    case "forkWait":
      // No column — the fork belongs to the whole field, not a tile in it.
      return { id: "ship.forkOpen" };
    case "shellBreak":
      // A crack and two halves ringing — the sound was written for a crystal
      // coming apart and this is the same event, a piece leaving a body that
      // is still there afterwards.
      return {
        id: "impact.split",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "shellBare":
      // The one moment this creature exists for, so it gets the one cue that
      // was written for it and never spent: a skin coming off, and something
      // underneath. Deliberately not a second `impact.split` — the ear has to
      // be able to tell "another piece" from "that was the last piece, and
      // now only one colour lands", because that is the whole reversal.
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "runtHit":
      // Not `impact.destroyRed`/`Cyan`: those are the sound of the pair doing
      // the right thing, and this is the one hit that must not be mistaken
      // for one (`docs/spec/audio.md`).
      return {
        id: "impact.wrongTarget",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
