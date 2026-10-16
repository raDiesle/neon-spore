import type { Wave } from "@neon-spore/content";
import { readBlock } from "./compose-block.js";
import type { Step } from "./compose-steps.js";

/**
 * **A body block's names, written again** when the block moves
 * (`waves:order`). Every body block after the arc was named on one pattern —
 * LURES AGAIN … LURE AND SHIELD … LURE PEAK — from the thing's plural and
 * singular, and R4 from the thing it is paired with, which is the block
 * before's. So the plural and the singular are read off the names as they
 * shipped, and R4 is named again for its new partner.
 */

/** The longest name a wave has, and the most words (`compose-lesson.test.ts`). */
const LONGEST = 20;
const WORDS = 4;

export interface ThingWords {
  /** Plural and singular by intro id: LURES, LURE. */
  plural: Map<string, string>;
  singular: Map<string, string>;
  /** The word for a thing as the second half of a pair, by mechanic id. */
  partner: Map<string, string>;
  /** Every name as it shipped, by id: the fallback for one too long. */
  shipped: Map<string, string>;
}

/** The words, read off the list as it ships. */
export function thingWords(waves: readonly Wave[], intros: readonly string[]): ThingWords {
  const shipped = new Map(waves.map((w) => [w.id, w.name]));
  const words: ThingWords = { plural: new Map(), singular: new Map(), partner: new Map(), shipped };
  const owned = new Map<string, string>();
  for (const id of intros) {
    const again = shipped.get(`${id}Again`);
    if (again?.endsWith(" AGAIN")) words.plural.set(id, again.slice(0, -" AGAIN".length));
    const pair = shipped.get(`${id}Pair`) ?? "";
    const [single, partner] = pair.includes(" AND ") ? pair.split(" AND ") : [];
    const peak = shipped.get(`${id}Peak`);
    const one = single ?? (peak?.endsWith(" PEAK") ? peak.slice(0, -" PEAK".length) : undefined);
    if (one) words.singular.set(id, one);
    const read = readBlock(waves, id);
    if (typeof read === "string") continue;
    if (one) owned.set(read.x, one);
    if (read.y && partner && !words.partner.has(read.y)) words.partner.set(read.y, partner);
  }
  // A thing's own singular before the word another block paired it as.
  for (const [thing, word] of owned) words.partner.set(thing, word);
  return words;
}

const fits = (name: string) => name.length <= LONGEST && name.split(" ").length <= WORDS;

/** A body step's name in a block opened by `introId`, paired with `y`, or
 * `undefined` when the thing has no words and the composer's own stands. */
export function stepName(
  words: ThingWords,
  introId: string,
  step: Step,
  y: string | undefined,
): string | undefined {
  const p = words.plural.get(introId);
  const s = words.singular.get(introId);
  if (!p || !s) return undefined;
  const partner = y === undefined ? undefined : words.partner.get(y);
  const tries: Record<Step["id"], string[]> = {
    R1: [`${p} AGAIN`],
    R2: [`${p} SPREAD`],
    R3: [`${p} FAR APART`],
    R4: [
      ...(partner ? [`${s} AND ${partner}`, `${s} AND ${partner.split(" ").pop()}`] : []),
      `${s} IN PAIRS`,
    ],
    R5: [`EASY ${p}`],
    R6: [`${s} RECALL`],
    R7: [`${p} AND TWINS`],
    R8: [`${s} PEAK`],
  };
  const own = words.shipped.get(`${introId}${step.name}`);
  return tries[step.id].find(fits) ?? (step.id !== "R4" ? own : undefined);
}
