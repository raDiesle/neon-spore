import { describe, expect, it } from "bun:test";
import { repoPath, touched } from "../after-edit-size.ts";
import { guardsDeterminism } from "../after-sim-edit.ts";
import { counted, LIMIT, lineCount, mark, notice } from "../file-size.ts";
import { formats } from "../format-edited.ts";
import { editedPath, shellCommand, stopHookActive } from "../payload.ts";
import { writtenPaths } from "../written-paths.ts";

/**
 * The two `PostToolUse` hooks, and the payload reader underneath them.
 *
 * Each was a bash script that pulled `file_path` out of the raw JSON with a
 * `grep -o` and then matched it with a `case`. Both parts are now functions,
 * and this is the file that says what they answer — a hook whose decision can
 * only be exercised by editing a file and watching for a side effect is a hook
 * nobody checks.
 */

const edit = (file_path: unknown) => ({ tool_input: { file_path } });

describe("the path an edit names", () => {
  it("comes back with Windows separators normalised", () => {
    expect(editedPath(edit("C:\\Users\\raDi\\repo\\packages\\sim\\src\\step.ts"))).toBe(
      "C:/Users/raDi/repo/packages/sim/src/step.ts",
    );
  });

  it("is left alone when it already has forward slashes", () => {
    expect(editedPath(edit("packages/sim/src/step.ts"))).toBe("packages/sim/src/step.ts");
  });

  it("is null for a payload with nothing to say", () => {
    // A payload is another program's object: every field is optional, and a
    // hook that throws on one it did not expect blocks the tool that fired it.
    expect(editedPath(null)).toBeNull();
    expect(editedPath({})).toBeNull();
    expect(editedPath(edit(undefined))).toBeNull();
    expect(editedPath(edit(""))).toBeNull();
    expect(editedPath(edit(42))).toBeNull();
  });
});

describe("whether a stop is the one already sent back", () => {
  it("is true only for the boolean, never for the string", () => {
    // The bash version matched `"stop_hook_active":true` in the raw text, so a
    // payload spelling it `"true"` — or with unusual whitespace — read as the
    // opposite of what it said. Parsed, there is one answer.
    expect(stopHookActive({ stop_hook_active: true })).toBe(true);
    expect(stopHookActive({ stop_hook_active: "true" })).toBe(false);
    expect(stopHookActive({ stop_hook_active: false })).toBe(false);
    expect(stopHookActive({})).toBe(false);
    expect(stopHookActive(null)).toBe(false);
  });
});

describe("what the formatter is handed", () => {
  it("takes the extensions Biome has something to say about", () => {
    for (const p of ["a.ts", "a.tsx", "a.js", "a.jsx", "a.json", "a.css"]) {
      expect(formats(p)).toBe(true);
    }
  });

  it("leaves everything else alone", () => {
    for (const p of ["README.md", "icon.svg", "a.sh", "waves.txt", "no-extension"]) {
      expect(formats(p)).toBe(false);
    }
    expect(formats(null)).toBe(false);
  });

  it("does not care how the path was spelled", () => {
    expect(formats("C:/Users/raDi/repo/apps/game/src/Main.TS")).toBe(true);
    // `.tsx` must not be matched by the `.ts` row alone reversed — a file
    // called `something.ts.bak` is not a TypeScript file.
    expect(formats("something.ts.bak")).toBe(false);
  });
});

describe("which edits have to re-prove determinism", () => {
  it("takes anything under packages/sim or packages/content", () => {
    expect(guardsDeterminism("packages/sim/src/step.ts")).toBe(true);
    expect(guardsDeterminism("packages/content/src/creatures.ts")).toBe(true);
    expect(guardsDeterminism("C:/Users/raDi/repo/packages/sim/test/purity.test.ts")).toBe(true);
  });

  it("leaves the rest of the tree alone", () => {
    expect(guardsDeterminism("packages/render/src/band.ts")).toBe(false);
    expect(guardsDeterminism("apps/game/src/loop.ts")).toBe(false);
    expect(guardsDeterminism("docs/queue.md")).toBe(false);
    expect(guardsDeterminism(null)).toBe(false);
  });

  it("is not fooled by a directory that merely starts the same", () => {
    // `packages/simulation-notes/` is not `packages/sim/`. The trailing slash
    // in the table is the whole of what makes that true.
    expect(guardsDeterminism("packages/simulation-notes/x.ts")).toBe(false);
    expect(guardsDeterminism("packages/contents-list/x.ts")).toBe(false);
  });
});

