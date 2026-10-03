import { describe, expect, it } from "bun:test";
import { capture } from "../src/pointer-capture.js";

/**
 * A press the browser will not capture is still a press (`pointer-capture.ts`).
 * There is no DOM in this runner, so the canvas is a stub that refuses the
 * way a browser does, and the listener's wiring is held in its source the way
 * `input-pc.test.ts` holds the rest of it.
 */

const inputSource = await Bun.file(
  Bun.fileURLToPath(new URL("../src/input.ts", import.meta.url)),
).text();

describe("a pointer the browser will not capture", () => {
  it("is captured when the browser allows it", () => {
    const held: number[] = [];
    expect(capture({ setPointerCapture: (id) => void held.push(id) }, 1)).toBe(true);
    expect(held).toEqual([1]);
  });

  it("is refused without a throw, as a synthetic pointer id is", () => {
    const refusing = {
      setPointerCapture(): void {
        throw new DOMException("No active pointer with the given id is found.", "NotFoundError");
      },
    };
    expect(capture(refusing, 7)).toBe(false);
  });

  it("still reaches down() from the pointerdown listener", () => {
    expect(inputSource).not.toContain("canvas.setPointerCapture(");
    expect(inputSource).toMatch(
      /addEventListener\("pointerdown", \(e\) => \{[\s\S]*?capture\(canvas, e\.pointerId\);\s*down\(e\.pointerId, p\.x, p\.y\);/,
    );
  });
});
