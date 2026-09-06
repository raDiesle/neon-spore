import type { Creature } from "./types.js";

/**
 * **The fields a hand writes**, folded into the fingerprint.
 *
 * Split out of `hash-creature.ts` when THE PUSH took that file past its
 * 250-line limit, along the seam the state itself was already cut on:
 * `creature-state-held.ts` is the fields a *thumb* writes, as against the
 * fields the beat writes next door, and this is the same list one layer down.
 *
 * **Order is the contract**, `creatureHashParts`' own rule inherited whole: a
 * flat list of numbers in a fixed sequence, appended to rather than inserted
 * into, spread into the caller's list at the position these fields have always
 * had.
 */
export function heldHashParts(c: Creature): number[] {
  const out: number[] = [];
  // THE LID's cord, as two numbers rather than one. Whether a hand is on it
  // decides whether the plates are shut, and how far it has been carried
  // decides whether a shot lands — so two devices that disagree about either
  // disagree about whether the body player 2 just fired at was open. They
  // cannot be folded into one: the pull is signed and a grab reports zero, so
  // there is no value of it left over to mean "nobody is holding this".
  out.push(c.lidPullMilli === undefined ? 0 : 1);
  out.push(c.lidPullMilli ?? 0);
  // And the other half of it. A hand may carry a cord any way it likes, so two
  // devices that agreed about the x and not the y would disagree about how far
  // the plates stand apart — which is to say about whether the shot player 2
  // just fired counted.
  out.push(c.lidPullYMilli ?? 0);
  // And where the hand took the cord, for the reason above one more time: two
  // devices that disagree about the anchor draw the handle in two places.
  out.push(c.lidAnchorMilli ?? -1);
  out.push(c.lidAnchorYMilli ?? -1);
  // The beat this body was last carried a column on. It decides whether the
  // next hand that has earned a column gets one, so two devices that disagree
  // about it disagree about which column the body is standing in a beat later
  // — the shield's own question (`grip-push.ts`). `-1` for a body that has
  // never been carried, which is a value no beat can take.
  out.push(c.pushBeat ?? -1);
  // Dropped by THE CLAW's arm, which is the other thing a hand can do to a
  // body it cannot carry: it comes down at the torch's speed from there rather
  // than at its own, so two devices that disagree here disagree about the beat
  // it reaches the hull — the beat the shield has to answer on.
  out.push(c.dropped === true ? 1 : 0);
  return out;
}
