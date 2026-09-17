import { describe, expect, it } from "bun:test";
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

describe("a test that draws states its own timeout", () => {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".test.ts"));

  it("finds the drawing tests at all", () => {
    // A rule that matched nothing would pass for the wrong reason. It was 117
    // on the day this landed.
    const drawing = files.filter((f) => DRAWS.test(readFileSync(join(DIR, f), "utf8")));
    expect(drawing.length).toBeGreaterThan(80);
  });

  it("leaves none of them on bun's five-second default", () => {
    const bare: string[] = [];
    for (const f of files) {
      const src = readFileSync(join(DIR, f), "utf8");
      if (!DRAWS.test(src)) continue;
      if (!/setDefaultTimeout\(FRAME_TIMEOUT_MS\)/.test(src)) bare.push(f);
    }
    expect(bare).toEqual([]);
  });
});
