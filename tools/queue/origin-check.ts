/**
 * **What `origin/main` says about an item, asked before `next` or `take`
 * claims it.**
 *
 * The claim's `Taken:` line is pushed to origin, and a session reads it only
 * from its own copy of the trunk. On 26 September 2026 a cloud session had
 * claimed "§34 THE CYST — the simulation lane" and had it half built when a
 * session on the owner's machine, whose `main` had not been fetched, took the
 * same boss and landed it; the cloud lane was thrown away whole. The push of a
 * claim is refused when the trunk is behind (`claim-push.ts`), but a session
 * whose trunk has landings of its own never gets that far, and neither does
 * one that finds the entry already gone.
 *
 * So `origin/main` is fetched and asked first. An entry origin marks taken by
 * somebody else is refused with the holder's name; one origin no longer has at
 * all, while this trunk still does, was finished there.
 */

import { heldElsewhere } from "./claim.js";
import { hasEntry, takenIn } from "./edit.js";
import { gitIn, gitWith } from "./git.js";
import type { Item } from "./queue.js";
import { TRUNK } from "./tree.js";

/** Origin's copies of the two files, or `null` for one it could not be read from. */
export interface OriginView {
  queue: string | null;
  parked: string | null;
}

/**
 * Why origin says this item is not free, or `undefined` when it is.
 *
 * `known` is the mark this checkout already judged — the working copy's or the
 * trunk's — and a mark origin shares with it is left to that judgement: it is
 * the same line, and `take` has already decided whether it is the caller's own
 * or a spent one (`spent.ts`).
 */
export function originRefusal(
  item: Item,
  view: OriginView,
  trunkHasIt: boolean,
  head: string,
  known: string,
): string | undefined {
  const md = view[item.source];
  if (md === null) return undefined;
  if (!hasEntry(md, item.title)) {
    return trunkHasIt ? `already done on origin/${TRUNK} — fetch it before claiming` : undefined;
  }
  const mark = takenIn(md, item.title);
  if (mark === "" || mark === known) return undefined;
  const held = heldElsewhere({ ...item, taken: mark }, [], head);
  return held ? `already taken on origin/${TRUNK} — ${held}` : undefined;
}

/** Fetch `origin/main` and read both files off it. Nothing is read without an origin. */
export function readOrigin(root: string): OriginView {
  const none = { queue: null, parked: null };
  if (!gitIn(root, "remote", "get-url", "origin").ok) return none;
  if (!gitIn(root, "fetch", "-q", "origin", TRUNK).ok) {
    console.log(`  ⚑ origin cannot be reached — its claims were not asked`);
    return none;
  }
  const show = (file: string) => {
    const r = gitWith({ cwd: root, raw: true }, "show", `origin/${TRUNK}:docs/${file}.md`);
    return r.ok ? r.out : null;
  };
  return { queue: show("queue"), parked: show("parked") };
}
