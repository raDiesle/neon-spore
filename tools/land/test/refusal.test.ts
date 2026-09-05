import { describe, expect, it } from "bun:test";
import { reason, refusalLines } from "../refusal.js";

/**
 * The output of a refused `bun run push`, held as words rather than driven
 * against a remote.
 *
 * What it used to print was `error.message.split("\n")[0]`, and git's first
 * line is the remote's URL — so the whole of the report was
 * `✗ origin was not updated: To https://github.com/…`, which says nothing the
 * session did not already know. The reason and the hint are on the lines under
 * it, and the trunk was 19 ahead and 36 behind at the time with none of that
 * said either.
 */

/** What git actually writes when a push is not a fast-forward. */
const REJECTED = [
  "To https://github.com/raDiesle/neon-spore",
  " ! [rejected]        main -> main (non-fast-forward)",
  "error: failed to push some refs to 'https://github.com/raDiesle/neon-spore'",
  "hint: Updates were rejected because the tip of your current branch is behind",
  "hint: its remote counterpart.",
].join("\n");

describe("git's own reason", () => {
  it("drops the banner and keeps everything else, in order", () => {
    expect(reason(REJECTED)).toEqual([
      " ! [rejected]        main -> main (non-fast-forward)",
      "error: failed to push some refs to 'https://github.com/raDiesle/neon-spore'",
      "hint: Updates were rejected because the tip of your current branch is behind",
      "hint: its remote counterpart.",
    ]);
  });

  it("drops blank lines, so the report has no gaps in it", () => {
    expect(reason("To https://x\n\n ! [rejected] main\n\n")).toEqual([" ! [rejected] main"]);
  });
});

describe("a refused push", () => {
  it("says what git said, and then what to do about it", () => {
    const lines = refusalLines(REJECTED, { ahead: 19, behind: 36, trunk: "main" });
    expect(lines[0]).toBe("✗ origin/main was not updated");
    expect(lines.join("\n")).toContain("[rejected]");
    expect(lines.at(-1)).toBe(
      "  origin/main has 36 commits yours has not, and you have 19 commits it has not — reconcile the trunk before sending it",
    );
  });

  /**
   * A trunk that is not behind was refused for some other reason — a
   * permission, a hook, a protected branch — and telling it to rebase would
   * send the session at the wrong problem.
   */
  it("does not blame a fast-forward when the trunk is not behind", () => {
    const lines = refusalLines("To https://x\nremote: refused by policy", {
      ahead: 2,
      behind: 0,
      trunk: "main",
    });
    expect(lines.at(-1)).toBe(
      "  main is 2 commits ahead and behind by none, so this is not a fast-forward problem",
    );
    expect(lines.join("\n")).toContain("refused by policy");
  });

  it("counts one commit as one commit", () => {
    const lines = refusalLines(REJECTED, { ahead: 1, behind: 1, trunk: "main" });
    expect(lines.at(-1)).toContain("has 1 commit yours has not, and you have 1 commit it has not");
  });

  /** git saying nothing is itself worth reporting: an empty line under the ✗
   * would read as a report that had been truncated. */
  it("says so when git said nothing", () => {
    const lines = refusalLines("To https://x", { ahead: 1, behind: 0, trunk: "main" });
    expect(lines[1]).toBe("  git said nothing about why");
  });
});
