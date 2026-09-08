import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PALETTE } from "@neon-spore/render";
import { DIAL, FAMILIES } from "../src/families.js";
import { sheet } from "../src/main.js";

const OUT = resolve(import.meta.dir, "../../../docs/reference/style-guide.svg");

describe("the specimen sheet covers the palette", () => {
  const filed = FAMILIES.flatMap((f) => f.keys);

  test("every colour in PALETTE is on the sheet", () => {
    // A colour nobody drew is the drift this sheet exists to catch: the next
    // hue gets placed against a picture that is missing three of them.
    const missing = Object.keys(PALETTE).filter((k) => !filed.includes(k));
    expect(missing).toEqual([]);
  });

  test("no colour is filed twice", () => {
    expect(filed.length).toBe(new Set(filed).size);
  });

  test("nothing is filed that is not a colour", () => {
    const strays = filed.filter((k) => !(k in PALETTE));
    expect(strays).toEqual([]);
  });

  test("every hue on the dial is a real swatch", () => {
    expect(DIAL.filter((k) => !(k in PALETTE))).toEqual([]);
  });
});

describe("the sheet on disk is the sheet the code draws", () => {
  test("docs/reference/style-guide.svg is current", () => {
    // Regenerate with `bun run style-guide`. A committed picture that no
    // longer matches the values is worse than none: it is read as evidence.
    expect(readFileSync(OUT, "utf8")).toBe(sheet());
  });

  test("nothing is drawn outside the page", () => {
    const svg = sheet();
    const box = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    expect(box).not.toBeNull();
    const width = Number(box?.[1]);
    const height = Number(box?.[2]);
    for (const m of svg.matchAll(/<text x="([\d.]+)" y="([\d.]+)"/g)) {
      expect(Number(m[1])).toBeLessThan(width);
      expect(Number(m[2])).toBeLessThan(height);
    }
  });
});
