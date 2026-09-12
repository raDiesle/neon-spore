import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { changedSince, fastScopeFor, SWEEPS } from "../fast-scope.js";

/**
 * What `bun run check:fast` decides to run. The table of what reaches what is
 * `tools/hooks/scope.ts`'s and is tested there; this asks only about the two
 * things the fast check adds — the narrowing of "run everything", and the
 * sweeps that ride along whatever changed.
 */

const ROOT = join(import.meta.dirname, "..", "..", "..");

describe("fastScopeFor", () => {
  it("a narrow scope is the hook's answer plus the sweeps", () => {
    expect(fastScopeFor(["packages/net/src/wire.ts"])).toEqual([
      "apps/game",
      "apps/server",
      "packages/net",
      ...SWEEPS,
    ]);
  });

  it("a lane that can break the relay reaches the relay's own tests", () => {
    // `apps/server/test/room.test.ts` raises the shipped worker; until 12
    // September 2026 nothing short of `bun run land` ran it for a change to
    // the wire, and two landings went red there for lanes that had not
    // touched it.
    for (const path of [
      "packages/net/src/protocol.ts",
      "apps/server/src/room.ts",
      "apps/game/src/link.ts",
      "apps/game/src/relay.ts",
    ]) {
      expect(fastScopeFor([path]), path).toContain("apps/server");
    }
    expect(fastScopeFor(["apps/game/src/loop.ts"])).not.toContain("apps/server");
  });

  it("a change the hook would run everything for runs its own package instead", () => {
    expect(fastScopeFor(["packages/content/src/creatures.ts"])).toEqual([
      "packages/content",
      ...SWEEPS,
    ]);
  });

  it("one path asking for everything does not silence the narrow answers beside it", () => {
    expect(fastScopeFor(["package.json", "docs/queue.md", "packages/net/src/wire.ts"])).toEqual(
      [
        "apps/game",
        "apps/server",
        "packages/net",
        ...SWEEPS,
        "tools/director",
        "tools/queue",
      ].sort(),
    );
  });

  it("a sim change names sim once — three of the sweeps already live there", () => {
    expect(fastScopeFor(["packages/sim/src/step.ts"])).toEqual([
      "packages/sim",
      "tools/index/test/index.test.ts",
    ]);
  });

  it("a shared file with no package of its own is the sweeps alone", () => {
    expect(fastScopeFor(["package.json"])).toEqual([...SWEEPS]);
    expect(fastScopeFor(["tsconfig.json"])).toEqual([...SWEEPS]);
  });

  it("nothing changed is still the sweeps", () => {
    expect(fastScopeFor([])).toEqual([...SWEEPS]);
  });

  it("a tool is its own directory, whichever tool it is", () => {
    expect(fastScopeFor(["tools/check/fast.ts"])).toEqual([...SWEEPS, "tools/check"].sort());
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
