import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearFrames, framePathFor, isFrameOf } from "../frame-files.js";

/**
 * A capture clears the frames an earlier run left under its prefix before it
 * writes, so `bun run sheet` never sheets a ten-frame run's `-08` and `-09`
 * under an eight-frame one — and clears nothing else in the directory.
 */

let dir = "";

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "ns-frame-files-"));
});

afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("clearFrames", () => {
  it("takes every frame the prefix has, and leaves the rest of the directory", async () => {
    const earlier = Array.from({ length: 10 }, (_, i) => framePathFor(join(dir, "frame"), i, 10));
    const keep = ["frame-sheet.png", "frame-00.txt", "other-00.png", "frames-00.png", "notes.md"];
    for (const p of earlier) await writeFile(p, "x");
    await writeFile(join(dir, "frame.png"), "x");
    for (const k of keep) await writeFile(join(dir, k), "x");

    const cleared = await clearFrames(join(dir, "frame"));
    expect(cleared).toHaveLength(11);
    expect((await readdir(dir)).sort()).toEqual([...keep].sort());
  });

  it("is quiet about a directory that is not there yet", async () => {
    expect(await clearFrames(join(dir, "not-yet", "frame"))).toEqual([]);
  });
});

describe("isFrameOf", () => {
  it("knows the two shapes a capture names its frames", () => {
    expect(isFrameOf("frame", "frame.png")).toBe(true);
    expect(isFrameOf("frame", "frame-07.png")).toBe(true);
    expect(isFrameOf("frame", "frame-123.png")).toBe(true);
    expect(isFrameOf("frame", "frame-sheet.png")).toBe(false);
    expect(isFrameOf("frame", "frame-.png")).toBe(false);
    expect(isFrameOf("frame", "frames-00.png")).toBe(false);
  });
});
