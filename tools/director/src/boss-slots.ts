import { controlSet, type Wave, waveKeys } from "@neon-spore/content";
import { startsBlock } from "./compose-starts.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";
import { regularAt } from "./list-reading.js";

/**
 * **Where each boss goes**: `docs/spec/wave-curriculum.md` §7, decision 7.
 *
 * A boss closes a block, at most one per block, and each goes to the end of
 * the first block after which everything it needs has been taught. *Needs*
 * is the wave's keys (`waveKeys`, `content/src/wave-keys.ts`): every mechanic
 * it carries (its bodies, pods and faults, and what a boss brings along) and
 * its panel — the panel itself and every button on it, and the hold.
 * Something no wave but a boss ever carries is the boss's own, and it teaches
 * it — the same rule `untaughtKeys` holds every list the director writes to.
 *
 * Three rules the decision leaves implicit, and decided here (the owner,
 * 15 October 2026: *take decisions for now and proceed*):
 * - **The tutorial arc keeps its bosses.** Up to FINALE nothing moves —
 *   THE BROOD, THE BASTION and BULB QUEEN — and no boss moves into it.
 *   THE INSTAR stood there until 16 October 2026; the owner moved it past
 *   the basics, and it takes the first free block after the arc like any
 *   other boss — the second, since THE SWINDLE closes THE HUSK's. BULB QUEEN moved in the same day, the owner's pick of the bosses
 *   that need nothing the arc does not teach. On 17 October 2026 THE SPLICE
 *   took SALVAGE's block from it — its mouth is SALVAGE's, on the other seat
 *   (`SAME_BUTTON`, `wave-keys.ts`) — and BULB QUEEN closes a review block
 *   of its own straight after. The same evening the owner took THE SPLICE
 *   out of the arc again — a boss on a panel of its own stands past the
 *   basics, behind a filler (`compose-filler.ts`) — and it closes THE ECHO's
 *   block, the only one free.
 * - **A boss takes the first free block** after its needs are taught, so a
 *   block a boss skipped is taken
 *   by the next boss ready for it, and no block goes without one but those
 *   `WAITS_FOR_ITS_BOSS` names (the owner,
 *   15 October 2026: *rearrange boss waves however you want*). One order is
 *   kept: a boss on an earlier boss's panel (THE HAUL on THE SCOUT's) comes
 *   after it, on a panel only bosses carry.
 * - **A boss with no block left waits at the end**, in order, for the blocks
 *   still to be written; nothing is doubled up. A review block
 *   (`compose-review.ts`) is a block too, and takes the next one.
 *
 * Moving a boss never moves an intro: the rest of the list keeps its order.
 *
 * **A block the owner emptied waits for a boss about its own new thing**
 * (`WAITS_FOR_ITS_BOSS`), and no boss is moved up to fill it — the owner,
 * 17 October 2026, taking THE SPLICE from THE ECHO's block to SALVAGE's: *the
 * boss should be related to the new thing introduced … i will later on create
 * new bosses which fit.* THE ECHO's waited until THE SPLICE came back to it.
 */

/** The intros of blocks waiting for a boss written for them. None since THE
 * SPLICE went back to THE ECHO's block. */
export const WAITS_FOR_ITS_BOSS: ReadonlySet<string> = new Set<string>();

export interface BossSlot {
  id: string;
  name: string;
  /** Its index in the list it was read from. */
  from: number;
  /** Its index in the list `bossOrder` returns. */
  to: number;
  /** The intro of the block it closes, or `undefined` when it stays where it
   * is (in the arc) or waits at the end. */
  closes?: string;
  /** What it waited on: the last-taught of its needs, by name. */
  waited: string[];
}

/**
 * Where a block ends: at the next block's start, less the waves just before
 * it that are neither regular nor a block of their own — a panel's or a
 * fault's lesson (THE LANCE, THE CLAW, THE FLIP). Those open the next block,
 * so its boss comes before them and straight after a regular wave — the
 * owner, 15 October 2026: *I expect to follow from top to bottom without
 * spaces.* A boss that needs what they teach takes a later block.
 */
function leadIn(rest: readonly Wave[], intro: number, next: number): number {
  let end = next;
  while (end - 1 > intro && end < rest.length && !regularAt(rest, end - 1)) end--;
  return end;
}

/** The waves in boss order (decision 7), and where each boss went. */
export function bossOrder(waves: readonly Wave[]): { order: Wave[]; slots: BossSlot[] } {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const moves = (i: number) => waves[i]?.boss !== undefined && i > finale;
  const rest = waves.filter((_, i) => !moves(i));
  const taught = new Map<string, number>();
  rest.forEach((w, i) => {
    for (const k of waveKeys(w)) if (!taught.has(k)) taught.set(k, i);
  });
  // Block ends after the arc: the index in `rest` of the next intro or
  // review head (`compose-review.ts`).
  const restFinale = rest.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const intros: number[] = [];
  for (let i = 0; i < rest.length; i++) if (startsBlock(rest, i)) intros.push(i);
  const blocks = intros
    .map((at, k) => ({ intro: at, end: leadIn(rest, at, intros[k + 1] ?? rest.length) }))
    .filter((b) => b.intro > restFinale && !WAITS_FOR_ITS_BOSS.has(rest[b.intro]?.id ?? ""));

  const placed = new Map<number, Wave[]>();
  const waiting: Wave[] = [];
  const slots: BossSlot[] = [];
  const taken = new Set<number>();
  // The block each panel's last boss took, so the next on it comes later.
  const panels = new Map<string, number>();
  waves.forEach((wave, from) => {
    if (!moves(from)) {
      if (wave.boss) slots.push({ id: wave.id, name: wave.name, from, to: -1, waited: [] });
      return;
    }
    const needs = waveKeys(wave).filter((k) => taught.has(k));
    const ready = Math.max(-1, ...needs.map((k) => taught.get(k) ?? -1));
    const waited = needs.filter((k) => taught.get(k) === ready);
    // Only a panel no ordinary wave teaches — the bosses' own.
    const panel = controlSet(wave.controls).id;
    const own = !taught.has(`panel ${panel}`);
    const after = own ? (panels.get(panel) ?? -1) : -1;
    const k = blocks.findIndex((b, j) => j > after && !taken.has(j) && b.end > ready);
    const block = blocks[k];
    if (k === -1 || !block) {
      waiting.push(wave);
      slots.push({ id: wave.id, name: wave.name, from, to: -1, waited });
      return;
    }
    taken.add(k);
    if (own) panels.set(panel, k);
    placed.set(block.end, [wave]);
    const intro = rest[block.intro];
    slots.push({ id: wave.id, name: wave.name, from, to: -1, closes: intro?.id, waited });
  });

  const order: Wave[] = [];
  rest.forEach((w, i) => {
    order.push(...(placed.get(i) ?? []), w);
  });
  order.push(...(placed.get(rest.length) ?? []), ...waiting);
  for (const s of slots) s.to = order.findIndex((w) => w.id === s.id);
  return { order, slots };
}
