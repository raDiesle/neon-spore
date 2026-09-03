import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { refusalFor } from "../guard.ts";

const SCRIPT = path.join(import.meta.dir, "..", "guard.ts");

/** The rules, read the way the hook reads them: from the working directory the session is standing in. */
function refusal(command: string) {
  return refusalFor(command, process.cwd());
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
    expect(refusal("git add .claude/hooks/auto-land.sh .claude/settings.json")).toBeNull();
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
