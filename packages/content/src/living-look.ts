import type { CreatureKind } from "@neon-spore/sim";
import { HANDED_LOOK } from "./living-look-handed.js";
import { STROKED_LOOK } from "./living-look-stroked.js";
import { BANK } from "./motion-bank.js";
import { FLICKER, HOLD, POISE, RUMBLE } from "./motions.js";
import { BLOOM } from "./motions-event.js";
import type { OwnMotion } from "./own-motion.js";
import { BEATBOX, BULB, type CreatureSilhouette, DART, SLICK, THROB, WISP } from "./silhouettes.js";
import { LEECH, LIMPET } from "./silhouettes-cling.js";
import { COUNTDOWN } from "./silhouettes-countdown.js";
import { MINE } from "./silhouettes-mine.js";

/**
 * Which kinds are drawn as a body of their own, and what that body looks like
 * — one row for every `CreatureKind`, and the only place either half is said.
 *
 * **Why one table and not two.** The contour lived in `silhouettes.ts` and the
 * own-motion in `motions.ts`, each a ternary chain ending in a default: two
 * hand-kept answers to one question, *is this kind a body, and which one*.
 * Two lists over one fact drift — a kind reaching one chain and not the other
 * draws its own shape with the slick's sway. One row now, so they cannot.
 *
 * **It is total on purpose, and that is the whole point of the file.** Each
 * chain used to end in `: SLICK` and `: TILT_RIPPLE`, so a kind added to
 * `CreatureKind` and forgotten here was drawn as a slick, on both phones, with
 * no compile error and no failing test. In a game where a shape has to mean one
 * spoken word every time, a body wearing another body's silhouette is the most
 * expensive silent failure there is: the pair say "slick", both of them are
 * looking at one, and only the simulation knows better.
 * `satisfies Record<CreatureKind, …>` makes that omission a build error — a new
 * kind cannot reach the field without an answer here.
 *
 * **`null` is an answer, not a gap.** It means *this kind is never asked*, for
 * one of two reasons. Either it has no body at all — a meteor and the torch are
 * crystals (`crystalPath`), the tether is a line down a column, and the queen
 * and the warden draw themselves from `world.boss` — or it is drawn as the body
 * it wears, and the caller resolves that with `wornKind` first. `lure`,
 * `clasp`, `shell` and `veil` are the second sort: a disguise, a membrane,
 * plating and weather, each laid over a slick or a bulb. Giving any of them a
 * row of its own would be a second answer to the question `wornKind` exists to
 * be the only answer to — and for the lure it would be worse than a drift, it
 * would be a tell.
 */
