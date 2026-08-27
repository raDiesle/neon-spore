import { describe, expect, test } from "bun:test";
import { CATALOGUE } from "@neon-spore/shape-sheet";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";

/**
 * The join between a shape and the concept it was drawn at.
 *
 * A draft carries `suggests: "Echo"` and the backlog carries an entry called
 * Echo, and the backlog page puts them side by side. Nothing enforces that
 * spelling: renaming an idea in `docs/spec/ideas.md` is one edit, and the
 * shape drawn at it would go quietly back to being a picture beside other
 * pictures — which is the state this whole join exists to end.
 *
 * So the test is the spelling. It fails on the rename rather than a month
 * later on somebody noticing the Echo has stopped showing its shape.
 */

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(
    await read("docs/spec/bestiary.md"),
    await read("docs/spec/bosses.md"),
    await read("docs/spec/couplings.md"),
    await read("docs/spec/assists.md"),
    await read("docs/spec/systems.md"),
    await read("docs/spec/ideas.md"),
  );
}

const allNames = (backlog: Backlog): Set<string> =>
  new Set(
    Object.values(backlog)
      .flat()
      .flatMap((g: BacklogGroup) => g.entries.map((e) => e.name))
      .filter(Boolean),
  );

const suggested = (): string[] => [
  ...new Set(CATALOGUE.map((e) => e.suggests).filter((s): s is string => Boolean(s))),
];

describe("a shape drawn at a concept", () => {
  test("names a concept the backlog actually has", async () => {
    const names = allNames(await realBacklog());
    const orphans = suggested().filter((s) => !names.has(s));
    expect(orphans).toEqual([]);
  });

  test("is drawn at enough of them to be worth joining", async () => {
    // Not a count that has to be kept up to date — a floor. If this drops to
    // nothing the join is still correct and no longer does anything, and a
    // green test that proves nothing is the failure mode being guarded here.
    const names = allNames(await realBacklog());
    const hit = suggested().filter((s) => names.has(s));
    expect(hit.length).toBeGreaterThan(10);
  });

  test("is offered rather than claimed: a draft is never marked taken", () => {
    // The suggestion is a proposal and a person accepts it. A draft that has
    // become `taken` has moved into `packages/content` and should have lost
    // its `suggests` on the way, or the backlog would keep offering a shape
    // that is already spent.
    const claimed = CATALOGUE.filter((e) => e.suggests && e.status === "taken");
    expect(claimed.map((e) => e.subject.name)).toEqual([]);
  });
});
