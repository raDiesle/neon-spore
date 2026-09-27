import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * **Every test that draws a frame states its own timeout.**
 *
 * `canvas-stub.ts` exports `FRAME_TIMEOUT_MS` and says why: a frame through
 * the checking canvas is slow by construction, and bun's default is five
 * seconds. The call cannot be made once on everyone's behalf — bun applies
 * `setDefaultTimeout` to the file the call is *in*, and a module is evaluated
 * once, by whichever test imports it first — so it was made at the top of
 * `frame-harness.ts` for two years and covered exactly one file at a time.
 *
 * That is not a failure anybody can read. It is a test in a diff that did not
 * touch it, failing at 5000 ms on a machine that happened to be running the
 * other seven shards, and passing alone. It cost two sessions a re-run each
 * before anybody looked at the number: 7 September 2026 (`crawler-frame`) and
 * 17 September (`briefing`, then `path-text`, then `briefing` again, three
 * different tests across three runs of one green diff).
 *
 * So the rule is stated here rather than remembered. A file that reaches for
 * the harness or the stub is a file that draws, and a file that draws says how
 * long it is allowed to take.
 */
const DIR = import.meta.dir;
const DRAWS = /from "\.\/(frame-harness|canvas-stub)\.js"/;

/**
 * This file reads every test beside it, and it kept to the rule it checks
 * only by luck: under `check:fast`'s eight shards on 27 September 2026 the
 * read timed out at bun's 5000 ms, where alone it takes 0.16 s. So the
 * directory is read once, for both tests, and the file states its own limit.
 */
setDefaultTimeout(30_000);

describe("a test that draws states its own timeout", () => {
  let drawing: { file: string; src: string }[] = [];

  beforeAll(() => {
    drawing = readdirSync(DIR)
      .filter((f) => f.endsWith(".test.ts"))
      .map((file) => ({ file, src: readFileSync(join(DIR, file), "utf8") }))
      .filter((t) => DRAWS.test(t.src));
  });

  it("finds the drawing tests at all", () => {
    // A rule that matched nothing would pass for the wrong reason. It was 117
    // on the day this landed.
    expect(drawing.length).toBeGreaterThan(80);
  });

  it("leaves none of them on bun's five-second default", () => {
    const bare = drawing
      .filter((t) => !/setDefaultTimeout\(FRAME_TIMEOUT_MS\)/.test(t.src))
      .map((t) => t.file);
    expect(bare).toEqual([]);
  });
});
