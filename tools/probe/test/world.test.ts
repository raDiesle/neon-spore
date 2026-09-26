import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { read } from "../../../packages/sim/test/source-scan.ts";
import { counted } from "../../hooks/file-size.ts";
import { beats, field, played, playedBeat, waveWorld } from "../world.js";

const ROOT = new URL("../../../", import.meta.url);

/**
 * The rig itself, which is the one part of this package worth a test.
 *
 * A probe is a throwaway and asserts nothing; these three helpers are what
 * every probe is written on top of, and a session reaching for them at the
 * moment it has a question is a session that cannot afford to find out they
 * have gone stale. The wave id lookup in particular: it is the difference
 * between "no wave with the id x, here are the ones there are" and a world
 * quietly built from wave 0.
 */

describe("a probe's world", () => {
  it("is the wave named, and the wave named is stood up", () => {
    const world = waveWorld("theCoil");
    expect(world.wave).toBe(WAVES.findIndex((w) => w.id === "theCoil"));
    expect(world.tick).toBe(0);
  });

  it("says what the ids are when the one asked for is not among them", () => {
    // The message is the whole value: a session typing a wave's *name* rather
    // than its id gets the list rather than an empty field to puzzle over.
    expect(() => waveWorld("coil")).toThrow(/no wave with the id "coil"/);
    expect(() => waveWorld("coil")).toThrow(/theCoil/);
  });

  it("is deterministic, so two runs of the same probe say the same thing", () => {
    const once = waveWorld("theCoil");
    const twice = waveWorld("theCoil");
    beats(once, 13);
    beats(twice, 13);
    expect(field(once)).toBe(field(twice));
  });

  it("counts beats, and a body has somewhere to be by the thirteenth", () => {
    const world = waveWorld("theCoil");
    beats(world, 13);
    expect(world.creatures.length).toBeGreaterThan(0);
    expect(field(world)).toContain("col");
  });

  it("says so plainly when there is nothing on the field", () => {
    expect(field(waveWorld("theCoil"))).toContain("(empty)");
  });
});

/**
 * `played` is what a benchmark of a defended wave stands on. If the hand ever
 * stopped reaching the world, it would quietly measure `beats` again. So the
 * test is the one thing the hand changes: a rock left alone scars the hull and
 * a played one does not.
 */
describe("a played wave", () => {
  it("is defended, where the same wave left alone is scarred", () => {
    const alone = waveWorld("theRock");
    const defended = waveWorld("theRock");
    beats(alone, 48);
    played(defended, 48);
    expect(alone.scars.length).toBeGreaterThan(0);
    expect(defended.scars).toHaveLength(0);
  });

  it("has a hand for an ordinary wave, and plays the same way twice", () => {
    const once = waveWorld("theStrand");
    const twice = waveWorld("theStrand");
    expect(playedBeat(once)).toBe(true);
    playedBeat(twice);
    played(once, 12);
    played(twice, 12);
    expect(field(once)).toBe(field(twice));
  });
});

/**
 * The scratch directory is git-ignored *and* unchecked, and the second half
 * was missing until 17 September 2026: `tsconfig.json` includes `tools/**`, so
 * `bunx tsc --noEmit` read every probe anybody had left behind and a lane
 * inherited nine errors from a file `git status` cannot show.
 *
 * Held here rather than trusted to the comment in `run.ts`, because the thing
 * that would undo it is somebody tidying an `exclude` list they have no reason
 * to connect to a directory two packages away.
 */
describe("the scratch directory", () => {
  it("is outside the typecheck, so a probe left behind is nobody's problem", async () => {
    const tsconfig = await Bun.file(new URL("tsconfig.json", ROOT)).text();
    const exclude = (JSON.parse(tsconfig) as { exclude: string[] }).exclude;
    expect(exclude).toContain("tools/probe/scratch");
  });

  it("is git-ignored, which is the half that was always true", async () => {
    const ignore = await Bun.file(new URL(".gitignore", ROOT)).text();
    expect(ignore).toContain("tools/probe/scratch/*");
  });

  it("is outside the guards that read source, which was the half found an hour later", () => {
    expect(read("tools/probe/scratch/anything.ts")).toBe(false);
    expect(read("tools\\probe\\scratch\\anything.ts")).toBe(false);
    // And the rest of the tree still is read, or the guards pass vacuously.
    expect(read("packages/sim/src/step.ts")).toBe(true);
    expect(read("tools/probe/world.ts")).toBe(true);
  });

  it("is outside the line ceiling, so a long throwaway is not asked to be split", () => {
    expect(counted("tools/probe/scratch/anything.ts")).toBe(false);
    expect(counted("tools/probe/world.ts")).toBe(true);
  });
});
