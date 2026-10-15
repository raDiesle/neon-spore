import {
  controlSet,
  isRegularWave,
  WAVES,
  type Wave,
  waveIntroduces,
  wavePressure,
} from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG } from "@neon-spore/sim";
import { startsBlock } from "../director/src/compose-starts.js";
import { BAND, PAIR_FACTOR } from "../director/src/waves-table-rows.js";
import type { Measured } from "./measure-waves.js";

/**
 * The page `bun run waves:measure` writes, from what it measured
 * (`measure-waves.ts`): the whole game, every wave, the bosses against their
 * bands. The bands and the pair's factor are the director's live table's
 * (`waves-table-rows.ts`), so the two cannot disagree.
 */

const seconds = (beats: number): number => Math.round(beats * beatSeconds(DEFAULT_CONFIG));
const span = (w: Wave): number => Math.max(0, ...w.entries.map((e) => e.beat));

function kindOf(m: Measured): string {
  const w = m.wave;
  if (w.boss) return w.bossType === "special" ? "boss (special)" : "boss";
  if (isRegularWave(WAVES, m.index)) return "**regular**";
  return w.guide ? "intro" : "intro, no guide";
}

/** For every wave, the name of the block it is in: the nearest wave at or
 * before it that brings a body or a pod, or a review head (`startsBlock`). */
function blockNames(): string[] {
  let current = "—";
  return WAVES.map((w, i) => {
    if (startsBlock(WAVES, i)) current = w.name;
    return current;
  });
}

/** The table of every wave, in game order: one number to a column, so a row
 * says how long the wave is without opening it. */
export function waveRows(all: readonly Measured[]): string[] {
  const rows = [
    "| # | Wave | Kind | Block | New | Panel | Arrivals | Span (beats) | AUTO beats | AUTO s | A pair, about (s) | Pressure |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|",
  ];
  const blocks = blockNames();
  for (const m of all) {
    const w = m.wave;
    const known = m.clearBeat > 0;
    const auto = known
      ? `${m.clearBeat} | ${seconds(m.clearBeat)} | ${seconds(m.clearBeat) * PAIR_FACTOR}`
      : "AUTO fails | — | —";
    const fresh = waveIntroduces(WAVES, m.index).join(", ") || "—";
    const pressure = wavePressure(w) ?? "—";
    rows.push(
      `| ${m.index + 1} | ${w.name} | ${kindOf(m)} | ${blocks[m.index] ?? "—"} | ${fresh} | ${controlSet(w.controls).name} | ${w.entries.length} | ${span(w)} | ${auto} | ${pressure} |`,
    );
  }
  return rows;
}

const clock = (s: number): string => {
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
};

/** The whole game in a few numbers: how many waves of each kind, and how
 * long each kind and the whole run take AUTO, and a pair about. */
export function summaryRows(all: readonly Measured[]): string[] {
  const kinds: [string, (m: Measured) => boolean][] = [
    ["regular", (m) => !m.wave.boss && isRegularWave(WAVES, m.index)],
    ["intro", (m) => !m.wave.boss && !isRegularWave(WAVES, m.index)],
    ["boss", (m) => m.wave.boss !== undefined],
    ["every wave", () => true],
  ];
  const rows = [
    "| Kind | Waves | AUTO fails | Shortest (s) | Median (s) | Longest (s) | AUTO, all of them | A pair, about |",
    "|---|---|---|---|---|---|---|---|",
  ];
  for (const [name, is] of kinds) {
    const these = all.filter(is);
    const s = these.filter((m) => m.clearBeat > 0).map((m) => seconds(m.clearBeat));
    s.sort((a, b) => a - b);
    const total = s.reduce((n, x) => n + x, 0);
    const median = s[Math.floor((s.length - 1) / 2)] ?? 0;
    rows.push(
      `| ${name} | ${these.length} | ${these.length - s.length} | ${s[0] ?? "—"} | ${median} | ${s[s.length - 1] ?? "—"} | ${clock(total)} | ${clock(total * PAIR_FACTOR)} |`,
    );
  }
  return rows;
}

/** The table of the bosses against the bands. */
export function bossRows(all: readonly Measured[]): string[] {
  const rows = [
    "| # | Boss | Type | AUTO clears in | AUTO seconds | A pair, about | Against the band |",
    "|---|---|---|---|---|---|---|",
  ];
  for (const m of all) {
    if (!m.wave.boss) continue;
    const type = m.wave.bossType ?? "normal";
    const [lo, hi] = BAND[type];
    const s = seconds(m.clearBeat);
    const known = m.clearBeat > 0;
    const verdict = !known
      ? "unknown — AUTO cannot finish it"
      : s < lo
        ? "short"
        : s > hi
          ? "long"
          : "in band";
    rows.push(
      `| ${m.index + 1} | ${m.wave.name} | ${type} | ${known ? `${m.clearBeat} beats` : "—"} | ${known ? s : "—"} | ${known ? `${s * PAIR_FACTOR} s` : "—"} | ${verdict} |`,
    );
  }
  return rows;
}

/** The whole page. */
export function page(all: readonly Measured[], day: string): string {
  return [
    "# The waves today, measured",
    "",
    `> **Status: a measurement of ${day}**, the evidence for`,
    "> `wave-curriculum.md`. Written by `bun run waves:measure`",
    "> (`tools/probe/measure-waves.ts`) — run it again rather than editing a",
    "> number here.",
    "",
    "**How it was read.** *Kind* and *New* are content's own answers —",
    "`isRegularWave` and `waveIntroduces` (`packages/content/src/wave-regular.ts`).",
    "*Block* is the wave that brought the block's new body or pod.",
    "*Span* is the beat of the last authored arrival. *AUTO beats* is the beat",
    "the field was clear, with AUTO playing both seats — perfect hands, no",
    "talking, so a lower bound on what a pair needs; *AUTO fails* means it lost",
    `the wave. *A pair, about* is AUTO's seconds × ${PAIR_FACTOR}, the owner's accepted`,
    "guess. *Pressure* is `wavePressure`",
    "(`packages/content/src/wave-pressure.ts`); a boss wave has none.",
    "",
    "## The whole game",
    "",
    ...summaryRows(all),
    "",
    "## Every wave",
    "",
    ...waveRows(all),
    "",
    "## The bosses against the bands",
    "",
    "The band is `wave-curriculum.md` §3's, on AUTO's time: a normal boss",
    `${BAND.normal[0]}–${BAND.normal[1]} s, a special one ${BAND.special[0]}–${BAND.special[1]} s. *A pair, about* is AUTO's`,
    `time × ${PAIR_FACTOR} — the owner's accepted guess, never measured.`,
    "",
    ...bossRows(all),
    "",
  ].join("\n");
}
