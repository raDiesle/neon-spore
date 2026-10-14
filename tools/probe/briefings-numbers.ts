#!/usr/bin/env bun
import { WAVES } from "@neon-spore/content";
import { guidedOfAll } from "../../packages/content/test/spelled.ts";

/**
 * `bun run briefings:renumber` — the wave numbers in `docs/spec/briefings.md`
 * rewritten from today's wave order.
 *
 * §1's table names each teaching block's wave by number, `24 · SALVAGE`, the
 * page's opening counts the guided waves in words, and every wave inserted
 * before one of them moves both. `waves.test.ts` and `scenes-prose.test.ts`
 * then fail until they are rewritten by hand, and a block lane writing its
 * composed waves (`bun run waves:compose --write`) did it with a scratch
 * script on 14 October 2026. This is that script, kept: each `N · NAME` in
 * the table's wave column is given the number the wave of that name has now,
 * and the count is spelled again. Nothing else on the page is touched, and a
 * name no wave carries is a throw rather than a guess.
 */

const DOC = new URL("../../docs/spec/briefings.md", import.meta.url);

/** The heading the section starts at, as `waves.test.ts` reads it. */
const SECTION = "## 1 · What has to be taught";

/** A wave as this needs it: its name, and whether it is guided. */
export interface NamedWave {
  name: string;
  guide?: unknown;
}

/** One `N · NAME` in a wave cell: the number, the dot between, the name up to a comma. */
const NAMED = /(\d+)(\s*·\s*)([^,|]+)/g;

/** A count spelled as this section spells it: number words, hyphens, *hundred* and *and*. */
const WORDS =
  "(?:(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-[a-z]+)?|hundred|and)";
const COUNT = new RegExp(
  `${WORDS}(?:\\s+${WORDS})*\\s+of\\s+the\\s+${WORDS}(?:\\s+${WORDS})*\\s+waves\\s+today`,
);

/** One wave cell with every number put back on the wave its name names. */
function renumberCell(cell: string, waves: readonly NamedWave[]): string {
  return cell.replace(NAMED, (_, _n: string, dot: string, name: string) => {
    const at = waves.findIndex((w) => w.name === name.trim());
    if (at === -1)
      throw new Error(`briefings.md §1 names ${name.trim()}, and no wave is called that`);
    return `${at + 1}${dot}${name}`;
  });
}

/** `md` with §1's wave numbers and the page's guided count taken from `waves`, in order. */
export function renumberBriefings(md: string, waves: readonly NamedWave[]): string {
  const from = md.indexOf(SECTION);
  if (from === -1) throw new Error(`briefings.md has no '${SECTION}' section to renumber`);
  const next = md.indexOf("\n## ", from + 1);
  const to = next === -1 ? md.length : next;
  const lines = md.slice(from, to).split("\n");
  const rows = lines.map((line) => {
    const cells = line.split("|");
    // A row of the table: a leading empty cell, a block number, and the wave
    // column last — `waves.test.ts`' own reading of it.
    if (cells.length < 4 || !/^\s*\d+\s*$/.test(cells[1] ?? "")) return line;
    const last = cells.length - 2;
    cells[last] = renumberCell(cells[last] ?? "", waves);
    return cells.join("|");
  });
  const page = md.slice(0, from) + rows.join("\n") + md.slice(to);
  // The count is in the page's opening, above §1, and there is one of it.
  const found = page.match(new RegExp(COUNT.source, "g")) ?? [];
  if (found.length !== 1) {
    throw new Error(`briefings.md says '… of the … waves today' ${found.length} times, not once`);
  }
  return page.replace(COUNT, guidedOfAll(waves.filter((w) => w.guide).length, waves.length));
}

if (import.meta.main) {
  const before = await Bun.file(DOC).text();
  const after = renumberBriefings(before, WAVES);
  if (after === before) console.log("briefings.md already names today's waves");
  else {
    await Bun.write(DOC, after);
    console.log("briefings.md renumbered from today's wave order");
  }
}
