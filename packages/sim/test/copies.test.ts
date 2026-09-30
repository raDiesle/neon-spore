import { describe, expect, it } from "bun:test";
import { join, relative } from "node:path";
import { Glob } from "bun";
import { itCosts } from "../../../tools/test/figure.js";
import { treeText } from "../../../tools/test/tree-text.js";
import { COPIES } from "./copies-table.js";
import { ROOT, read, stripNonCode } from "./source-scan.js";

/**
 * The table lives next door in `copies-table.ts`, because it grows by a row
 * per finding and the check over it does not. This file is the check.
 *
 * **One case per row, not one per row and file.** It used to be the latter:
 * seventy thousand cases, each reading and stripping its file again, twenty
 * seconds of a suite that was four and a half minutes — and the only thing the
 * extra cases bought was a name per file in a listing nobody scrolls. The
 * failure names the file just the same; it is in the message now.
 */

function allSourceFiles(): string[] {
  const patterns = ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts", "tools/**/*.ts"];
  const all: string[] = [];
  for (const pattern of patterns) {
    const glob = new Glob(pattern);
    for (const f of glob.scanSync(ROOT)) {
      // Tested against the path *inside* the repository, never the absolute
      // one: a git worktree lives under `.claude/worktrees/`, so an absolute
      // test threw away every file in the tree and the whole guard passed
      // vacuously wherever it mattered most — in the copy work is done in.
      // What counts as unread is `source-scan.ts`'s list, not this chain: it
      // had lost the scratch directory the other two walks also have to skip.
      if (read(f)) all.push(join(ROOT, f));
    }
  }
  return all;
}

/**
 * Each file read once and stripped once, whichever rows ask for it. The
 * reading is `tools/test/tree-text.ts`', many files at a time: until 30
 * September 2026 the first row opened every file one `await` after another.
 */
class Sources {
  private readonly stripped = new Map<string, string>();

  async code(file: string, strip: boolean): Promise<string> {
    return (await this.codes([file], strip))[0] as string;
  }

  async codes(files: readonly string[], strip: boolean): Promise<string[]> {
    const texts = await treeText(files);
    if (!strip) return texts;
    return files.map((file, i) => {
      let code = this.stripped.get(file);
      if (code === undefined) {
        code = stripNonCode(texts[i] as string);
        this.stripped.set(file, code);
      }
      return code;
    });
  }
}

describe("no re-derived rules", () => {
  const files = allSourceFiles();
  const sources = new Sources();

  it("guards a non-empty set of files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const copy of COPIES) {
    const ownerPath = join(ROOT, copy.owner);
    const strip = copy.strip !== false;

    it(`${copy.owner} contains its own pattern`, async () => {
      expect(copy.pattern.test(await sources.code(ownerPath, strip))).toBe(true);
    });

    const allowed = new Set([ownerPath, ...(copy.also ?? []).map((f) => join(ROOT, f))]);

    itCosts(450, `every other file calls ${copy.call} instead of re-deriving it`, async () => {
      const offenders: string[] = [];
      const codes = await sources.codes(files, strip);
      files.forEach((file, i) => {
        if (allowed.has(file)) return;
        if (copy.pattern.test(codes[i] as string)) {
          offenders.push(relative(ROOT, file).replaceAll("\\", "/"));
        }
      });
      expect(
        offenders,
        `Call ${copy.call} from ${copy.owner} in: ${offenders.join(", ")}`,
      ).toHaveLength(0);
      // The first rule to run reads and strips the whole tree — fifteen
      // hundred files — and every rule after it is served from `Sources`. That
      // first one costs 205 ms alone on the cloud image, 18 September 2026,
      // and passed five seconds twice under `bun run check`'s eight shards on
      // 12 September 2026. What it waits on is the machine, so the budget
      // rises with the load (`tools/test/repo-time.ts`) rather than standing
      // at a flat number that is right for one machine and no other.
    });
  }
});
