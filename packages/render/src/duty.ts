import { type CreatureKind, fenceGapCols, type World } from "@neon-spore/sim";
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
  // The pilot counts, the navigator fires on the count — both halves said,
  // because a thumb that fires on sight is the mistake and it is the seat
  // that cannot see the count that makes it.
  countdown: { p1: "COUNT", p2: "FIRE ON ZERO" },
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
  // THE FENCE, and the only row where **both seats are given the same word**
  // and the only one whose word is not fixed. It said EVADE under the pilot
  // alone, then GAP under both, and the owner asked for the pair to be told
  // which of this creature's two answers the wall in front of them takes:
  // FIND GAP FOR SHIELD for a wall with a way through it somewhere, SHOOT
  // THE CRACK for one with none. `fenceWord` picks; the row below is the shape
  // and the default. The long one is the owner's own wording, asked for by
  // name: GAP alone said nothing about *what* the gap is for, and the seat
  // reading it is holding a shield rather than a cannon.
  //
  // Both seats get it because both are needed either way round. The pilot can
  // see where the wall is open and cannot move the dome; the navigator moves
  // the dome and is shown an unbroken wire (`fence.ts`) — and the cannon is
  // the pilot's while the trigger that fires it is the navigator's, so
  // SHOOT THE CRACK is an instruction to two people and not a secret. It names
  // the place rather than the act because that is what changed under it: a
  // bolt no longer opens a wall wherever it likes, and the crack is a column
  // *and* a colour the pilot has to say out loud (`fence-crack.ts`).
  fence: { p1: "FIND GAP FOR SHIELD", p2: "FIND GAP FOR SHIELD" },
  // THE MAGNET, and the only word in this table naming something the seat has
  // to *choose* rather than something it can see. The pilot picks which side
  // to bring the shot in from, and until they say so the navigator is holding
  // two triggers and cannot tell which of the two poles is the one that will
  // be met.
  magnet: { p1: "POLE" },
  // THE COIL. The pilot is the only seat the bolt is drawn on, so the only
  // thing they can say is *which one opens next* — and the navigator, who
  // cannot see the bolt, has four beats to get the plate into that column.
  // NEXT rather than COLUMN, which is THE GHOST's word: there the number is
  // the whole of what is missing, here the number is easy and the **order** is
  // what nobody else has.
  coil: { p1: "NEXT" },
  // THE CHOIR, and the one word in this table that is an **instruction to the
  // seat reading it** rather than a thing that seat has to pass on. The pilot
  // is the only one who can shake the phone or carry the arrows, and until
  // they do there is nothing on the field either of them can act on — so the
  // word under the dial is the gesture itself, and what the navigator reads
  // off their own dark dial is that the pilot has been asked for it.
  choir: { p1: "SHAKE" },
  // THE BEATBOX. The pilot is the only seat the count is drawn on and the
  // navigator is the only one who can tap it out, so the word is the thing
  // being asked for and nothing else.
  //
  // It said BEATS and the owner asked for the whole phrase. The short form
  // was a word the pilot had to *interpret* before they could say anything —
  // BEATS on its own is a subject, not an instruction — and the navigator's
  // own frame reads CLICK X TIMES TO BEAT (`beatbox-marks.ts`), so the two
  // halves are one sentence with the number missing from one end of it.
  //
  // **Both seats, which the owner asked for**, and it is THE FENCE's row said
  // about a number rather than a gap: the word is not the thing being withheld,
  // it is the *name* of the thing being withheld, and the seat that cannot see
  // it needs that name as much as the seat that can. The pilot reads NUMBER OF
  // BEATS and says a digit; the navigator reads it and knows a digit is coming.
  // Nothing leaks — the count is on one screen and stays there.
  beatbox: { p1: "NUMBER OF BEATS", p2: "NUMBER OF BEATS" },
  // THE BALLOON, and the only row here that gives **both** seats a word — and
  // the same kind of word THE CHOIR's is, an instruction to the seat reading
  // it rather than a fact to pass on. Neither hand does anything alone, so
  // what each dial says is the half its own thumb owes; what has to be said
  // out loud is which body, and no dial can carry that.
  balloon: { p1: "PULL LEFT", p2: "PULL RIGHT" },
  // Silent in `TALKER`, so no word here either.
  crystal: null,
  // The halves of the gesture, by seat: the cannon parked under it, and the
  // swipe toward the wall. Which wall is the picture's to say (`gum.ts`).
  gum: { p1: "PARK UNDER", p2: "SWIPE" },
  // The halves by seat again: the pilot's is the gesture that gets it off,
  // said the way the beatbox's is — a whole instruction — because a thumb
  // that taps once and waits is the mistake; the navigator's is what she is
  // still doing while the cannon is not hers to aim.
  choke: { p1: "TAP AGAIN", p2: "FIRE ON THE PASS" },
  // The seat with the fuse says the word; the seat with the control does the
  // thing, whole instruction both, since standing still is the mistake.
  limpet: { p1: "SAY MOVE", p2: "KEEP MOVING" },
  leech: { p1: "KEEP MOVING", p2: "SAY MOVE" },
} as const satisfies Record<CreatureKind, { p1?: string; p2?: string } | null>;

/** Whether a kind counts as active for this word, including the one kind
 * whose siren goes up before the body itself does (`comms.ts`'s reason). */
function kindActive(kind: CreatureKind, world: World): boolean {
  if (world.creatures.some((c) => c.kind === kind)) return true;
  if (kind === "torch") return torchWarning(world, world.cfg.radarLead) !== null;
  return false;
}

/**
 * Which of THE FENCE's two answers the wall on the field takes.
 *
 * A wall with no way through at all is the one the cannon is for: its cracks
 * are the only openings it has, and a bolt in the right colour is the only
 * thing that makes one (`fence-crack.ts`) — so the pair is told to make a hole
 * rather than to hunt for one. Everything else has an opening somewhere
 * and has to be talked through. A wall the pair has already cut counts as
 * having one: they watched the bolt open it, and the job from that beat on is
 * to get the dome there.
 *
 * `fenceGapCols` with `secret` true, which is the *world's* answer rather than
 * either screen's — the word is the same on both phones, the way every other
 * row in this table is.
 */
function fenceWord(world: World): string {
  for (const c of world.creatures) {
    if (c.kind === "fence" && fenceGapCols(world.cfg, c, true).length === 0)
      return "SHOOT THE CRACK";
  }
  return "FIND GAP FOR SHIELD";
}

/** The words owed by one seat, in table order, without repeats. */
function wordsFor(seat: "p1" | "p2", world: World): string[] {
  const words: string[] = [];
  for (const [kind, entry] of Object.entries(DUTY_WORD) as [
    CreatureKind,
    { p1?: string; p2?: string } | null,
  ][]) {
    const owed = entry?.[seat];
    if (!owed || !kindActive(kind, world)) continue;
    const word = kind === "fence" ? fenceWord(world) : owed;
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
