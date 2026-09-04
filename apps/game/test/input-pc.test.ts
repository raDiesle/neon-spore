import { describe, expect, it } from "bun:test";

/**
 * PC support for the game itself, not only the director:
 * `bindControls` already spoke Pointer Events before this change, which is
 * mouse and touch through one path — the actual gap was a hold that never
 * lets go, and a player with no way to learn the keys exist.
 *
 * There is no DOM in this repo's test runner (no jsdom, no happy-dom — see
 * `tools/director/test/demo-panel.test.ts`), so this proves the wiring is in
 * the source rather than driving a real canvas: a route this repo's own
 * `bun run check` cannot catch any other way.
 */

const inputSource = await Bun.file(
  Bun.fileURLToPath(new URL("../src/input.ts", import.meta.url)),
).text();
const hintSource = await Bun.file(
  Bun.fileURLToPath(new URL("../src/key-hint.ts", import.meta.url)),
).text();

describe("a held control on a PC", () => {
  it("is released when the window loses focus", () => {
    expect(inputSource).toMatch(/window\.addEventListener\("blur",\s*releaseAll\)/);
  });

  it("is released when the pointer leaves the document", () => {
    expect(inputSource).toMatch(
      /document\.documentElement\.addEventListener\("pointerleave",\s*releaseAll\)/,
    );
  });

  it("releaseAll answers touchUp for every hold still down, then clears it", () => {
    expect(inputSource).toMatch(
      /const releaseAll = \(\): void => \{\s*for \(const \[id, hold\] of holding\) \{\s*holding\.delete\(id\);[\s\S]*?const t = touchUp\(layout\(\), hold, field\(\)\);/,
    );
  });

  it("pointerup and pointercancel still answer the normal lift, on top of the two escapes above", () => {
    expect(inputSource).toMatch(/canvas\.addEventListener\("pointerup", up\)/);
    expect(inputSource).toMatch(/canvas\.addEventListener\("pointercancel", up\)/);
  });
});

describe("telling a PC player the keys exist", () => {
  it("bindControls shows the hint once, over the canvas it was given", () => {
    expect(inputSource).toMatch(/showKeyHint\(canvas\)/);
  });

  it("only where the pointer is a mouse, never on a touch-only phone", () => {
    expect(hintSource).toMatch(/matchMedia\("\(pointer: fine\)"\)\.matches/);
  });

  it("never blocks a click meant for the field underneath it", () => {
    expect(hintSource).toMatch(/pointerEvents:\s*"none"/);
  });

  it("gets out of the way on its own, and on the first key pressed", () => {
    expect(hintSource).toMatch(/setTimeout\(dismiss, \d+\)/);
    expect(hintSource).toMatch(/addEventListener\("keydown", dismiss, \{ once: true \}\)/);
  });
});
