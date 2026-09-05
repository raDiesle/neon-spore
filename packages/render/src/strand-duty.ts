import type { World } from "@neon-spore/sim";
import type { ViewRole } from "./view-role.js";

/**
 * The one word a seat owes the other while THE STRAND is on the field.
 *
 * **Nothing else in this game writes a word onto the playing screen**, and the
 * exception is the owner's and is narrow on purpose. Every other split names
 * one seat that can see something, and the seat that cannot see it has nothing
 * to say — so the siren lighting one mouth is the whole instruction. A thread
 * is the first body where *both* mouths light, and two lit mouths do not say
 * which half is whose: the pilot is holding a colour and the navigator a place,
 * and a pair meeting this creature for the first time has no way to guess which
 * of them starts.
 *
 * So each screen carries its own half, under the dial that is already telling
 * them to talk: **COLOUR** on the pilot's and **POSITION** on the navigator's.
 * It is not a label on the game's own construction — it does not name a
 * control set, a variant or a creature — it is the sentence each of them has to
 * say, in one word, on the screen of the person who has to say it.
 *
 * It goes the moment the last bead does, because `commsCall` reads the field:
 * the siren is not up unless something on it is asking for a call.
 */

/** The pilot's half and the navigator's, in the spelling the rest of the game
 * uses (`balance.ts` writes COLOUR too). */
const P1 = "COLOUR";
const P2 = "POSITION";

/** Whether a thread is on the field at all. Any bead will do — a strand with
 * one live bead left still needs the same two sentences. */
function strandOnField(world: World): boolean {
  return world.creatures.some((c) => c.kind === "strand");
}

/**
 * What this screen writes under the siren, or null.
 *
 * The rig gets both, separated, for `showsBeadColor`'s reason: `test` is the
 * two halves at once on one screen, and a rig that showed one seat's word would
 * be telling a lie about which seat it is.
 */
export function dutyWord(role: ViewRole, world: World): string | null {
  if (!strandOnField(world)) return null;
  if (role === "p1") return P1;
  if (role === "p2") return P2;
  return `${P1} · ${P2}`;
}
