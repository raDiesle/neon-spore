import { readFileSync } from "node:fs";
import { parseActList } from "./waves-act-list.js";

/**
 * **Where the waves live on disk**, and nothing about writing them.
 *
 * Split off `waves-acts.ts` on 22 September 2026, when act eleven's two lines
 * took that file to 254 (`packages/sim/test/limits.test.ts`). It was a table
 * typed by hand, five lines an act; since 14 October 2026 it is read off
 * `packages/content/src/waves/acts.ts`, the one list of act files, which the
 * save itself rewrites when it cuts a full act (`waves-act-list.ts`). So a
 * new act is never a line anybody has to add here.
 */

export interface ActFile {
  file: URL;
  rel: string;
  exportName: string;
}

/** The list of act files, and where it sits in the repository. */
export interface ActList {
  file: URL;
  rel: string;
}

/** The real one. */
export const ACT_LIST: ActList = {
  file: new URL("../../../packages/content/src/waves/acts.ts", import.meta.url),
  rel: "packages/content/src/waves/acts.ts",
};

/**
 * The act files a list names, **in the order of the game** — the order of its
 * array, not of the names: `act-3b.ts` is the second half of act three and
 * stands between act three and act four. Read fresh on every call, because a
 * save may have cut a new act since the last one.
 */
export function actFilesIn(list: ActList): ActFile[] {
  const dir = list.rel.slice(0, list.rel.lastIndexOf("/") + 1);
  return parseActList(readFileSync(list.file, "utf8")).map((a) => ({
    file: new URL(`./${a.name}.ts`, list.file),
    rel: `${dir}${a.name}.ts`,
    exportName: a.exportName,
  }));
}

/** The act files as they stood when this module loaded. A save reads the list
 * again (`actFilesIn`) rather than trusting this. */
export const ACT_FILES: readonly ActFile[] = actFilesIn(ACT_LIST);
