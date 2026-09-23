import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { drop } from "../decide.js";

/**
 * What `drop` takes off the disk, in a small repository built in a temporary
 * directory: a slot of two candidates and a helper they share, a second slot
 * that must be left standing, the registry naming all three, the director's
 * pose map with a row for each slot, and a `DECIDED.md`. `adopt` removes a
 * slot the same way (`removeSlot`), so this holds that half of it too.
 */

let root = "";

function put(file: string, text: string): void {
  const abs = join(root, file);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, text);
}

const read = (file: string): string => readFileSync(join(root, file), "utf8");

const variant = (symbol: string): string =>
  `import type { Variant } from "../../../variant.js";\n\nexport const ${symbol}: Variant = {} as Variant;\n`;

const CANDIDATES = "tools/versus/candidates";
const POSE = "tools/director/src/versus-pose.ts";

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "versus-drop-"));
  put(`${CANDIDATES}/ship-crater/shards/index.ts`, variant("SHARDS"));
  put(`${CANDIDATES}/ship-crater/ring/index.ts`, variant("RING"));
  put(`${CANDIDATES}/ship-crater/grain.ts`, "export const grain = 1;\n");
  put(`${CANDIDATES}/panel-join/wide/index.ts`, variant("WIDE"));
  put(`${CANDIDATES}/registry.ts`, "// stale\n");
  put(
    POSE,
    [
      "const SLOT_POSE: Record<string, string> = {",
      '  "ship:crater": "THE CRATER",',
      '  "panel:join": "THE JOIN",',
      "};",
      "",
    ].join("\n"),
  );
  put("tools/versus/DECIDED.md", "# Decided\n");
});

afterEach(() => rmSync(root, { recursive: true, force: true }));

describe("drop", () => {
  it("takes the slot's candidates, their shared helper, its registry entry and its pose row", () => {
    const out = drop("ship:crater", "neither reads as a crater", root);

    expect(existsSync(join(root, CANDIDATES, "ship-crater"))).toBe(false);
    expect(existsSync(join(root, CANDIDATES, "panel-join", "wide", "index.ts"))).toBe(true);

    const registry = read(`${CANDIDATES}/registry.ts`);
    expect(registry).toContain('import { WIDE } from "./panel-join/wide/index.js";');
    expect(registry).not.toContain("SHARDS");
    expect(registry).not.toContain("RING");

    const pose = read(POSE);
    expect(pose).not.toContain("ship:crater");
    expect(pose).toContain('"panel:join": "THE JOIN"');

    const decided = read("tools/versus/DECIDED.md");
    expect(decided).toContain("`ship:crater` — nothing taken");
    expect(decided).toContain("neither reads as a crater");

    expect(out).toContain(`  removed  ${CANDIDATES}/ship-crater/grain.ts`);
    expect(out.some((l) => l.includes("1 candidate left"))).toBe(true);
  });

  it("refuses a slot with nothing on disk, and names the ones that are open", () => {
    expect(() => drop("ship:hull", "", root)).toThrow(/open right now: .*panel:join/);
    expect(read("tools/versus/DECIDED.md")).toBe("# Decided\n");
  });
});