/**
 * The line ceiling arriving with the edit rather than with the red check.
 *
 * `packages/sim/test/limits.test.ts` proves the rule against the real tree and
 * cannot say anything about a file that does not exist; these are the four
 * decisions the hook makes on a path and a number, which is all it ever sees.
 */
describe("which files the line ceiling reaches", () => {
  it("takes source under the three top-level directories", () => {
    for (const p of ["packages/sim/src/step.ts", "apps/game/src/loop.ts", "tools/queue/run.ts"]) {
      expect(counted(p)).toBe(true);
    }
  });

  it("leaves tests, test helpers and everything outside the tree alone", () => {
    for (const p of [
      "packages/sim/test/limits.test.ts",
      "packages/render/test/fixture.ts",
      "docs/queue.md",
      "legacy/old.ts",
      "packages/sim/src/step.tsx",
      "node_modules/x/index.ts",
      "packages/render/dist/bundle.ts",
    ]) {
      expect({ p, counted: counted(p) }).toEqual({ p, counted: false });
    }
  });

  it("does not care how the path was spelled", () => {
    expect(counted("tools\\hooks\\file-size.ts")).toBe(true);
  });
});

describe("what a file's line count is measured against", () => {
  it("counts lines the way wc -l does", () => {
    // A trailing newline ends the last line; it does not begin an empty one.
    expect(lineCount("a\nb\n")).toBe(2);
    expect(lineCount("a\nb")).toBe(2);
    expect(lineCount("")).toBe(0);
  });

  it("puts the mark at a share of the ceiling rather than at its own number", () => {
    // The whole point of the share: moving `LIMIT` moves this with it, and
    // there is no second constant to go stale quietly.
    expect(mark("packages/sim/src/step.ts")).toBe(Math.round(LIMIT * 0.88));
  });

  it("says nothing at all until the mark", () => {
    const file = "packages/sim/src/step.ts";
    expect(notice(file, mark(file) - 1)).toBeNull();
    expect(notice("packages/sim/test/limits.test.ts", 400)).toBeNull();
  });

  it("names the file, the count and the ceiling once the mark is reached", () => {
    const said = notice("packages/sim/src/step.ts", 231);
    expect(said).toContain("packages/sim/src/step.ts");
    expect(said).toContain("231 lines");
    expect(said).toContain(`${LIMIT}-line ceiling`);
    expect(said).toContain("19 under");
  });

  it("says a file already over is over, rather than how much room is left", () => {
    const said = notice("packages/sim/src/step.ts", LIMIT + 4);
    expect(said).toContain("past the");
    expect(said).not.toContain("under");
    expect(notice("packages/sim/src/step.ts", LIMIT)).toContain("at the");
  });
});

describe("the path the size hook is given", () => {
  const root = "/home/me/neon-spore";

  it("is the one the ceiling names, relative and forward-slashed", () => {
    expect(repoPath(root, `${root}/packages/sim/src/step.ts`)).toBe("packages/sim/src/step.ts");
  });

  it("is null for anything outside the tree, and for no path at all", () => {
    expect(repoPath(root, "/home/me/elsewhere/step.ts")).toBeNull();
    expect(repoPath(root, root)).toBeNull();
    expect(repoPath(root, null)).toBeNull();
  });
});

describe("the command line a shell tool was given", () => {
  it("comes back whole, and is null for a payload that names none", () => {
    expect(shellCommand({ tool_input: { command: "sed -i s/a/b/ x.ts" } })).toBe(
      "sed -i s/a/b/ x.ts",
    );
    expect(shellCommand({ tool_input: { file_path: "x.ts" } })).toBeNull();
    expect(shellCommand({ tool_input: { command: "" } })).toBeNull();
    expect(shellCommand({ tool_input: { command: 42 } })).toBeNull();
    expect(shellCommand(null)).toBeNull();
  });
});

