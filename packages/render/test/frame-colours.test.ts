import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Glob } from "bun";
import { PALETTE } from "../src/palette.js";

/**
 * A frame test proves a thing is drawn by counting its colour in the canvas
 * log — `count(text, PALETTE.redRim)` against a world that should not have
 * it — and that is only a proof while the colour belongs to the one thing
 * being asked about (`docs/queue.md`, 19 September 2026).
 *
 * THE CURTAIN's jam bar found the gap the hard way: it was stroked in
 * `PALETTE.rock`, which is also the cue word's fill (`boss-cue-text.ts`) and
 * the target lock's (`boss-cue-draw.ts`), so a count meant to prove the bar
 * was drawn was measuring whichever cue happened to be on screen instead.
 *
 * **Most of the palette is shared, on purpose** (`CLAUDE.md`: *a colour spent
 * when the picture needs one, over a rule kept*) — `PALETTE.red` alone is
 * drawn by ninety-five files, one per body it can arm. None of that is the
 * ambiguity THE CURTAIN found: two bosses never draw on the same frame, so a
 * count inside one boss's own test can never be reading another boss's file.
 * **The one thing that can share a frame with anything is the cue chrome**
 * (`docs/decisions.md` #34) — the mark and the word ride on top of whichever
 * boss is asking, so a colour it shares with a boss's own material is read on
 * the same canvas at once, which is the one kind of sharing this checks:
 * every colour a frame test counts, checked against the cue chrome and every
 * other file drawing with it, one case per colour rather than one throw on
 * the first (`hash-coverage.test.ts`'s shape).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");

/** The chrome that can stand over **any** boss's own picture, on the same
 * frame, whichever boss a test is about — the mark and the word under it. */
const CUE_CHROME = ["boss-cue-text.ts", "boss-cue-draw.ts"];

/**
 * Colours already found sharing the cue chrome, with why the frame test that
 * counts each one is still sound despite it.
 */
const EXCEPTIONS: Record<string, string> = {
  rock:
    "antiphon-frame.test.ts pairs a held organ (the mark, no word — the " +
    "word shows only while nothing holds it) against none (neither), which " +
    "isolates the mark's own fill from boss-cue-text.ts's and " +
    "boss-cue-draw.ts's use of the same one — reviewed 19 September 2026",
};

/**
 * The `count(...)` calls in a test's own text, as the raw string between the
 * matching parens — never a single regex over the whole call, because an
 * argument like `drawn(pilot, "p1", 3).text` carries its own parens and
 * commas that a regex cannot tell from the call's own.
 */
function countCalls(text: string): string[] {
  const calls: string[] = [];
  for (const m of text.matchAll(/\bcount\(/g)) {
    let depth = 1;
    let j = m.index + m[0].length;
    while (j < text.length && depth > 0) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")") depth--;
      j++;
    }
    calls.push(text.slice(m.index + m[0].length, j - 1));
  }
  return calls;
}

/** Every `PALETTE` key named in every `count(...)` call under `render/test`. */
function countedColours(): Set<string> {
  const out = new Set<string>();
  for (const f of new Glob("*.test.ts").scanSync(HERE)) {
    const text = readFileSync(join(HERE, f), "utf8");
    for (const call of countCalls(text)) {
      for (const m of call.matchAll(/PALETTE\.(\w+)/g)) out.add(m[1]!);
    }
  }
  return out;
}

/** Every `.ts` file directly under `render/src` — a flat package, no
 * subdirectories — read once, whichever colour below asks for it. */
function srcTexts(): Map<string, string> {
  const out = new Map<string, string>();
  for (const f of new Glob("*.ts").scanSync(SRC)) {
    out.set(f, readFileSync(join(SRC, f), "utf8"));
  }
  return out;
}

/** Every file under `render/src` that draws with this colour — `palette.ts`
 * itself excluded, since defining a value there is not drawing with it. */
function drawnBy(colour: string, texts: Map<string, string>): string[] {
  const pattern = new RegExp(`PALETTE\\.${colour}\\b`);
  const files: string[] = [];
  for (const [file, text] of texts) {
    if (file !== "palette.ts" && pattern.test(text)) files.push(file);
  }
  return files.sort();
}

describe("a frame test's colour does not share the cue chrome", () => {
  const counted = [...countedColours()].sort();
  const texts = srcTexts();

  it("finds a non-empty set of counted colours", () => {
    expect(counted.length).toBeGreaterThan(0);
  });

  it("names only PALETTE keys that still exist", () => {
    // The pattern below cannot mistake a key for one of its own prefixes —
    // `PALETTE.red` inside `PALETTE.redRim` fails the `\b` that follows it —
    // but it can still name a key this palette no longer has, if a colour is
    // renamed and a test is not. `PALETTE` is the one list this can check
    // itself against.
    const known = new Set(Object.keys(PALETTE));
    for (const colour of counted) {
      expect(known.has(colour), `PALETTE has no ${colour}`).toBe(true);
    }
  });

  it("carries no stale exception", () => {
    for (const colour of Object.keys(EXCEPTIONS)) {
      expect(counted, `EXCEPTIONS names ${colour}, which no test counts any more`).toContain(
        colour,
      );
    }
  });

  for (const colour of counted) {
    const drawers = drawnBy(colour, texts);
    const others = drawers.filter((f) => !CUE_CHROME.includes(f));
    const sharesChrome = CUE_CHROME.some((f) => drawers.includes(f)) && others.length > 0;

    it(`PALETTE.${colour} does not share the cue chrome with another file`, () => {
      expect(
        sharesChrome && !(colour in EXCEPTIONS),
        `PALETTE.${colour} is counted by a frame test and drawn by the cue chrome ` +
          `(${CUE_CHROME.join(", ")}) as well as ${others.join(", ")} — a count of it on a ` +
          `frame carrying a cue can be measuring either, the way PALETTE.rock was on THE ` +
          `CURTAIN's own frame. Pick a colour the cue chrome does not use, or add a reviewed ` +
          `exception naming why this count still isolates its subject.`,
      ).toBe(false);
    });
  }
});
