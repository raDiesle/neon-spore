import { describe, expect, it } from "bun:test";
import { SCRATCH_PREFIX, SCRATCH_STALE_MS, staleScratch } from "../scratch.js";

/**
 * Which of the system temp directory's entries a later capture is entitled to
 * delete.
 *
 * This is the half of the cleanup worth testing without a disk, because it is
 * the half that can do damage: `%TEMP%` held five and a half thousand of this
 * tool's abandoned checkouts, and the fix for that is a sweep — which is a
 * deletion loop pointed at a directory full of other programs' work.
 */

const NOW = 1_757_000_000_000;

describe("staleScratch", () => {
  it("takes this tool's own leavings once they are old enough", () => {
    expect(
      staleScratch([{ name: `${SCRATCH_PREFIX}abc123`, mtimeMs: NOW - 2 * SCRATCH_STALE_MS }], NOW),
    ).toEqual([`${SCRATCH_PREFIX}abc123`]);
  });

  /**
   * The safety. A lane photographing a commit and its parent runs two captures,
   * and a sweep that went by name alone would delete a checkout the other one
   * is still installing into.
   */
  it("leaves a fresh one alone, because something may be inside it", () => {
    expect(staleScratch([{ name: `${SCRATCH_PREFIX}fresh`, mtimeMs: NOW - 1000 }], NOW)).toEqual(
      [],
    );
  });

  it("never touches a directory that is not this tool's", () => {
    expect(
      staleScratch(
        [
          { name: "somebody-elses-build", mtimeMs: 0 },
          { name: "neon-spore-relay-check", mtimeMs: 0 },
        ],
        NOW,
      ),
    ).toEqual([]);
  });

  it("takes every prefix this tool writes under", () => {
    const old = NOW - 2 * SCRATCH_STALE_MS;
    expect(
      staleScratch(
        [
          { name: `${SCRATCH_PREFIX}out-1`, mtimeMs: old },
          { name: `${SCRATCH_PREFIX}opening-test-2`, mtimeMs: old },
          { name: `${SCRATCH_PREFIX}3`, mtimeMs: old },
        ],
        NOW,
      ),
    ).toHaveLength(3);
  });
});