/**
 * The four shapes that write a file in this repository, recovered from the
 * command line — the half of the hook that was missing while it was bound to
 * `Edit|Write|MultiEdit` and a lane was told to use Bash.
 */
describe("the paths a bash line looks like it wrote", () => {
  it("takes the target of a redirection, appending or not", () => {
    expect(writtenPaths("cat > packages/sim/src/step.ts <<'EOF'\nx\nEOF")).toEqual([
      "packages/sim/src/step.ts",
    ]);
    expect(writtenPaths("echo hi >> apps/game/src/shell.ts")).toEqual(["apps/game/src/shell.ts"]);
  });

  it("takes a sed that edits in place, and nothing from one that reads", () => {
    expect(writtenPaths("sed -i 's/a/b/' tools/queue/run.ts")).toEqual(["tools/queue/run.ts"]);
    expect(writtenPaths("sed --in-place -e 's/a/b/' tools/queue/run.ts")).toEqual([
      "tools/queue/run.ts",
    ]);
    expect(writtenPaths("sed -n '1,5p' tools/queue/run.ts")).toEqual([]);
  });

  it("takes what tee is handed", () => {
    expect(writtenPaths("echo x | tee -a tools/queue/run.ts")).toEqual(["tools/queue/run.ts"]);
  });

  it("takes a python heredoc's open, only when the mode writes", () => {
    const write = "python3 - <<'PY'\nopen('packages/sim/src/step.ts', 'w').write(s)\nPY";
    expect(writtenPaths(write)).toEqual(["packages/sim/src/step.ts"]);
    const read = "python3 - <<'PY'\ns = open('packages/sim/src/step.ts').read()\nPY";
    expect(writtenPaths(read)).toEqual([]);
  });

  it("says nothing at all about a command that only reads", () => {
    // Silence is the answer it owes when it cannot parse a write. A path it
    // invented would be a sentence about a file the lane never touched.
    for (const line of [
      "cat packages/sim/src/step.ts",
      "grep -n x packages/sim/src/step.ts",
      "bun run check",
      "sed -n '1,5p' a.ts < packages/sim/src/step.ts",
    ]) {
      expect({ line, wrote: writtenPaths(line) }).toEqual({ line, wrote: [] });
    }
  });

  it("names a file written twice in one line only once", () => {
    const line = "echo a > tools/queue/run.ts && echo b >> tools/queue/run.ts";
    expect(writtenPaths(line)).toEqual(["tools/queue/run.ts"]);
  });

  it("keeps every file of a line that wrote several", () => {
    // The lane that found this wrote seven files in a turn and heard about
    // none of them; one path per command line would have heard about one.
    const line = "echo a > packages/sim/src/step.ts; sed -i 's/x/y/' apps/game/src/shell.ts";
    expect(writtenPaths(line)).toEqual(["packages/sim/src/step.ts", "apps/game/src/shell.ts"]);
  });
});

describe("what the size hook decides a payload touched", () => {
  const root = "/home/me/neon-spore";

  it("is the declared path, for an edit tool", () => {
    expect(
      touched(root, { tool_input: { file_path: `${root}/packages/sim/src/step.ts` } }),
    ).toEqual(["packages/sim/src/step.ts"]);
  });

  it("is what the command wrote, for a bash line", () => {
    const command = "echo a > packages/sim/src/step.ts; sed -i 's/x/y/' apps/game/src/shell.ts";
    expect(touched(process.cwd(), { tool_input: { command } })).toEqual([
      "packages/sim/src/step.ts",
      "apps/game/src/shell.ts",
    ]);
  });

  it("drops what the ceiling does not reach, whichever tool named it", () => {
    expect(touched(root, { tool_input: { file_path: `${root}/docs/queue.md` } })).toEqual([]);
    expect(touched(process.cwd(), { tool_input: { command: "echo a > docs/queue.md" } })).toEqual(
      [],
    );
    expect(touched(root, null)).toEqual([]);
  });
});
