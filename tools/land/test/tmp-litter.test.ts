import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { PROFILE_PREFIX, PROFILE_STALE_MS, staleProfiles, tmpRoot } from "../../tmp-litter.js";

/**
 * The rule that decides which directories under `.claude/tmp` a sweep may
 * delete. It is tested rather than trusted because getting it wrong deletes a
 * profile out from under a browser that is still using it — and because two
 * tools that cannot import each other (`tools/frames/browser.ts` and
 * `tools/land/specs.ts`) both call it, so there is exactly one place to hold
 * it honest.
 */
describe("spent browser profiles", () => {
  const now = 1_000_000_000_000;
  const old = now - PROFILE_STALE_MS - 1;
  const fresh = now - 60_000;

  it("takes this tool's own leavings once they are past the window", () => {
    expect(
      staleProfiles(
        [
          { name: `${PROFILE_PREFIX}aaa`, mtimeMs: old },
          { name: `${PROFILE_PREFIX}bbb`, mtimeMs: old },
        ],
        now,
      ),
    ).toEqual([`${PROFILE_PREFIX}aaa`, `${PROFILE_PREFIX}bbb`]);
  });

  it("leaves a profile a run happening right now is standing in", () => {
    expect(staleProfiles([{ name: `${PROFILE_PREFIX}live`, mtimeMs: fresh }], now)).toEqual([]);
  });

  /** The window is the whole safety: a sweep that took a directory by its name
   * alone would delete one mid-run, and two of these tools run at once often. */
  it("is a window and not a name match — an old profile with the wrong name stays", () => {
    expect(
      staleProfiles(
        [
          { name: "neon-spore-frames-scratch", mtimeMs: old },
          { name: "spec-9f3a.md", mtimeMs: old },
          { name: PROFILE_PREFIX.slice(0, -1), mtimeMs: old },
        ],
        now,
      ),
    ).toEqual([]);
  });

  it("keeps the litter inside the repository, where a sweep can find it", () => {
    expect(tmpRoot("/repo")).toBe(join("/repo", ".claude", "tmp"));
  });
});
