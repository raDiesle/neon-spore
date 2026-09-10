import { describe, expect, it } from "bun:test";
import { join, relative } from "node:path";
import { Glob } from "bun";
import { COPIES } from "./copies-table.js";
import { ROOT, stripNonCode } from "./source-scan.js";

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
      const rel = f.replaceAll("\\", "/");
      if (!rel.includes("node_modules") && !rel.includes("dist") && !rel.includes(".claude")) {
        all.push(join(ROOT, f));
      }
    }
  }
  return all;
}

/** Each file read once and stripped once, whichever rows ask for it. */
class Sources {
  private readonly raw = new Map<string, string>();
  private readonly stripped = new Map<string, string>();

  async text(file: string): Promise<string> {
    let text = this.raw.get(file);
    if (text === undefined) {
      text = await Bun.file(file).text();
      this.raw.set(file, text);
    }
    return text;
  }

  async code(file: string, strip: boolean): Promise<string> {
    if (!strip) return await this.text(file);
    let code = this.stripped.get(file);
    if (code === undefined) {
      code = stripNonCode(await this.text(file));
      this.stripped.set(file, code);
    }
    return code;
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

    it(`every other file calls ${copy.call} instead of re-deriving it`, async () => {
      const offenders: string[] = [];
      for (const file of files) {
        if (allowed.has(file)) continue;
        if (copy.pattern.test(await sources.code(file, strip))) {
          offenders.push(relative(ROOT, file).replaceAll("\\", "/"));
        }
      }
      expect(
        offenders,
        `Call ${copy.call} from ${copy.owner} in: ${offenders.join(", ")}`,
      ).toHaveLength(0);
    });
  }
});
