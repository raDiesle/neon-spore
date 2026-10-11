import type { SimEvent } from "@neon-spore/sim";

/**
 * **Which pull handles a boss's event says have counted**, by the keys their
 * drawings pass (`PullTrackDraw.key`), for FIZZ's ending (`pull-memory.ts`).
 *
 * Only the handles whose hand's part is over when they count. A cord the hand
 * must go on holding taut — THE WARDEN's, THE LID's, THE CURTAIN's hem — is
 * not here: its drop fizzing away under a hand still asked to hold would say
 * *let go*. Most of these are gone the tick they count (`count` finishes them
 * where they were); BASTION's and BLISTER's knob jumps home, and the fizz is
 * where it was counted.
 */
export function pullCountsOf(e: SimEvent): readonly string[] {
  switch (e.type) {
    case "bastionTear":
      return [`bastion:${e.seat}`];
    case "blisterBlow":
      return [`blister:${e.id}`];
    case "gimbalShear":
      return ["gimbal"];
    case "haspOpen":
      return ["hasp"];
    case "lampreyLoose":
      return ["lamprey:tail", "lamprey:tow", "lamprey:head"];
    case "latchTurn":
      return [`latch:${e.grip}`];
    case "sinewPart":
      return ["sinew:-1", "sinew:1"];
    default:
      return [];
  }
}
