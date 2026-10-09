import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { framePathFor } from "../frame-files.js";
import { throughScratch } from "../frame-publish.js";

/**
 * A run's frames reach `out` only once every one is taken (`frame-publish.ts`):
 * a capture refused in the page leaves the folder as it found it, and one
 * that succeeds replaces its prefixes' frames — the stale tail of a longer
 * run included — and nothing else.
 */

let out = "";

beforeEach(async () => {
  out = await mkdtemp(join(tmpdir(), "ns-frame-publish-"));
});

afterEach(async () => {
  await rm(out, { recursive: true, force: true });
});

const listing = async () => (await readdir(out)).sort();

/** A capture that writes `n` frames under `prefix` in the scratch folder. */
const writes =
  (prefix: string, n: number, body = "new") =>
  async (scratch: string) => {
    const paths = Array.from({ length: n }, (_, i) => framePathFor(join(scratch, prefix), i, n));
    await mkdir(scratch, { recursive: true });
    for (const p of paths) await writeFile(p, body);
    return { paths };
  };

describe("throughScratch", () => {
  it("leaves the folder as it found it when the page refuses", async () => {
    await writeFile(join(out, "frame.png"), "old");
    const refused = throughScratch(out, ["frame"], async (scratch) => {
      await writes("frame", 1)(scratch);
      throw new Error("--entry 7: this wave has 2 arrivals");
    });
    await expect(refused).rejects.toThrow("this wave has 2 arrivals");
    expect(await listing()).toEqual(["frame.png"]);
    expect(await readFile(join(out, "frame.png"), "utf8")).toBe("old");
  });

  it("writes nothing on an answer of null, the pair's identical", async () => {
    await writeFile(join(out, "after.png"), "old");
    expect(await throughScratch(out, ["before", "after"], async () => null)).toBeNull();
    expect(await listing()).toEqual(["after.png"]);
  });

  it("replaces a prefix's frames, the stale tail of a longer run with them", async () => {
    for (let i = 0; i < 10; i++) await writeFile(framePathFor(join(out, "frame"), i, 10), "old");
    await writeFile(join(out, "notes.md"), "kept");
    const done = await throughScratch(out, ["frame"], writes("frame", 8));
    expect(done?.written).toHaveLength(8);
    const names = await listing();
    expect(names).toContain("notes.md");
    expect(names.filter((n) => n.startsWith("frame-"))).toHaveLength(8);
    expect(await readFile(join(out, "frame-07.png"), "utf8")).toBe("new");
  });

  it("clears every prefix named, so an absent before does not stand beside a new after", async () => {
    await writeFile(join(out, "before.png"), "old");
    await writeFile(join(out, "after.png"), "old");
    await throughScratch(out, ["before", "after"], writes("after", 1));
    expect(await listing()).toEqual(["after.png"]);
  });

  it("makes the folder when it is not there yet", async () => {
    const deeper = join(out, "not-yet");
    const done = await throughScratch(deeper, ["frame"], writes("frame", 1));
    expect(done?.written).toEqual([join(deeper, "frame.png")]);
  });
});
