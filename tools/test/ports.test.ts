import { describe, expect, it } from "bun:test";
import {
  DIRECTOR_BAND,
  DIRECTOR_BASE,
  derivePort,
  freePort,
  PREVIEW_BAND,
  PREVIEW_BASE,
  portFor,
  treeKey,
} from "../ports.js";
import { SERVERS } from "../servers.js";

/**
 * The one property that matters: a worktree's port is its own and it is the
 * same every time. A port that moved between two starts would make the
 * `/__preview` identity check — the whole point of which is knowing who
 * answered — impossible to perform twice.
 */

const TREE = "C:/Users/x/project/.claude/worktrees/feature-a";

describe("a server's port", () => {
  it("is the same for the same tree, every time", () => {
    const once = derivePort(PREVIEW_BAND, TREE);
    expect(derivePort(PREVIEW_BAND, TREE)).toBe(once);
    expect(once).toBeGreaterThanOrEqual(PREVIEW_BAND);
    expect(once).toBeLessThan(PREVIEW_BAND + 100);
  });

  it("does not depend on how the path was spelled", () => {
    expect(treeKey(String.raw`C:\Users\X\Project\.claude\worktrees\feature-a`)).toBe(
      "c:/users/x/project/.claude/worktrees/feature-a",
    );
    // A trailing separator is not a different tree, and neither is the case.
    expect(treeKey("C:/Users/X/Project/")).toBe("c:/users/x/project");
    expect(
      derivePort(PREVIEW_BAND, String.raw`C:\Users\X\Project\.claude\worktrees\feature-a`),
    ).toBe(derivePort(PREVIEW_BAND, TREE));
  });

  it("keeps the two servers in bands that cannot overlap", () => {
    expect(PREVIEW_BAND + 100).toBeLessThanOrEqual(DIRECTOR_BAND);
    for (const tree of ["a", "b", "c", TREE]) {
      expect(derivePort(PREVIEW_BAND, tree)).not.toBe(derivePort(DIRECTOR_BAND, tree));
    }
  });

  it("gives different worktrees different ports far more often than not", () => {
    // Not a guarantee — a hundred ports and a hash collide sometimes, which is
    // why a server also refuses to retire a copy rooted in another tree.
    const seen = new Set<number>();
    for (let i = 0; i < 40; i++) seen.add(derivePort(PREVIEW_BAND, `${TREE}-${i}`));
    expect(seen.size).toBeGreaterThan(30);
  });

  it("can be asked for a free one, settled now rather than at bind time", async () => {
    const port = await freePort();
    expect(port).toBeGreaterThan(1024);
    // Free means free: it must be bindable straight afterwards, which is the
    // whole point of settling it early and handing the number to a child.
    const server = Bun.serve({ port, hostname: "127.0.0.1", fetch: () => new Response(null) });
    expect(server.port).toBe(port);
    server.stop(true);
  });

  it("falls back to the base port where there is no worktree to be in", () => {
    // A path with no `.git` at all is the only checkout there is, so the
    // number everything else is written against stays free for it.
    expect(portFor(PREVIEW_BASE, PREVIEW_BAND, "/nowhere/at/all")).toBe(PREVIEW_BASE);
  });
});

/**
 * The descriptors, which are the numbers and the strings the servers used to
 * carry a copy of each. `bun run port` prints them and both servers claim with
 * them, so a drift here is a `curl` against a port nothing is on.
 */
describe("the server table", () => {
  it("gives each server its own base inside its own band", () => {
    expect(SERVERS.director.base).toBe(DIRECTOR_BASE);
    expect(SERVERS.preview.base).toBe(PREVIEW_BASE);
    expect(SERVERS.director.band).toBe(DIRECTOR_BAND);
    expect(SERVERS.preview.band).toBe(PREVIEW_BAND);
    expect(SERVERS.director.base).not.toBe(SERVERS.preview.base);
  });

  it("answers on a path under the marker it answers with", () => {
    for (const spec of Object.values(SERVERS)) {
      expect(spec.marker).toStartWith("neon-spore-");
      expect(spec.quitPath).toBe(`${spec.probePath}/quit`);
      expect(spec.env).toMatch(/^[A-Z_]+_PORT$/);
    }
  });
});
