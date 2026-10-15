import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The director's cascade is an `@import` list, and the phone sheet ends it.
 *
 * `index.html` linked eighteen sheets and relied on their order; Bun's HTML
 * dev route rewrote the links in reverse, so on `bun run dev` a phone matched
 * `director-phone.css`'s media query and lost every rule in it to the column
 * rules that now came after. `src/director.css` holds the order instead, and
 * this test is what keeps a sheet from being linked from the page again, or
 * added to the list below the one that has to be last.
 */

const DIRECTOR = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(DIRECTOR, "src");

async function importsOf(sheet: string): Promise<string[]> {
  const text = await Bun.file(join(SRC, sheet)).text();
  return [...text.matchAll(/^@import "\.\/([^"]+)";$/gm)].map((m) => m[1] as string);
}

function links(html: string): string[] {
  return [...html.matchAll(/<link rel="stylesheet" href="\.\/src\/([^"]+)"/g)].map(
    (m) => m[1] as string,
  );
}

describe("the director's stylesheet order", () => {
  it("index.html links one sheet, and that sheet imports the rest", async () => {
    const html = await Bun.file(join(DIRECTOR, "index.html")).text();
    expect(links(html)).toEqual(["director.css"]);
    const list = await importsOf("director.css");
    expect(list.length).toBeGreaterThan(1);
    for (const sheet of list) expect(existsSync(join(SRC, sheet))).toBe(true);
  });

  it("director-phone.css is the last import, so its media block wins its ties", async () => {
    const list = await importsOf("director.css");
    expect(list.at(-1)).toBe("director-phone.css");
    expect(list[0]).toBe("director-shell.css");
  });

  it("every director-*.css on disk is imported exactly once", async () => {
    const list = await importsOf("director.css");
    const onDisk = readdirSync(SRC)
      .filter((f) => /^director-.*\.css$/.test(f))
      .sort();
    expect([...list].sort()).toEqual(onDisk);
  });

  it("versus.html takes its sheets the same way, in director.css's order", async () => {
    const html = await Bun.file(join(DIRECTOR, "versus.html")).text();
    expect(links(html)).toEqual(["versus.css"]);
    const some = await importsOf("versus.css");
    const all = await importsOf("director.css");
    const positions = some.map((s) => all.indexOf(s));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  // A sheet cut in two can leave its variables in the half the VERSUS list
  // does not name: on 13 October 2026 the palette moved to
  // director-tokens.css and a VERSUS tab drew black on white.
  it("every var() the VERSUS sheets read is defined by one of them", async () => {
    let text = "";
    for (const sheet of await importsOf("versus.css")) {
      text += await Bun.file(join(SRC, sheet)).text();
    }
    const read = new Set([...text.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1] as string));
    const defined = new Set([...text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1] as string));
    expect([...read].filter((name) => !defined.has(name))).toEqual([]);
  });

  it("no sheet imports another: the order is in one place", async () => {
    for (const sheet of await importsOf("director.css")) {
      expect(await importsOf(sheet)).toEqual([]);
    }
  });
});
