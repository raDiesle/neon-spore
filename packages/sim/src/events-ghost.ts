import type { Color } from "./types.js";

/**
 * THE GHOST's three: the body letting go, a wall turned at, and the dive.
 *
 * Its own file rather than three more arms of `events-creature.ts`, for the
 * reason `events-carom.ts`, `events-volley.ts` and `events-strand.ts` are next
 * door to that one: it is at its 250-line limit and THE CRAWLER needed room.
 * One arrival taken apart, and it joins `CreatureEvent` as a single arm.
 *
 * What holds the three together is that each of them is about the seat that
 * **cannot see the body**. Player 1 gets a band across a row and nothing else,
 * so the only things this creature can ever tell them are that a turn has gone
 * by, that the temper has run out, and that it is over.
 */
export type GhostEvent =
  /**
   * A ghost was shot, and for the length of one escape both screens draw it.
   *
   * It rides beside the ordinary `destroy` on the same tick rather than in
   * place of it, exactly as `veilTorn` does: the kill is a kill and keeps its
   * burst, its sound and its score, and this is the body letting go and
   * climbing out of the top of the field (`render/ghost-release.ts`).
   *
   * Its own event and not a flag on `destroy`, because what it is for is the
   * *other* screen. Player 1 has never seen this body — only the band across
   * its row — so the one moment it is worth drawing for them is the moment it
   * is no longer a secret, and an event nobody could tell from a slick's death
   * could not carry that.
   */
  | { type: "ghostRelease"; col: number; row: number; color: Color }
  /**
   * A crossing ghost ran out of field, stood at the wall and turned back.
   * `laps` is how many walls it has now touched, which is the number the pair
   * is counting: at `ghostChargeLaps` it stops prowling.
   *
   * Both devices carry it, and that is deliberate rather than a leak of the
   * split. Player 1 cannot see the body and is not told which wall — only
   * that one more turn has gone by, which is the half of this creature that
   * is about *time* rather than about place, and time was never the secret.
   */
  | { type: "ghostTurn"; col: number; row: number; laps: number }
  /**
   * It has given up on prowling and is coming down at the ship, head first.
   * From this moment it is drawn on both screens (`showsGhostBody`): a hull
   * hit nobody could see coming is a hull hit the pair cannot learn from.
   */
  | { type: "ghostCharge"; col: number; row: number };
