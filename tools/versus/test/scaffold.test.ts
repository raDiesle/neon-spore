import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { posix, resolve } from "node:path";
import { ROOT } from "../root.js";
import { slotDir, symbolFor, template } from "../scaffold.js";

/**
 * The scaffold is printed for a person to paste, so nothing type-checks it and
 * nothing runs it — which is how it came to print a candidate that could not
 * compile. It carried `../../../../packages/…` and `../../variant.js`, right
 * for the flat `candidates/<name>.ts` layout it was written against and one
 * directory short of the `candidates/<slot>/<name>/index.ts` layout that
 * replaced it, so every import in a freshly scaffolded candidate was wrong
 * (17 September 2026, the `lost:screen` answers).
 *
 * So the check is the one the compiler would have made: take each specifier
 * out of the printed template, resolve it against the directory the template
 * says to put the file in, and ask the tree whether anything is there.
 */
describe("the scaffold's imports resolve", () => {
  const dirOf = (slot: string, name: string) => `tools/versus/candidates/${slotDir(slot)}/${name}`;

  /** Every `from "…"` in the printed template, in order. */
  const specifiers = (slot: string, name: string): string[] =>
    [
      ...template(slot, name)
        .join("\n")
        .matchAll(/from "([^"]+)"/g),
    ].map((m) => m[1] as string);

  it("reaches variant.ts from where it says to put the file", () => {
    for (const [slot, name] of [
      ["lost:screen", "tryout"],
      ["creature:torch", "flare"],
      ["ship:hull", "a"],
    ] as const) {
      const spec = specifiers(slot, name).find((s) => s.endsWith("variant.js"));
      expect(spec).toBeDefined();
      const landed = posix.normalize(posix.join(dirOf(slot, name), spec as string));
      expect(landed).toBe("tools/versus/variant.js");
      expect(existsSync(resolve(ROOT, "tools/versus/variant.ts"))).toBe(true);
    }
  });

  it("reaches packages/render from the same place", () => {
    const slot = "lost:screen";
    const name = "tryout";
    const spec = specifiers(slot, name).find((s) => s.includes("packages/render"));
    expect(spec).toBeDefined();
    const landed = posix.normalize(posix.join(dirOf(slot, name), spec as string));
    expect(landed).toBe("packages/render/src/<file>.js");
    expect(existsSync(resolve(ROOT, "packages/render/src"))).toBe(true);
  });

  it("names the symbol the file exports", () => {
    expect(template("lost:screen", "tryout").join("\n")).toContain(
      `export const ${symbolFor("lost:screen", "tryout")}: Variant`,
    );
  });
});
