import type { ViewRole } from "./view-role.js";
import { showsCannon, showsShield } from "./view-role.js";

/**
 * **What a cue is**, and which screen is owed it: the shape `boss-cue.ts`'s
 * thirty readings all return and every drawing of one reads.
 *
 * Split off `boss-cue.ts` on 20 September 2026, when `wordFloor` took it past
 * 250 lines. The seam is the one the file already had: what a cue *is* here,
 * and which boss says what over there — the switch needs all thirty
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
   * **The lowest line this cue's verb may be written at**, in pixels. A verb
   * that would land below it is written **above the mark** instead
   * (`boss-cue-text.ts`), and the kind line follows it up.
   *
   * **The plating is the usual floor and it is the default**, stamped on by
   * `bossCue()` from the skin under the mark so no reading has to ask. Eight
   * bosses park a mark on the hull line itself — the cannon is the carry every
   * one of them asks for, and THE LEDGER's socket is `l.hullY` exactly — and
   * `halfH + WORD_GAP` under that is forty-two pixels inside the ship. Drawing
   * the cue after `drawShip` (`boss-cue-field.ts`) stopped the plating painting
   * the word out and did not make it readable: eleven-point rock grey over lit
   * plating with the hull's own stalks running through it is a smear on a real
   * frame, which is what `docs/queue.md` sent this back for. There is no room
   * under a mark on the ship, and saying so is cheaper than lifting the mark
   * off the place it is pointing at.
   *
   * **Two bosses were doing exactly that lifting and have stopped.** THE
   * WARDEN's handle stood 1.7 tiles clear of the skin and THE UNDERTOW's lobes
   * 0.8, each with its own arithmetic for the same question this field now
   * answers once — so both marks came back down onto the place they name, 21
   * September 2026. A reading that reaches for a lift again is re-deriving
   * this.
   *
   * **The plating is not the only floor, which is why the name is not the
   * hull's.** THE SPLICE's mark rides a number down a straw and ends the
   * flight sitting in the mouth it was fed to, two tiles clear of any plating:
   * watched at tempo the verb spent its last stretch written across the
   * mouth's own ring, unreadable exactly when a thumb is likeliest to press
   * again (`boss-cue-read-d.ts`, 21 September 2026). A reading that knows what
   * its mark is about to land on passes that line here, and the flip it
   * already has does the rest.
   */
  wordFloor?: number;
  /**
   * **What the verb is for**, in a few plain words, written small under it —
   * `FLING` / `INTO THE MOUTH`, `FIRE` / `OR THE THROAT HEALS`.
   *
   * The owner, 25 September 2026, on THE THROAT: *add some ingame text help
   * what i have to do in the moments.* One word said *what* and never *why*,
   * and a pair who did not know what the fight is for could not tell a gum
   * to fling from a gum to let go. It is #34's rule and not an exception to
   * it: never a column, a colour or a count, only the reason.
   */
  why?: string;
  /**
   * **A mark on what comes next, not a call for the thumb now.** The kind line
   * is left off, and the verb alone says which press the item will want.
   * SNAKE's hint is the case (`boss-cue-read-g.ts`): `PRESS` over a point
   * three tiles out would spend the mouth before the body gets there. The
   * kind stays on the cue as data, as `CARRY`'s does.
   */
  soon?: boolean;
}

/** Whether this screen is the one being asked. */
export function cueSeen(cue: BossCue, role: ViewRole): boolean {
  if (cue.seat === null) return true;
  return cue.seat === 1 ? showsCannon(role) : showsShield(role);
}

/**
 * **Whether the kind line is drawn over this verb.** Not when it is the verb
 * said twice — `TURN` over `TURN` — and **never `CARRY`**: the owner, 24
 * September 2026, *why we need the keyword of "Carry"? … "Pull up" its clear
 * he has to take action, so "Carry" is not required at all.* Every carry's
 * verb is already the motion — `PULL`, `SWIPE`, `MOVE` — so the line over it
 * only repeated it in grammar. The kind stays on the cue as data: tests and
 * the desk still read which gesture a mark asks for. Both hands that write a
 * cue ask here (`boss-cue-text.ts`, `instar-word.ts`).
 */
export function saysKind(kind: string | undefined, word: string): kind is string {
  return kind !== undefined && kind !== word && kind !== "CARRY";
}
