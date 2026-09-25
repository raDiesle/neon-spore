/**
 * **What THE THROAT's field says about why** — the reason under each of its
 * cue verbs (`BossCue.why`), and the receipt by the mouth when a ring goes or
 * comes back (`throat-receipt.ts`).
 *
 * The owner, 25 September 2026, after playing it: *should I suck in the gum
 * or not? should I shoot the enemy or let it go that it's sucked in again? add
 * some ingame text help what I have to do in the moments.* Every verb here was
 * already on the field; none of them said what it was for, and the fight is
 * the one in this game where the habit — clear the field — is the mistake.
 *
 * **#34 still holds**: no column, no colour, no count. Each line is the
 * reason the verb is worth anything, which the verb cannot say.
 */
export const THROAT_WHY: Readonly<Record<string, string>> = {
  // A gum on the mouth's row: the swipe that chokes a ring.
  FLING: "INTO THE MOUTH",
  // A gum still falling: a swipe before its row flies along the wrong one.
  WAIT: "SWIPE ON THE MOUTH ROW",
  // A body in the mouth, the cannon under it: the shot is the only way out.
  FIRE: "OR THE THROAT HEALS",
  // The same body, the cannon somewhere else: the shot leaves his column.
  MOVE: "SO P2 CAN SHOOT IT",
  // A rock in the mouth: a held ring stops the breath and the mouth slides on.
  CINCH: "NO INHALE WHILE HELD",
  // A rock in the mouth once it stops sliding: the tube goes, not the rock.
  HAUL: "PULL THE MOUTH OFF IT",
  // A rock climbing towards the mouth.
  BRAKE: "OR THE THROAT EATS IT",
};

/** The receipt for a ring choked, and for a body swallowed. */
export const RING_DOWN = "RING DOWN";
export const RING_HEALS = "SWALLOWED · RING HEALS";
/** A swallow while nothing is slack yet costs no ring, and says only this. */
export const SWALLOWED = "SWALLOWED";
