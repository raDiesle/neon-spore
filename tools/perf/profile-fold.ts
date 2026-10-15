/**
 * **A `.cpuprofile` folded into time per function** — self, and total with
 * everything it called — for `bun run profile` (`profile.ts`).
 *
 * The profile is the Chrome format `bun --cpu-prof` writes: a call tree of
 * nodes, and a list of samples each naming the node that was running, with the
 * microseconds since the sample before. A sample lasts until the next one, so
 * the last sample has no length and is not counted, which is how the DevTools
 * timeline reads the same file.
 *
 * A function is a name and a place, so two `step`s in two files are two rows,
 * and a function that recurses is counted once per sample in its total — the
 * time it was anywhere on the stack, not the sum over its frames.
 */

export interface ProfileNode {
  id: number;
  callFrame: { functionName: string; url: string; lineNumber: number };
  children?: number[];
}

export interface CpuProfile {
  nodes: ProfileNode[];
  samples: number[];
  timeDeltas: number[];
}

export interface FoldedRow {
  /** `name file:line`, the line counted from one. */
  name: string;
  selfUs: number;
  totalUs: number;
}

export interface Folded {
  rows: FoldedRow[];
  /** Every sample's length together: the run the profile saw. */
  sampledUs: number;
}

/** The tree's own top, which every sample is under and which is never the answer. */
const ROOT = "(root)";

/** Where a frame is, as short as tells it apart: the path under `root` if it is in there. */
function place(url: string, root: string): string {
  const path = url.startsWith("file://") ? url.slice("file://".length) : url;
  if (path === "") return "";
  return path.startsWith(`${root}/`) ? path.slice(root.length + 1) : path;
}

function nameOf(node: ProfileNode, root: string): string {
  const f = node.callFrame;
  const fn = f.functionName === "" ? "(anonymous)" : f.functionName;
  const at = place(f.url, root);
  return at === "" ? fn : `${fn} ${at}:${f.lineNumber + 1}`;
}

/** Fold `profile` into one row per function, `root` cut off the front of paths. */
export function foldProfile(profile: CpuProfile, root = ""): Folded {
  const byId = new Map<number, ProfileNode>();
  const parent = new Map<number, number>();
  for (const n of profile.nodes) {
    byId.set(n.id, n);
    for (const c of n.children ?? []) parent.set(c, n.id);
  }
  const rows = new Map<string, FoldedRow>();
  const row = (name: string): FoldedRow => {
    let r = rows.get(name);
    if (r === undefined) {
      r = { name, selfUs: 0, totalUs: 0 };
      rows.set(name, r);
    }
    return r;
  };
  let sampledUs = 0;
  for (let i = 0; i < profile.samples.length; i++) {
    const us = profile.timeDeltas[i + 1] ?? 0;
    const leaf = byId.get(profile.samples[i] ?? -1);
    if (leaf === undefined || us <= 0) continue;
    sampledUs += us;
    const seen = new Set<string>();
    for (let n: ProfileNode | undefined = leaf; n !== undefined; ) {
      const name = nameOf(n, root);
      if (name !== ROOT && !seen.has(name)) {
        seen.add(name);
        row(name).totalUs += us;
      }
      const up = parent.get(n.id);
      n = up === undefined ? undefined : byId.get(up);
    }
    const leafName = nameOf(leaf, root);
    if (leafName !== ROOT) row(leafName).selfUs += us;
  }
  return { rows: [...rows.values()], sampledUs };
}

/** The `n` rows highest by `key`, highest first, ties by name so a run reads the same twice. */
export function topBy(rows: FoldedRow[], key: "selfUs" | "totalUs", n: number): FoldedRow[] {
  const byName = (a: FoldedRow, b: FoldedRow): number =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  return [...rows].sort((a, b) => b[key] - a[key] || byName(a, b)).slice(0, n);
}
