import { describe, expect, test } from "bun:test";
import { parseCommits, restampText, rewrites } from "../restamp.js";

/** The pure half of `restamp.ts`: pairing a replay's commits and rewriting stamps. */

const OLD = "aaaaaaaaa1111111111111111111111111111111";
const NEW = "bbbbbbbbb2222222222222222222222222222222";

describe("rewrites", () => {
  test("pairs a commit with its replayed self by author, date and subject", () => {
    const map = rewrites(
      [{ sha: OLD, key: "Us\t100\tours" }],
      [{ sha: NEW, key: "Us\t100\tours" }],
    );
    expect(map.get(OLD)).toBe(NEW);
  });

  test("leaves a commit the replay dropped, and a key seen twice", () => {
    const twice = [
      { sha: OLD, key: "k" },
      { sha: "c".repeat(40), key: "k" },
    ];
    expect(rewrites([{ sha: OLD, key: "gone" }], []).size).toBe(0);
    expect(rewrites(twice, [{ sha: NEW, key: "k" }]).size).toBe(0);
  });

  test("reads git log's tab-separated lines, a tab in the subject included", () => {
    const [c] = parseCommits(`${OLD}\tUs\t100\ta\tb\n`);
    expect(c).toEqual({ sha: OLD, key: "Us\t100\ta\tb" });
  });
});

describe("restampText", () => {
  const map = new Map([[OLD, NEW]]);

  test("replaces a stamp with as many characters of the new sha", () => {
    const text = "## 2026-09-27 · aaaaaaaaa — ours\n## Unverified at aaaaaaaaa1: x\n";
    expect(restampText(text, map)).toBe(
      "## 2026-09-27 · bbbbbbbbb — ours\n## Unverified at bbbbbbbbb2: x\n",
    );
  });

  test("leaves a hex word that is no rewritten commit's prefix", () => {
    const text = "0551cd063 and aaaaaaab and deadbeef\n";
    expect(restampText(text, map)).toBe(text);
  });
});
