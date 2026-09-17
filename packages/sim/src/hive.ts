import type { SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE HIVE: close the source, not the spill.
 *
 * **The question no other boss asks** — *whether to answer what is falling
 * or the hole it is falling out of.* One creature nearly the width of the
 * field hangs over row 0, with `hiveSites` **breach sites** along its
 * underside. They **open** on a clock, one at a time and then two, in an
 * order the seed decided; every breach has a **colour** the seed decided
 * too. An open breach **spills** a rock down its column on a cadence, and
 * goes on spilling until a bolt of its own colour leaves the top of the
 * field in its column, which **seals** it for good. The rocks are rocks:
 * the shield turns them and the cannon cannot, so the cannon is only ever
 * the answer to the source and the shield only ever the answer to the
 * spill — and a pair that wards well and seals nothing is a pair answering
 * more breaches every eight beats. Both are shown which breaches are open;
 * the pilot alone is shown a breach's **colour**, and he cannot fire it;
 * the navigator alone is shown the **swell** where the next one opens,
 * `hiveSwellBeats` before it does, and she cannot move the cannon there.
 * *Four is red — and the next one comes at seven*
 * (`docs/spec/bosses.md` §11.14; the split is the look's, `render/view-role-clocks-b.ts`).
 *
 * **Health is the underside**: a site sealed is a scar, and there is no
 * body of its own to shoot — it is beaten when every site has opened and
 * every one is sealed. A bolt into the skin between breaches is nothing;
 * a bolt of the wrong colour into a breach **provokes** it, and every open
 * breach spills `hiveProvokeBeats` sooner.
 *
 * **It is a fixture and not a body**, and it *is* its wave
 * (`bossFillsWave`): nothing of it is among the creatures, no hand takes
 * hold of it, and everything that falls under it is what it spilled.
 *
 * The clock is `hive-step.ts`, the bolt that leaves the top `hive-shot.ts`,
 * the fingerprint `hive-hash.ts`, the numbers `config-hive.ts`. This file is
 * the shape and the questions asked of it.
 */

/** Everything THE HIVE remembers between beats. */
export interface HiveState {
  kind: "hive";
  /** Every site's column, in the order the sites open. The seed's. */
  cols: number[];
  /** Every site's colour, by the same index. The seed's, and the pilot's read. */
  colors: Color[];
  /** Whether each site is sealed for good, by the same index. */
  sealed: boolean[];
  /** How many sites have opened: `cols[0..opened)` have, the rest have not. */
  opened: number;
  /** `world.beat` of the last opening, or of the install before the first. */
  openBeat: number;
  /** `world.beat` the open breaches last spilled on. */
  spillBeat: number;
  /** `world.beat` the last site was sealed on; `-1` while any stands. */
  downBeat: number;
}

/** The boss, if it is the one installed. Narrowing in one place rather than five. */
export function hiveBoss(world: World): HiveState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "hive" ? boss : null;
}

/**
 * Where `count` sites sit along the underside: spread over the inner
 * columns, never the two at the walls — the body is *nearly* the width of
 * the field — and never two in one column, because a column is how a bolt
 * names a breach. More sites than inner columns is the inner columns.
 */
export function hiveSiteCols(cfg: SimConfig, count: number): number[] {
  const inner = Math.max(1, cfg.cols - 2);
  const n = Math.max(1, Math.min(count, inner));
  const out: number[] = [];
  for (let i = 0; i < n; i++) out.push(1 + Math.floor((i * inner) / n));
  return out;
}

/** Whether site `i` is open: it has opened and nothing has sealed it. */
export function hiveOpen(s: HiveState, i: number): boolean {
  return i < s.opened && s.sealed[i] === false;
}

/** The open site over `col`, or `-1` — skin, a sealed scar, or a site that has not opened yet. */
export function hiveOpenAt(s: HiveState, col: number): number {
  for (let i = 0; i < s.opened; i++) if (s.cols[i] === col && hiveOpen(s, i)) return i;
  return -1;
}

/** How many breaches are open right now: how many columns are spilling. */
export function hiveOpenCount(s: HiveState): number {
  let n = 0;
  for (let i = 0; i < s.opened; i++) if (hiveOpen(s, i)) n += 1;
  return n;
}

/** Sites not yet sealed, opened or not: the health, as the underside still unscarred. */
export function hiveLeft(s: HiveState): number {
  let n = 0;
  for (const sealed of s.sealed) if (!sealed) n += 1;
  return n;
}

/** The next site to open, or `-1` once every site has. */
export function hiveNext(s: HiveState): number {
  return s.opened < s.cols.length ? s.opened : -1;
}

/** Whether openings come in pairs now: from `hiveTwinFrom` sites opened. */
export function hiveTwins(s: HiveState, cfg: SimConfig): boolean {
  return s.opened >= cfg.hiveTwinFrom;
}

/** The beat the next opening is due on — the look before the first, the clock after. */
export function hiveNextBeat(s: HiveState, cfg: SimConfig): number {
  return s.openBeat + (s.opened === 0 ? cfg.hiveLookBeats : cfg.hiveOpenBeats);
}

/** Whether the next site is swelling at `beat`: due within `hiveSwellBeats`, and there is one. Only the navigator is shown it. */
export function hiveSwelling(s: HiveState, cfg: SimConfig, beat: number): boolean {
  return hiveNext(s) >= 0 && s.downBeat < 0 && beat >= hiveNextBeat(s, cfg) - cfg.hiveSwellBeats;
}

/** Whether it is beaten: every site sealed and the body hanging out its last beats. */
export function hiveDown(s: HiveState): boolean {
  return s.downBeat >= 0;
}
