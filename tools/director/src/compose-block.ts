import {
  mapCol,
  mechanicsInWave,
  WAVE_COLS,
  type Wave,
  waveCols,
  wavePressure,
  waveTalk,
} from "@neon-spore/content";
import type { Block, Motif } from "./compose-block-types.js";
import { STEPS, TUTORIAL_LAST_ID } from "./compose-steps.js";
import { introducesAt, regularAt } from "./list-reading.js";

export type { Block, Motif } from "./compose-block-types.js";

/**
 * **A block, read off the wave list**: the wave that introduces a thing, what
 * came before it, and where its regular waves go. What `compose-place.ts`
 * places from — every arrival it writes is a copy of one an author already
 * wrote, so a body's extra fields (what it wears, its route, its pods) come
 * along without the composer knowing what they mean.
 */

const BASICS = ["slick", "bulb", "meteor"];

/** Whether a wave is a filler's: its id is `filler`, the boss's name and a
 * step's. No wave is one since the fillers went (19 October 2026). */
export function isFiller(id: string | undefined): boolean {
  return id !== undefined && /^filler[A-Z]/.test(id);
}

/** Whether a wave is a filler's or a review's: composed after a block, and
 * none of its own written waves — SCRAP FIELD after SALVAGE's. */
const composedAfter = (id: string | undefined) => isFiller(id) || /^review[A-Z]/.test(id ?? "");

/** The thing a wave introduces that a wave can place: a body or a pod, not a
 * panel, a fault or a boss. */
export function placeable(waves: readonly Wave[], index: number): string | undefined {
  const wave = waves[index];
  if (!wave || wave.boss) return undefined;
  return introducesAt(waves, index).find((id) => motifsIn(wave, id).length > 0);
}

const one = (wave: Wave, part: Partial<Wave>): Wave => ({
  id: wave.id,
  name: "",
  entries: [],
  ...part,
});

/** The motifs a wave holds for one thing, columns on the eleven-column field. */
export function motifsIn(wave: Wave, id: string): Motif[] {
  const from = waveCols(wave);
  const col = (c: number) => (from === WAVE_COLS ? c : mapCol(c, WAVE_COLS, from));
  const out: Motif[] = [];
  for (const pod of wave.pods ?? []) {
    if (!mechanicsInWave(one(wave, { pods: [pod] })).has(id as never)) continue;
    out.push({
      pods: [{ ...pod, beat: 0, col: col(pod.col) }],
      entries: [],
      length: 0,
      anchor: col(pod.col),
    });
  }
  for (const e of wave.entries) {
    if (!mechanicsInWave(one(wave, { entries: [e] })).has(id as never)) continue;
    out.push({
      entries: [{ ...e, beat: 0, col: col(e.col) }],
      pods: [],
      length: 0,
      anchor: col(e.col),
    });
  }
  return out;
}

/** The lowest pressure among the composed regular waves between two intros.
 * A hand-made one stands for a block's last steps (`stepsToCompose`), so it
 * is no block's gentlest — folded into the block or not: a composed wave is
 * known by its id, the intro's and its step's (`compose.ts`). */
function floorOf(
  waves: readonly Wave[],
  from: number,
  to: number,
  score: (wave: Wave) => number | undefined = wavePressure,
): number | undefined {
  const composed = new Set(STEPS.map((s) => `${waves[from]?.id}${s.name}`));
  let low: number | undefined;
  for (let i = from + 1; i < to; i++) {
    const wave = waves[i];
    const p = wave && composed.has(wave.id) && regularAt(waves, i) ? score(wave) : undefined;
    if (p !== undefined && (low === undefined || p < low)) low = p;
  }
  return low;
}

/**
 * The same block with its written regular waves standing for its **first**
 * steps rather than its last, or `undefined` when it has none: the composed
 * ones go after them and rise from the last one. For a written wave too
 * gentle for the block's ramp to fit under — THE COIL's, at 8, where the
 * tooth starts past 7 (`compose.ts` tries this when the usual order fails).
 */
