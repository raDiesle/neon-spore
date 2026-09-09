/**
 * Merging `docs/queue.md` when a lane and the trunk both wrote to it
 *
 * This conflict is not an accident between two lanes: it happens on *every*
 * landing that drains an item, because one tool wrote both sides.
 * `bun run queue take` puts its `Taken:` line on the trunk, which is what makes
 * the claim visible to a session that never sees this worktree; `bun run queue
 * done` then removes the whole entry, and it removes it here, in the lane, so
 * the removal lands with the work that earned it. Two edits to the same lines
 * of the same file, and `git rebase` has no idea they are agreeing.
 *
 * A queue file is a list of entries, one per `##` heading, and that makes the
 * merge well defined rather than a guess about prose. Start from the trunk's
 * copy; drop the entries this lane removed; append the ones it added. Nothing
 * is resolved by preferring a side, so the guard in `queue-guard.ts` still has
 * nothing to catch — an entry the trunk finished is never on the far side of
 * this merge.
 *
 * The one thing it will not do is decide. If both sides rewrote the same
 * entry's body, or both rewrote the preamble, the merge returns `null` and the
 * landing refuses the way it always did. That is rare and it is a real
 * disagreement; the tax this removes is the one nobody authored.
 */

/** One `##` entry: its heading text, and the whole block including the heading. */
export interface Entry {
  title: string;
  block: string;
}

/** The prose above the first `##`, and the entries under it. */
export interface Split {
  preamble: string;
  entries: Entry[];
}

/**
 * The fenced format example in the preamble carries a `## ` line of its own, so
 * splitting on the heading alone would tear the preamble in half and file the
 * example as an entry. Fences are tracked and everything inside one stays where
 * it is.
 */
export function split(md: string): Split {
  const lines = md.split("\n");
  const entries: Entry[] = [];
  const preamble: string[] = [];
  let current: string[] | null = null;
  let title = "";
  let fenced = false;
  const flush = () => {
    if (current) entries.push({ title, block: current.join("\n") });
  };
  for (const line of lines) {
    if (line.startsWith("```")) fenced = !fenced;
    if (!fenced && line.startsWith("## ")) {
      flush();
      title = line.slice(3).trim();
      current = [line];
      continue;
    }
    if (current) current.push(line);
    else preamble.push(line);
  }
  flush();
  return { preamble: preamble.join("\n"), entries };
}

/**
 * The inverse of `split`, exactly — `join(split(md)) === md`.
 *
 * Both halves were cut on line boundaries, so the newline between them belongs
 * to neither and is put back here. A file that opens on a heading has no
 * preamble at all, and must not gain a blank first line.
 */
export function join(parts: Split): string {
  const blocks = parts.entries.map((entry) => entry.block);
  if (parts.preamble === "" && parts.entries.length > 0) return blocks.join("\n");
  return [parts.preamble, ...blocks].join("\n");
}

function byTitle(entries: readonly Entry[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of entries) map.set(entry.title, entry.block);
  return map;
}

/**
 * The three-way merge, entry by entry, or `null` when the two sides genuinely
 * disagree.
 *
 * `base` is the version the lane branched from, `trunk` what it is landing
 * onto, `lane` what it wrote. An entry is followed by its heading rather than
 * by its position, so a `Taken:` line added on the trunk and a removal made in
 * the lane are two edits to two different things and neither is lost.
 */
export function mergeQueue(base: string, trunk: string, lane: string): string | null {
  const baseParts = split(base);
  const trunkParts = split(trunk);
  const laneParts = split(lane);

  const preamble =
    laneParts.preamble === baseParts.preamble
      ? trunkParts.preamble
      : trunkParts.preamble === baseParts.preamble
        ? laneParts.preamble
        : laneParts.preamble === trunkParts.preamble
          ? trunkParts.preamble
          : null;
  if (preamble === null) return null;

  const baseAt = byTitle(baseParts.entries);
  const trunkAt = byTitle(trunkParts.entries);
  const laneAt = byTitle(laneParts.entries);

  const merged: Entry[] = [];
  for (const entry of trunkParts.entries) {
    // Removed by this lane — which is what `bun run queue done` did — unless it
    // is an entry the lane never had in the first place.
    if (!laneAt.has(entry.title) && baseAt.has(entry.title)) continue;
    const mine = laneAt.get(entry.title);
    if (mine === undefined || mine === entry.block) {
      merged.push(entry);
      continue;
    }
    const was = baseAt.get(entry.title);
    if (was === undefined) return null; // both sides filed it, differently
    if (entry.block === was) merged.push({ title: entry.title, block: mine });
    else if (mine === was) merged.push(entry);
    else return null; // both sides rewrote the same entry
  }
  // Entries this lane filed, in the order it filed them.
  for (const entry of laneParts.entries) {
    if (trunkAt.has(entry.title) || baseAt.has(entry.title)) continue;
    merged.push(entry);
  }
  return join({ preamble, entries: merged });
}
