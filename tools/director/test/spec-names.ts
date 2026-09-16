import { parseConcepts } from "../src/concepts.js";
import { parseRoster } from "../src/roster.js";

/**
 * Every name the design has, case-blind: the systems, the idea store, what is
 * set aside in it, and the bosses the act order lists as built.
 *
 * Two tests join a drawing to the concept it was drawn at — `concept-art.test.ts`
 * for the contours and `scenes.test.ts` for the scenes — and both used to ask
 * `buildBacklog` for the names. That was the same set until 16 September 2026,
 * when the owner cut the MECHANICS page down to the four things with work
 * written down for them: nine creature ideas are still in `docs/spec/ideas.md`
 * and no longer on the page, and reading the page would have called every
 * shape drawn at one of them an orphan.
 *
 * So the join reads the **spec**, which is what a rename edits and what the
 * test exists to catch. A shape whose concept is off the page is a shape
 * waiting for its idea to come back up the list; a shape whose concept has been
 * renamed or cut is a picture of nothing, and only the second is a failure.
 */
const ROOT = new URL("../../../", import.meta.url);
const read = (rel: string) => Bun.file(Bun.fileURLToPath(new URL(rel, ROOT))).text();

export async function specNames(): Promise<Set<string>> {
  const sheet = parseConcepts(await read("docs/spec/systems.md"), await read("docs/spec/ideas.md"));
  const roster = parseRoster(
    await read("docs/spec/bestiary.md"),
    await read("docs/spec/bosses.md"),
  );
  return new Set(
    [
      ...sheet.systems.map((c) => c.name),
      ...sheet.ideas.map((i) => i.name),
      ...sheet.deferred.map((i) => i.name),
      ...roster.bosses.map((b) => b.name),
    ]
      .filter(Boolean)
      .map((n) => n.toLowerCase()),
  );
}
