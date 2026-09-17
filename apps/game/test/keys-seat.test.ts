import { describe, expect, it } from "bun:test";

/**
 * The game's test screen signs a mouse on the field by the seat key held —
 * 1 or 2 — and player 1 with none (`render/desk-seat.ts`). There is no DOM
 * in this runner, so this holds the wiring in the source the way
 * `input-pc.test.ts` does: the keys are listened for, cleared on a blur, and
 * the seat every hit test is handed is the rule's answer and not a literal.
 */
const source = await Bun.file(
  Bun.fileURLToPath(new URL("../src/field-input.ts", import.meta.url)),
).text();

describe("the seat keys on the game's test screen", () => {
  it("feeds keydown, keyup and blur to the desk", () => {
    expect(source).toMatch(/window\.addEventListener\("keydown", \(e\) => desk\.down\(e\.code\)\)/);
    expect(source).toMatch(/window\.addEventListener\("keyup", \(e\) => desk\.up\(e\.code\)\)/);
    expect(source).toMatch(/window\.addEventListener\("blur", \(\) => desk\.clear\(\)\)/);
  });

  it("signs the pointer with pointerSeat and the held key, never a literal seat", () => {
    expect(source).toMatch(/player: \(\) => pointerSeat\(o\.role\(\), desk\.seat\(\)\)/);
    expect(source).not.toMatch(/player: \(\) => \(o\.role\(\) === "p2" \? 2 : 1\)/);
  });
});
