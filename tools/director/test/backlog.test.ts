import { describe, expect, test } from "bun:test";
import { type Backlog, type BacklogGroup, buildBacklog } from "../src/backlog.js";

const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

async function realBacklog(): Promise<Backlog> {
  return buildBacklog(
    await read("docs/spec/bosses.md"),
    await read("docs/spec/bosses-choreographed.md"),
    await read("docs/spec/boss-looks.md"),
  );
}

const names = (groups: BacklogGroup[]): string[] =>
  groups.flatMap((g) => g.entries.map((e) => e.name));

/** One group of a page, by its heading. */
const group = (groups: BacklogGroup[], title: string): BacklogGroup => {
  const found = groups.find((g) => g.title === title);
  if (!found) throw new Error(`no group titled ${title}`);
  return found;
};

describe("buildBacklog", () => {
  test("the sheet is one page, and it is the bosses", async () => {
    const backlog = await realBacklog();

    // MECHANICS went on 17 September 2026 at the owner's ask, and with it the
    // three parsers that fed it. Held by name rather than by a count: a page
    // that comes back should come back deliberately, and a `mechanics` key
    // reappearing on this object is the old one creeping back in.
    expect(Object.keys(backlog)).toEqual(["bosses"]);
    expect(backlog).not.toHaveProperty("mechanics");
    // And the two that went before it, for the same reason.
    expect(backlog).not.toHaveProperty("bestiary");
    expect(backlog).not.toHaveProperty("designs");
  });

  test("the bosses page is what is left on a boss, and reads it off the spec", async () => {
    const backlog = await realBacklog();

    expect(backlog.bosses.map((g) => g.title)).toEqual([
      // First, and read off a third file — see the block at the foot of this
      // file.
      "LOOKS WAITING FOR A YES",
      "STILL IN HAND",
      "LEFT ON A BUILT BOSS",
      "PRIMITIVES A SCENE STILL NEEDS",
    ]);

    // **Not a list of names.** Which group a boss is in is the `##` heading it
    // stands under in `bosses.md`, so a look that lands moves it by being
    // moved in the spec. What this holds is that the reading works at all: the
    // retired one is on no group, and the two that carry an act order — the
    // preamble's own `·` paragraph — are not read as sections.
    const every = names(backlog.bosses);
    expect(every).not.toContain("THE TELL");
    expect(every.length).toBeGreaterThan(5);

    // Every entry of the second group says what it still owes, in the spec's
    // own words. A group of built bosses with nothing under them would be an
    // act order, which is the page the owner took off.
    const left = group(backlog.bosses, "LEFT ON A BUILT BOSS");
    for (const entry of left.entries) expect(entry.note).toMatch(/not built/i);

    // STILL IN HAND is the one group that is *right* to be empty — it holds a
    // boss whose simulation landed and whose look nobody has written, and on
    // the day every look has landed there is nothing in it. So its drift guard
    // cannot be "it has entries"; it is that the two headings
    // `backlog-bosses.ts` matches on are still the headings in the file.
    // Rename one in the spec and this fails instead of a column quietly
    // emptying.
    const spec = await read("docs/spec/bosses.md");
    expect(spec).toContain("\n## Still in hand\n");
    expect(spec).toContain("\n## Built\n");
  });

  test("a lead line is prose, never a flattened bullet list", async () => {
    const backlog = await realBacklog();
    for (const entry of Object.values(backlog)
      .flat()
      .flatMap((g) => g.entries)) {
      expect({ name: entry.name, runOn: entry.note.includes(" - ") }).toEqual({
        name: entry.name,
        runOn: false,
      });
    }
  });

  test("every group is populated, so a heading renamed in the spec is caught", async () => {
    const backlog = await realBacklog();
    for (const groups of Object.values(backlog)) {
      for (const group of groups as BacklogGroup[]) {
        // A group with no entries is a heading the parser no longer finds.
        //
        // Except STILL IN HAND, which is empty on a day when every boss's look
        // has landed — an outcome, not a broken parser. Its heading is held by
        // name in the bosses test above instead.
        if (group.title === "STILL IN HAND") continue;
        const found = group.entries.length > 0;
        expect({ title: group.title, found }).toEqual({ title: group.title, found: true });
      }
    }
  });
});

/**
 * The menu of looks nobody may start unasked, at the top of the page.
 *
 * Read off the real `boss-looks.md` rather than a fixture, for the reason the
 * rest of this file is: the value of the section is that it is the whole list,
 * and a fixture cannot go stale in the direction that matters — a boss put
 * back in `docs/queue.md` and left on the menu as well.
 */
describe("looks waiting for a yes", () => {
  test("heads the page, one entry per description and not per boss", async () => {
    const backlog = await realBacklog();
    const first = backlog.bosses[0];
    expect(first?.title).toBe("LOOKS WAITING FOR A YES");
    expect(first?.reading).toBe(true);
    // Every entry names the bosses its one paragraph covers, and says how
    // many — the number the owner is actually weighing.
    for (const entry of first?.entries ?? []) {
      expect(entry.note).not.toBe("");
      expect(entry.kind).toMatch(/^\d+ boss(es)?$/);
      expect(entry.detail).not.toBe("");
    }
  });

  test("a boss on the menu is not also claimable in the queue", async () => {
    const queue = await read("docs/queue.md");
    // The whole point of the move: a title in both files is a lane free to
    // spend a sitting on a boss the owner has not said yes to.
    expect(queue).not.toContain("picture looks like something real");
  });
});
