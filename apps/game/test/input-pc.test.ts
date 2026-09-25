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
      /const releaseAll = \(\): void => \{\s*for \(const \[id, holds\] of holding\) \{\s*holding\.delete\(id\);[\s\S]*?for \(const hold of holds\) \{\s*const t = touchUp\(layout\(\), hold\);/,
    );
  });

  it("answers the normal lift for pointerup, with the point it lifted at", () => {
    expect(inputSource).toMatch(
      /canvas\.addEventListener\("pointerup", \(e\) => up\(e, inStage\(e\) \?\? undefined\)\)/,
    );
  });

  it("answers pointercancel with no point at all — the browser took the gesture, not the player, so a half-finished swipe or a cannon tap it cut short fires nothing, the same as releaseAll's own escapes", () => {
    expect(inputSource).toMatch(
      /canvas\.addEventListener\("pointercancel", \(e\) => up\(e, undefined\)\)/,
    );
  });
});

/**
 * The other half of a pointer path, and the one this file can actually hold:
 * whether the handler asks for the samples at all. What the samples are worth
 * is `apps/game/test/coalesced.test.ts` and the flick case in
 * `packages/sim/test/crank.test.ts`.
 */
describe("a drag read at more than one position a frame", () => {
  it("pushes a command per sample the move carried, not one per event", () => {
    expect(inputSource).toMatch(
      /for \(const sample of samplesOf\(e\)\) \{\s*const at = inStage\(sample\);[\s\S]*?for \(const h of holds\) \{\s*const t = touchMove\(layout\(\), h, at\.x, at\.y\);\s*if \(t\?\.command\) buffer\.push\(from\(t, e\.pointerId\), t\.command\);/,
    );
  });
});

describe("telling a PC player the keys exist", () => {
  it("bindControls shows the hint once, over the canvas it was given", () => {
    expect(inputSource).toMatch(/showKeyHint\(canvas\)/);
  });

  it("only where the pointer is a mouse, never on a touch-only phone", () => {
    // The query itself lives in `at-a-desk.ts` now — three callers asked it and
    // three copies is three chances to spell it wrong, which `at-a-desk.test.ts`
    // holds instead. What this holds is that the hint is behind it.
    expect(hintSource).toContain("if (!atADesk()) return;");
  });

  it("never blocks a click meant for the field underneath it", () => {
    expect(hintSource).toMatch(/pointerEvents:\s*"none"/);
  });

  it("gets out of the way on its own, and on the first key pressed", () => {
    expect(hintSource).toMatch(/setTimeout\(dismiss, \d+\)/);
    expect(hintSource).toMatch(/addEventListener\("keydown", dismiss, \{ once: true \}\)/);
  });
});
