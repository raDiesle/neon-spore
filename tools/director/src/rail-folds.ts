import { readRemembered, writeRemembered } from "./remembered.js";

/**
 * WHICH GROUPS IN THE WAVE LIST ARE OPEN (`rail-groups.ts`).
 *
 * **Folded until opened**, because folding is what grouping is for: the owner
 * asked for it so that the waves which introduce something stay visible, and
 * a list that opened every group by default would be the list he already had.
 *
 * Kept by wave **id** rather than by place, so a group stays open when a drag
 * moves it, and across a reload with the rest of the list's view state
 * (`remembered.ts`). The wave being edited is drawn whatever its group says —
 * `rail-list.ts` makes that call, for the reason it keeps it through a filter.
 */
export interface RailFolds {
  /** Whether the group headed by the wave with this id is open. */
  open(id: string): boolean;
  /** Opens a folded group, folds an open one, and redraws. */
  toggle(id: string): void;
  /** Opens every group headed by one of `ids`, or folds every group, and
   * redraws — the owner's *expand or minimize all waves*, 15 October 2026. */
  setAll(ids: readonly string[], open: boolean): void;
}

const OPEN_KEY = "wave-groups-open";

export function bindRailFolds(onChange: () => void): RailFolds {
  const open = new Set<string>(readIds());
  const changed = (): void => {
    writeRemembered(OPEN_KEY, open.size ? JSON.stringify([...open]) : null);
    onChange();
  };
  return {
    open: (id) => open.has(id),
    toggle(id) {
      if (open.has(id)) open.delete(id);
      else open.add(id);
      changed();
    },
    setAll(ids, opening) {
      open.clear();
      if (opening) for (const id of ids) open.add(id);
      changed();
    },
  };
}

function readIds(): string[] {
  try {
    const kept: unknown = JSON.parse(readRemembered(OPEN_KEY) ?? "[]");
    return Array.isArray(kept) ? kept.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
