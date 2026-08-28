import type { BossEntry, PodEntry, SpawnEntry } from "./entries.js";
import type { World } from "./world.js";

/**
 * The card a wave opens on the first time it contains something the pair has
 * never met.
 *
 * Two decisions are load-bearing here, and both cut against
 * `docs/spec/briefings.md` as it was first written.
 *
 * **Derived, not placed.** The spec asked for a wave to *name* the blocks that
 * run before it, so that reordering a wave moved its teaching with it. Deriving
 * the subjects from what the wave actually contains does the same thing more
 * reliably and cannot go stale: a rock taught on wave 9 because someone forgot
 * to move a list is exactly the failure the placed version was guarding
 * against, and the guard was itself a hand-kept list.
 *
 * **World state, not `localStorage`.** The spec put the "already seen" set in
 * the app. It cannot live there: the card stops the wave, so two devices that
 * disagree about whether a card is up disagree about whether the world ticked.
 * The set is a bitmask in `World`, it is in `hashWorld`, and the desync ledger
 * watches it like everything else.
 */

/**
 * Every subject a card can be about. Closed on purpose — the catalogue in
 * `packages/content` is a record over exactly this list, so a creature that
 * ships without a card fails the type check rather than opening a blank card.
 *
 * The thirteen creature kinds and the three pod kinds are spelled the same as
 * their kinds, so `subjectIndex` takes either straight off the wave's own
 * entries and nothing has to keep a second table of names in step.
 */
export const BRIEFING_SUBJECTS = [
  "opening",
  "slick",
  "bulb",
  "runt",
  "throb",
  "shell",
  "meteor",
  "meteorMedium",
  "meteorFast",
  "meteorFaster",
  "meteorFastest",
  "torch",
  "queen",
  "warden",
  "tether",
  "mirror",
  "vane",
  "mend",
  "purge",
  "ward",
] as const;

export type BriefingId = (typeof BRIEFING_SUBJECTS)[number];

/**
 * The most subjects the met set can hold. It is a single integer with one bit
 * per subject, and JavaScript's bitwise operators work on 32-bit signed
 * integers — bit 31 is the sign, so 31 subjects is where it stops. A 32nd
 * would set `met` negative and hash as something else on the other device.
 * `briefing.test.ts` fails before that happens; the answer then is a second
 * word, not a wider shift.
 */
export const MAX_BRIEFING_SUBJECTS = 31;

/** Bit 1 is player 1's dismissal, bit 2 is player 2's. Both, and the card goes. */
const ACK_P1 = 1;
const ACK_P2 = 2;
const ACK_BOTH = ACK_P1 | ACK_P2;

export interface Briefings {
  /** Subject indices this wave still owes, lowest first. Empty means play. */
  due: number[];
  /** Which seats have dismissed the card on top — see `ACK_P1`. */
  ack: number;
  /** One bit per `BRIEFING_SUBJECTS` index, set when its card was dismissed. */
  met: number;
}

export function newBriefings(): Briefings {
  return { due: [], ack: 0, met: 0 };
}

export function subjectIndex(id: BriefingId): number {
  const i = BRIEFING_SUBJECTS.indexOf(id);
  if (i < 0) throw new Error(`${id} is not a briefing subject`);
  return i;
}

/** Whether a card is up, which is the whole of whether the wave is frozen. */
export function briefingHolds(world: World): boolean {
  return world.brief.due.length > 0;
}

/** The subject of the card on top, or null when the field is playing. */
export function currentBriefing(world: World): BriefingId | null {
  const i = world.brief.due[0];
  return i === undefined ? null : (BRIEFING_SUBJECTS[i] ?? null);
}

/** Whether this seat has already put the current card away. */
export function briefingAcked(world: World, player: 1 | 2): boolean {
  return (world.brief.ack & (player === 1 ? ACK_P1 : ACK_P2)) !== 0;
}

/**
 * One seat dismisses the card. The card only goes when both have, which is the
 * point: the two halves are not the same sentence, so a card one player skips
 * past is a sentence the pair never finished reading.
 */
export function ackBriefing(world: World, player: 1 | 2): void {
  const b = world.brief;
  if (b.due.length === 0) return;
  b.ack |= player === 1 ? ACK_P1 : ACK_P2;
  if (b.ack !== ACK_BOTH) return;
  const subject = b.due.shift();
  // Met on dismissal rather than on opening: a run abandoned with the card
  // still up has not been taught anything.
  if (subject !== undefined) b.met |= 1 << subject;
  b.ack = 0;
}

/**
 * What a wave is about to ask of the pair, minus everything they have already
 * been asked. Called by `startWave` from the queue it was handed, so a wave
 * teaches what it actually contains and nothing has to be authored beside it.
 *
 * The opening is the one subject that is not in any queue: it is about the
 * split itself, so it comes due before the first wave of a run and never again.
 */
export function openBriefings(
  world: World,
  queue: readonly SpawnEntry[],
  podQueue: readonly PodEntry[],
  boss: BossEntry | null,
): void {
  const b = world.brief;
  b.due = [];
  b.ack = 0;
  if (!world.cfg.briefings) return;

  const wanted = new Set<number>([subjectIndex("opening")]);
  for (const e of queue) wanted.add(subjectIndex(e.kind));
  for (const p of podQueue) wanted.add(subjectIndex(p.kind ?? "mend"));
  if (boss) wanted.add(subjectIndex(boss.kind));

  // Catalogue order, so two devices deal the same cards in the same order and
  // the opening — index 0 — is always the first thing a pair reads.
  b.due = [...wanted].filter((i) => (b.met & (1 << i)) === 0).sort((x, y) => x - y);
}

/**
 * Forget everything the pair has met. Not part of `resetRun`: a run restarted
 * after the hull went is the same two people, and re-teaching them the rock is
 * an insult with a tap attached. This is for a genuinely fresh pair — the game
 * calls it at beat zero, when two devices agree to start together.
 */
export function forgetBriefings(world: World): void {
  world.brief = newBriefings();
}
