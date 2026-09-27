import { describe, expect, it } from "bun:test";
import { parseFrameSpec } from "../flags.js";
import { RECIPES, recipeEntry, recipeHelp } from "../recipes.js";
import { waveNamesHere } from "../wave.js";

/**
 * Every line `--help` prints is a command line the parser takes. A recipe is
 * the one place a flag's spelling is shown rather than argued, so one that
 * drifted from the parser would be a help screen teaching a refusal.
 */

/** A command line split the way a shell splits these: on spaces, with a
 * quoted run kept whole and its quotes dropped. */
function words(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(/"([^"]*)"|'([^']*)'|(\S+)/g)) out.push(m[1] ?? m[2] ?? m[3] ?? "");
  return out;
}

describe("RECIPES", () => {
  it("splits a quoted wave name and a quoted JSON list whole", () => {
    expect(words(`. --wave "THE BATON" --boss-json '{"sockets":[1,1,0]}'`)).toEqual([
      ".",
      "--wave",
      "THE BATON",
      "--boss-json",
      '{"sockets":[1,1,0]}',
    ]);
  });

  it("parses, every one of them, against this tree's waves", async () => {
    const waves = await waveNamesHere();
    for (const r of RECIPES) {
      const argv = words(r.argv.replaceAll("<sha>", "."));
      expect(() => parseFrameSpec(argv, waves), r.argv).not.toThrow();
    }
  });

  it("is what --help prints, a line each, each saying what it is for", () => {
    const help = recipeHelp();
    for (const r of RECIPES) {
      expect(r.what.length).toBeGreaterThan(0);
      expect(help).toContain(recipeEntry(r));
    }
  });
});
