import { describe, expect, it } from "bun:test";
import { guardsDeterminism } from "../after-sim-edit.ts";
import { formats } from "../format-edited.ts";
import { editedPath, stopHookActive } from "../payload.ts";

/**
 * The two `PostToolUse` hooks, and the payload reader underneath them.
 *
 * Each was a bash script that pulled `file_path` out of the raw JSON with a
 * `grep -o` and then matched it with a `case`. Both parts are now functions,
 * and this is the file that says what they answer — a hook whose decision can
 * only be exercised by editing a file and watching for a side effect is a hook
 * nobody checks.
 */

const edit = (file_path: unknown) => ({ tool_input: { file_path } });

describe("the path an edit names", () => {
  it("comes back with Windows separators normalised", () => {
    expect(editedPath(edit("C:\\Users\\raDi\\repo\\packages\\sim\\src\\step.ts"))).toBe(
      "C:/Users/raDi/repo/packages/sim/src/step.ts",
    );
  });

  it("is left alone when it already has forward slashes", () => {
    expect(editedPath(edit("packages/sim/src/step.ts"))).toBe("packages/sim/src/step.ts");
  });

  it("is null for a payload with nothing to say", () => {
    // A payload is another program's object: every field is optional, and a
    // hook that throws on one it did not expect blocks the tool that fired it.
    expect(editedPath(null)).toBeNull();
    expect(editedPath({})).toBeNull();
    expect(editedPath(edit(undefined))).toBeNull();
    expect(editedPath(edit(""))).toBeNull();
    expect(editedPath(edit(42))).toBeNull();
  });
});

describe("whether a stop is the one already sent back", () => {
  it("is true only for the boolean, never for the string", () => {
    // The bash version matched `"stop_hook_active":true` in the raw text, so a
    // payload spelling it `"true"` — or with unusual whitespace — read as the
    // opposite of what it said. Parsed, there is one answer.
    expect(stopHookActive({ stop_hook_active: true })).toBe(true);
    expect(stopHookActive({ stop_hook_active: "true" })).toBe(false);
    expect(stopHookActive({ stop_hook_active: false })).toBe(false);
    expect(stopHookActive({})).toBe(false);
    expect(stopHookActive(null)).toBe(false);
  });
});

describe("what the formatter is handed", () => {
  it("takes the extensions Biome has something to say about", () => {
    for (const p of ["a.ts", "a.tsx", "a.js", "a.jsx", "a.json", "a.css"]) {
      expect(formats(p)).toBe(true);
    }
  });

  it("leaves everything else alone", () => {
    for (const p of ["README.md", "icon.svg", "a.sh", "waves.txt", "no-extension"]) {
      expect(formats(p)).toBe(false);
    }
    expect(formats(null)).toBe(false);
  });

  it("does not care how the path was spelled", () => {
    expect(formats("C:/Users/raDi/repo/apps/game/src/Main.TS")).toBe(true);
    // `.tsx` must not be matched by the `.ts` row alone reversed — a file
    // called `something.ts.bak` is not a TypeScript file.
    expect(formats("something.ts.bak")).toBe(false);
  });
});

describe("which edits have to re-prove determinism", () => {
  it("takes anything under packages/sim or packages/content", () => {
    expect(guardsDeterminism("packages/sim/src/step.ts")).toBe(true);
    expect(guardsDeterminism("packages/content/src/creatures.ts")).toBe(true);
    expect(guardsDeterminism("C:/Users/raDi/repo/packages/sim/test/purity.test.ts")).toBe(true);
  });

  it("leaves the rest of the tree alone", () => {
    expect(guardsDeterminism("packages/render/src/band.ts")).toBe(false);
    expect(guardsDeterminism("apps/game/src/loop.ts")).toBe(false);
    expect(guardsDeterminism("docs/queue.md")).toBe(false);
    expect(guardsDeterminism(null)).toBe(false);
  });

  it("is not fooled by a directory that merely starts the same", () => {
    // `packages/simulation-notes/` is not `packages/sim/`. The trailing slash
    // in the table is the whole of what makes that true.
    expect(guardsDeterminism("packages/simulation-notes/x.ts")).toBe(false);
    expect(guardsDeterminism("packages/contents-list/x.ts")).toBe(false);
  });
});
