import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { changedSince, fastScopeFor, SWEEPS } from "../fast-scope.js";

/**
 * What `bun run check:fast` decides to run. The table of what reaches what is
 * `tools/hooks/scope.ts`'s and is tested there; this asks only about the two
 * things the fast check adds — the narrowing of "run everything", and the two
 * sweeps that ride along whatever changed.
 */

const ROOT = join(import.meta.dirname, "..", "..", "..");

describe("fastScopeFor", () => {
  it("a narrow scope is the hook's answer plus the sweeps", () => {
    expect(fastScopeFor(["packages/net/src/wire.ts"])).toEqual([
      "apps/game",
      "packages/net",
      ...SWEEPS,
    ]);
  });

  it("a change the hook would run everything for runs its own package instead", () => {
    expect(fastScopeFor(["packages/content/src/creatures.ts"])).toEqual([
      "packages/content",
      ...SWEEPS,
    ]);
  });

  it("one path asking for everything does not silence the narrow answers beside it", () => {
    expect(fastScopeFor(["package.json", "docs/queue.md", "packages/net/src/wire.ts"])).toEqual([
      "apps/game",
      "packages/net",
      ...SWEEPS,
      "tools/director",
      "tools/queue",
    ]);
  });

  it("a sim change names sim once — the sweeps already live there", () => {
    expect(fastScopeFor(["packages/sim/src/step.ts"])).toEqual(["packages/sim"]);
  });

  it("a shared file with no package of its own is the sweeps alone", () => {
    expect(fastScopeFor(["package.json"])).toEqual([...SWEEPS]);
    expect(fastScopeFor(["tsconfig.json"])).toEqual([...SWEEPS]);
  });

  it("nothing changed is still the sweeps", () => {
    expect(fastScopeFor([])).toEqual([...SWEEPS]);
  });

  it("a tool is its own directory, whichever tool it is", () => {
    expect(fastScopeFor(["tools/check/fast.ts"])).toEqual([...SWEEPS, "tools/check"]);
  });

  it("the sweeps are real files, so a rename cannot make the fast check silent", () => {
    for (const sweep of SWEEPS) expect(existsSync(join(ROOT, sweep)), sweep).toBe(true);
  });
});

describe("changedSince", () => {
  it("answers with paths relative to the repository, or nothing, and never throws", () => {
    for (const path of changedSince("HEAD", ROOT)) {
      expect(path).not.toMatch(/^[A-Za-z]:|^\//);
    }
  });
});
