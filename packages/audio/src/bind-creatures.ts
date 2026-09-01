import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * What one **body** did, as a sound: armour chipping, a covering coming off, a
 * disguise leaving on its own, a cloud shutting over a shot or tearing open on
 * one.
 *
 * Split out of `bind.ts` when THE VEIL took that file past its 250-line limit,
 * along the seam that was already the longest run of cases in it. What stayed
 * next door is the ship, the field, the hull, the pods and the four bosses —
 * events about the *game*. These are events about one creature, and every one
 * of them carries the same argument in its comment: the ear has to be able to
 * tell this apart from the ordinary thing it most resembles, because the pair
 * is deciding what to do next on the strength of it.
 *
 * `cueFor` names each of these cases and delegates, rather than reaching this
 * file through a `default` — a default would take that switch's exhaustiveness
 * with it, and the exhaustiveness is what makes a new event a compile error
 * rather than a silence nobody notices.
 */
export function creatureCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "shellBreak"
        | "shellBare"
        | "claspBreak"
        | "lureHit"
        | "lureSeen"
        | "lureVanished"
        | "veilMorph"
        | "veilRebuff"
        | "veilTorn";
    }
  >,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
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
    case "claspBreak":
      // The same cue THE SHELL's last piece gets, and for the same reason: a
      // covering coming off a body that goes on falling. It is deliberately
      // not `impact.split` — that is the sound of a piece leaving something
      // still armoured, and a clasp has exactly one covering, so there is no
      // "another one" for the ear to have to tell this from.
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "lureHit":
      // Not `impact.destroyRed`/`Cyan`: those are the sound of the pair doing
      // the right thing, and this is the one hit that must not be mistaken
      // for one (`docs/spec/audio.md`).
      return {
        id: "impact.wrongTarget",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "lureSeen":
      // **Player 2's device only**, and the one cue in this file that names a
      // seat. Two people playing this game are usually sitting next to each
      // other, so a chime both phones make is a chime player 1 hears — and
      // player 1 knowing that *something* on the field is a lure is the whole
      // disguise gone through the speaker. It is quiet on purpose too: the
      // alarm is already on the body and on the strip, and this is one more
      // indicator rather than a replacement for either.
      return { id: "signal.lureWarn", pan: panForCol(e.col, cols), gain: 0.5, seat: 2 };
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
    case "lureVanished":
      // Both devices, because this is the one moment both screens show the
      // same thing. Not `impact.destroyRed`/`Cyan` and not `impact.reject`:
      // nothing was killed and nothing failed, so the ear gets the same
      // reversal the picture does — a body closing rather than coming apart.
      return {
        id: "creature.lureFold",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
