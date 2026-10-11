import type { Wave } from "@neon-spore/content";
import type { Store } from "./state.js";

/**
 * WAVES GROUPED UNDER THE WAVE THAT INTRODUCES THEM, AND THE STRETCH BEFORE
 * EACH BOSS.
 *
 * The owner, 11 October 2026: *"I would like to be able to visually group for
 * organization waves I create to move below one wave"* — a wave introduces a
 * concept, the waves after it use the concept and vary by placement and
 * settings, and folding those under the first keeps the special waves
 * visible. And the second half of the same message: seeing roughly how many
 * regular waves stand between one boss and the next, to decide where the next
 * boss goes.
 *
 * **A group is a stretch of the list, never a list of its own.** Play order is
 * list order, and a group that could hold waves from elsewhere would draw the
 * campaign in an order it is not played in. So a wave carries one flag,
 * `Wave.variant`, and belongs to the nearest wave above it that is not a
 * variant — its *head*. A boss wave is always a head, so a boss is never
 * folded out of sight, and the first wave has nothing above it to belong to.
 *
 * The boss half is counted rather than authored: the stretch before a boss is
 * every wave since the boss before it, and the groups among them are how many
 * concepts it introduced.
 */

export interface WaveGroups {
  /** For each wave, the index of the head it is grouped under, or -1 for a
   * wave that is a head (or stands alone). */
  head: number[];
  /** For each wave, how many waves are grouped under it. */
  size: number[];
}

/** Whether the wave at `i` is folded under the one above it. */
export function isVariant(waves: readonly Wave[], i: number): boolean {
  const wave = waves[i];
  return i > 0 && wave?.variant === true && !wave.boss;
}

/** Every wave's head and every head's size, in one pass down the list. */
export function waveGroups(waves: readonly Wave[]): WaveGroups {
  const head: number[] = [];
  const size: number[] = waves.map(() => 0);
  let top = -1;
  for (let i = 0; i < waves.length; i++) {
    if (isVariant(waves, i) && top >= 0) {
      head.push(top);
      size[top] = (size[top] ?? 0) + 1;
    } else {
      head.push(-1);
      top = i;
    }
  }
  return { head, size };
}

/** The head of the group the wave at `i` is in — itself, for a head. */
export function headOf(groups: WaveGroups, i: number): number {
  const h = groups.head[i] ?? -1;
  return h === -1 ? i : h;
}

/** The last index of the group the wave at `i` is in. */
export function groupEnd(groups: WaveGroups, i: number): number {
  const h = headOf(groups, i);
  return h + (groups.size[h] ?? 0);
}

/**
 * A row dragged and let go on another (`rail-drag.ts`), group-aware.
 *
 * **A head travels with its group**, and it lands only between groups: let go
 * on any row of another group, it goes before that group dragged up and after
 * it dragged down. Landing inside one would make the variants below it its
 * own, which nobody dragging a wave meant.
 *
 * **A variant travels alone**, and lands exactly where `moveWave` would put
 * it — so it joins whichever group it is dropped into. The one exception is a
 * folded head dragged down onto: its variants are not on screen, so *after
 * that row* means after the group it stands for.
 *
 * The wave that was open stays open, wherever the move pushed it.
 */
export function moveWithGroup(
  store: Store,
  from: number,
  to: number,
  folded: (head: number) => boolean,
): void {
  const n = store.waves.length;
  if (from === to || from < 0 || to < 0 || from >= n || to >= n) return;
  const groups = waveGroups(store.waves);
  const variant = groups.head[from] !== -1;
  const length = variant ? 1 : 1 + (groups.size[from] ?? 0);
  if (to >= from && to < from + length) return;

  let at: number;
  if (to < from) {
    at = variant ? to : headOf(groups, to);
  } else {
    const end = variant && !(groups.head[to] === -1 && folded(to)) ? to : groupEnd(groups, to);
    at = end + 1 - length;
  }

  const open = store.waves[store.index];
  const block = store.waves.splice(from, length);
  store.waves.splice(at, 0, ...block);
  // Carried to the top, a variant has nothing above it to belong to.
  const first = store.waves[0];
  if (first?.variant) delete first.variant;
  if (open) store.index = store.waves.indexOf(open);
}

/** The stretch of regular waves that leads up to one boss. */
export interface BossStretch {
  /** Waves since the boss before this one, with no boss among them. */
  waves: number;
  /** How many of those are heads — the concepts the stretch introduced. */
  groups: number;
}

/**
 * The stretch before every boss, by the boss wave's index — and the stretch
 * after the last boss, under the last wave's index, when that wave is not a
 * boss: it is the stretch the next boss would close. A boss straight after a
 * boss has no stretch and is left out.
 */
export function bossStretches(waves: readonly Wave[]): Map<number, BossStretch> {
  const out = new Map<number, BossStretch>();
  let count: BossStretch = { waves: 0, groups: 0 };
  for (let i = 0; i < waves.length; i++) {
    const wave = waves[i];
    if (!wave) continue;
    if (wave.boss) {
      if (count.waves > 0) out.set(i, count);
      count = { waves: 0, groups: 0 };
      continue;
    }
    count = { waves: count.waves + 1, groups: count.groups + (isVariant(waves, i) ? 0 : 1) };
  }
  const last = waves.length - 1;
  if (count.waves > 0 && last >= 0) out.set(last, count);
  return out;
}
