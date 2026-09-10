import { describe, expect, it } from "bun:test";
import { destinationFor, fieldIdent, importedFrom, rewriteSpecifiers } from "../take-function.js";
import { pointRecord, retireImport } from "../take-record.js";

/**
 * The four steps a lane used to take by hand when a candidate patched a
 * function, each held to a candidate written out in a string. The shapes are
 * the real ones: `CRATER_LOOK` is `{ pit }` shorthand pointing at an import,
 * FORGE imports two names from one `paint.ts`, GULLET is three sibling files
 * that import each other.
 */

const INDEX = `import * as craterLook from "../../../../../packages/render/src/crater-look.js";
import { patch, type Variant } from "../../../variant.js";
import { shards, type Shard } from "./paint.js";

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
      fields: { pit: shards, depth: 3 },
    }),
  ],
};
`;

const RECORD = `import type { Crater } from "./crater-geom.js";
import { pit } from "./crater-pit.js";
import type { HullSkin } from "./hull.js";

/** The shipped look. */
export const CRATER_LOOK: {
  pit: (ctx: CanvasRenderingContext2D, c: Crater, skin: HullSkin) => void;
} = { pit };
`;

describe("reading the candidate", () => {
  it("finds the identifier a field is given, named or shorthand", () => {
    expect(fieldIdent(INDEX, "pit")).toBe("shards");
    expect(fieldIdent(INDEX.replace("pit: shards", "shards"), "shards")).toBe("shards");
    // A number is not an identifier, and an inline function is not one either.
    expect(fieldIdent(INDEX, "depth")).toBeUndefined();
    expect(fieldIdent(INDEX.replace("pit: shards", "pit: () => 1"), "pit")).toBeUndefined();
    expect(fieldIdent(INDEX.replace("pit: shards", "pit(c) { return c; }"), "pit")).toBeUndefined();
  });

  it("finds the sibling an identifier is imported from, past a type import beside it", () => {
    expect(importedFrom(INDEX, "shards")).toBe("./paint.js");
    expect(importedFrom(INDEX, "patch")).toBe("../../../variant.js");
    // Reached through a namespace, or declared locally: no module to move.
    expect(importedFrom(INDEX, "craterLook")).toBeUndefined();
    expect(importedFrom(INDEX, "SHARDS")).toBeUndefined();
  });
});

describe("where the file lands", () => {
  it("names it after the record less its -look, then the candidate", () => {
    expect(destinationFor("packages/render/src/crater-look.ts", "spall", "paint")).toBe(
      "packages/render/src/crater-spall.ts",
    );
    expect(destinationFor("packages/render/src/hull.ts", "gullet", "throat")).toBe(
      "packages/render/src/hull-gullet-throat.ts",
    );
    expect(destinationFor("packages/render/src/hull.ts", "gullet", "paint", "gullet-ship")).toBe(
      "packages/render/src/gullet-ship.ts",
    );
  });
});

describe("rewriting a moved file's imports", () => {
  const PAINT = `import { LIGHT_HALF } from "../../../../../packages/content/src/index.js";
import { strokeGlow } from "../../../../../packages/render/src/glow.js";
import { deep } from "../../../../../packages/render/src/sub/deep.js";
import { nerves } from "./nerves.js";
import { wrap } from "../../../text.js";
import { join } from "node:path";
`;
  const from = "tools/versus/candidates/ship-body/gullet/paint.ts";
  const to = "packages/render/src/hull-gullet.ts";
  const moved = new Map([
    [from, to],
    [
      "tools/versus/candidates/ship-body/gullet/nerves.ts",
      "packages/render/src/hull-gullet-nerves.ts",
    ],
  ]);
  const out = rewriteSpecifiers(PAINT, from, to, moved);

  it("shortens a path into its own package and follows a sibling that moved", () => {
    expect(out).toContain(`from "./glow.js"`);
    expect(out).toContain(`from "./sub/deep.js"`);
    expect(out).toContain(`from "./hull-gullet-nerves.js"`);
  });

  it("turns another package's path into its bare specifier and leaves the rest alone", () => {
    expect(out).toContain(`from "@neon-spore/content"`);
    expect(out).toContain(`from "node:path"`);
    // A path it cannot place stays as it was, for the check to name.
    expect(out).toContain(`from "../../../text.js"`);
  });
});

describe("pointing the record at the moved function", () => {
  it("rewrites a shorthand field and adds the import after the last one", () => {
    const r = pointRecord(RECORD, "CRATER_LOOK", "pit", "shards", "./crater-shards.js");
    if ("why" in r) throw new Error(r.why);
    expect(r.was).toBe("pit");
    expect(r.text).toContain("} = { pit: shards };");
    expect(r.text).toContain(
      `import type { HullSkin } from "./hull.js";\nimport { shards } from "./crater-shards.js";\n`,
    );
  });

  it("rewrites a named field, and joins an import that already reaches the module", () => {
    const src = RECORD.replace("= { pit }", "= { pit: pit, lift: 2 }").replace(
      `import { pit } from "./crater-pit.js";`,
      `import { pit } from "./crater-pit.js";\nimport { ring } from "./crater-shards.js";`,
    );
    const r = pointRecord(src, "CRATER_LOOK", "pit", "shards", "./crater-shards.js");
    if ("why" in r) throw new Error(r.why);
    expect(r.text).toContain("{ pit: shards, lift: 2 }");
    expect(r.text).toContain(`import { ring, shards } from "./crater-shards.js";`);
  });

  it("replaces an inline function whole", () => {
    const src = RECORD.replace(
      "= { pit }",
      "= {\n  pit: (ctx, c, skin) => {\n    ctx.arc(0, 0, c.r, 0, 1);\n  },\n}",
    );
    const r = pointRecord(src, "CRATER_LOOK", "pit", "shards", "./crater-shards.js");
    if ("why" in r) throw new Error(r.why);
    expect(r.text).toContain("{\n  pit: shards,\n}");
    expect(r.was.startsWith("pit: (ctx, c, skin) =>")).toBe(true);
  });

  it("refuses a name the file already uses, and a field it cannot find", () => {
    expect("why" in pointRecord(RECORD, "CRATER_LOOK", "pit", "pit", "./x.js")).toBe(true);
    expect("why" in pointRecord(RECORD, "CRATER_LOOK", "rim", "shards", "./x.js")).toBe(true);
    expect("why" in pointRecord(RECORD, "OTHER", "pit", "shards", "./x.js")).toBe(true);
  });
});

describe("retiring the old implementation", () => {
  it("drops the old name from its import, the whole line when it stood alone", () => {
    const r = retireImport(RECORD, "pit");
    expect(r.module).toBe("./crater-pit.js");
    expect(r.text).not.toContain("crater-pit.js");
    const shared = retireImport(RECORD.replace("import { pit }", "import { pit, lid }"), "pit");
    expect(shared.text).toContain(`import { lid } from "./crater-pit.js";`);
  });

  it("leaves a local declaration and an inline function alone, and says so", () => {
    expect(retireImport(RECORD, "CRATER_LOOK").module).toBeUndefined();
    expect(retireImport(RECORD, "(ctx) => {}").note).toContain("inline");
  });
});
