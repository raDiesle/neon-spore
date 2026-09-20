import type { ViewRole } from "./view-role.js";
import { showsCannon, showsShield } from "./view-role.js";

/**
 * **What a cue is**, and which screen is owed it: the shape `boss-cue.ts`'s
 * twenty-eight readings all return and every drawing of one reads.
 *
 * Split off `boss-cue.ts` on 20 September 2026, when `hullTop` took it past
 * 250 lines. The seam is the one the file already had: what a cue *is* here,
 * and which boss says what over there — the switch needs all twenty-eight
 * readings imported and this needs none of them.
 */

/**
 * What kind of action it is, over the frame: #34's own list, and the only
 * words that may stand on that line.
 *
 * Four are what the gestures this game has reduce to — a press of a button on
 * the band, a hold of one, a thumb carried across the field, a turn of the
 * crank — and a fifth would be a gesture nothing in `DragTarget` or
 * `Hold["kind"]` answers, which is a wish (`.claude/skills/new-boss`). The
 * fifth here is the one the simulation *does* answer without a member: **no
 * gesture at all**. THE STARE refuses and charges for a watched press
 * (`sim/stare-step.ts`), which makes a thumb kept off the glass a thing the
 * fight asks for and a thing it can tell was done — the `RestraintGate` of
 * `bosses-choreographed.md`'s library, shipped as a boss. It is its own word
 * rather than `HOLD` over `STILL` because a player told to hold would hold
 * the trigger, which is the one press the eye is waiting for.
 */
export type CueKind = "PRESS" | "HOLD" | "CARRY" | "TURN" | "STILL";

/** One thing to do, where it is wanted. */
export interface BossCue {
  /** Whose thumb. `null` where either seat's will do. */
  seat: 1 | 2 | null;
  kind: CueKind;
  /** One word. Never a column, a colour or a count. */
  word: string;
  /** The middle of the mark, in canvas pixels. */
  x: number;
  y: number;
  /** How far the frame reaches from it. */
  halfW: number;
  halfH: number;
  /** Spreads the frame's interference, so two cues in a wave are not one
   * object blinking (`target-lock.ts`). */
  seed: number;
  /**
   * Whether the cue draws its own scan frame. `false` where the boss's own
   * picture already puts one around this place — THE SCUTTLE locks the column
   * of the next throw on the navigator's screen — because a second frame
   * around one place is exactly the four-pictures-for-one-idea mistake
   * `target-lock.ts` records the owner ending. The half-extents are still
   * read: they are what the two lines of text are hung off.
   */
  framed?: boolean;
  /**
   * How far below the mark's centre the verb may reach, in pixels, where the
   * reading knows something in the boss's own picture stands closer than the
   * frame does. THE BATON's arm is the case it was written for: its sockets
   * are one tile apart and the frame is two thirds of a tile tall, so the
   * pilot's `HOLD` hung the full `halfH + WORD_GAP` under his bead landed on
   * the navigator's, one socket down (`boss-cue-read-i.ts`).
   *
   * Only the verb is capped. The kind line is drawn *over* the mark and has
   * never been the one in the way.
   */
  roomBelow?: number;
  /**
   * The plating's own top under the mark, in pixels, where the cue was read
   * with the membrane to hand. A verb that would be written below this line
   * is written **above the mark** instead (`boss-cue-text.ts`).
   *
   * **Eight bosses park a mark on the hull line itself** — the cannon is the
   * carry every one of them asks for, and THE LEDGER's socket is `l.hullY`
   * exactly — and `halfH + WORD_GAP` under that is forty-two pixels inside the
   * ship. Drawing the cue after `drawShip` (`boss-cue-field.ts`) stopped the
   * plating painting the word out and did not make it readable: eleven-point
   * rock grey over lit plating with the hull's own stalks running through it
   * is a smear on a real frame, which is what `docs/queue.md` sent this back
   * for. There is no room under a mark on the ship, and saying so is cheaper
   * than lifting the mark off the place it is pointing at — which is what THE
   * WARDEN's `HULL_LIFT` and THE UNDERTOW's `LOBE_LIFT` do, each in its own
   * arithmetic.
   */
  hullTop?: number;
}

/** Whether this screen is the one being asked. */
export function cueSeen(cue: BossCue, role: ViewRole): boolean {
  if (cue.seat === null) return true;
  return cue.seat === 1 ? showsCannon(role) : showsShield(role);
}
