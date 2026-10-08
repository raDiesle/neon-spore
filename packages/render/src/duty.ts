import type { CreatureKind, World } from "@neon-spore/sim";
import { fenceWord } from "./duty-fence.js";
import { harpoonWord } from "./duty-harpoon.js";
import { mineWord } from "./duty-mine.js";
import { DUTY_WORD } from "./duty-words.js";
import { torchWarning } from "./torch-alarm.js";
import type { ViewRole } from "./view-role.js";

/**
 * The one word (or two) a seat owes the other while a split body is on the
 * field.
 *
 * **Nothing else in this game writes a word onto the playing screen**, and the
 * exception is the siren's and is narrow on purpose. `comms.ts`'s `TALKER` table
 * already says *which* seat speaks about a kind; this file says *what*, in one
 * word, for every kind that table does not answer with `null`.
 * A kind `TALKER` leaves at `null` has nothing hidden, by a decision written out
 * at that row, and gets no word here either: this file only ever narrows an
 * existing siren, it never lights a new one.
 *
 * **THE STRAND started this file alone**, because it was the first body where
 * *both* mouths light for one creature and two lit mouths do not say which
 * half is whose. Every other flagged kind hides one fact from one seat, so
 * naming the seat already named the sentence; a thread needed the sentence
 * spelled out or a pair meeting it for the first time had no way to guess
 * who starts. The table keeps that shape: most rows carry one word for
 * one seat; the rest carry a **different** word each where the halves are not
 * interchangeable, or the **same** word on both dials where what is missing is
 * a fact neither seat has alone or an act neither hand does alone.
 *
 * The table itself is `duty-words.ts`.
 */

export { DUTY_WORD } from "./duty-words.js";

/** Whether a kind counts as active for this word, including the one kind
 * whose siren goes up before the body itself does (`comms.ts`'s reason). */
function kindActive(kind: CreatureKind, world: World): boolean {
  if (world.creatures.some((c) => c.kind === kind)) return true;
  if (kind === "torch") return torchWarning(world, world.cfg.radarLead) !== null;
  return false;
}

/**
 * The words owed by one seat, in table order, without repeats.
 *
 * **Two rows have a wording that something about the world picks**, and each
 * picks it in a file of its own rather than in the table: THE FENCE, whose word
 * depends on whether the wall in front of the pair has a way through it
 * (`duty-fence.ts`), and the two clingers, whose word depends on whether the
 * body holding the control was fired there by a fault (`duty-harpoon.ts`). The
 * table is the shape and the default in both cases.
 */
function wordsFor(seat: "p1" | "p2", world: World): string[] {
  const words: string[] = [];
  for (const [kind, entry] of Object.entries(DUTY_WORD) as [
    CreatureKind,
    { p1?: string; p2?: string } | null,
  ][]) {
    const owed = entry?.[seat];
    if (!owed || !kindActive(kind, world)) continue;
    const word =
      kind === "fence"
        ? fenceWord(world)
        : (harpoonWord(kind, seat, world) ?? mineWord(kind, seat, world) ?? owed);
    if (!words.includes(word)) words.push(word);
  }
  return words;
}

/**
 * What this screen writes under the siren, or null.
 *
 * A seat that owes more than one word at once — two flagged kinds landing
 * together — gets every one of them, joined the same way `strand` already
 * joins its own pair, so the line never goes quiet exactly when there is the
 * most to say.
 *
 * The rig gets both seats' words, `strand`'s own reason: `test` is the two
 * halves at once on one screen, and a rig that showed one seat's word would
 * be telling a lie about which seat it is.
 */
export function dutyWord(role: ViewRole, world: World): string | null {
  const p1 = wordsFor("p1", world);
  const p2 = wordsFor("p2", world);
  if (role === "p1") return p1.length ? p1.join(" · ") : null;
  if (role === "p2") return p2.length ? p2.join(" · ") : null;
  // The rig is both seats at once, so a word owed by each of them — THE
  // FENCE's word is one word under two dials — must not be printed twice.
  const parts = [...p1, ...p2.filter((w) => !p1.includes(w))];
  return parts.length ? parts.join(" · ") : null;
}
