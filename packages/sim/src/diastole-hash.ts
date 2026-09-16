import { DIASTOLE_PHASES, type DiastoleState } from "./diastole.js";

/**
 * What THE DIASTOLE puts into `hashWorld`, and nothing else.
 *
 * Its own file for the reason `stare-hash.ts` and `snake-hash.ts` are ones:
 * `hash-boss.ts` grows by a whole boss at a time.
 *
 * **The two cadences and the origin they are counted from are the fields that
 * matter most**, and they are the ones a reader would most expect to be left
 * out — they look like tuning, and `cfg` is a named exception to rule 4 for
 * exactly that reason (`docs/decisions.md` #23). They are not tuning here.
 * They *move*, once per phase, and a device that disagreed about `rightEvery`
 * or about `phaseBeat` would disagree about which beats are contractions —
 * which is to say about whether the beam player 1 held still for lands at all.
 * That is the worst desync this boss could have: the pair would have counted
 * correctly and the field would tell one of them they had not.
 *
 * `struckBeat` and `struckSide` are render's and go in anyway, because rule 4
 * has no clause for a field only the drawing wants: a device that disagrees
 * about which chamber collapsed is a device drawing a different boss.
 */
export function diastoleHashParts(b: DiastoleState): number[] {
  return [
    DIASTOLE_PHASES.indexOf(b.phase),
    b.phaseBeat,
    b.leftHits,
    b.rightHits,
    b.leftEvery,
    b.rightEvery,
    b.struckBeat,
    b.struckSide,
  ];
}
