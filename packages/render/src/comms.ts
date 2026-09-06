import type { CreatureKind, World } from "@neon-spore/sim";
import { TALKER } from "./comms-talker.js";
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
 * | `veer` | the pilot sees which lane its next step takes | P1 |
 * | `fence`| the pilot sees where the wall is open | P1 |
 * | `magnet`| the pilot picks the side the shot comes in from | P1 |
 * | `coil` | the pilot sees which dome the charge jumps to next | P1 |
 *
 * The rocks are **not** in it, and that is a decision rather than an
 * oversight: a meteor is on the pilot's strip like a torch, but there is one
 * in nearly every wave, and a siren lit through a whole wave is a lamp rather
 * than a warning. The torch earns its row by being the one rock the pair
 * cannot answer late, and THE VEER by being the one whose *column* is a thing
 * only the pilot can see coming — the plain tiers hide nothing at all once
 * they are on the field, and this one hides the only fact that matters.
 *
 * The seat named is the seat that has to **speak**; the other one listens.
 * Both can be speaking at once — a veil and a lure on one field is exactly
 * that — and then neither is only listening, which the picture shows by
 * lighting both mouths.
 */
export type Seat = "p1" | "p2";

/**
 * Who has to speak about a kind: one seat, **both**, or neither.
 *
 * `"both"` arrived with THE STRAND and is the first of its kind in the game.
 * Every split before it hid one fact from one screen — what is inside a cloud,
 * which side a dart takes, where a wisp is standing — so naming the seat that
 * could see it named the seat that had to talk, and the other one listened. A
 * thread hides a different thing from each of them: the navigator is shown
 * which bead is lit and no colour, the pilot the colours and no mark, and
 * neither can act on what they have got. So both mouths light for one body,
 * which is what `commsCall` already draws when two creatures are on the field
 * at once — this is the first time one creature does it on its own.
 */
export type Talker = Seat | "both";

/** The seat that has to say something about this kind, or null if the two of
 * them can both see everything there is to see about it. The table itself is
 * `comms-talker.ts` next door — one row per kind, and the argument for each
 * `null` beside it. */
function commsTalker(kind: CreatureKind): Talker | null {
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
    if (seat === "both") {
      p1 = true;
      p2 = true;
    } else if (seat === "p1") p1 = true;
    else if (seat === "p2") p2 = true;
  }
  if (torchWarning(world, world.cfg.radarLead)) p1 = true;
  return p1 || p2 ? { p1, p2 } : null;
}
