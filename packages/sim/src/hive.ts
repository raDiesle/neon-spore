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
 * too. An open breach **spills** a body down its column on a cadence, and
 * goes on spilling until a bolt of its own colour leaves the top of the
 * field in its column, which **seals** it for good. Both seats are shown
 * which breaches are open; the pilot alone is shown a breach's **colour**,
 * and he cannot fire it; the navigator alone is shown the **swell** where
 * the next one opens, `hiveSwellBeats` before it does, and she cannot move
 * the cannon there. *Four is red — and the next one comes at seven*
 * (`docs/spec/bosses.md` §11.14; the split is the look's, `render/view-role-clocks-b.ts`).
 *
 * **Health is the underside**: a site sealed is a scar, and there is no
 * body of its own to shoot — it is beaten when every site has opened and
 * every one is sealed. A bolt into the skin between breaches is nothing;
 * a bolt of the wrong colour into a breach **provokes** it, and every open
 * breach spills `hiveProvokeBeats` sooner.
 *
 * **And the mass answers back, in two states the pair meets with two
 * gestures of their own** — the §6.2 ask (`.claude/skills/new-boss-more`),
 * and both of them reached on the picture rather than on the panel, because
 * the picture is the one part of this boss that hangs inside the field.
 *
 * - **`clench`**, its answer to being hurt: every `hiveClenchEvery` seals
 *   the underside draws **up out of reach** for `hiveClenchBeats`. Nothing
 *   spills and nothing can be sealed, and the opening clock runs on through
 *   it — so a clench waited out is bought with two more breaches and the
 *   backlog breaking over them the beat it relaxes. The pilot's thumb on
 *   the underside **hauls** it back down (`hiveHaulMilli` thousandths of a
 *   tile), and a clench hauled costs them nothing but the hand.
 * - **`swelling`**, the lobe about to open: the navigator's thumb **held**
 *   on it for `hivePinchBeats` **wrings the colour out**, and the breach
 *   opens colourless — `wrung`, sealed by either colour, so the sentence he
 *   would have had to say is one she no longer has to wait for. It costs
 *   what a wrong colour costs: the mass feels the thumb and every open
 *   breach spills `hiveProvokeBeats` sooner.
 *
 * Each gesture is in the state its own seat's eye reports — he sees the
 * mass clench, she alone sees the swell — so neither can be reached by the
 * seat that cannot see it, and the fight's one sentence grows a second:
 * *it is clenched, haul it* and *the next one is at seven, wring it*.
 *
 * **It is a fixture and not a body**, and it *is* its wave
 * (`bossFillsWave`): nothing of it is among the creatures, and everything
 * that falls under it is what it spilled.
 *
 * The clock is `hive-step.ts`, the bolt that leaves the top `hive-shot.ts`,
 * the two thumbs `hive-hand.ts`, the fingerprint `hive-hash.ts`, the numbers
 * `config-hive.ts`. This file is the shape and the questions asked of it.
 */

/**
 * Where the mass itself is: hanging shut before the first opening, spilling
 * out of its open breaches, clenched up out of reach, or beaten.
 *
 * The lobes are a second axis and `HIVE_LOBES` in `hive-lobe.ts` is their
 * table, as SNAKE's body is a second table beside its rounds
 * (`boss-phases.ts`): a pair meets a different gesture in each, and the
 * sheet wants both sets of names.
 */
export const HIVE_PHASES = ["hang", "spill", "clench", "down"] as const;
export type HivePhase = (typeof HIVE_PHASES)[number];

/** Everything THE HIVE remembers between beats. */
export interface HiveState {
  kind: "hive";
  /** Where the mass is: `hive-step.ts` walks it, `hive-shot.ts` clenches it. */
  phase: HivePhase;
  /** `world.beat` the phase began — what the clench is timed from. */
  phaseBeat: number;
  /** Every site's column, in the order the sites open. The seed's. */
  cols: number[];
  /** Every site's colour, by the same index. The seed's, and the pilot's read. */
  colors: Color[];
  /** Whether each site is sealed for good, by the same index. */
  sealed: boolean[];
  /** Whether each site opened with its colour wrung out: either colour seals it. */
  wrung: boolean[];
  /** How many sites have opened: `cols[0..opened)` have, the rest have not. */
  opened: number;
  /** `world.beat` of the last opening, or of the install before the first. */
  openBeat: number;
  /** `world.beat` the open breaches last spilled on. */
  spillBeat: number;
  /** The site the navigator's thumb is on, or `NO_PINCH` (`hive-lobe.ts`). */
  pinch: number;
  /** `world.beat` that thumb came down; meaningless with no thumb down. */
  pinchBeat: number;
  /** Thousandths of a tile the mass has been hauled down in this clench. */
  haulMilli: number;
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

/** The open site over `col`, or `-1` — skin, a sealed scar, or a site yet to open. */
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

/** How many sites are sealed: the scars, and what a clench is counted off. */
export function hiveSealedCount(s: HiveState): number {
  return s.sealed.length - hiveLeft(s);
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

/**
 * Whether the next site is swelling at `beat`: due within `hiveSwellBeats`,
 * and there is one. Only the navigator is shown it.
 */
export function hiveSwelling(s: HiveState, cfg: SimConfig, beat: number): boolean {
  return hiveNext(s) >= 0 && s.downBeat < 0 && beat >= hiveNextBeat(s, cfg) - cfg.hiveSwellBeats;
}

/** Whether it is beaten: every site sealed and the body hanging out its last beats. */
export function hiveDown(s: HiveState): boolean {
  return s.phase === "down";
}
