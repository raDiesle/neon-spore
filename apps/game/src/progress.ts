/**
 * How far this device has got, kept on this device.
 *
 * The front door knew only PLAY versus RESUME, so a player who put the phone
 * down at wave seven came back to a menu that offered them wave one and a
 * thirty-eight-line list to find their place in. What is remembered is the
 * smallest thing that answers that: the furthest wave reached, and the score
 * the last run left behind.
 *
 * **Solo, per device, and never shared.** This is a convenience, not state two
 * people agree about — it never touches the room or the wire, because a record
 * that crossed the wire would be a second thing to keep in step for no gain at
 * all. Two phones playing together each remember their own.
 *
 * The deciding is pure and the storage is four lines at the bottom, so the
 * rules can be tested without a DOM — which this repo's runner does not have.
 */

/** The key the browser keeps it under. Namespaced like the others. */
export const PROGRESS_KEY = "neon-spore.progress";

export interface Progress {
  /** The furthest wave reached, counted from 0 as `world.wave` is. */
  furthest: number;
  /** The score the last run was on when it was last seen. */
  lastScore: number;
}

/** A device that has never played. Every field zero, and no line to draw. */
export const NOTHING_YET: Progress = { furthest: 0, lastScore: 0 };

/** Whether there is anything worth showing a returning player. */
export function hasProgress(p: Progress): boolean {
  return p.furthest > 0 || p.lastScore > 0;
}

/**
 * The record after a wave is reached. Furthest only ever goes up: jumping to
 * wave three from the WAVES list is not losing wave seven, and neither is
 * starting over.
 */
export function reached(p: Progress, wave: number): Progress {
  if (!Number.isFinite(wave) || wave <= p.furthest) return p;
  return { ...p, furthest: Math.floor(wave) };
}

/** The record after a run is seen on a score. The last one wins, high or low. */
export function scored(p: Progress, score: number): Progress {
  if (!Number.isFinite(score) || score < 0 || Math.floor(score) === p.lastScore) return p;
  return { ...p, lastScore: Math.floor(score) };
}

/**
 * Whatever was stored, read as a record.
 *
 * Deliberately forgiving in one direction only: anything unreadable, missing
 * or the wrong shape becomes "never played", because a player whose stored
 * record has gone strange wants a menu, not an error. Negative and fractional
 * numbers are dropped rather than clamped — they cannot come from this code,
 * so they are somebody's hand-edit and honouring them is honouring a guess.
 */
export function parseProgress(raw: string | null): Progress {
  if (raw === null) return NOTHING_YET;
  try {
    const read = JSON.parse(raw) as Partial<Progress> | null;
    if (read === null || typeof read !== "object") return NOTHING_YET;
    return {
      furthest: whole(read.furthest),
      lastScore: whole(read.lastScore),
    };
  } catch {
    return NOTHING_YET;
  }
}

function whole(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

/** The line the menu draws under the title, or nothing when there is none. */
export function progressLine(p: Progress): string {
  if (!hasProgress(p)) return "";
  return `Furthest: wave ${p.furthest + 1} · Last score ${p.lastScore}`;
}

/**
 * The stored record. Wrapped, like `view.ts`'s store: private browsing refuses
 * to keep anything and a game that cannot remember is still a game.
 */
export function readProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(PROGRESS_KEY));
  } catch {
    return NOTHING_YET;
  }
}

export function writeProgress(next: Progress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch {
    // Nothing to be done, and nothing that needs saying: the run carries on.
  }
}

/** Read, change, write — the one shape every caller wants. */
export function updateProgress(change: (p: Progress) => Progress): Progress {
  const next = change(readProgress());
  writeProgress(next);
  return next;
}
