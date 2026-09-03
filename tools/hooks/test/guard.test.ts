import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { dialectFor, refusalFor } from "../guard.ts";

const SCRIPT = path.join(import.meta.dir, "..", "guard.ts");

/** The rules, read the way the hook reads them: from the working directory the session is standing in. */
function refusal(command: string) {
  return refusalFor(command, process.cwd(), "posix");
}

/** The same, for a line typed into the PowerShell tool rather than Bash. */
function psRefusal(command: string) {
  return refusalFor(command, process.cwd(), "powershell");
}

describe("guard", () => {
  it("refuses staging everything, however it is spelled", () => {
    expect(refusal("git add -A")?.blocked).toContain("staging everything");
    expect(refusal("git add --all")?.blocked).toContain("staging everything");
    expect(refusal("git add .")?.blocked).toContain("staging everything");
    expect(refusal("cd packages/sim && git add . && git commit -m x")?.blocked).toContain(
      "staging everything",
    );
  });

  it("refuses a commit that stages whatever is dirty", () => {
    expect(refusal("git commit -am 'wip'")?.blocked).toContain("stages whatever is dirty");
    expect(refusal("git commit --all -m x")?.blocked).toContain("stages whatever is dirty");
  });

  /**
   * The rule is written against `--am`, the abbreviation of `--all`. As a glob
   * over the whole line that also matched `--amend`, so a plain reword of the
   * commit just written was refused with a message about another lane's work.
   * The way round it was `git reset --soft` and a fresh commit: the same result
   * in two steps, with no guard at all on what gets staged.
   */
  it("allows a reword, which stages nothing", () => {
    expect(refusal("git commit --amend --no-edit")).toBeNull();
    expect(refusal("git commit --amend -m 'a better subject'")).toBeNull();
  });

  /** A refused form inside an argument is text. The guard used to refuse its own documentation. */
  it("allows a message that merely quotes a refused command", () => {
    expect(refusal("git commit -m 'the guard refuses git add -A'")).toBeNull();
    expect(refusal('git commit -m "no git push origin main from a lane"')).toBeNull();
    expect(refusal("cat <<'EOF' > docs/note.md\ngit add -A\nEOF")).toBeNull();
  });

  it("refuses a direct push to main, by any ref that names it", () => {
    expect(refusal("git push origin main")?.blocked).toContain(
      "bypasses the rebase-then-check order",
    );
    expect(refusal("git push --force origin HEAD:main")?.blocked).toContain(
      "bypasses the rebase-then-check order",
    );
  });

  it("allows a push of a feature branch whose name contains main", () => {
    expect(refusal("git push origin claude/main-menu-fix")).toBeNull();
  });

  it("refuses a hot dev server meant for the human", () => {
    expect(refusal("bun run dev")?.blocked).toContain("belong to the human's own session");
    expect(refusal("bun run dev:game")?.blocked).toContain("belong to the human's own session");
    expect(refusal("bun --hot tools/director/server.ts")?.blocked).toContain(
      "belong to the human's own session",
    );
  });

  it("leaves the human's second dev server and the agent's preview alone", () => {
    expect(refusal("bun run dev:once")).toBeNull();
    expect(refusal("bun run preview")).toBeNull();
  });

  it("refuses removing the worktree the session is standing in", () => {
    expect(refusal(`git worktree remove ${process.cwd()}`)?.blocked).toContain("standing in");
    expect(refusal(`git worktree remove --force "${process.cwd()}"`)?.blocked).toContain(
      "standing in",
    );
  });

  it("allows removing a worktree that is not the current one", () => {
    expect(refusal("git worktree remove ../some-other-worktree")).toBeNull();
  });

  it("allows staging by path, dotfiles included", () => {
    expect(refusal("git add tools/hooks/guard.ts")).toBeNull();
    expect(refusal("git add tools/hooks/auto-land.ts .claude/settings.json")).toBeNull();
  });

  /**
   * `noUnusedImports` is an error, and its fix is offered as unsafe: applied,
   * it deletes the whole import statement including the comment above it. On
   * one director module that took a sixty-line file header, silently, in a run
   * whose only reported change was "removed unused imports".
   */
  it("refuses biome's unsafe fixes, which eat a file's header docblock", () => {
    expect(refusal("bunx biome check --write --unsafe .")?.blocked).toContain("unused import");
    expect(refusal("biome check --unsafe --write packages/sim")?.blocked).toContain(
      "unused import",
    );
  });

  it("allows the safe formatter", () => {
    expect(refusal("bunx biome check --write tools/hooks/guard.ts")).toBeNull();
    expect(refusal("bun run format")).toBeNull();
  });

  it("refuses a Claude model routed through the worker's key", () => {
    const blocked = refusal("aider --model openrouter/anthropic/claude-sonnet-4.5 --yes");
    expect(blocked?.blocked).toContain("Anthropic model through OpenRouter");
  });

  /**
   * The extraction this rule used to do was a shell regex over the payload,
   * which never handled a JSON-escaped backslash — and a Windows path is made
   * of them. The model name has to be found in a command that carries one.
   */
  it("finds the model name in a command carrying a Windows path", () => {
    const command = String.raw`bun run delegate C:\Users\raDi\spec.md --model anthropic/claude-opus-4`;
    expect(refusal(command)?.blocked).toContain("Anthropic model through OpenRouter");
  });

  it("allows the worker on the model it is configured with", () => {
    expect(refusal("bun run delegate spec.md packages/sim/src/hash.ts")).toBeNull();
    expect(refusal(String.raw`bun run delegate C:\Users\raDi\spec.md`)).toBeNull();
  });

  /**
   * On Windows the session's primary shell is the separate PowerShell tool, and
   * the hook's matcher named only `Bash`. Every rule above was unenforced the
   * moment the same command was typed into the other tool — which is the tool
   * CLAUDE.md names first. The rules are spelled identically in both shells;
   * what differs is the quoting, so each one is read again in that dialect.
   */
  it("refuses every one of them typed into PowerShell", () => {
    expect(psRefusal("git add -A")?.blocked).toContain("staging everything");
    expect(psRefusal("git add .; git commit -m x")?.blocked).toContain("staging everything");
    expect(psRefusal("git commit -am 'wip'")?.blocked).toContain("stages whatever is dirty");
    expect(psRefusal("git push origin main")?.blocked).toContain("rebase-then-check");
    expect(psRefusal("bun run dev:game")?.blocked).toContain("the human's own session");
    expect(psRefusal("bunx biome check --write --unsafe .")?.blocked).toContain("unused import");
    expect(psRefusal(`git worktree remove "${process.cwd()}"`)?.blocked).toContain("standing in");
  });

  /** PowerShell's call operator: the program is the second word, and often a full path. */
  it("reads a PowerShell call operator, path and all", () => {
    const command = String.raw`& "C:\Program Files\Git\git.exe" push origin main`;
    expect(psRefusal(command)?.blocked).toContain("rebase-then-check");
  });

  /**
   * A message that merely quotes a refused command is text in either dialect,
   * PowerShell's own quoting included: `''` is how a literal quote is written
   * inside a single-quoted run, and a backtick is the escape inside a
   * double-quoted one.
   */
  it("allows a PowerShell message that quotes a refused command", () => {
    expect(psRefusal("git commit -m 'the guard refuses git add -A'")).toBeNull();
    expect(psRefusal('git commit -m "no git push origin main from a lane"')).toBeNull();
    expect(psRefusal("git commit -m 'it''s about git add -A'")).toBeNull();
    expect(psRefusal('git commit -m "he said `"git add -A`" once"')).toBeNull();
  });

  /** A here-string body is data, the way a heredoc body is. Its terminator sits at column zero. */
  it("allows a refused command quoted inside a here-string", () => {
    const command = ["git commit -m @'", "git add -A", "git push origin main", "'@"].join("\n");
    expect(psRefusal(command)).toBeNull();
  });

  /**
   * The case that makes the dialect worth passing rather than guessing. A
   * backslash is a path separator in PowerShell and never an escape, and tab
   * completion leaves one on the end of a directory. Read as bash, the `\"`
   * that closes the argument is an escaped quote instead, the argument runs to
   * the end of the line, and the worktree the session is standing in goes
   * unrecognised.
   */
  it("refuses removing this worktree, written the way PowerShell completes it", () => {
    const command = `git worktree remove --force "${process.cwd()}\\"`;
    expect(psRefusal(command)?.blocked).toContain("standing in");
    expect(refusal(command)).toBeNull();
  });

  /** A bash `'a''b'` is one word `ab`; only PowerShell reads the pair as a literal quote. */
  it("keeps the two dialects apart on a doubled quote", () => {
    expect(refusal("git add 'a''b'")).toBeNull();
    expect(psRefusal("git add 'a''b'")).toBeNull();
  });

  it("takes the dialect from the payload's tool name", () => {
    expect(dialectFor("PowerShell")).toBe("powershell");
    expect(dialectFor("Bash")).toBe("posix");
    expect(dialectFor(undefined)).toBe("posix");
  });

  /** The hook's own contract: a PreToolUse payload on stdin, exit 2 and a message on stderr. */
  it("reads the harness payload and exits 2", () => {
    const payload = JSON.stringify({
      tool_name: "Bash",
      tool_input: { command: "git push origin main" },
    });
    const result = spawnSync(process.execPath, [SCRIPT], { input: payload, encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Blocked: pushing to main");
  });

  it("reads a PowerShell payload in PowerShell's own dialect", () => {
    const payload = JSON.stringify({
      tool_name: "PowerShell",
      tool_input: { command: "git add -A" },
    });
    const result = spawnSync(process.execPath, [SCRIPT], { input: payload, encoding: "utf8" });
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Blocked: staging everything");
  });

  it("lets an allowed command through with exit 0", () => {
    const payload = JSON.stringify({ tool_name: "Bash", tool_input: { command: "bun run check" } });
    const result = spawnSync(process.execPath, [SCRIPT], { input: payload, encoding: "utf8" });
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("says nothing about a payload it cannot read", () => {
    const result = spawnSync(process.execPath, [SCRIPT], { input: "not json", encoding: "utf8" });
    expect(result.status).toBe(0);
  });
});
