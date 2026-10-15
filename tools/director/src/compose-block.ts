import {
  isRegularWave,
  mapCol,
  mechanicsInWave,
  WAVE_COLS,
  type Wave,
  type WaveEntry,
  waveCols,
  waveIntroduces,
  wavePressure,
} from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import { STEPS, TUTORIAL_LAST_ID } from "./compose-steps.js";

/**
 * **A block, read off the wave list**: the wave that introduces a thing, what
 * came before it, and where its regular waves go. What `compose-place.ts`
 * places from — every arrival it writes is a copy of one an author already
 * wrote, so a body's extra fields (what it wears, its route, its pods) come
 * along without the composer knowing what they mean.
 */

/** One arrival as an author wrote it — an entry or a pod, with whatever
 * fields it carries — at beat 0. `anchor` is the column it is placed by, on
 * the eleven-column field. A list rather than one, so a later motif can be a
 * pair an author wrote together. */
export interface Motif {
  entries: WaveEntry[];
  pods: PodEntry[];
  length: number;
  anchor: number;
}

export interface Block {
  /** Where the intro is in the list, and which block it is, from 0. */
  intro: number;
  number: number;
  x: string;
  /** The block before's thing, and every thing from three or more back. */
  y?: string;
  z: string[];
  /** Slick, bulb and the slow rock, as far as they are known yet. */
  basics: string[];
  motifs: ReadonlyMap<string, readonly Motif[]>;
  tutorial: boolean;
  /** The block's regular waves that are already written. */
  existing: number;
  /** Blocks since the tutorial arc ended: 0 for the first after it, -1 in
   * the arc. What the steps grow by (`compose-grow.ts`). */
  sinceTutorial: number;
  /** The gentlest composed regular wave of the nearest block before with one,
   * which this block's first aims a little above (`START_RISE`). */
  floor?: number;
  /** Whether the block's written regular waves stand for its first steps, so
   * the composed ones follow them, rising from `after`, the last one's
   * pressure (`leadingBlock`). */
  leads?: true;
  after?: number;
  /** Where composed waves go in the list, and the panel they are played on. */
  insertAt: number;
  controls: Wave["controls"];
  /** A lesson's faults, which every composed wave carries as far as it
   * lasts (`compose-lesson.ts`). */
  faults?: Wave["faults"];
  /** Whether every composed wave carries them, or a wave AUTO cannot play
   * with them may go without (`compose.ts` tries this first). */
  faultsOnly?: true;
  /** Whether it is THE CLAW's block, placed as pods and the rocks they
   * answer on the claw's panel rather than by the steps (`compose-claw.ts`). */
  claw?: true;
}

const BASICS = ["slick", "bulb", "meteor"];

/** The thing a wave introduces that a wave can place: a body or a pod, not a
 * panel, a fault or a boss. */
export function placeable(waves: readonly Wave[], index: number): string | undefined {
  const wave = waves[index];
  if (!wave || wave.boss) return undefined;
  return waveIntroduces(waves, index).find((id) => motifsIn(wave, id).length > 0);
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
function floorOf(waves: readonly Wave[], from: number, to: number): number | undefined {
  const composed = new Set(STEPS.map((s) => `${waves[from]?.id}${s.name}`));
  let low: number | undefined;
  for (let i = from + 1; i < to; i++) {
    const wave = waves[i];
    const p =
      wave && composed.has(wave.id) && isRegularWave(waves, i) ? wavePressure(wave) : undefined;
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
  while (isRegularWave(waves, past)) past++;
  const last = waves[past - 1];
  const after = last && wavePressure(last);
  if (after === undefined) return undefined;
  return { ...block, leads: true, insertAt: past, after };
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
  while (insertAt < next && !waves[insertAt]?.boss && !isRegularWave(waves, insertAt)) insertAt++;
  // Up to the boss that closes it: a lesson's block may follow, before the
  // next intro (`compose-lesson.ts`).
  let existing = 0;
  for (let i = intro + 1; i < next && (!tutorial || i <= last) && !waves[i]?.boss; i++) {
    if (isRegularWave(waves, i)) existing++;
  }
  const before = intros.slice(0, number);
  // The nearest block before with a regular wave written: one the composer
  // could not fill yet does not drop the next tooth back to the bottom.
  let floor: number | undefined;
  for (let j = number - 1; j >= 0 && floor === undefined; j--) {
    floor = floorOf(waves, intros[j]?.index ?? 0, intros[j + 1]?.index ?? intro);
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
    insertAt,
    controls: waves[insertAt - 1]?.controls,
  };
}
