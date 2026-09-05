import type { CreatureKind, World } from "@neon-spore/sim";
import { torchWarning } from "./torch-alarm.js";
import type { ViewRole } from "./view-role.js";

/**
 * The one word (or two) a seat owes the other while a split body is on the
 * field.
 *
 * **Nothing else in this game writes a word onto the playing screen**, and the
 * exception is the siren's and is narrow on purpose. `comms.ts`'s `TALKER`
 * table already says *which* seat has to speak about a kind — this file says
 * *what*, in one word, for every kind that table does not answer with `null`.
 * A kind `TALKER` leaves at `null` has nothing hidden, by a decision written
 * out at that row, and gets no word here either: this file only ever narrows
 * an existing siren, it never lights a new one.
 *
 * **THE STRAND started this file alone**, because it was the first body where
 * *both* mouths light for one creature and two lit mouths do not say which
 * half is whose. Every other flagged kind hides one fact from one seat, so
 * naming the seat already named the sentence; a thread needed the sentence
 * spelled out or a pair meeting it for the first time had no way to guess
 * who starts. The table below keeps that shape: most rows carry one word for
 * one seat, and `strand` is still the only row carrying one for each.
 */

/** The word an active kind puts under one or both seats' dials, or `null` for
 * every kind `TALKER` leaves silent. Keyed the same way as `comms.ts`'s own
 * table, and just as deliberately not a `Partial` — a flagged kind added
 * there and forgotten here is a siren that lights with nothing to say. */
const DUTY_WORD = {
  // The pilot sees the colour inside the cloud; the navigator cannot.
  veil: { p1: "COLOUR" },
  // The pilot's strip is the only one carrying it at all.
  torch: { p1: "ROCK" },
  // The pilot sees which lane its next step takes.
  veer: { p1: "LANE" },
  // The navigator sees it is not a body worth a shot.
  lure: { p2: "FAKE" },
  // The navigator sees which side it jumps to next.
  dart: { p2: "SIDE" },
  // The navigator sees which of the two marks is real.
  queen: { p2: "MARK" },
  // The navigator is the only one it is drawn to at all.
  wisp: { p2: "SPOT" },
  // The navigator sees the whole body; the pilot only a band across its row.
  ghost: { p2: "COLUMN" },
  // The only row with a word for each seat: the pilot holds a colour and the
  // navigator a place, and neither half is worth anything alone.
  strand: { p1: "COLOUR", p2: "POSITION" },
  slick: null,
  bulb: null,
  meteor: null,
  meteorMedium: null,
  meteorFast: null,
  meteorFaster: null,
  meteorFastest: null,
  warden: null,
  tether: null,
  throb: null,
  shell: null,
  clasp: null,
  echo: null,
  rind: null,
  gyre: null,
  mount: null,
  lid: null,
  recoil: null,
  carom: null,
  chute: null,
  volley: null,
  // THE CRAWLER, and it is the loudest `null` in this table: both screens draw
  // every link, every colour and every plate, and the pair still cannot stop
  // talking. What they have to agree is an order of work on one body that is
  // walking, not a fact one of them is missing — so there is no word for a
  // siren to carry (`comms.ts`).
  crawler: null,
} as const satisfies Record<CreatureKind, { p1?: string; p2?: string } | null>;

/** Whether a kind counts as active for this word, including the one kind
 * whose siren goes up before the body itself does (`comms.ts`'s reason). */
function kindActive(kind: CreatureKind, world: World): boolean {
  if (world.creatures.some((c) => c.kind === kind)) return true;
  if (kind === "torch") return torchWarning(world, world.cfg.radarLead) !== null;
  return false;
}

/** The words owed by one seat, in table order, without repeats. */
function wordsFor(seat: "p1" | "p2", world: World): string[] {
  const words: string[] = [];
  for (const [kind, entry] of Object.entries(DUTY_WORD) as [
    CreatureKind,
    { p1?: string; p2?: string } | null,
  ][]) {
    const word = entry?.[seat];
    if (word && !words.includes(word) && kindActive(kind, world)) words.push(word);
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
  const parts = [...p1, ...p2];
  return parts.length ? parts.join(" · ") : null;
}
