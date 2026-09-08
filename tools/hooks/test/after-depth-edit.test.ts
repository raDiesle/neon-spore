import { describe, expect, it } from "bun:test";
import { finding, reminder, scope } from "../after-depth-edit.ts";

/**
 * The hook's judgement, without a payload. What matters is that it is quiet on
 * everything it has nothing to say about: a hook that fires on ordinary render
 * work is one the next session turns off, and then it is not there on the file
 * that needed it.
 */
describe("what the depth hook looks at", () => {
  it("watches only what a person looks at", () => {
    expect(scope("packages/render/src/warden-skin.ts")).toBe(true);
    expect(scope("tools/director/src/skins/turn.ts")).toBe(true);
    expect(scope("packages/sim/src/step.ts")).toBe(false);
    expect(scope("packages/render/src/warden-skin.test.ts")).toBe(false);
    // The projection's own home writes the arithmetic by definition.
    expect(scope("packages/content/src/surface.ts")).toBe(false);
    expect(scope(null)).toBe(false);
  });

  it("says nothing about ordinary drawing", () => {
    const plain = "export function drawRow(ctx: CanvasRenderingContext2D): void {}";
    expect(finding("packages/render/src/rows.ts", plain)).toBe(null);
  });

  it("catches the projection written out by hand", () => {
    const copied = "const x = Math.cos(lat) * Math.sin(lon + theta);";
    expect(finding("packages/render/src/rock-drift.ts", copied)).toBe("copy");
    expect(reminder("packages/render/src/rock-drift.ts", "copy")).toContain("surface.ts");
  });

  it("catches a file that says it is making something round", () => {
    const claims = "/** The rim light on the terminator, so the body reads as a solid. */";
    expect(finding("packages/render/src/lobe.ts", claims)).toBe("claim");
    const out = reminder("packages/render/src/lobe.ts", "claim");
    expect(out).toContain("POSED");
    expect(out).toContain(".claude/skills/depth");
  });
});
