/**
 * The wave editor's unsaved edits, kept across a reload — the owner, 11
 * October 2026: *on reload it remember in localstorage what i changed*, with
 * a RESET that drops them and a count on the save button.
 *
 * What the page last read off disk (or wrote to it) is the **base**; the
 * store's list is the **draft**. Every repaint compares the two by wave `id`
 * and, when they differ, writes the draft to localStorage; when they agree it
 * forgets it, so an edit undone by hand leaves nothing behind.
 *
 * A draft is stored with the token of the files it was made against
 * (`waves-io.ts`). If the files have not moved by the next load, the draft is
 * the list. If they have — a save from another tab, a landing — only the
 * waves the draft actually edited are laid over the fresh files, so a wave
 * this page never touched is not written back over somebody else's change.
 */

import type { Wave } from "@neon-spore/content";
import { readRemembered, writeRemembered } from "./remembered.js";

const KEY = "wave-draft";

/** What localStorage holds between two loads. */
export interface StoredDraft {
  /** The revision of the act files the draft was made against. */
  token: string;
  waves: Wave[];
  /** Ids of waves the draft added or changed. */
  edited: string[];
  /** Ids the base held, so a wave deleted in the draft stays deleted. */
  base: string[];
}

/** Ids of the waves in `waves` that are new or differ from `base`. */
export function editedIds(base: ReadonlyMap<string, string>, waves: readonly Wave[]): string[] {
  return waves.filter((w) => base.get(w.id) !== JSON.stringify(w)).map((w) => w.id);
}

/**
 * How many waves the draft differs from the base by: changed, added and
 * deleted ones, and a reorder with nothing else changed counts as one.
 */
export function changedCount(
  base: ReadonlyMap<string, string>,
  waves: readonly Wave[],
  edited: readonly string[] = editedIds(base, waves),
): number {
  const here = new Set(waves.map((w) => w.id));
  const removed = [...base.keys()].filter((id) => !here.has(id)).length;
  const n = edited.length + removed;
  if (n > 0) return n;
  return [...base.keys()].join() === waves.map((w) => w.id).join() ? 0 : 1;
}

/** The list a stored draft makes of the act files as they are now. */
export function overlayDraft(draft: StoredDraft, disk: readonly Wave[], token: string): Wave[] {
  if (draft.token === token) return draft.waves;
  const fresh = new Map(disk.map((w) => [w.id, w]));
  const edited = new Set(draft.edited);
  const base = new Set(draft.base);
  const out: Wave[] = [];
  for (const w of draft.waves) {
    if (edited.has(w.id)) out.push(w);
    else if (fresh.has(w.id)) out.push(fresh.get(w.id) as Wave);
    // Untouched here and deleted on disk since: the disk is right.
    else if (!base.has(w.id)) out.push(w);
  }
  const ids = new Set(out.map((w) => w.id));
  for (const w of disk) if (!base.has(w.id) && !ids.has(w.id)) out.push(w);
  return out;
}

function readDraft(): StoredDraft | null {
  const raw = readRemembered(KEY);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as StoredDraft;
    return Array.isArray(draft.waves) && draft.waves.length > 0 ? draft : null;
  } catch {
    return null;
  }
}

export interface WaveDraft {
  /** The act files as the page has just read or written them. */
  setBase(waves: readonly Wave[], token: string): void;
  /** A fresh copy of the base, for RESET. */
  base(): Wave[];
  /** The stored draft laid over `disk`, or null when there is none. */
  restore(disk: readonly Wave[], token: string): Wave[] | null;
  /**
   * How many waves differ from the base, storing the draft or forgetting it
   * to match. Zero, and nothing stored, until the first `setBase`: before the
   * load answers, the list is the bundled fallback and would wipe the draft.
   */
  settle(waves: readonly Wave[]): number;
  forget(): void;
}

export function makeWaveDraft(): WaveDraft {
  let base: Wave[] | null = null;
  let baseJson = new Map<string, string>();
  let token = "";

  return {
    setBase(waves, at) {
      base = structuredClone([...waves]);
      baseJson = new Map(base.map((w) => [w.id, JSON.stringify(w)]));
      token = at;
    },
    base: () => structuredClone(base ?? []),
    restore(disk, at) {
      const draft = readDraft();
      return draft ? overlayDraft(draft, disk, at) : null;
    },
    settle(waves) {
      if (!base) return 0;
      const edited = editedIds(baseJson, waves);
      const n = changedCount(baseJson, waves, edited);
      if (n === 0) {
        writeRemembered(KEY, null);
        return 0;
      }
      const draft: StoredDraft = {
        token,
        waves: [...waves],
        edited,
        base: [...baseJson.keys()],
      };
      writeRemembered(KEY, JSON.stringify(draft));
      return n;
    },
    forget: () => writeRemembered(KEY, null),
  };
}
