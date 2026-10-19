import type { CreatureKind, MalfunctionKind } from "@neon-spore/sim";
import type { Wave, WaveEntry } from "./wave-types.js";

/**
 * **A wave's talk**: how much the pair has to say out loud to answer it —
 * the owner, 15 October 2026: *difficulty should also include difficulty of
 * each enemy, for example how often players need to talk to each other, or if
 * something is not visible for the other but needs to be told, like
 * positions or colour.*
 *
 * `wavePressure` counts what the hands do; this counts what the voices do.
 * Every body already needs one sentence — whoever reads its radar is never the
 * one who acts on it (`docs/spec/roles.md`) — so each kind is scored by the
 * **facts** one player must hand the other for each arrival, and a wave by
 * the most facts inside any eight beats, the window pressure uses: two spoken
 * exchanges. A fault adds the sentences it costs for as long as it runs.
 *
 * The facts are read off each kind's own description (`creatures-table.ts`);
 * like pressure's weights they are a judgement, to be tuned against a pair.
 */

/**
 * One fact said aloud for an arrival:
 * - `where` — its column, from the one who sees it to the one who moves;
 * - `which` — a colour or a moment the body does not wear plainly;
 * - `hidden` — something only one seat is drawn at all, said in full;
 * - `moves` — it changes column on the way down, so `where` is said again;
 * - `both` — the cannon and the shield both answer it, two jobs to agree.
 */
export type TalkFact = "where" | "which" | "hidden" | "moves" | "both";

/** What each fact costs in sentences. Something only one of you can see is
 * the whole picture put into words, so it costs two. */
export const TALK_COST: Readonly<Record<TalkFact, number>> = {
  where: 1,
  which: 1,
  hidden: 2,
  moves: 1,
  both: 1,
};

/** The facts each kind asks; a kind not named asks only `where`. */
export const KIND_TALK: Readonly<Partial<Record<CreatureKind, readonly TalkFact[]>>> = {
  veer: ["where", "moves"],
  fence: ["where", "both"],
  coil: ["where", "moves"],
  queen: ["where", "hidden", "both"],
  warden: ["where", "moves", "both"],
  curtain: ["where", "hidden", "both"],
  lure: ["where", "hidden"],
  throb: ["where", "which"],
  shell: ["where", "which"],
  clasp: ["where", "which", "both"],
  dart: ["where", "which", "moves"],
  veil: ["where", "which", "hidden"],
  wisp: ["where", "hidden", "moves"],
  ghost: ["where", "which", "hidden"],
  countdown: ["where", "which"],
  echo: ["where", "which", "moves"],
  rind: ["where", "which"],
  recoil: ["where", "which", "moves"],
  gyre: ["where", "which", "moves"],
  lid: ["where", "which", "both"],
  carom: ["where", "which", "moves", "both"],
  crystal: ["where", "moves", "both"],
  chute: ["where", "moves"],
  volley: ["where", "which", "both"],
  strand: ["where", "which"],
  magnet: ["where", "which"],
  choir: ["where", "which"],
  crawler: ["where", "moves", "both"],
  balloon: ["where", "moves"],
  mine: ["where", "hidden"],
  moult: ["where", "both"],
};

/**
 * What a fault adds while it runs. Each takes a control from one seat or
 * changes what one seat is drawn, so the other has to say what it can no
 * longer do or see: CODEX and HANDOVER are silent until one of you notices
 * and says so, and FLIP turns every `where` into a translation.
 */
export const FAULT_TALK: Readonly<Record<MalfunctionKind, number>> = {
  cannon: 2,
  shield: 2,
  steer: 2,
  codex: 3,
  handover: 3,
  swap: 3,
  leech: 1,
  limpet: 1,
  flip: 3,
  dark: 2,
};

/** The window the facts are summed over, in beats — pressure's own. */
export const TALK_WINDOW_BEATS = 8;

/** What one arrival asks to be said. A slick or a bulb (no `kind`) is `where`. */
export function arrivalTalk(e: Pick<WaveEntry, "kind">): number {
  const facts = (e.kind && KIND_TALK[e.kind]) || ["where"];
  return facts.reduce((n, f) => n + TALK_COST[f], 0);
}

/** A wave's talk, to one decimal, or `undefined` for a boss wave — a boss is
 * the encounter, and what it asks is not in its entries. */
export function waveTalk(wave: Wave): number | undefined {
  if (wave.boss) return undefined;
  const costs = wave.entries.map((e) => ({ beat: e.beat, cost: arrivalTalk(e) }));
  let peak = 0;
  for (const from of costs) {
    let sum = 0;
    for (const c of costs)
      if (c.beat >= from.beat && c.beat < from.beat + TALK_WINDOW_BEATS) sum += c.cost;
    peak = Math.max(peak, sum);
  }
  const faults = (wave.faults ?? []).reduce((n, f) => n + FAULT_TALK[f.kind], 0);
  return Math.round((peak + faults) * 10) / 10;
}
