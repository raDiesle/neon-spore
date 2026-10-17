import type { Pod, World } from "@neon-spore/sim";
import type { CommsCall, Seat } from "./comms.js";

/**
 * **A husk on the field lights the siren** — the owner, 17 October 2026, of
 * the hollow pod: *remove the scanner help box and the text below. instead
 * activate the siren and show text and state accordingly when on the field*.
 * The white frame and DO NOT TAKE round it on the seat that can tell are gone;
 * that seat still draws the husk as the fake twin it is (`pods.ts`), and the
 * siren is what says a call is on and who owes it.
 *
 * A husk is a pod rather than a creature, so it is not a row of `TALKER` and
 * is answered here, beside `comms.ts` as THE MINE's word is beside `duty.ts`:
 * the seat that sees it is a setting on the pod (`PodEntry.truthP1`), not a
 * fact about the kind.
 *
 * The seat that sees says **which one**; the seat that is fooled — the one
 * whose screen shows every pod alike — asks before the maw opens. Both
 * sentences are on screen at once, the two halves of THE MINE's arrangement.
 */

/** What the seat that can tell says, and what the seat that cannot does. */
const SEEING = "SAY THE HOLLOW ONE";
const BLIND = "ASK BEFORE YOU TAKE";

/** Every husk on the field, hanging, loose or in the maw's grip. */
export function husks(world: World): Pod[] {
  return world.pods.filter((p) => p.kind === "husk");
}

/** The seat a husk tells the truth to: player 2, unless authored `truthP1`. */
export function huskSees(pod: Pick<Pod, "truthP1">): Seat {
  return pod.truthP1 ? "p1" : "p2";
}

/** Who has to speak because of the husks on the field, or null for none. */
export function huskCall(world: World): CommsCall | null {
  let p1 = false;
  let p2 = false;
  for (const p of husks(world)) {
    if (huskSees(p) === "p1") p1 = true;
    else p2 = true;
  }
  return p1 || p2 ? { p1, p2 } : null;
}

/** The words this seat owes about the husks on the field, in order. A seat
 * that sees one husk and is fooled by another owes both. */
export function huskWords(seat: Seat, world: World): string[] {
  const all = husks(world);
  const words: string[] = [];
  if (all.some((p) => huskSees(p) === seat)) words.push(SEEING);
  if (all.some((p) => huskSees(p) !== seat)) words.push(BLIND);
  return words;
}
