import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { importersOf, planFunctionTake } from "../take-function-fs.js";
import type { Patch, Variant } from "../variant.js";

/**
 * The whole take, planned against a small repository built in a temporary
 * directory: a record pointing at a function in a sibling module, a candidate
 * whose `paint.ts` imports across two packages and a sibling of its own, and
 * a second reader of the old module in one case and none in the other. What
 * is held is the plan — every path, every rewritten import, and the decision
 * about the old file — not the writes, which `adopt` makes and `bun run
 * check` proves.
 */

let root = "";

function put(file: string, text: string): void {
  const abs = join(root, file);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, text);
}

const RECORD = `import type { Crater } from "./crater-geom.js";
import { pit } from "./crater-pit.js";

export const CRATER_LOOK: { pit: (c: Crater) => void; lift: number } = { pit, lift: 2 };
`;

const INDEX = `import * as craterLook from "../../../../../packages/render/src/crater-look.js";
import { patch, type Variant } from "../../../variant.js";
import { shards } from "./paint.js";

export const SHARDS: Variant = {
  slot: "ship:crater",
  name: "shards",
  sentence: "…",
  dir: "tools/versus/candidates/ship-crater/shards",
  patches: [
    patch({
      target: craterLook.CRATER_LOOK,
      reached: () => craterLook.CRATER_LOOK,
      where: { file: "packages/render/src/crater-look.ts", symbol: "CRATER_LOOK" },
      fields: { pit: shards, lift: 3 },
    }),
  ],
};
`;

const PAINT = `import { LIGHT_HALF } from "../../../../../packages/content/src/index.js";
import type { Crater } from "../../../../../packages/render/src/crater-geom.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { grain } from "./grain.js";

export function shards(c: Crater): void {
  strokeGlow(c, grain(LIGHT_HALF));
}
`;

const GRAIN = `export function grain(x: number): number {
  return x * 2;
}
`;

const won: Variant = {
  slot: "ship:crater",
  name: "shards",
  sentence: "…",
  dir: "tools/versus/candidates/ship-crater/shards",
  patches: [],
};
const patch: Patch = {
  target: {},
  reached: () => ({}),
  where: { file: "packages/render/src/crater-look.ts", symbol: "CRATER_LOOK" },
  fields: { pit: () => undefined },
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "versus-take-"));
  put("packages/render/src/crater-look.ts", RECORD);
  put("packages/render/src/crater-pit.ts", "export function pit(): void {}\n");
  put("packages/render/src/crater-geom.ts", "export interface Crater { r: number }\n");
  put("packages/render/src/glow.ts", "export function strokeGlow(): void {}\n");
  put("packages/content/src/index.ts", "export const LIGHT_HALF = 1;\n");
  put("tools/versus/candidates/ship-crater/shards/index.ts", INDEX);
  put("tools/versus/candidates/ship-crater/shards/paint.ts", PAINT);
  put("tools/versus/candidates/ship-crater/shards/grain.ts", GRAIN);
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("planning a take", () => {
  it("moves every sibling, rewrites their imports and points the record at the function", () => {
    const plan = planFunctionTake(root, won, patch, ["pit"], RECORD);
    if ("why" in plan) throw new Error(plan.why);

    const moves = new Map(plan.moves.map((m) => [m.from, m]));
    const paint = moves.get("tools/versus/candidates/ship-crater/shards/paint.ts");
    const grain = moves.get("tools/versus/candidates/ship-crater/shards/grain.ts");
    expect(paint?.to).toBe("packages/render/src/crater-shards.ts");
    expect(grain?.to).toBe("packages/render/src/crater-shards-grain.ts");
    expect(paint?.text).toContain(`from "@neon-spore/content"`);
    expect(paint?.text).toContain(`from "./crater-geom.js"`);
    expect(paint?.text).toContain(`from "./glow.js"`);
    expect(paint?.text).toContain(`from "./crater-shards-grain.js"`);

    expect(plan.recordText).toContain("= { pit: shards, lift: 2 };");
    expect(plan.recordText).toContain(`import { shards } from "./crater-shards.js";`);
    expect(plan.fields).toEqual([
      {
        field: "pit",
        ident: "shards",
        from: "tools/versus/candidates/ship-crater/shards/paint.ts",
        to: "packages/render/src/crater-shards.ts",
      },
    ]);
  });

  it("deletes the old module when nothing else imports it, and keeps it when something does", () => {
    const alone = planFunctionTake(root, won, patch, ["pit"], RECORD);
    if ("why" in alone) throw new Error(alone.why);
    expect(alone.recordText).not.toContain("crater-pit.js");
    expect(alone.retired).toEqual([
      {
        file: "packages/render/src/crater-pit.ts",
        delete: true,
        note: "packages/render/src/crater-pit.ts — nothing else imports it; deleted",
      },
    ]);

    put("packages/render/src/craters.ts", `import { pit } from "./crater-pit.js";\npit();\n`);
    try {
      const shared = planFunctionTake(root, won, patch, ["pit"], RECORD);
      if ("why" in shared) throw new Error(shared.why);
      expect(shared.retired[0]?.delete).toBe(false);
      expect(shared.retired[0]?.note).toContain("packages/render/src/craters.ts");
    } finally {
      rmSync(join(root, "packages/render/src/craters.ts"));
    }
  });

  it("lands the files under --as when the default name is not wanted", () => {
    const plan = planFunctionTake(root, won, patch, ["pit"], RECORD, "crater-glass");
    if ("why" in plan) throw new Error(plan.why);
    expect(plan.moves.map((m) => m.to).sort()).toEqual([
      "packages/render/src/crater-glass-grain.ts",
      "packages/render/src/crater-glass.ts",
    ]);
  });

  it("refuses a destination that exists, an inline function, and a name in use", () => {
    put("packages/render/src/crater-shards.ts", "export const x = 1;\n");
    try {
      const taken = planFunctionTake(root, won, patch, ["pit"], RECORD);
      expect("why" in taken && taken.why).toContain("--as");
    } finally {
      rmSync(join(root, "packages/render/src/crater-shards.ts"));
    }

    const indexFile = "tools/versus/candidates/ship-crater/shards/index.ts";
    put(indexFile, INDEX.replace("pit: shards", "pit: (c) => c"));
    try {
      const inline = planFunctionTake(root, won, patch, ["pit"], RECORD);
      expect("why" in inline && inline.why).toContain("inline");
    } finally {
      put(indexFile, INDEX);
    }

    const clash = planFunctionTake(root, won, patch, ["pit"], `const shards = 1;\n${RECORD}`);
    expect("why" in clash && clash.why).toContain("already a name");
    expect(readFileSync(join(root, "packages/render/src/crater-look.ts"), "utf8")).toBe(RECORD);
  });
});

describe("who imports a module", () => {
  it("finds every reader by resolving its relative specifier, except the one asked to skip", () => {
    const file = "packages/render/src/crater-pit.ts";
    expect(importersOf(root, file, "")).toEqual(["packages/render/src/crater-look.ts"]);
    expect(importersOf(root, file, "packages/render/src/crater-look.ts")).toEqual([]);
  });
});
