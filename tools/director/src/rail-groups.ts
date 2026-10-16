import type { Wave } from "@neon-spore/content";
import type { Store } from "./state.js";

/**
 * WAVES GROUPED UNDER THE WAVE THAT INTRODUCES THEM.
 *
 * The owner, 11 October 2026: *"I would like to be able to visually group for
 * organization waves I create to move below one wave"* — a wave introduces a
 * concept, the waves after it use the concept and vary by placement and
 * settings, and folding those under the first keeps the special waves
 * visible. A wave joins a group by being dragged onto it (`dropWave`), and
 * every group starts folded (`rail-folds.ts`).
 *
 * **A group is a stretch of the list, never a list of its own.** Play order is
 * list order, and a group that could hold waves from elsewhere would draw the
 * campaign in an order it is not played in. So a wave carries one flag,
 * `Wave.variant`, and belongs to the nearest wave above it that is not a
 * variant — its *head*. A boss wave is always a head, so a boss is never
 * folded out of sight, and the first wave has nothing above it to belong to.
 *
 * **A block's later intros are variants of its first.** THE HAND, THE GAP,
 * THE CUT and THE LEAK each carry a guide, and each stood as a head, so the
 * block's regular waves folded under the last intro and the wave that brought
 * the block stood alone — the owner, 16 October 2026: *why there are still
 * waves introducing something new, but no waves below attached? such as "the
 * rock".* Marked `variant`, they fold under the block's first intro with the
 * regular waves, and the play order does not move.
 *
 * Counting the waves between one boss and the next stood here for an hour of
 * the same day; the owner had not asked for it, and it went.
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

/** Where on a row a dragged wave was let go (`rail-drag.ts`): its upper or
 * lower edge, between two rows, or its middle — into the row's group. */
export type DropZone = "before" | "after" | "into";

/**
 * A row dragged and let go on another, group-aware.
 *
 * The owner, 11 October 2026: *"let me drag and drop one wave into another,
 * so it becomes like a parent which the dragged wave is a child of it."*
 *
 * **Let go on a row's middle (`into`), the wave becomes a child** of that
 * row's group: it goes to the end of the group, and is a variant. A head
 * dragged in brings its own children, and they become children of the new
 * parent too — a group is one level deep, because it is a stretch of the list.
 *
 * **Let go on a row's edge, the wave goes between two rows**, and is a child
 * exactly when the row below the gap is: dropped between two children it
 * stays in their group, dropped between two groups it stands on its own. So
 * a child is taken out of its group by dropping it on an edge outside it, and
 * no wave ever takes another group's children by landing above them.
 *
 * **A head travels with its group; a child travels alone.** The lower edge of
 * a folded head means after the group it stands for, since its children are
 * not on screen. A boss is never a child: dropped into a group it is refused,
 * and dropped on an edge inside one it lands after that group.
 *
 * The wave that was open stays open, wherever the move pushed it.
 */
export function dropWave(
  store: Store,
  from: number,
  to: number,
  zone: DropZone,
  folded: (head: number) => boolean,
): void {
  const n = store.waves.length;
  if (from < 0 || to < 0 || from >= n || to >= n) return;
  const groups = waveGroups(store.waves);
  const variant = groups.head[from] !== -1;
  const length = variant ? 1 : 1 + (groups.size[from] ?? 0);
  const lead = store.waves[from];
  if (!lead) return;

  // Where the block goes in the list as it stands, and whether it is a child.
  let at: number;
  let child: boolean;
  if (zone === "into") {
    const head = headOf(groups, to);
    if (lead.boss || (head >= from && head < from + length)) return;
    at = groupEnd(groups, head) + 1;
    child = true;
  } else {
    const shut = zone === "after" && groups.head[to] === -1 && folded(to);
    at = zone === "before" ? to : shut ? groupEnd(groups, to) + 1 : to + 1;
    if (at > from && at < from + length) return;
    // The row that will stand below the gap once the block has left it.
    const below = at >= from && at <= from + length ? from + length : at;
    child = below < n && groups.head[below] !== -1;
    // A boss would take the children below it as its own: after the group.
    if (child && lead.boss) {
      at = groupEnd(groups, below) + 1;
      child = false;
    }
  }

  const open = store.waves[store.index];
  const block = store.waves.splice(from, length);
  if (at > from) at -= length;
  for (const wave of block) {
    if (child || wave !== lead) wave.variant = true;
    else delete wave.variant;
  }
  store.waves.splice(at, 0, ...block);
  // Carried to the top, a child has nothing above it to belong to.
  const first = store.waves[0];
  if (first?.variant) delete first.variant;
  if (open) store.index = store.waves.indexOf(open);
}
