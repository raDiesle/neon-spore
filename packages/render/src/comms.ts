import type { CreatureKind, World } from "@neon-spore/sim";
import { torchWarning } from "./torch-alarm.js";

/**
 * Which arrivals make the two of them talk, and which way round.
 *
 * **Why this is one list and not five markings.** Every creature whose secret
 * is split across the two screens used to announce itself in its own private
 * dialect — a shut eye over a cloud, a white ring round a lure, an arrow under
 * a dart — and a pair learning the game had to learn each marking before they
 * learned that all three were saying the same thing: *one of you can see this
 * and the other cannot, so say it out loud.* That sentence is the game, and it
 * was written five times in five hands. It is written here once.
 *
 * **What is in the list.** The kinds where one screen carries a picture the
 * other does not, once the body is on the field:
 *
 * | kind | who can see it | so who talks |
 * |---|---|---|
 * | `veil` | the pilot sees the colour through the cloud | P1 |
 * | `lure` | the navigator sees it is not a body | P2 |
 * | `dart` | the navigator sees which side it jumps to | P2 |
 * | `queen`| the navigator sees which of her two marks is real | P2 |
 * | `torch`| the pilot's strip is the only one that carries rocks | P1 |
 * | `wisp` | the navigator is the only one it is drawn on at all | P2 |
 * | `ghost`| the navigator is the only one the body is drawn on | P2 |
 *
 * The rocks are **not** in it, and that is a decision rather than an
 * oversight: a meteor is on the pilot's strip like a torch, but there is one
 * in nearly every wave, and a siren lit through a whole wave is a lamp rather
 * than a warning. The torch earns its row by being the one rock the pair
 * cannot answer late.
 *
 * The seat named is the seat that has to **speak**; the other one listens.
 * Both can be speaking at once — a veil and a lure on one field is exactly
 * that — and then neither is only listening, which the picture shows by
 * lighting both mouths.
 */
export type Seat = "p1" | "p2";

/**
 * **Every kind has a row, including the twelve that say nothing.** This was a
 * `Partial<Record<…>>` with five entries, which reads as the shorter list and
 * is the one that goes wrong: a kind whose whole point is that one screen sees
 * it and the other does not is exactly the kind somebody adds in a hurry, and
 * leaving it out here cost no compile error, no failing test, and no visible
 * defect — only a siren that never lit, on the one creature that needed it.
 * `satisfies Record<CreatureKind, …>` makes the omission a build error, so the
 * question is asked of every new body whether or not the answer is `null`.
 *
 * `null` means the two of them see the same thing and neither has to speak.
 * That is the ordinary answer and it is a decision, not a blank.
 */
const TALKER = {
  veil: "p1",
  // THE GHOST, and the plainest row in the table: the navigator is the only
  // one who can see the body at all, and the pilot — who holds the cannon
  // that has to be under it — is shown a band across its row and nothing
  // about the column. So the navigator speaks, and what they say is a number.
  ghost: "p2",
  lure: "p2",
  dart: "p2",
  queen: "p2",
  torch: "p1",
  // The sharpest row in the table: every other creature here is a body both
  // screens draw with something about it hidden. A wisp is not on player 1's
  // screen at all, so there is nothing for the pilot to be looking at while
  // they listen — which makes the siren the only thing telling them that the
  // empty field they are staring at is not empty.
  wisp: "p2",
  // THE GYRE, both halves, and it is the loudest `null` in the table. Both
  // screens draw the whole wheel and every colour on it — nothing at all is
  // hidden — and the pair still cannot stop talking, because what has to be
  // said about one is not a secret but a *moment*: which column a rim position
  // will have reached, and when the maw goes. A siren here would teach them to
  // look for something withheld, and nothing is.
  gyre: null,
  mount: null,
  // THE LID, and it is the gyre's `null` said about a hand instead of a beat.
  // Both screens draw the whole body, the plates, how far they have parted and
  // the colour of the lens behind them — nothing at all is withheld — and the
  // pair still has to talk, because what they have to agree on is a *moment*
  // in two hands. A siren here would teach them to look for something hidden,
  // and there is nothing hidden to find.
  lid: null,
  // Both screens carry these whole: nothing about them is split, so a siren
  // over one would be a lamp saying "look at the field", which is not news.
  slick: null,
  bulb: null,
  throb: null,
  // THE ECHO carries nothing hidden either — both screens draw all four bodies
  // whole. What the pair has to say about one is an order rather than a
  // secret, and a siren over a body neither of them is missing anything about
  // would be teaching them to look instead of to decide.
  echo: null,
  // THE RIND carries nothing hidden either, and less than any of them: both
  // screens draw the whole body and its size says what is left of it. What the
  // pair has to say about one is that it is not finished, which is a thing
  // they can both already see — a siren would be teaching them to look at the
  // strip instead of at the column they are meant to be holding.
  rind: null,
  shell: null,
  clasp: null,
  warden: null,
  tether: null,
  // The rocks, for the reason written above: one is in nearly every wave, and
  // a siren lit through a whole wave stops being a warning. The torch has its
  // own row up there because it is the one rock that cannot be answered late.
  meteor: null,
  meteorMedium: null,
  meteorFast: null,
  meteorFaster: null,
  meteorFastest: null,
} as const satisfies Record<CreatureKind, Seat | null>;

/** The seat that has to say something about this kind, or null if the two of
 * them can both see everything there is to see about it. */
function commsTalker(kind: CreatureKind): Seat | null {
  return TALKER[kind];
}

/** Whether a blip of this kind wants the eye on the strip. */
export function needsComms(kind: CreatureKind): boolean {
  return commsTalker(kind) !== null;
}

/** Who is speaking, this frame. `true` means that seat has something the other
 * one has not got. */
export interface CommsCall {
  p1: boolean;
  p2: boolean;
}

/**
 * The live call, or null when nothing on the field is asking for one.
 *
 * **On the field, not in the queue** — the siren goes up the moment the body
 * arrives, because that is the moment there is something to describe. The
 * torch is the exception the owner named: it is the fastest thing in the game
 * and a call that starts when it lands is a call that finishes after it has,
 * so its warning starts on the strip. `torchWarning` is that window, called
 * rather than re-derived, so the siren and the band across the top can never
 * disagree about when a torch is worth talking about.
 */
export function commsCall(world: World): CommsCall | null {
  let p1 = false;
  let p2 = false;
  for (const c of world.creatures) {
    const seat = commsTalker(c.kind);
    if (seat === "p1") p1 = true;
    else if (seat === "p2") p2 = true;
  }
  if (torchWarning(world, world.cfg.radarLead)) p1 = true;
  return p1 || p2 ? { p1, p2 } : null;
}
