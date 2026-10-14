#!/usr/bin/env bun
import {
  controlSet,
  isRegularWave,
  WAVES,
  type Wave,
  waveIntroduces,
  wavePressure,
} from "@neon-spore/content";
import { beatSeconds, DEFAULT_CONFIG, failHolds, type World } from "@neon-spore/sim";
import { playedBeat, waveWorld } from "./world.js";

/**
 * `bun run waves:measure` — every wave and every boss, measured, written to
 * `docs/spec/wave-curriculum-today.md`.
 *
 * The evidence the curriculum is planned against (`docs/spec/wave-curriculum.md`):
 * what each wave introduces, how long it is, how long AUTO takes to clear it,
 * and its pressure. It was three scratch probes on 14 October 2026, and a table
 * copied out of scratch goes stale with the first wave edited; this rewrites
 * the whole page from the tree, so the numbers on it are always the tree's.
 *
 * **AUTO is a lower bound.** It plays both seats with perfect hands and never
 * talks (`playedBeat`), so a pair takes longer — the curriculum's guess, which
 * the owner accepted on 14 October 2026, is twice as long. A wave AUTO loses is
 * written *AUTO fails* rather than given a number.
 */

/** Past this many beats a wave is taken as never clearing — the longest boss
 * today clears in about 550. */
const LIMIT_BEATS = 900;

/** The curriculum's boss bands, on AUTO's time, in seconds (§3). */
const BAND = { normal: [30, 60], special: [45, 90] } as const;

/** How much longer a talking pair is taken to need than AUTO (§9). */
const PAIR_FACTOR = 2;

export interface Measured {
  wave: Wave;
  index: number;
  /** The beat the field was clear with AUTO playing, or -1 when AUTO lost. */
  clearBeat: number;
}

/** Plays one wave with AUTO on both seats until its field is clear. */
export function measureWave(index: number): Measured {
  const wave = WAVES[index];
  if (!wave) throw new Error(`no wave at ${index}`);
  return { wave, index, clearBeat: clearBeat(waveWorld(wave.id)) };
}

/**
 * The beat a world stood at a wave's start is clear with AUTO on both seats,
 * or -1 when AUTO loses it. The composer asks the same of a wave it has not
 * written yet (`tools/director/src/compose-check.ts`).
 */
export function clearBeat(world: World): number {
  for (let beat = 1; beat <= LIMIT_BEATS; beat++) {
    playedBeat(world);
    if (world.restBeat !== 0) return beat;
    if (failHolds(world)) break;
  }
  return -1;
}

const seconds = (beats: number): number => Math.round(beats * beatSeconds(DEFAULT_CONFIG));
const span = (w: Wave): number => Math.max(0, ...w.entries.map((e) => e.beat));

function kindOf(m: Measured): string {
  const w = m.wave;
  if (w.boss) return w.bossType === "special" ? "boss (special)" : "boss";
  if (isRegularWave(WAVES, m.index)) return "**regular**";
  return w.guide ? "intro" : "intro, no guide";
}

/** The table of every wave, in game order. */
export function waveRows(all: readonly Measured[]): string[] {
  const rows = [
    "| # | Wave | Kind | New | Panel | Arrivals | Span (beats) | AUTO clears in | Pressure |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const m of all) {
    const w = m.wave;
    const auto = m.clearBeat > 0 ? `${m.clearBeat} b · ${seconds(m.clearBeat)} s` : "AUTO fails";
    const fresh = waveIntroduces(WAVES, m.index).join(", ") || "—";
    const pressure = wavePressure(w) ?? "—";
    rows.push(
      `| ${m.index + 1} | ${w.name} | ${kindOf(m)} | ${fresh} | ${controlSet(w.controls).name} | ${w.entries.length} | ${span(w)} | ${auto} | ${pressure} |`,
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
    "*Span* is the beat of the last authored arrival. *AUTO clears in* is the beat",
    "the field was clear, with AUTO playing both seats — perfect hands, no",
    "talking, so a lower bound on what a pair needs; *AUTO fails* means it lost",
    "the wave. *Pressure* is `wavePressure`",
    "(`packages/content/src/wave-pressure.ts`); a boss wave has none.",
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

if (import.meta.main) {
  const all = WAVES.map((_, i) => measureWave(i));
  const out = new URL("../../docs/spec/wave-curriculum-today.md", import.meta.url);
  const day = new Date().toISOString().slice(0, 10);
  await Bun.write(out, page(all, day));
  const lost = all.filter((m) => m.clearBeat < 0).map((m) => m.wave.name);
  console.log(`wrote docs/spec/wave-curriculum-today.md — ${all.length} waves`);
  if (lost.length) console.log(`AUTO loses ${lost.length}: ${lost.join(", ")}`);
}
