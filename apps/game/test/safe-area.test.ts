import { afterEach, describe, expect, it } from "bun:test";
import { safeArea } from "../src/safe-area.js";

/**
 * The four numbers the stage is cut inside, and the three ways a browser can
 * decline to give them.
 *
 * `safe-area.ts` is the only file in the app that asks the document about the
 * phone's own furniture, and every one of its paths has to fail to zero: a
 * desktop has no furniture, a browser without `env()` support hands back the
 * text of the expression instead of a length, and a headless runner has no
 * document at all. Each of those is the stage the game has always had, and
 * none of them may reach `computeStage` as a negative or a `NaN`.
 */

const heldDoc = Object.getOwnPropertyDescriptor(globalThis, "document");
const heldStyle = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");

afterEach(() => {
  restore("document", heldDoc);
  restore("getComputedStyle", heldStyle);
});

function restore(name: string, had: PropertyDescriptor | undefined): void {
  if (had) Object.defineProperty(globalThis, name, had);
  else delete (globalThis as Record<string, unknown>)[name];
}

function define(name: string, value: unknown): void {
  Object.defineProperty(globalThis, name, { configurable: true, value });
}

/** A document that resolves `padding` to whatever `padding` is asked for. */
function phone(padding: Record<string, string>): { asked: Record<string, string> } {
  const asked: Record<string, string> = {};
  define("document", {
    documentElement: {},
    body: { appendChild: (): void => {} },
    createElement: () => ({
      style: {
        setProperty: (name: string, value: string): void => {
          asked[name] = value;
        },
      },
    }),
  });
  define("getComputedStyle", () => padding);
  return { asked };
}

describe("safeArea", () => {
  it("is nothing at all where there is no document", () => {
    restore("document", undefined);
    expect(safeArea()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("reads the four strips off the probe's resolved padding", () => {
    phone({
      paddingTop: "44px",
      paddingRight: "0px",
      paddingBottom: "34px",
      paddingLeft: "0px",
    });
    expect(safeArea()).toEqual({ top: 44, right: 0, bottom: 34, left: 0 });
  });

  it("asks for a real env() on each side, which is why the padding resolves", () => {
    // A `--var` holding `env()` is handed back as its own text by
    // `getPropertyValue` on more than one browser; a padding is resolved.
    const { asked } = phone({ paddingTop: "0px" });
    safeArea();
    expect(asked["padding-top"]).toBe("env(safe-area-inset-top, 0px)");
    expect(asked["padding-bottom"]).toBe("env(safe-area-inset-bottom, 0px)");
  });

  it("is nothing where the browser hands back the expression it was given", () => {
    phone({ paddingTop: "env(safe-area-inset-top, 0px)" });
    expect(safeArea().top).toBe(0);
  });

  it("is nothing where the padding is missing entirely", () => {
    phone({});
    expect(safeArea()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("sees the new numbers after a rotation rather than the ones it cached", () => {
    const upright = { paddingTop: "44px", paddingLeft: "0px" };
    const turned = { paddingTop: "0px", paddingLeft: "44px" };
    phone(upright);
    expect(safeArea().top).toBe(44);
    phone(turned);
    expect(safeArea()).toMatchObject({ top: 0, left: 44 });
  });
});
