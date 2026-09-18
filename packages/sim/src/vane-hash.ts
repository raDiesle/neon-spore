import type { VaneState } from "./boss-state.js";

/**
 * THE VANE in the fingerprint. Its own file on `fleet-hash.ts`' terms —
 * `hash-boss.ts` is at its limit and the boss's two hands on the picture took
 * it over — and for the reason every field here is a field: **where the arm is
 * standing is where every arrival this beat lands**, so two phones that
 * disagree about the pin are two phones putting the same rock in two columns.
 *
 * `pins` is the phase and so the reach; `spentOpening` and `spentPin` are each
 * whether the next shot counts, one for a window the cycle handed the pair and
 * one for a window they made (`vane-open.ts`); `hauled` is the same question
 * again under SEIZE. `throwBeat` and `throwCol` are render's — the last thing
 * the arm threw — and are hashed anyway, because `hashWorld` takes every field
 * of `World` that is not one of the named exceptions (`hash.ts`).
 */
export function hashVane(push: (n: number) => void, b: VaneState): void {
  push(b.pins);
  push(b.spentOpening);
  push(b.throwBeat);
  push(b.throwCol);
  push(b.pinBeat);
  push(b.pinCol);
  push(b.pinSide);
  push(b.hauled ? 1 : 0);
  push(b.spentPin);
}