const LIVING_LOOK = {
  slick: { shape: SLICK, motion: BANK },
  bulb: { shape: BULB, motion: BLOOM },
  throb: { shape: THROB, motion: HOLD },
  dart: { shape: DART, motion: POISE },
  wisp: { shape: WISP, motion: FLICKER },
  // A body whose *size* is the whole of what it says: a rounded cabinet that
  // `render/beatbox.ts` swells on the beat. A row here rather than a draw
  // path of its own because four shallow lobes on a nearly square body is
  // exactly what a radial contour describes well.
  beatbox: { shape: BEATBOX, motion: RUMBLE },
  // THE COUNT: the COUNTDOWN draft's disc, bare — the marks are the pilot's
  // and `render/countdown.ts` cuts them. HOLD for the throb's reason: a body
  // whose rim is being read must not turn or swell under the reading.
  countdown: { shape: COUNTDOWN, motion: HOLD },
  // Drawn as the body underneath — resolve with `wornKind` before asking.
  lure: null,
  clasp: null,
  shell: null,
  veil: null,
  // THE ECHO is the fifth, and the one with nothing laid over it at all: it is
  // a slick or a bulb drawn small (`livingBodyMul` in render), so a contour of
  // its own here would be a second shape for a body the pair already has one
  // word for — and the word is what they have to say four of, fast.
  echo: null,
  // THE RIND is the sixth, and the echo's case with the sign turned round: it
  // is a slick or a bulb drawn *larger*, one body's footprint per layer it
  // still wears (`livingBodyMul` in render), so a contour of its own here
  // would be a second shape for a body the pair already has one word for —
  // and the word plus a size is the whole sentence this creature asks for.
  rind: null,
  // THE RECOIL is the seventh, and the only one of them whose answer changes
  // while it falls: it is a slick or a bulb with a cage over it, and a bounce
  // turns the body inside over to the other colour — so `wornKind` returns a
  // different row of this table on the next frame, which is the creature. A
  // contour of its own would freeze the one thing about it that moves.
  recoil: null,
  // THE CAROM is the eighth, and the only one whose answer *runs out*: it is a
  // slick or a bulb with a rock crust over it, and the shot that cracks the
  // crust turns the whole body into a `meteor` — which has a row of its own
  // further down and no contour either. So this row describes the creature
  // only while it is alive, which is exactly as long as it is a creature.
  carom: null,
  // THE CHUTE is the ninth, and the echo's case again: the same slick or bulb
  // with a canopy drawn above it (`render/chute.ts`) — this *is* the body they
  // were looking at inside the rock, and the word is the whole point.
  chute: null,
  // THE VOLLEY is the tenth, and the carom's row with the sign turned over: it
  // is a slick or a bulb with a rock shell over it, and the *ward* that opens
  // the shell is what turns the whole body into an ordinary one — which has a
  // row of its own further up and a contour of its own to go with it. So this
  // row describes the creature only while it is a creature, and a contour here
  // would be a second shape for a body the pair already has one word for.
  volley: null,
  // THE STRAND is the eleventh, and the one whose answer depends on which
  // screen is asking. On the pilot's it is a slick or a bulb with nothing laid
  // over it — `wornKind` resolves one. On the navigator's it is not drawn as
  // a body at all: a sealed bead with no colour on it, by a path of its own
  // in `render/strand.ts`. Neither half is a contour this table could hold.
  strand: null,
  // The nine bodies drawn by a path of their own rather than a radial
  // contour — a dome over a hem, a wheel, an eye, a worm, a wall, a horseshoe
  // — are `living-look-stroked.ts` next door, every one of them `null`, and
  // spread in here where the first of them stood.
  ...STROKED_LOOK,
  // The six on THE GYRE's rim are the sixth worn body: a slick or a bulb with
  // a wheel under it, so `wornKind` resolves one and a row here would be a
  // second shape for a body the pair already has a word for. What is different
  // about a mount is where it is standing, and where is not a silhouette.
  mount: null,
  // No body of their own: crystals, a line down a column, and the two bosses.
  meteor: null,
  meteorMedium: null,
  meteorFast: null,
  meteorFaster: null,
  meteorFastest: null,
  torch: null,
  // A rock too, and drawn as one — the rider on top of it is `render/veer-clown.ts`
  // laid over the stone, not a contour of its own.
  veer: null,
  queen: null,
  warden: null,
  // THE CAIRN, and the third boss here for the other two's reason: it is seven
  // faceted rocks drawn from `world.boss`, and one radius sampled all the way
  // round draws that as a lumpy boulder with no seams in it — which is the
  // whole of what there is to count (`render/cairn.ts`).
  cairn: null,
  tether: null,
  // THE BALLOON, THE GUM and THE WEIGHT — the bodies two hands answer, and three
  // different answers to "is this a body of its own". `living-look-handed.ts`
  // next door, cut out when the third of them took this table over its limit,
  // and spread rather than named one by one the way `creatures-table.ts` does.
  ...HANDED_LOOK,
  // THE LIMPET and THE LEECH fall as ordinary bodies off the sheet — HOOK
  // COLONY's base and CALTROP — and `render/cling.ts` draws them on the ship.
  limpet: { shape: LIMPET, motion: HOLD },
  leech: { shape: LEECH, motion: HOLD },
  // THE MINE: REACHER, and the throb's stillness under it. A body that is
  // fixed to the field is the one kind in this table for which a sway would be
  // a lie about the rule — the fuse is the only thing about it that moves, and
  // `render/mine.ts` draws that off the count rather than off a clock here.
  mine: { shape: MINE, motion: HOLD },
  // THE MOULT has no contour of its own, and that is the creature rather than
  // an omission: the two things it looks like are the two things the game
  // already draws — a rock, and a pod — and a third shape between them would
  // be a picture of neither answer. What the pair reads is not a silhouette,
  // it is *which of the two* is standing there, so a body of its own would be
  // the one drawing that made this creature unanswerable
  // (`render/moult.ts`).
  moult: null,
} as const satisfies Record<CreatureKind, { shape: CreatureSilhouette; motion: OwnMotion } | null>;

/**
 * Whether this kind is drawn as a body with a contour and a motion of its own.
 *
 * The shape sheet reads this rather than keeping its own list of what to leave
 * off, so a kind added to the bestiary reaches the sheet — or stays off it — by
 * the same fact the field draws by, and a card can no longer appear for a body
 * that is really a slick under weather.
 */
export function hasOwnBody(kind: CreatureKind): boolean {
  return LIVING_LOOK[kind] !== null;
}

/**
 * Every kind drawn as a body of its own, in the order the table above writes
 * them — bodies first, which is also the order the shape sheet lays its cards
 * out in. Deliberately *not* `CREATURE_KINDS` order: that list is append-only
 * because its index is the wire value, and a sheet is not a wire.
 */
export function livingBodyKinds(): CreatureKind[] {
  return (Object.keys(LIVING_LOOK) as CreatureKind[]).filter(hasOwnBody);
}

function look(kind: CreatureKind, asked: string): { shape: CreatureSilhouette; motion: OwnMotion } {
  const row = LIVING_LOOK[kind];
  if (row === null) {
    throw new Error(
      `${kind} has no body of its own — resolve it with wornKind before asking ${asked}`,
    );
  }
  return row;
}

/**
 * The silhouette a living kind is drawn with. Call this rather than pairing a
 * kind to a shape by hand at the draw site — the queen's morph blends two of
 * these, and a second copy of the pairing drifts.
 *
 * Asking about a kind with no body throws, which is exactly what the old
 * fallback would not do: the answer is not "draw a slick", it is that the
 * caller skipped `wornKind`. Nothing in the game reaches it — `drawCreatures`
 * routes crystals, bosses and the tether away before `drawLiving` — so the
 * throw guards a bug rather than a case the field plays through.
 */
export function livingSilhouette(kind: CreatureKind): CreatureSilhouette {
  return look(kind, "its silhouette").shape;
}

/**
 * The own-motion a living kind is drawn with, on the same terms as
 * `livingSilhouette` and out of the same row, so a body and its sway are never
 * answers about two different creatures.
 */
export function livingMotion(kind: CreatureKind): OwnMotion {
  return look(kind, "its motion").motion;
}
