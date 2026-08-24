import { describe, expect, test } from "bun:test";
import { mentionedPaths } from "../mentions.js";

describe("mentionedPaths", () => {
  test("finds paths in backticks and bare in prose", () => {
    const texts = ["See `src/index.ts` for details", "The file tools/build.js handles compilation"];
    const result = mentionedPaths(texts, []);
    expect(result).toContain("src/index.ts");
    expect(result).toContain("tools/build.js");
  });

  test("normalizes Windows backslashes to forward slashes", () => {
    const texts = ["Check src\\utils\\helper.ts"];
    const result = mentionedPaths(texts, []);
    expect(result).toEqual(["src/utils/helper.ts"]);
  });

  test("excludes files in the exclude list", () => {
    const texts = ["Edit src/main.ts and src/helper.ts", "Also check src\\config.json"];
    const result = mentionedPaths(texts, ["src/main.ts", "src\\config.json"]);
    expect(result).toEqual(["src/helper.ts"]);
  });

  test("ignores non-path tokens", () => {
    const texts = [
      "Version 1.2.3 is stable",
      "Visit https://example.com/page",
      "Just a word",
      "Check src/real.ts though",
    ];
    const result = mentionedPaths(texts, []);
    expect(result).toEqual(["src/real.ts"]);
  });

  test("caps results at twelve in first-seen order", () => {
    const texts = [Array.from({ length: 15 }, (_, i) => `file${i}/path.ts`).join(" ")];
    const result = mentionedPaths(texts, []);
    expect(result).toHaveLength(12);
    expect(result[0]).toBe("file0/path.ts");
    expect(result[11]).toBe("file11/path.ts");
  });

  test("removes duplicates keeping first occurrence", () => {
    const texts = ["src/a.ts and src/b.ts", "src/a.ts again and src/c.ts"];
    const result = mentionedPaths(texts, []);
    expect(result).toEqual(["src/a.ts", "src/b.ts", "src/c.ts"]);
  });
});
