import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { planFunctionTake } from "../take-function-fs.js";
import { keyOnly, renamedFor, renameIdent } from "../take-rename.js";
import type { Patch, Variant } from "../variant.js";

/**
 * **An export named after its field adopts with no hand edit** —
 * `take-rename.ts`. The shape is the one both adoptions of 1 October 2026
 * hit: THE STARE's eye record with an inline `paint`, and a candidate,
 * `globe`, exporting `paint` from its `paint.ts`. By hand it became
 * `paintGlobe`; the plan now says the same.
 */

const RECORD = `import type { Eye } from "./stare-eye.js";

export const STARE_EYE_LOOK: { paint: (e: Eye) => void } = {
  // The shipped sliver.
  paint: (e) => {
    e.r += 1;
  },
};
`;

const INDEX = `import * as eyeLook from "../../../../../packages/render/src/stare-eye-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paint } from "./paint.js";

export const GLOBE: Variant = {
  slot: "stare:eye",
  name: "globe",
  sentence: "…",
  dir: "tools/versus/candidates/stare-eye/globe",
  patches: [
    patch({
      target: eyeLook.STARE_EYE_LOOK,
      reached: () => eyeLook.STARE_EYE_LOOK,
      where: { file: "packages/render/src/stare-eye-look.ts", symbol: "STARE_EYE_LOOK" },
      fields: { paint },
    }),
  ],
};
`;

const PAINT = `import type { Eye } from "../../../../../packages/render/src/stare-eye.js";
import { roll } from "./roll.js";

/** The paint, which turns the ball — \`paint\` in a comment stays as it is. */
export function paint(e: Eye): void {
  const look = { paint: 1 };
  roll(e, look.paint, "paint");
}
`;

const ROLL = `import { paint } from "./paint.js";

export function roll(e: unknown, n: number, why: string): void {
  if (n > 9) paint(e as never);
  void why;
}
`;

let root = "";

function put(file: string, text: string): void {
  const abs = join(root, file);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, text);
}

const won: Variant = {
  slot: "stare:eye",
  name: "globe",
  sentence: "…",
  dir: "tools/versus/candidates/stare-eye/globe",
  patches: [],
};
const patch: Patch = {
  target: {},
  reached: () => ({}),
  where: { file: "packages/render/src/stare-eye-look.ts", symbol: "STARE_EYE_LOOK" },
  fields: { paint: () => undefined },
};

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), "versus-rename-"));
  put("packages/render/src/stare-eye-look.ts", RECORD);
  put("packages/render/src/stare-eye.ts", "export interface Eye { r: number }\n");
  put("tools/versus/candidates/stare-eye/globe/index.ts", INDEX);
  put("tools/versus/candidates/stare-eye/globe/paint.ts", PAINT);
  put("tools/versus/candidates/stare-eye/globe/roll.ts", ROLL);
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("an export named after its field", () => {
  it("adopts as the field and the candidate's name, in every file that moves", () => {
    const plan = planFunctionTake(root, won, patch, ["paint"], RECORD);
    if ("why" in plan) throw new Error(plan.why);
    expect(plan.recordText).toContain("  paint: paintGlobe,\n};");
    expect(plan.recordText).toContain(`import { paintGlobe } from "./stare-eye-globe.js";`);
    expect(plan.fields[0]?.ident).toBe("paintGlobe");

    const moves = new Map(plan.moves.map((m) => [m.to, m.text]));
    const paint = moves.get("packages/render/src/stare-eye-globe.ts") ?? "";
    expect(paint).toContain("export function paintGlobe(e: Eye): void {");
    // A key, a member, a string and a comment are not the binding.
    expect(paint).toContain("const look = { paint: 1 };");
    expect(paint).toContain(`roll(e, look.paint, "paint");`);
    expect(paint).toContain("`paint` in a comment");
    const roll = moves.get("packages/render/src/stare-eye-globe-roll.ts") ?? "";
    expect(roll).toContain(`import { paintGlobe } from "./stare-eye-globe.js";`);
    expect(roll).toContain("if (n > 9) paintGlobe(e as never);");
  });

  it("is still refused when the record uses the name as more than its key", () => {
    const used = `import { paint } from "./stare-paint.js";\n${RECORD.replace(
      /paint: \(e\) => \{[^}]*\},/,
      "paint,",
    )}`;
    const plan = planFunctionTake(root, won, patch, ["paint"], used);
    expect("why" in plan && plan.why).toContain("already a name");
  });
});

describe("the pieces", () => {
  it("names the export after the field and the candidate", () => {
    expect(renamedFor("paint", "globe")).toBe("paintGlobe");
    expect(renamedFor("paint", "two-tone")).toBe("paintTwoTone");
  });

  it("tells a key from a use", () => {
    expect(keyOnly(RECORD, "paint")).toBe(true);
    expect(keyOnly("const x = { paint };", "paint")).toBe(false);
    expect(keyOnly("const x = ok ? paint : 0;", "paint")).toBe(false);
    expect(keyOnly("const x = 1;", "paint")).toBe(false);
  });

  it("writes an object's shorthand out, and renames a list's", () => {
    expect(renameIdent("const x = { paint };", "paint", "paintGlobe")).toBe(
      "const x = { paint: paintGlobe };",
    );
    expect(renameIdent(`export { paint };`, "paint", "paintGlobe")).toBe("export { paintGlobe };");
  });
});
