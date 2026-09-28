import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { Glob } from "bun";
import { stripNonCode } from "../../../packages/sim/test/source-scan.js";

/**
 * NO LISTENER IN THE GAME TURNS A SCREEN COORDINATE INTO A STAGE ONE BY HAND.
 *
 * There were five of them — the field, the guide, THE GAUGE, SNAKE and
 * PINBALL — each carrying the same three lines: subtract `stage.left`,
 * subtract `stage.top`, reject anything outside. They were right only while
 * the canvas covered the window exactly and was the size the renderer had been
 * told about. Nothing said so, and nothing failed when it stopped being true.
 * The director had the same three lines in four files and every one of them
 * was wrong: each control was answered to the left of where it was drawn
 * (`render/stage-point.ts`).
 *
 * So there is one conversion — `bindViewport`'s `inStage` — and this is what
 * stops a sixth copy. Comments are stripped first, because the paragraph above
 * quotes the very thing it is warning about.
 */

const SRC = Bun.fileURLToPath(new URL("../src/", import.meta.url));
const FILES = [...new Glob("**/*.ts").scanSync(SRC)];

describe("where a pointer landed", () => {
  it("is asked of more than a handful of files", () => {
    expect(FILES.length).toBeGreaterThan(10);
  });

  // One test per file, as `purity.test.ts` does it: the whole tree read in one
  // test took 35 ms alone and 5137 ms in a loaded shard of `land`, past bun's
  // 5 s default, and no single file comes near that.
  for (const file of FILES) {
    it(`${file} asks one function rather than converting the pointer itself`, async () => {
      const code = stripNonCode(await Bun.file(join(SRC, file)).text());
      expect(code, `${file} does the stage conversion itself`).not.toMatch(/client[XY]\s*-/);
    });
  }
});
