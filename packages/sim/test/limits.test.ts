import { describe, expect, it } from "bun:test";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { counted, KNOWN_LONG, LIMIT, lineCount } from "../../../tools/hooks/file-size.ts";
import { itCosts } from "../../../tools/test/figure.js";

/**
 * A session reads less when files are small. The 250-line limit keeps source
 * files scannable in one pass — a reviewer or a maintainer can hold the whole
 * shape of a file in their head, and a language model can read it without
 * truncating it.
 *
 * The limit, the exempt list and which paths the two of them reach are
 * `tools/hooks/file-size.ts`, because `after-edit-size.ts` says a file is
 * filling up at the moment it is written and has to mean the same thing by it.
 * This file is still the rule — the hook only ever warns.
 *
 * **Every case here reports all of its offenders, not the first.** An `expect`
 * inside the loop throws on the first file over, and everything after it goes
 * unlooked-at — so a lane that added one row to several lists at once met four
 * full pages one at a time, re-reading 560 files between each. Four runs at
 * two and a half minutes, for four facts the first run already had in hand.
 * So each loop collects and the assertion comes after it: one `expect`, one
 * budget, and a failure that names every file and its count at once.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function sourceFiles(): string[] {
  // `**` rather than `*/src/**`: a file outside a `src/` directory is still a
  // file somebody has to read, and the four longest in the repository were all
  // outside one — `tools/versus/prompt.ts` at 509 lines went over the limit,
  // and past twice the limit, without this test ever looking at it.
  //
  // A second glob for the one `.md` `counted` also reaches: a skill's own
  // `SKILL.md`, held to the same ceiling since 19 September 2026 for the same
  // reason `.ts` source is (`docs/queue.md`).
  //
  // Filtered while the paths are still the glob's own relative ones, which is
  // what `counted` answers about: an absolute path under a checkout that
  // happens to live in a directory called `apps` is not an `apps/` file.
  const ts = [...new Glob("{packages,apps,tools}/**/*.ts").scanSync(ROOT)];
  const skills = [...new Glob(".claude/skills/**/*.md").scanSync(ROOT)];
  return [...ts, ...skills]
    .map((f) => f.replaceAll("\\", "/"))
    .filter(counted)
    .map((f) => join(ROOT, f));
}

/** The markdown beside the code: read by tools (`tools/queue`), so held to the same bytes. */
function docFiles(): string[] {
  return [...new Glob("docs/**/*.md").scanSync(ROOT)].map((f) => join(ROOT, f));
}

/**
 * **Every file the four cases look at, read once and in parallel.** Each case
 * used to read the whole tree for itself, one file at a time: nine times its
 * figure alone by 26 September 2026, and past the 20 s timeout under a loaded
 * `bun run check` (`docs/queue.md`). Three thousand files one after another
 * cost about 400 ms here, and in batches about 70, and the cases then share
 * one read instead of making three. Batched rather than all at once, so a
 * machine with a low open-file limit is not handed three thousand at a time.
 */
let reading: Promise<Map<string, Uint8Array>> | undefined;
function contents(): Promise<Map<string, Uint8Array>> {
  reading ??= readAll([...new Set([...sourceFiles(), ...docFiles()])]);
  return reading;
}

const BATCH = 256;

async function readAll(files: readonly string[]): Promise<Map<string, Uint8Array>> {
  const out = new Map<string, Uint8Array>();
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const bytes = await Promise.all(
      batch.map(async (f) => [f, await Bun.file(f).bytes()] as const),
    );
    for (const [f, b] of bytes) out.set(f, b);
  }
  return out;
}

/**
 * What the shared read costs whichever case pays it. It was 200 over 3,200
 * files; by 30 September 2026 the tree had grown to nearly five thousand, and one
 * run of three alone at a load of 28 to 42 came to about a second idle. So
 * 500, which covers two of those three and leaves the third to say so.
 */
const READ_MS = 500;

const decoder = new TextDecoder();

/** The file's own count, by the same rule the hook applies to what it is handed. */
async function linesIn(file: string): Promise<number> {
  const bytes = (await contents()).get(file) ?? (await Bun.file(file).bytes());
  return lineCount(decoder.decode(bytes));
}

describe("file size limits", () => {
  const files = sourceFiles();

  itCosts(READ_MS, "keeps source files under the limit", async () => {
    const over: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (rel in KNOWN_LONG) continue;
      const lines = await linesIn(file);
      if (lines > LIMIT) over.push(`${rel} has ${lines} lines, limit is ${LIMIT}`);
    }
    expect(over).toEqual([]);
    // Whichever case runs first pays the shared read (`contents`): 105 ms
    // alone on a quiet Mac on 27 September 2026, over 3,200 files, where each
    // case reading for itself had cost 3.6 s at a slowdown of 1.8. What that
    // costs is the machine rather than the work, so the budget scales with the load
    // (`tools/test/repo-time.ts`) instead of being a flat number that is right
    // for one machine under one load and for no other.
  });

  it("does not let a known long file grow", async () => {
    const grown: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replaceAll("\\", "/");
      if (!(rel in KNOWN_LONG)) continue;
      const lines = await linesIn(file);
      const max = KNOWN_LONG[rel]!;
      if (lines > max) grown.push(`${rel} has ${lines} lines, known max is ${max}`);
    }
    expect(grown).toEqual([]);
  });

  it("drops a known long file once it is short enough", async () => {
    const shrunk: string[] = [];
    for (const [rel] of Object.entries(KNOWN_LONG)) {
      const file = join(ROOT, ...rel.split("/"));
      const lines = await linesIn(file);
      if (lines <= LIMIT) shrunk.push(`${rel} is now ${lines} lines — delete it from KNOWN_LONG`);
    }
    expect(shrunk).toEqual([]);
  });
});

/**
 * A source file is text, to git as much as to a reader. `waves-api.ts` carried
 * two raw NUL bytes for twelve days — the separator in `wavesToken`, typed as
 * the byte rather than the escape — and git classed the file as binary for
 * all of them: every `diff --stat` said `Bin`, `git show` printed no hunk,
 * `grep` skipped it, and a rebase conflict in it could not have been resolved
 * by hand. No check said a word, because a line count is blind to what the
 * line holds. Found 14 September 2026.
 */
describe("source files are text", () => {
  const files = [...sourceFiles(), ...docFiles()];

  itCosts(READ_MS, "has no control byte but tab, LF and CR in any of them", async () => {
    const binary: string[] = [];
    const read = await contents();
    for (const file of files) {
      const bytes = read.get(file) ?? (await Bun.file(file).bytes());
      const at = bytes.findIndex((b) => b < 0x20 && b !== 0x09 && b !== 0x0a && b !== 0x0d);
      if (at === -1) continue;
      const rel = relative(ROOT, file).replaceAll(sep, "/");
      binary.push(`${rel} has byte 0x${bytes[at]?.toString(16)} at offset ${at}`);
    }
    expect(binary).toEqual([]);
    // The same read as the size case, and the same figure: a few milliseconds
    // after it, and the whole read when this case is run alone (`-t`).
  });
});
