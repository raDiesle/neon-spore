/**
 * **Where the waves live on disk**, and nothing about writing them.
 *
 * Split off `waves-acts.ts` on 22 September 2026, when act eleven's two lines
 * took that file to 254 (`packages/sim/test/limits.test.ts`). The list is the
 * half of it that grows on its own — a line an act, and an act every time one
 * fills up — while the save around it has not changed in a fortnight, so the
 * seam is between the table and the machinery rather than through either.
 * `waves-acts.ts` re-exports both names, and nothing had to change import.
 */

export interface ActFile {
  file: URL;
  rel: string;
  exportName: string;
}

/**
 * The act files, **in the order `waves.ts` concatenates them** — which is the
 * order of the game and not of the names: `act-3b.ts` is the second half of act
 * three and stands between act three and act four, because a file is cut where
 * it fills up rather than where the game changes subject.
 *
 * A save splits the incoming flat list back across them at
 * each act's *current* length, except the last, which takes whatever is left
 * over — so a wave appended in the editor lands in the newest act
 * without either act needing to say which waves are its own.
 */
export const ACT_FILES: readonly ActFile[] = [
  {
    file: new URL("../../../packages/content/src/waves/act-1.ts", import.meta.url),
    rel: "packages/content/src/waves/act-1.ts",
    exportName: "WAVES_ACT_1",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-1b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-1b.ts",
    exportName: "WAVES_ACT_1B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-2.ts", import.meta.url),
    rel: "packages/content/src/waves/act-2.ts",
    exportName: "WAVES_ACT_2",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-3.ts", import.meta.url),
    rel: "packages/content/src/waves/act-3.ts",
    exportName: "WAVES_ACT_3",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-3b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-3b.ts",
    exportName: "WAVES_ACT_3B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-4.ts", import.meta.url),
    rel: "packages/content/src/waves/act-4.ts",
    exportName: "WAVES_ACT_4",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-4b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-4b.ts",
    exportName: "WAVES_ACT_4B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-5.ts", import.meta.url),
    rel: "packages/content/src/waves/act-5.ts",
    exportName: "WAVES_ACT_5",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-6.ts", import.meta.url),
    rel: "packages/content/src/waves/act-6.ts",
    exportName: "WAVES_ACT_6",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7.ts",
    exportName: "WAVES_ACT_7",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7a.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7a.ts",
    exportName: "WAVES_ACT_7A",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7b.ts",
    exportName: "WAVES_ACT_7B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7c.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7c.ts",
    exportName: "WAVES_ACT_7C",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7d.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7d.ts",
    exportName: "WAVES_ACT_7D",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7e.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7e.ts",
    exportName: "WAVES_ACT_7E",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7f.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7f.ts",
    exportName: "WAVES_ACT_7F",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-7g.ts", import.meta.url),
    rel: "packages/content/src/waves/act-7g.ts",
    exportName: "WAVES_ACT_7G",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-8.ts", import.meta.url),
    rel: "packages/content/src/waves/act-8.ts",
    exportName: "WAVES_ACT_8",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-8b.ts", import.meta.url),
    rel: "packages/content/src/waves/act-8b.ts",
    exportName: "WAVES_ACT_8B",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-9.ts", import.meta.url),
    rel: "packages/content/src/waves/act-9.ts",
    exportName: "WAVES_ACT_9",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-10.ts", import.meta.url),
    rel: "packages/content/src/waves/act-10.ts",
    exportName: "WAVES_ACT_10",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-11.ts", import.meta.url),
    rel: "packages/content/src/waves/act-11.ts",
    exportName: "WAVES_ACT_11",
  },
  {
    file: new URL("../../../packages/content/src/waves/act-12.ts", import.meta.url),
    rel: "packages/content/src/waves/act-12.ts",
    exportName: "WAVES_ACT_12",
  },
];
