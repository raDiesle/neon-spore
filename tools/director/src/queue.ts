/**
 * `docs/queue.md`, drawn as one more group on the NOT BUILT YET sheet.
 *
 * It is a third state and neither of the other two: a spec entry is unbuilt and
 * undecided, a parked idea is unbuilt and unclaimed, and a queue entry is
 * unbuilt and *already decided on*. That distinction is worth keeping and is
 * the only part of the old queue machinery that was.
 *
 * What went with the machinery is the status: this used to ask git about every
 * lane's branch and label it `waiting`, `opened`, `flying` or `landed`, so a
 * board could be read while several ran at once. Nothing runs at once any more
 * — the work is picked up one session at a time, by hand — so the question that
 * answered has stopped being asked, and answering it cost four `git` calls per
 * entry on every load of the sheet.
 *
 * So this is a pure read of the markdown, like every other group in
 * `backlog.ts`, which is also why it can live beside them rather than in an
 * async file of its own.
 */

import type { BacklogEntry, BacklogGroup } from "./backlog.js";

export interface Lane {
  title: string;
  /**
   * The `_… · …_` line under the heading, verbatim, or "".
   *
   * Historically `branch · the paths that lane owns`, from when two lanes ran
   * side by side and path ownership was what kept them apart. Read as prose now
   * rather than parsed: the paths are still the useful half — they say what a
   * session picking this up is going to touch — and the branch name is a
   * suggestion nobody is bound by.
   */
  meta: string;
  /** What it is and what finished looks like, verbatim. */
  brief: string;
}

const HEADING = /^## (.+)$/;
const META = /^_(.+)_$/;

export function parseQueue(md: string): Lane[] {
  const lanes: Lane[] = [];
  const body = new Map<Lane, string[]>();
  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();
    const heading = HEADING.exec(line.trim());
    if (heading) {
      const lane: Lane = { title: (heading[1] ?? "").trim(), meta: "", brief: "" };
      lanes.push(lane);
      body.set(lane, []);
      continue;
    }
    const lane = lanes.at(-1);
    if (!lane) continue;
    const meta = META.exec(line.trim());
    if (meta && !lane.meta && (body.get(lane)?.length ?? 0) === 0) {
      lane.meta = (meta[1] ?? "").trim();
      continue;
    }
    body.get(lane)?.push(line);
  }
  for (const lane of lanes) lane.brief = (body.get(lane) ?? []).join("\n").trim();
  return lanes.filter((lane) => lane.title);
}

/**
 * One group, one entry per lane, in the file's own order — first in the file is
 * next to be done, the same rule `docs/queue.md`'s own header states.
 */
export function buildQueue(md: string): BacklogGroup[] {
  const lanes = parseQueue(md);
  if (lanes.length === 0) return [];
  const entries: BacklogEntry[] = lanes.map((lane) => ({
    name: lane.title,
    kind: "queued",
    note: lane.meta || "no paths named",
    detail: lane.brief,
    ref: "docs/queue.md",
  }));
  return [
    {
      title: "THE QUEUE",
      note: "decided, not yet done — docs/queue.md; first in the file is next",
      entries,
      builtHidden: 0,
    },
  ];
}
