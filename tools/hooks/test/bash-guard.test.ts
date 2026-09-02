import { describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";

// The hook reads a Claude PreToolUse payload off stdin, in the same shape
// the harness actually sends — matching worker-model-guard.sh's own
// input contract rather than inventing a simpler one for the test.
const SCRIPT = path.join(import.meta.dir, "..", "..", "..", ".claude", "hooks", "bash-guard.sh");

function run(command: string) {
  const payload = JSON.stringify({ tool_name: "Bash", tool_input: { command } });
  return spawnSync("bash", [SCRIPT], { input: payload, encoding: "utf8" });
}

describe("bash-guard", () => {
  it("refuses git add -A for scooping up another lane's edits", () => {
    const result = run("git add -A");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("staging everything");
  });

  it("refuses git commit -a for the same reason", () => {
    const result = run("git commit -am 'wip'");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("stages whatever is dirty");
  });

  it("refuses a direct push to main", () => {
    const result = run("git push origin main");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("bypasses the rebase-then-check order");
  });

  it("refuses a hot dev server meant for the human", () => {
    const result = run("bun run dev");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("belong to the human's own session");
  });

  it("leaves the human's second dev server alone", () => {
    const result = run("bun run dev:once");
    expect(result.status).toBe(0);
  });

  it("refuses removing the worktree the session is standing in", () => {
    const result = run(`git worktree remove ${process.cwd()}`);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("standing in");
  });

  it("allows staging a specific file by path", () => {
    const result = run("git add tools/hooks/scope.ts");
    expect(result.status).toBe(0);
  });

  /**
   * A path that *begins* with a dot is the case this hook refused on the very
   * commit that introduced it: `git add .` as a glob also matches
   * `git add .claude/hooks/x`, which is staging by path — the thing the refusal
   * is telling you to do instead. The dot has to be a whole argument.
   */
  it("allows staging a dotfile path, which is not staging everything", () => {
    const result = run("git add .claude/hooks/bash-guard.sh .claude/settings.json");
    expect(result.status).toBe(0);
  });

  it("still refuses the bare dot, and refuses it mid-chain", () => {
    expect(run("git add .").status).toBe(2);
    expect(run("cd packages/sim && git add . && git commit -m x").status).toBe(2);
  });

  it("allows a push of a feature branch, main only as a substring of its name", () => {
    const result = run("git push origin claude/main-menu-fix");
    expect(result.status).toBe(0);
  });

  it("allows bun run preview, the agent's own verification command", () => {
    const result = run("bun run preview");
    expect(result.status).toBe(0);
  });

  it("allows removing a worktree that is not the current one", () => {
    const result = run("git worktree remove ../some-other-worktree");
    expect(result.status).toBe(0);
  });
});
