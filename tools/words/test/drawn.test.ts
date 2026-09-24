import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { VOCABULARY } from "../measure.js";

/**
 * **The words drawn on a playing screen**, which `playerText()` cannot reach:
 * a mark, a banner, a tally heading or a scene caption is a string literal at
 * its call site, and `packages/render` cannot be imported here without a
 * canvas. So this reads the source instead — every capitalised literal of two
 * or more letters in the three places that draw text, run against the same
 * `VOCABULARY` the guides are.
 *
 * `STANDING` is what was still there on 23 September 2026, and it only
 * shrinks: a new hit fails, and so does a standing one that has gone, so the
 * line is struck in the same change that fixed it. The seat names went on 24
 * September 2026, when the owner chose `P1'S` / `P2'S` on a mark and a call
 * and `PLAYER 1` / `PLAYER 2` under `SCREEN` on the menu. `THE WARD` is a
 * wave's name and stays (`.claude/skills/game-words`, section 3).
 */

const ROOT = join(import.meta.dir, "../../..");
const DIRS = ["packages/render/src", "apps/game/src", "packages/content/src"];
const LITERAL = /"([A-Z][A-Z0-9 ,.'!?·-]{1,})"/g;
const COMMENT = /^\s*(?:\/\/|\/?\*)/;

const STANDING: readonly string[] = ["packages/content/src/waves/act-3b.ts: THE WARD"];

function drawnHits(): string[] {
  const hits = new Set<string>();
  for (const dir of DIRS) {
    for (const file of readdirSync(join(ROOT, dir), { recursive: true }) as string[]) {
      if (!file.endsWith(".ts")) continue;
      for (const line of readFileSync(join(ROOT, dir, file), "utf8").split("\n")) {
        if (COMMENT.test(line)) continue;
        for (const m of line.matchAll(LITERAL)) {
          const text = m[1] ?? "";
          if (VOCABULARY.some(([pattern]) => pattern.test(text)))
            hits.add(`${dir}/${file}: ${text}`);
        }
      }
    }
  }
  return [...hits].sort();
}

describe("the words drawn on a playing screen", () => {
  const hits = drawnHits();

  it("adds no word the vocabulary has already replaced", () => {
    expect(hits.filter((h) => !STANDING.includes(h))).toEqual([]);
  });

  it("strikes a standing line in the change that fixed it", () => {
    expect(STANDING.filter((s) => !hits.includes(s))).toEqual([]);
  });
});