export function leadingBlock(waves: readonly Wave[], block: Block): Block | undefined {
  if (block.existing === 0 || block.leads) return undefined;
  let past = block.insertAt;
  while (regularAt(waves, past) && !isFiller(waves[past]?.id)) past++;
  const last = waves[past - 1];
  const after = last && wavePressure(last);
  if (after === undefined) return undefined;
  return { ...block, leads: true, insertAt: past, after };
}

/**
 * What a block with no thing of its own mixes (`Block.pool`): every thing
 * taught up to it, less the slick and the bulb — which every wave from R4
 * on is half of anyway — and less `without`, the body whose block it
 * follows. The owner, 19 October 2026: SOFT MORSEL, a filler of the morsel
 * straight after the morsel's own block, was *repeating "soft morsel" after
 * which was already introduced before in parent*.
 */
export function poolOf(block: Block, without?: string): string[] {
  return [...block.motifs.keys()].filter((id) => id !== "slick" && id !== "bulb" && id !== without);
}

/** The block a wave introduces, or a reason it is not one. */
export function readBlock(waves: readonly Wave[], introId: string): Block | string {
  const intro = waves.findIndex((w) => w.id === introId);
  if (intro === -1) return `no wave with the id ${introId}`;
  const x = placeable(waves, intro);
  if (x === undefined) return `${introId} introduces no body or pod a wave can place`;
  const intros: { index: number; thing: string }[] = [];
  for (let i = 0; i < waves.length; i++) {
    const thing = placeable(waves, i);
    if (thing !== undefined) intros.push({ index: i, thing });
  }
  const number = intros.findIndex((b) => b.index === intro);
  const next = intros[number + 1]?.index ?? waves.length;
  const last = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const tutorial = intro <= last;
  const sinceTutorial = tutorial
    ? -1
    : intros.filter((b) => b.index > last && b.index < intro).length;
  let insertAt = intro + 1;
  while (insertAt < next && !waves[insertAt]?.boss && !regularAt(waves, insertAt)) insertAt++;
  // Up to the boss that closes it: a lesson's block may follow, before the
  // next intro (`compose-lesson.ts`).
  let existing = 0;
  // A set piece written after the block is none of its steps (`Wave.setPiece`).
  for (let i = intro + 1; i < next && (!tutorial || i <= last) && !waves[i]?.boss; i++) {
    if (regularAt(waves, i) && !waves[i]?.setPiece && !composedAfter(waves[i]?.id)) existing++;
  }
  const before = intros.slice(0, number);
  // The nearest block before with a regular wave written: one the composer
  // could not fill yet does not drop the next tooth back to the bottom.
  let floor: number | undefined;
  let talkFloor: number | undefined;
  for (let j = number - 1; j >= 0 && floor === undefined; j--) {
    const [from, to] = [intros[j]?.index ?? 0, intros[j + 1]?.index ?? intro];
    floor = floorOf(waves, from, to);
    talkFloor = floorOf(waves, from, to, waveTalk);
  }
  const motifs = new Map<string, Motif[]>();
  for (const b of [...before, intros[number]]) {
    const wave = b && waves[b.index];
    if (b && wave && !motifs.has(b.thing)) motifs.set(b.thing, motifsIn(wave, b.thing));
  }
  return {
    intro,
    number,
    x,
    y: before[before.length - 1]?.thing,
    z: before.slice(0, Math.max(0, before.length - 2)).map((b) => b.thing),
    basics: BASICS.filter((id) => id !== x && motifs.has(id)),
    motifs,
    tutorial,
    existing,
    sinceTutorial,
    ...(floor === undefined ? {} : { floor }),
    ...(talkFloor === undefined ? {} : { talkFloor }),
    insertAt,
    controls: waves[insertAt - 1]?.controls,
  };
}
