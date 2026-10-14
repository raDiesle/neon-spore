import {
  isRegularWave,
  mapCol,
  mechanicsInWave,
  WAVE_COLS,
  type Wave,
  type WaveEntry,
  waveCols,
  waveIntroduces,
} from "@neon-spore/content";
import type { PodEntry } from "@neon-spore/sim";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";

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
  /** Where composed waves go in the list, and the panel they are played on. */
  insertAt: number;
  controls: Wave["controls"];
}

const BASICS = ["slick", "bulb", "meteor"];

/** The thing a wave introduces that a wave can place: a body or a pod, not a
 * panel, a fault or a boss. */
function placeable(waves: readonly Wave[], index: number): string | undefined {
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
  let insertAt = intro + 1;
  while (insertAt < next && !waves[insertAt]?.boss && !isRegularWave(waves, insertAt)) insertAt++;
  let existing = 0;
  for (let i = intro + 1; i < next && (!tutorial || i <= last); i++) {
    if (isRegularWave(waves, i)) existing++;
  }
  const before = intros.slice(0, number);
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
    insertAt,
    controls: waves[insertAt - 1]?.controls,
  };
}
