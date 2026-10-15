import { controlSet, mechanic, mechanicsInWave, setLance, type Wave } from "@neon-spore/content";
import { startsBlock } from "./compose-review.js";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **Where each boss goes**: `docs/spec/wave-curriculum.md` §7, decision 7.
 *
 * A boss closes a block, at most one per block, and each goes to the end of
 * the first block after which everything it needs has been taught. *Needs*
 * is read off the wave the way `waveIntroduces` reads it: every mechanic it
 * carries (its bodies, pods and faults, and what a boss brings along) and its
 * panel — the panel itself and every button on it, and the hold. Something
 * no wave but a boss ever carries is the boss's own, and it teaches it.
 *
 * Three rules the decision leaves implicit, and decided here (the owner,
 * 15 October 2026: *take decisions for now and proceed*):
 * - **The tutorial arc keeps its bosses.** Up to FINALE nothing moves —
 *   THE INSTAR and THE BASTION teach the panel the arc ends on — and no boss
 *   moves into it.
 * - **The bosses keep their order.** Each takes the first free block after
 *   the one the boss before it took, so a boss that shares a panel or a body
 *   with an earlier one (THE HAUL after THE SCOUT) still meets it second.
 * - **A boss with no block left waits at the end**, in order, for the blocks
 *   still to be written; nothing is doubled up. A review block
 *   (`compose-review.ts`) is a block too, and takes the next one.
 *
 * Moving a boss never moves an intro: the rest of the list keeps its order.
 */

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

/** What a wave needs taught, by key: mechanics, the panel, its buttons. */
function keysOf(wave: Wave): string[] {
  const keys: string[] = [...mechanicsInWave(wave)].filter((id) => mechanic(id).reach !== "run");
  const set = controlSet(wave.controls);
  keys.push(`panel ${set.id}`, ...set.controls.map((c) => `button ${c}`));
  if (setLance(set)) keys.push("the hold");
  return keys;
}

/** The waves in boss order (decision 7), and where each boss went. */
export function bossOrder(waves: readonly Wave[]): { order: Wave[]; slots: BossSlot[] } {
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const moves = (i: number) => waves[i]?.boss !== undefined && i > finale;
  const rest = waves.filter((_, i) => !moves(i));
  const taught = new Map<string, number>();
  rest.forEach((w, i) => {
    for (const k of keysOf(w)) if (!taught.has(k)) taught.set(k, i);
  });
  // Block ends after the arc: the index in `rest` of the next intro or
  // review head (`compose-review.ts`).
  const restFinale = rest.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const intros: number[] = [];
  for (let i = 0; i < rest.length; i++) if (startsBlock(rest, i)) intros.push(i);
  const blocks = intros
    .map((at, k) => ({ intro: at, end: intros[k + 1] ?? rest.length }))
    .filter((b) => b.intro > restFinale);

  const placed = new Map<number, Wave[]>();
  const waiting: Wave[] = [];
  const slots: BossSlot[] = [];
  let prev = -1;
  waves.forEach((wave, from) => {
    if (!moves(from)) {
      if (wave.boss) slots.push({ id: wave.id, name: wave.name, from, to: -1, waited: [] });
      return;
    }
    const needs = keysOf(wave).filter((k) => taught.has(k));
    const ready = Math.max(-1, ...needs.map((k) => taught.get(k) ?? -1));
    const waited = needs.filter((k) => taught.get(k) === ready);
    const k = blocks.findIndex((b, j) => j > prev && b.end > ready);
    const block = blocks[k];
    if (k === -1 || !block) {
      waiting.push(wave);
      slots.push({ id: wave.id, name: wave.name, from, to: -1, waited });
      return;
    }
    prev = k;
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
