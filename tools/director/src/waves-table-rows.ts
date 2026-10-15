import {
  controlSet,
  isRegularWave,
  type Wave,
  waveIntroduces,
  wavePressure,
  waveTalk,
} from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { TUTORIAL_LAST_ID } from "./compose-steps.js";
import { waveGroups } from "./rail-groups.js";

/**
 * DOCUMENTATION › WAVES › EVERY WAVE, as rows: every number the measured page
 * gives a wave, and what is out of the range the curriculum asks of it — the
 * owner, 15 October 2026: *other columns could indicate if some value is out
 * of desired range and should be handled/corrected*, and the bosses against
 * their bands in the same table rather than one of their own.
 *
 * Pure, so the ranges are tested without a document (`waves-table.ts` draws).
 * The ranges are `docs/spec/wave-curriculum.md` §3's, read on AUTO's time.
 */

/** A wave's length as the curriculum asks it (§3, decision 1). */
export const SPAN = { intro: [8, 24], regular: [24, 48] } as const;
export const ARRIVALS = { intro: [1, 4], regular: [4, 12] } as const;
/** The boss bands, on AUTO's seconds (§3). */
export const BAND = { normal: [30, 60], special: [45, 90] } as const;
/** How much longer a talking pair is taken to need than AUTO (§9). */
export const PAIR_FACTOR = 2;

/** Which column a flag is about, so the table can mark that cell. */
export type FlagColumn = "span" | "arrivals" | "auto" | "fold" | "wave";

export interface Flag {
  column: FlagColumn;
  /** `bad` must be fixed; `warn` is out of range; `info` is worth a look. */
  level: "bad" | "warn" | "info";
  text: string;
}

export interface WaveRow {
  index: number;
  wave: Wave;
  kind: "boss" | "intro" | "regular";
  /** What the wave brings that no wave before it did (`waveIntroduces`). */
  fresh: string[];
  panel: { short: string; full: string };
  arrivals: number;
  span: number;
  /** AUTO's beats to a clear field: -1 lost, undefined never measured. */
  clearBeat: number | undefined;
  autoSeconds: number | undefined;
  pressure: number | undefined;
  /** What the pair has to say out loud, at its peak (`waveTalk`). */
  talk: number | undefined;
  /** The rail's grouping: the head this row folds under (-1 for a head), and
   * how many fold under it (`rail-groups.ts`). */
  head: number;
  size: number;
  flags: Flag[];
}

/** STANDARD 4 is S4 and STANDARD is S; a panel of its own keeps its name. */
export function shortPanel(name: string): string {
  const standard = /^STANDARD ?(\d*)$/.exec(name);
  if (standard) return `S${standard[1] ?? ""}`;
  return name.replace(/^THE /, "");
}

const spanOf = (w: Wave): number => Math.max(0, ...w.entries.map((e) => e.beat));

function outside(n: number, [lo, hi]: readonly [number, number]): boolean {
  return n < lo || n > hi;
}

/** Every wave as a row, in play order. `clear` is AUTO's measurement by id
 * (`bun run waves:measure`). */
export function waveRows(
  waves: readonly Wave[],
  clear: Readonly<Record<string, number>>,
): WaveRow[] {
  const groups = waveGroups(waves);
  const finale = waves.findIndex((w) => w.id === TUTORIAL_LAST_ID);
  const seconds = beatSeconds(DEFAULT_CONFIG);
  return waves.map((wave, index) => {
    const kind = wave.boss ? "boss" : isRegularWave(waves, index) ? "regular" : "intro";
    const set = controlSet(wave.controls);
    const clearBeat = clear[wave.id];
    const row: WaveRow = {
      index,
      wave,
      kind,
      fresh: waveIntroduces(waves, index),
      panel: { short: shortPanel(set.name), full: set.name },
      arrivals: wave.entries.length + (wave.pods?.length ?? 0),
      span: spanOf(wave),
      clearBeat,
      autoSeconds:
        clearBeat === undefined || clearBeat < 0 ? undefined : Math.round(clearBeat * seconds),
      pressure: wavePressure(wave),
      talk: waveTalk(wave),
      head: groups.head[index] ?? -1,
      size: groups.size[index] ?? 0,
      flags: [],
    };
    row.flags = flagsOf(row, index > finale);
    return row;
  });
}

/** What is out of range on one row, worst first. */
export function flagsOf(row: WaveRow, pastTutorial: boolean): Flag[] {
  const flags: Flag[] = [];
  if (row.clearBeat === undefined)
    flags.push({ column: "auto", level: "info", text: "not measured — run waves:measure" });
  else if (row.clearBeat < 0) flags.push({ column: "auto", level: "bad", text: "AUTO loses it" });
  if (row.kind === "boss") {
    const type = row.wave.bossType ?? "normal";
    const [lo, hi] = BAND[type];
    const s = row.autoSeconds;
    if (s !== undefined && (s < lo || s > hi))
      flags.push({
        column: "auto",
        level: "warn",
        text: `${s < lo ? "short" : "long"} for a ${type} boss: ${lo}–${hi} s`,
      });
    return order(flags);
  }
  const kind = row.kind;
  // A guided intro is the game's own screen, and its span is the guide's.
  if (kind === "regular" || pastTutorial) {
    if (outside(row.span, SPAN[kind]))
      flags.push({
        column: "span",
        level: "warn",
        text: `span ${row.span}, ${kind} asks ${SPAN[kind][0]}–${SPAN[kind][1]}`,
      });
    if (outside(row.arrivals, ARRIVALS[kind]))
      flags.push({
        column: "arrivals",
        level: "warn",
        text: `${row.arrivals} arrivals, ${kind} asks ${ARRIVALS[kind][0]}–${ARRIVALS[kind][1]}`,
      });
  }
  if (pastTutorial && row.head === -1 && row.size === 0)
    flags.push({ column: "fold", level: "info", text: "no waves folded under it" });
  if (kind === "intro" && !row.wave.guide && row.fresh.length > 0)
    flags.push({ column: "wave", level: "info", text: "brings something new, with no guide" });
  return order(flags);
}

const RANK = { bad: 0, warn: 1, info: 2 } as const;
const order = (flags: Flag[]): Flag[] => flags.sort((a, b) => RANK[a.level] - RANK[b.level]);

/** A pair's seconds, about: AUTO's × 2, the owner's accepted guess. */
export const pairSeconds = (row: WaveRow): number | undefined =>
  row.autoSeconds === undefined ? undefined : row.autoSeconds * PAIR_FACTOR;
