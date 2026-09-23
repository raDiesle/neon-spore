import { describe, expect, test } from "bun:test";
import { generateIndex, parseRows, type Tree } from "../index.js";

/**
 * A row that was the generator's own sentence follows its file's header; a
 * row a person wrote stays. The case that put this here: the lost screen's
 * redesign rewrote `lost-shut.ts`'s header and its row went on describing the
 * vertical slot it no longer cut.
 */
describe("a row whose file's header changed", () => {
  const SHUT = "apps/game/src/lost-shut.ts";
  const LOOK = "apps/game/src/lost-look.ts";
  const doc = (shut: string, look: string) =>
    [
      "## Code\n",
      "<!-- index:code:start -->",
      "",
      "### apps/game",
      "",
      "| Path | One line |",
      "|---|---|",
      `| \`${LOOK}\` | ${look} |`,
      `| \`${SHUT}\` | ${shut} |`,
      "",
      "<!-- index:code:end -->",
      "",
    ].join("\n");
  const now: Record<string, string> = {
    [SHUT]: "/** The field shuts from both sides at once. */\n",
    [LOOK]: "/** The lost screen's colours, after the redesign. */\n",
  };
  const was: Record<string, string> = {
    [SHUT]: "/** The field shuts through a vertical slot. */\n",
    [LOOK]: "/** The lost screen's colours. */\n",
  };
  const tree = (before?: Tree["before"]): Tree => ({
    scope: [LOOK, SHUT],
    read: (p) => now[p] ?? "",
    has: (p) => p in now,
    before,
  });
  const lineOf = (text: string, path: string) => parseRows(text).find((r) => r.path === path)?.line;

  test("follows the header when the row was the old header's sentence", () => {
    const out = generateIndex(
      doc("The field shuts through a vertical slot", "The lost screen's colours"),
      tree((p) => (was[p] ? [was[p]] : [])),
    );
    expect(lineOf(out, SHUT)).toBe(`| \`${SHUT}\` | The field shuts from both sides at once |`);
    expect(lineOf(out, LOOK)).toBe(
      `| \`${LOOK}\` | The lost screen's colours, after the redesign |`,
    );
  });

  test("keeps words a person chose, whatever the header now says", () => {
    const out = generateIndex(
      doc("the cut that closes the field", "The lost screen's colours"),
      tree((p) => (was[p] ? [was[p]] : [])),
    );
    expect(lineOf(out, SHUT)).toBe(`| \`${SHUT}\` | the cut that closes the field |`);
  });

  test("knows the generator's sentence from any earlier source, not only the first", () => {
    const committed = "/** The field shuts from the left. */\n";
    const out = generateIndex(
      doc("The field shuts from the left", "The lost screen's colours"),
      tree((p) => (p === SHUT ? [was[SHUT] ?? "", committed] : [])),
    );
    expect(lineOf(out, SHUT)).toBe(`| \`${SHUT}\` | The field shuts from both sides at once |`);
  });

  test("keeps every row when nothing says what the file was", () => {
    const text = doc("The field shuts through a vertical slot", "The lost screen's colours");
    expect(generateIndex(text, tree())).toBe(
      generateIndex(
        text,
        tree(() => []),
      ),
    );
    expect(lineOf(generateIndex(text, tree()), SHUT)).toContain("vertical slot");
  });
});
