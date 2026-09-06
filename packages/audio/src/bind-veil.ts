import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **THE VEIL's three, as sounds**: the cloud turning its weather over, shutting
 * on a shot in the wrong colour, and coming apart on one that matched.
 *
 * Cut out of `bind-creatures.ts` on purpose rather than under pressure — that
 * file sat at 250 lines exactly and takes a case for every creature added, so
 * the next lane would have been the one choosing where the cut went
 * (`docs/queue.md`, 6 September 2026). It is the seam `bind-carom.ts` and
 * `bind-coil.ts` already cut, and the one `events-veil.ts` cuts on the
 * simulation's side of the same creature.
 *
 * All three carry the argument the whole of `bind-creatures.ts` carries: the
 * ear has to tell one of these apart from the ordinary thing it most resembles,
 * because the pair is deciding what to do next on the strength of it. Here that
 * is sharper than usual — the cloud is the one body whose colour only one seat
 * can read, so every one of these three is a sound made for the seat that
 * cannot see what caused it.
 *
 * `cueFor` names the three cases itself and delegates, rather than reaching
 * this file through a `default`: a default would take that switch's
 * exhaustiveness with it, and the exhaustiveness is what makes a new event a
 * compile error rather than a silence nobody notices.
 */
export function veilCue(
  e: Extract<SimEvent, { type: "veilMorph" | "veilRebuff" | "veilTorn" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "veilMorph":
      // Both devices, and deliberately a sound with no colour in it. What
      // player 2 has to know is that the call they are holding has just
      // expired; what they must not be told is what replaced it, and a cue
      // that came in two flavours would say the second thing every time it
      // said the first. `creature.moult` is a covering coming off a body and
      // this is the body changing under one, so it gets its own: the pip that
      // does not resolve, which is the same sound the strip uses for a veil
      // nobody can name yet.
      return {
        id: "signal.radarUnknown",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
        gain: 0.6,
      };
    case "veilRebuff":
      // Not `impact.reject`. A shot that bounced off armour is spent and
      // nothing else; this one cost the pair two seconds of a body that is
      // still turning over underneath, so the ear has to be able to tell the
      // two apart at the moment player 2 decides whether to fire again. The
      // cue is the one written for a thing that takes a hit and keeps it,
      // which is exactly what a cloud shutting over a bolt is.
      return {
        id: "impact.absorb",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "veilTorn":
      // The cue that was written for this creature and never spent: opaque,
      // then one bright moment where the core shows. It rides beside the
      // `destroy` on the same tick, so what the ear gets is the cloud opening
      // and then the kill, in that order and half a beat apart.
      return {
        id: "creature.veilFlash",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
